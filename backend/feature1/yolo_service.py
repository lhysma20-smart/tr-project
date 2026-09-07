from __future__ import annotations

import hashlib
import io
from pathlib import Path

import numpy as np
from PIL import Image

MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "best.pt"
CLASS_NAMES = ("tire", "wear", "crack", "tear")


def _status_from_score(score: int) -> str:
    if score >= 80:
        return "good"
    if score >= 60:
        return "warning"
    if score >= 40:
        return "replace"
    return "critical"


def _message(wear: int, crack: int, tear: int, status: str) -> str:
    if tear >= 50:
        return "타이어에 찢김이 감지되었습니다. 즉시 점검을 권장합니다."
    if crack >= 45:
        return "타이어 표면에 균열이 확인되었습니다. 가까운 매장에서 점검을 받아보세요."
    if wear >= 60:
        return "타이어의 마모가 진행되고 있습니다. 정기적인 점검을 권장합니다."
    if status == "good":
        return "타이어 상태가 양호합니다. 현재 주행에 큰 문제는 없어 보입니다."
    return "타이어 상태를 주기적으로 확인하는 것을 권장합니다."


def _to_scores(wear: float, crack: float, tear: float) -> dict:
    wear_i = int(np.clip(round(wear), 0, 100))
    crack_i = int(np.clip(round(crack), 0, 100))
    tear_i = int(np.clip(round(tear), 0, 100))
    penalty = wear_i * 0.30 + crack_i * 0.25 + tear_i * 0.45
    score = int(np.clip(round(100 - penalty), 0, 100))
    status = _status_from_score(score)
    return {
        "wear": wear_i,
        "crack": crack_i,
        "tear": tear_i,
        "score": score,
        "status": status,
        "message": _message(wear_i, crack_i, tear_i, status),
        "detections": [],
    }


def _heuristic_analyze(image_bytes: bytes) -> dict:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((256, 256))
    arr = np.asarray(image, dtype=np.float32) / 255.0
    gray = arr.mean(axis=2)

    gx = np.abs(np.diff(gray, axis=1, prepend=gray[:, :1]))
    gy = np.abs(np.diff(gray, axis=0, prepend=gray[:1, :]))
    edge = gx + gy
    edge_mean = float(edge.mean())
    contrast = float(gray.std())
    dark_ratio = float((gray < 0.22).mean())

    digest = hashlib.sha256(image_bytes[:4096]).digest()
    jitter = [b / 255.0 for b in digest[:3]]

    wear = 25 + (1.0 - min(contrast, 0.28) / 0.28) * 55 + jitter[0] * 8
    crack = 8 + min(edge_mean / 0.18, 1.0) * 62 + jitter[1] * 10
    tear = 5 + min(dark_ratio / 0.35, 1.0) * 55 + jitter[2] * 8

    result = _to_scores(wear, crack, tear)
    result["engine"] = "heuristic"
    return result


def _yolo_analyze(image_bytes: bytes, model_path: Path) -> dict:
    from ultralytics import YOLO

    model = YOLO(str(model_path))
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    results = model.predict(image, verbose=False)
    buckets = {"wear": 0.0, "crack": 0.0, "tear": 0.0}
    detections = []

    if results:
        result = results[0]
        names = result.names or {i: name for i, name in enumerate(CLASS_NAMES)}
        boxes = result.boxes
        if boxes is not None:
            for box in boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                name = str(names.get(cls_id, CLASS_NAMES[cls_id] if cls_id < len(CLASS_NAMES) else cls_id))
                xyxy = [float(v) for v in box.xyxy[0].tolist()]
                detections.append({"class": name, "confidence": round(conf, 3), "box": xyxy})
                if name in buckets:
                    buckets[name] = max(buckets[name], conf)

    result = _to_scores(buckets["wear"] * 100, buckets["crack"] * 100, buckets["tear"] * 100)
    if not detections:
        fallback = _heuristic_analyze(image_bytes)
        fallback["engine"] = "yolo-empty-fallback"
        return fallback
    result["detections"] = detections
    result["engine"] = "yolo"
    return result


def analyze_tire(image_bytes: bytes) -> dict:
    if MODEL_PATH.exists():
        try:
            return _yolo_analyze(image_bytes, MODEL_PATH)
        except Exception:
            fallback = _heuristic_analyze(image_bytes)
            fallback["engine"] = "heuristic-fallback"
            return fallback
    return _heuristic_analyze(image_bytes)

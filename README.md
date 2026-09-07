# 타이어케어 (TI)

YOLO 기반 AI 타이어 진단과 위치 기반 타이어 교체 서비스를 한 앱에서 제공합니다.

## 실행 방법

터미널 1 — API 서버

```bash
cd tr-test/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

터미널 2 — 웹 앱

```bash
cd tr-test/frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 을 엽니다.

## YOLO 모델

학습된 가중치가 있으면 `tr-test/models/best.pt` 로 저장하세요.
파일이 없으면 업로드 이미지의 명암·엣지 기반으로 마모/균열/찢김 점수를 계산합니다.

데이터셋 구조는 `dataset/README.md` 를 참고하세요.

## API

- `POST /api/diagnosis` 타이어 이미지 진단
- `GET /api/stores` 주변 매장
- `GET /api/tires` 타이어 상품
- `POST /api/orders` 예약
- `POST /api/drivers/match` 기사 매칭
- `GET /api/service/status?order_id=` 서비스 진행 상태

지도는 별도 키 없이 OpenStreetMap을 사용합니다. 카카오/네이버 지도로 바꾸려면 `StoreMap.jsx`와 `ServiceProgress.jsx`의 타일 레이어만 교체하면 됩니다.

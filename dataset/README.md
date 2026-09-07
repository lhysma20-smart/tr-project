# 타이어 YOLO 데이터셋

학습용 이미지는 아래 구조로 배치합니다.

```
dataset/
├── images/
│   ├── train/
│   └── val/
└── labels/
    ├── train/
    └── val/
```

클래스 (`data.yaml`):

- `0` tire
- `1` wear
- `2` crack
- `3` tear

학습이 끝나면 `models/best.pt`에 가중치를 두면 진단 API가 YOLO를 사용합니다.
학습 전이에는 이미지 기반 휴리스틱으로 결과를 반환합니다.

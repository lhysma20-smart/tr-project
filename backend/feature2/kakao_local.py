"""Kakao Local API를 이용해 실제 타이어 관련 매장을 검색합니다.

환경변수 KAKAO_REST_API_KEY 가 설정되어 있지 않거나 요청이 실패하면
빈 리스트를 반환하며, 호출부(stores.py)에서 기존 목업 데이터로 자동 폴백합니다.
"""
from __future__ import annotations

import os

import httpx

KAKAO_REST_API_KEY = os.environ.get("KAKAO_REST_API_KEY", "").strip()
KAKAO_LOCAL_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"


def search_tire_shops(
    lat: float,
    lng: float,
    radius: int = 5000,
    query: str = "타이어",
    limit: int = 12,
) -> list[dict]:
    """카카오 로컬 키워드 검색으로 주변 타이어 매장을 조회한다.

    좌표(x=lng, y=lat) 기준 반경(radius, m) 내에서 검색하며 거리순으로 정렬한다.
    Kakao REST API 키가 없거나 네트워크/요청 오류가 발생하면 빈 리스트를 반환한다.
    """
    if not KAKAO_REST_API_KEY:
        return []

    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {
        "query": query,
        "x": lng,
        "y": lat,
        "radius": radius,
        "sort": "distance",
        "size": min(limit, 15),
    }

    try:
        resp = httpx.get(KAKAO_LOCAL_URL, headers=headers, params=params, timeout=5.0)
        resp.raise_for_status()
        data = resp.json()
    except Exception:
        return []

    documents = data.get("documents", [])
    results: list[dict] = []
    for i, doc in enumerate(documents):
        distance_m = doc.get("distance")
        distance_km = round(int(distance_m) / 1000, 2) if distance_m else None
        results.append(
            {
                "id": f"kakao-{doc.get('id')}",
                "name": doc.get("place_name"),
                # Kakao Local API는 평점을 제공하지 않는다.
                "rating": None,
                "lat": float(doc["y"]),
                "lng": float(doc["x"]),
                # Kakao Local API는 기사 픽업 가능 여부를 제공하지 않으므로
                # 데모 목적으로 모든 매장에서 기사 매칭이 가능한 것으로 처리한다.
                "mechanic_available": True,
                "address": doc.get("road_address_name") or doc.get("address_name") or "",
                "distance_km": distance_km,
                "distance": f"{distance_km}km" if distance_km is not None else "",
                "phone": doc.get("phone") or "",
                "place_url": doc.get("place_url") or "",
                # 거리순 상위 2개를 추천 매장으로 강조 (실제 평점이 없으므로 거리 기준 사용)
                "recommended": i < 2,
                "source": "kakao",
            }
        )
    return results

from fastapi import APIRouter, Query

from .db import list_stores
from .kakao_local import search_tire_shops

router = APIRouter()


@router.get("/stores")
def get_stores(lat: float = Query(37.4979), lng: float = Query(127.0276)):
    kakao_results = search_tire_shops(lat, lng)
    if kakao_results:
        return kakao_results
    # KAKAO_REST_API_KEY가 설정되지 않았거나 검색 결과가 없으면 목업 데이터로 폴백
    return list_stores(lat, lng)

from fastapi import APIRouter, Query

from .db import list_stores

router = APIRouter()


@router.get("/stores")
def get_stores(lat: float = Query(37.4979), lng: float = Query(127.0276)):
    return list_stores(lat, lng)

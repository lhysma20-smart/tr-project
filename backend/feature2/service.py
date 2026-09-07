from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from .db import create_order, get_service_status

router = APIRouter()


class OrderBody(BaseModel):
    store_id: int
    tire_id: int
    method: str
    date: str | None = None
    user_lat: float | None = 37.4979
    user_lng: float | None = 127.0276


@router.post("/orders")
def post_order(body: OrderBody):
    if body.method not in {"visit", "driver"}:
        raise HTTPException(status_code=400, detail="method는 visit 또는 driver 여야 합니다.")
    return create_order(body.model_dump())


@router.get("/service/status")
def service_status(order_id: int = Query(...)):
    try:
        return get_service_status(order_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

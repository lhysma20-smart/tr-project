from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .db import match_driver

router = APIRouter()


class MatchBody(BaseModel):
    order_id: int


@router.post("/drivers/match")
def create_match(body: MatchBody):
    try:
        return match_driver(body.order_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

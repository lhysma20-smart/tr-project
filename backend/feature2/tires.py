from fastapi import APIRouter

from .db import list_tires

router = APIRouter()


@router.get("/tires")
def get_tires():
    return list_tires()

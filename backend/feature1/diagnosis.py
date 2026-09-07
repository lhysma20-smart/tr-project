from fastapi import APIRouter, File, HTTPException, UploadFile

from .yolo_service import analyze_tire

router = APIRouter()


@router.post("/diagnosis")
async def create_diagnosis(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드할 수 있습니다.")
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="빈 파일입니다.")
    return analyze_tire(contents)

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from feature1.diagnosis import router as diagnosis_router
from feature2.db import init_db
from feature2.drivers import router as drivers_router
from feature2.service import router as service_router
from feature2.stores import router as stores_router
from feature2.tires import router as tires_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title="TI Tire Care API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"ok": True}


app.include_router(diagnosis_router, prefix="/api")
app.include_router(stores_router, prefix="/api")
app.include_router(tires_router, prefix="/api")
app.include_router(drivers_router, prefix="/api")
app.include_router(service_router, prefix="/api")

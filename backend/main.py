import logging
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from destinations import DESTINATIONS
from forecaster import build_forecast

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Crowd Forecast")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

_cache: dict = {}
CACHE_TTL = timedelta(hours=12)


def cache_valid(dest_id: str) -> bool:
    if dest_id not in _cache:
        return False
    return datetime.now() - _cache[dest_id]["cached_at"] < CACHE_TTL


@app.get("/api/destinations")
def get_destinations():
    return [
        {"id": k, "name": v["name"], "state": v["state"]}
        for k, v in DESTINATIONS.items()
    ]


@app.get("/api/forecast/{destination_id}")
def get_forecast(destination_id: str):
    if destination_id not in DESTINATIONS:
        raise HTTPException(status_code=404, detail="Destination not found")

    if not cache_valid(destination_id):
        logger.info(f"cache miss: {destination_id}")
        try:
            data = build_forecast(destination_id)
            _cache[destination_id] = {"data": data, "cached_at": datetime.now()}
        except Exception as e:
            logger.error(f"forecast error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return _cache[destination_id]["data"]


@app.get("/health")
def health():
    return {"status": "ok"}
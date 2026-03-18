from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import httpx
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional

# Load env
load_dotenv()

app = FastAPI(title="KrishyaSetu API", version="1.0.0")

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Models
class WeatherRequest(BaseModel):
    city: str
    days: Optional[int] = 14

class ChatRequest(BaseModel):
    message: str

class MarketRequest(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    market: Optional[str] = None
    commodity: Optional[str] = None
    limit: Optional[int] = 2000

# API keys
ACCUWEATHER_API_KEY = os.getenv("ACCUWEATHER_API_KEY")
ACCUWEATHER_API_ENDPOINT = os.getenv("ACCUWEATHER_API_ENDPOINT")
MARKET_DATA_API_KEY = os.getenv("MARKET_DATA_API_KEY")
MARKET_DATA_API_ENDPOINT = os.getenv("MARKET_DATA_API_ENDPOINT")
CHATBOT_API_KEY = os.getenv("CHATBOT_API_KEY")
CHATBOT_API_ENDPOINT = os.getenv("CHATBOT_API_ENDPOINT")

# ✅ FRONTEND SERVE (FINAL FIX)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")

app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

# ✅ Health
@app.get("/health")
async def health():
    return {"status": "ok"}

# 🌦 Weather API
@app.post("/api/weather/forecast")
async def get_weather_forecast(request: WeatherRequest):
    if not ACCUWEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="Weather API key missing")

    async with httpx.AsyncClient() as client:
        location = await client.get(
            f"{ACCUWEATHER_API_ENDPOINT}/locations/v1/cities/search",
            params={"apikey": ACCUWEATHER_API_KEY, "q": request.city}
        )
        data = location.json()

        if not data:
            raise HTTPException(status_code=404, detail="City not found")

        key = data[0]["Key"]

        forecast = await client.get(
            f"{ACCUWEATHER_API_ENDPOINT}/forecasts/v1/daily/5day/{key}",
            params={"apikey": ACCUWEATHER_API_KEY}
        )

        return forecast.json()

# 🌾 Market API
@app.post("/api/market/prices")
async def market(request: MarketRequest):
    if not MARKET_DATA_API_KEY:
        raise HTTPException(status_code=500, detail="Market API key missing")

    url = f"{MARKET_DATA_API_ENDPOINT}9ef84268-d588-465a-a308-a864a43d0070"

    async with httpx.AsyncClient() as client:
        res = await client.get(url, params={
            "api-key": MARKET_DATA_API_KEY,
            "format": "json",
            "limit": request.limit
        })
        return res.json()

# 🤖 Chatbot
@app.post("/api/chatbot/message")
async def chatbot(request: ChatRequest):
    if not CHATBOT_API_KEY:
        return {"response": "Fallback response", "fallback": True}

    async with httpx.AsyncClient() as client:
        res = await client.post(
            CHATBOT_API_ENDPOINT,
            headers={"Authorization": f"Bearer {CHATBOT_API_KEY}"},
            json={"model": "sarvam-1", "messages": [{"role": "user", "content": request.message}]}
        )
        data = res.json()

        return {
            "response": data.get("choices", [{}])[0].get("message", {}).get("content", "")
        }
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
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

# ✅ SAFE FRONTEND LOAD (IMPORTANT FIX)

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")

if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/")
def serve_home():
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Frontend not found"}

@app.get("/index.html")
def index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

@app.get("/splash.html")
def splash():
    return FileResponse(os.path.join(FRONTEND_DIR, "splash.html"))

@app.get("/language.html")
def language():
    return FileResponse(os.path.join(FRONTEND_DIR, "language.html"))

@app.get("/signup.html")
def signup():
    return FileResponse(os.path.join(FRONTEND_DIR, "signup.html"))

@app.get("/login.html")
def login():
    return FileResponse(os.path.join(FRONTEND_DIR, "login.html"))

@app.get("/permissions.html")
def permissions():
    return FileResponse(os.path.join(FRONTEND_DIR, "permissions.html"))

@app.get("/navbar.html")
def navbaer():
    return FileResponse(os.path.join(FRONTEND_DIR, "navbar.html"))

@app.get("/dashboard.html")
def dashboard():
    return FileResponse(os.path.join(FRONTEND_DIR, "dashboard.html"))

@app.get("/market.html")
def market():
    return FileResponse(os.path.join(FRONTEND_DIR, "market.html"))

@app.get("/arscan.html")
def arscan():
    return FileResponse(os.path.join(FRONTEND_DIR, "arscan.html"))

@app.get("/chatbot.html")
def chatbot():
    return FileResponse(os.path.join(FRONTEND_DIR, "chatbot.html"))

@app.get("/pest.html")
def pest():
    return FileResponse(os.path.join(FRONTEND_DIR, "pest.html"))

@app.get("/soil.html")
def soil():
    return FileResponse(os.path.join(FRONTEND_DIR, "soil.html"))

@app.get("/calendar.html")
def calendar():
    return FileResponse(os.path.join(FRONTEND_DIR, "calendar.html"))

@app.get("/reports.html")
def reports():
    return FileResponse(os.path.join(FRONTEND_DIR, "reports.html"))

@app.get("/profile.html")
def profile():
    return FileResponse(os.path.join(FRONTEND_DIR, "profile.html"))

@app.get("/health")
async def health():
    return {"status": "ok"}

# 🌦 Weather API
@app.post("/api/weather/forecast")
async def get_weather_forecast(request: WeatherRequest):
    if not ACCUWEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="Weather API key missing")

    async with httpx.AsyncClient() as client:
        try:
            location_url = f"{ACCUWEATHER_API_ENDPOINT}/locations/v1/cities/search"
            loc = await client.get(location_url, params={
                "apikey": ACCUWEATHER_API_KEY,
                "q": request.city
            })
            data = loc.json()

            if not data:
                raise HTTPException(status_code=404, detail="City not found")

            key = data[0]["Key"]

            forecast_url = f"{ACCUWEATHER_API_ENDPOINT}/forecasts/v1/daily/5day/{key}"
            res = await client.get(forecast_url, params={
                "apikey": ACCUWEATHER_API_KEY
            })

            return res.json()

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# 🌾 Market API
@app.post("/api/market/prices")
async def market(request: MarketRequest):
    if not MARKET_DATA_API_KEY:
        raise HTTPException(status_code=500, detail="Market API key missing")

    url = f"{MARKET_DATA_API_ENDPOINT}9ef84268-d588-465a-a308-a864a43d0070"

    params = {
        "api-key": MARKET_DATA_API_KEY,
        "format": "json",
        "limit": request.limit
    }

    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url, params=params)
            return res.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# 🤖 Chatbot
@app.post("/api/chatbot/message")
async def chatbot(request: ChatRequest):
    if not CHATBOT_API_KEY:
        return {"response": "Fallback response", "fallback": True}

    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(
                CHATBOT_API_ENDPOINT,
                headers={"Authorization": f"Bearer {CHATBOT_API_KEY}"},
                json={"model": "sarvam-1", "messages": [{"role": "user", "content": request.message}]}
            )
            data = res.json()
            return {"response": data.get("choices", [{}])[0].get("message", {}).get("content", "")}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
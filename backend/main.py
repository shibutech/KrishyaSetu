from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import httpx
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional

# Load environment variables
load_dotenv()

app = FastAPI(title="KrishyaSetu API", version="1.0.0")

# ✅ CORS FIX (important for deploy)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for demo)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Models (fixed for pydantic v1)
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

# API Keys
ACCUWEATHER_API_KEY = os.getenv("ACCUWEATHER_API_KEY")
ACCUWEATHER_API_ENDPOINT = os.getenv("ACCUWEATHER_API_ENDPOINT")
MARKET_DATA_API_KEY = os.getenv("MARKET_DATA_API_KEY")
MARKET_DATA_API_ENDPOINT = os.getenv("MARKET_DATA_API_ENDPOINT")
CHATBOT_API_KEY = os.getenv("CHATBOT_API_KEY")
CHATBOT_API_ENDPOINT = os.getenv("CHATBOT_API_ENDPOINT")

# ✅ Serve frontend (optional but useful)
app.mount("/static", StaticFiles(directory="frontend"), name="static")

@app.get("/")
async def root():
    return FileResponse("frontend/index.html")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# 🌦 Weather API
@app.post("/api/weather/forecast")
async def get_weather_forecast(request: WeatherRequest):
    if not ACCUWEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="AccuWeather API key not configured")

    async with httpx.AsyncClient() as client:
        try:
            location_url = f"{ACCUWEATHER_API_ENDPOINT}/locations/v1/cities/search"
            location_params = {
                "apikey": ACCUWEATHER_API_KEY,
                "q": request.city,
                "limit": 1
            }

            location_response = await client.get(location_url, params=location_params)
            location_response.raise_for_status()
            location_data = location_response.json()

            if not location_data:
                raise HTTPException(status_code=404, detail="City not found")

            location_key = location_data[0]["Key"]

            forecast_url = f"{ACCUWEATHER_API_ENDPOINT}/forecasts/v1/daily/5day/{location_key}"
            forecast_params = {
                "apikey": ACCUWEATHER_API_KEY,
                "details": "true"
            }

            forecast_response = await client.get(forecast_url, params=forecast_params)
            forecast_response.raise_for_status()
            forecast_data = forecast_response.json()

            return {
                "location": location_data[0],
                "forecast": forecast_data,
                "city": request.city,
                "days_provided": min(request.days or 5, 5)
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# 🌾 Market API
@app.post("/api/market/prices")
async def get_market_prices(request: MarketRequest):
    if not MARKET_DATA_API_KEY:
        raise HTTPException(status_code=500, detail="Market API key not configured")

    resource_id = "9ef84268-d588-465a-a308-a864a43d0070"
    url = f"{MARKET_DATA_API_ENDPOINT}{resource_id}"

    params = {
        "api-key": MARKET_DATA_API_KEY,
        "format": "json",
        "limit": request.limit or 2000
    }

    if request.state:
        params["filters[state]"] = request.state
    if request.district:
        params["filters[district]"] = request.district
    if request.market:
        params["filters[market]"] = request.market
    if request.commodity:
        params["filters[commodity]"] = request.commodity

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# 🤖 Chatbot API
@app.post("/api/chatbot/message")
async def chatbot_message(request: ChatRequest):
    if not CHATBOT_API_KEY or CHATBOT_API_KEY == "your-chatbot-api-key":
        return {
            "response": f"Fallback: {request.message}",
            "fallback": True
        }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {CHATBOT_API_KEY}"
    }

    data = {
        "model": "sarvam-1",
        "messages": [
            {"role": "user", "content": request.message}
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(CHATBOT_API_ENDPOINT, headers=headers, json=data)
            response.raise_for_status()
            result = response.json()

            return {
                "response": result.get("choices", [{}])[0].get("message", {}).get("content", "No response"),
                "fallback": False
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Load environment variables
load_dotenv()

app = FastAPI(title="KrishyaSetu API", version="1.0.0")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:5500", "file://"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class WeatherRequest(BaseModel):
    city: str
    days: int = 14

class ChatRequest(BaseModel):
    message: str

class MarketRequest(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    market: Optional[str] = None
    commodity: Optional[str] = None
    limit: int = 2000

# API Keys from environment variables
ACCUWEATHER_API_KEY = os.getenv("ACCUWEATHER_API_KEY")
ACCUWEATHER_API_ENDPOINT = os.getenv("ACCUWEATHER_API_ENDPOINT")
MARKET_DATA_API_KEY = os.getenv("MARKET_DATA_API_KEY")
MARKET_DATA_API_ENDPOINT = os.getenv("MARKET_DATA_API_ENDPOINT")
CHATBOT_API_KEY = os.getenv("CHATBOT_API_KEY")
CHATBOT_API_ENDPOINT = os.getenv("CHATBOT_API_ENDPOINT")

@app.get("/")
async def root():
    return {"message": "KrishyaSetu API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Weather API endpoints
@app.post("/api/weather/forecast")
async def get_weather_forecast(request: WeatherRequest):
    """Get weather forecast for a city using AccuWeather API"""
    if not ACCUWEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="AccuWeather API key not configured")
    
    async with httpx.AsyncClient() as client:
        try:
            # Step 1: Get location key for the city
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
                raise HTTPException(status_code=404, detail=f"City '{request.city}' not found")
            
            location_key = location_data[0]["Key"]
            
            # Step 2: Get 5-day forecast (AccuWeather limit for free tier)
            forecast_url = f"{ACCUWEATHER_API_ENDPOINT}/forecasts/v1/daily/5day/{location_key}"
            forecast_params = {
                "apikey": ACCUWEATHER_API_KEY,
                "details": "true"
            }
            
            forecast_response = await client.get(forecast_url, params=forecast_params)
            forecast_response.raise_for_status()
            forecast_data = forecast_response.json()
            
            # Format response to match expected structure
            formatted_response = {
                "location": location_data[0],
                "forecast": forecast_data,
                "city": request.city,
                "days_provided": min(request.days, 5)  # AccuWeather free tier limit
            }
            
            return formatted_response
            
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"AccuWeather API error: {e}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

# Market Data API endpoints
@app.post("/api/market/prices")
async def get_market_prices(request: MarketRequest):
    """Get agricultural market prices"""
    if not MARKET_DATA_API_KEY:
        raise HTTPException(status_code=500, detail="Market API key not configured")
    
    resource_id = "9ef84268-d588-465a-a308-a864a43d0070"  # Current Daily Market Prices
    url = f"{MARKET_DATA_API_ENDPOINT}{resource_id}"
    
    params = {
        "api-key": MARKET_DATA_API_KEY,
        "format": "json",
        "limit": request.limit
    }
    
    # Add filters if provided
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
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Market API error: {e}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

# Chatbot API endpoints
@app.post("/api/chatbot/message")
async def chatbot_message(request: ChatRequest):
    """Send message to chatbot and get response using Sarvam AI API"""
    if not CHATBOT_API_KEY or CHATBOT_API_KEY == "your-chatbot-api-key":
        # Fallback response for development
        return {
            "response": f"I received your message: '{request.message}'. This is a fallback response. Please configure a proper chatbot API.",
            "fallback": True
        }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {CHATBOT_API_KEY}"
    }
    
    # Sarvam AI API format (similar to OpenAI)
    data = {
        "model": "sarvam-1",  # Sarvam AI model
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful agricultural advisor for Indian farmers. Provide practical advice about farming, crop management, weather patterns, market prices, and sustainable farming practices. Be concise and focus on actionable advice relevant to Indian agriculture. Respond in the language the user prefers (English, Hindi, or other Indian languages)."
            },
            {
                "role": "user",
                "content": request.message
            }
        ],
        "max_tokens": 500,
        "temperature": 0.7
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(CHATBOT_API_ENDPOINT, headers=headers, json=data)
            response.raise_for_status()
            result = response.json()
            
            # Extract the response content from Sarvam AI format
            if "choices" in result and len(result["choices"]) > 0:
                return {
                    "response": result["choices"][0]["message"]["content"],
                    "fallback": False
                }
            else:
                raise HTTPException(status_code=500, detail="Invalid response from chatbot API")
                
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Sarvam AI API error: {e}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

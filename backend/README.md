# KrishyaSetu Backend API

FastAPI backend for secure API key management and proxy services.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual API keys
# ACCUWEATHER_API_KEY=your-actual-accuweather-api-key
# MARKET_DATA_API_KEY=your-actual-market-api-key
# CHATBOT_API_KEY=your-chatbot-api-key
```

### 3. Run the Server
```bash
# Development
python main.py

# Or with uvicorn for hot reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📡 API Endpoints

### Base URL: `http://localhost:8000`

### Health Check
- `GET /` - Welcome message
- `GET /health` - Health status

### Weather API
- `POST /api/weather/forecast`
  ```json
  {
    "city": "Mumbai",
    "days": 14
  }
  ```

### Market Data API
- `POST /api/market/prices`
  ```json
  {
    "state": "Maharashtra",
    "district": "Pune",
    "market": "Pune",
    "commodity": "Wheat",
    "limit": 2000
  }
  ```

### Chatbot API
- **Provider**: Sarvam AI (https://www.sarvam.ai/)
- `POST /api/chatbot/message`
  ```json
  {
    "message": "What is the best time to sow wheat?"
  }
  ```

## 🔧 Frontend Integration

Update your frontend to call the backend instead of external APIs:

```javascript
// Instead of calling external API directly
const response = await fetch('http://localhost:8000/api/weather/forecast', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ city: 'Mumbai', days: 14 })
});
```

## 🛡️ Security Features

- ✅ API keys stored securely in backend environment variables
- ✅ CORS configured for frontend access
- ✅ Input validation with Pydantic models
- ✅ Error handling for API failures
- ✅ Fallback responses for development

## 🚀 Deployment

### Production Deployment
1. Set environment variables in your hosting platform
2. Use HTTPS in production
3. Configure proper CORS origins
4. Add rate limiting and authentication

### Docker Deployment (Optional)
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ACCUWEATHER_API_KEY` | AccuWeather API key | Yes |
| `MARKET_DATA_API_KEY` | Data.gov.in API key | Yes |
| `CHATBOT_API_KEY` | Sarvam AI API key | Optional |
| `ACCUWEATHER_API_ENDPOINT` | AccuWeather API base URL | No (has default) |
| `MARKET_DATA_API_ENDPOINT` | Market API base URL | No (has default) |
| `CHATBOT_API_ENDPOINT` | Sarvam AI API endpoint | No (has default) |

## 🔍 Testing

Test the API endpoints:
```bash
# Health check
curl http://localhost:8000/health

# Weather forecast
curl -X POST http://localhost:8000/api/weather/forecast \
  -H "Content-Type: application/json" \
  -d '{"city": "Mumbai", "days": 7}'

# Market prices
curl -X POST http://localhost:8000/api/market/prices \
  -H "Content-Type: application/json" \
  -d '{"limit": 10}'
```

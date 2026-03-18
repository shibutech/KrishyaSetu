# 🚀 KrishyaSetu Complete Setup Guide

## 📋 Overview
This guide will help you set up the complete KrishyaSetu application with secure API key management using FastAPI backend.

## 🏗️ Architecture
```
Frontend (Static HTML/JS) → FastAPI Backend → External APIs
```
- **Frontend**: Static files with no API keys exposed
- **Backend**: FastAPI server with secure API key management
- **External APIs**: Weather, Market Data, Chatbot services

## 🔧 Setup Steps

### 1. Backend Setup

#### 1.1 Navigate to Backend Directory
```bash
cd backend
```

#### 1.2 Quick Start (Windows)
```bash
# Run the startup script
start.bat
```

#### 1.3 Quick Start (Linux/Mac)
```bash
# Make script executable and run
chmod +x start.sh
./start.sh
```

#### 1.4 Manual Setup
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
notepad .env  # Windows
nano .env      # Linux/Mac

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Configure API Keys

Edit the `backend/.env` file with your actual API keys:

```env
# Get new API keys from providers
ACCUWEATHER_API_KEY=your-new-accuweather-api-key
MARKET_DATA_API_KEY=your-new-market-api-key
CHATBOT_API_KEY=your-chatbot-api-key
```

### 3. Frontend Setup

The frontend is already configured to use the backend API. No changes needed!

### 4. Test the Setup

#### 4.1 Backend Test
Open your browser and navigate to:
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

#### 4.2 Frontend Test
Open any frontend HTML file in your browser:
- `frontend/dashboard.html` - Weather functionality
- `frontend/market.html` - Market data
- `frontend/chatbot.html` - Chatbot functionality

## 🔑 API Key Providers

### Weather API
- **Provider**: https://www.accuweather.com/
- **Action**: Regenerate your key and update `backend/.env`

### Market Data API
- **Provider**: https://data.gov.in/
- **Action**: Regenerate your key and update `backend/.env`

### Chatbot API
- **Provider**: Sarvam AI (https://www.sarvam.ai/)
- **Action**: Update `backend/.env` with your Sarvam AI API key

## 🛡️ Security Features

✅ **API Keys Secure**: Stored in backend environment variables only  
✅ **No Frontend Exposure**: Frontend has no API keys  
✅ **CORS Protected**: Backend controls frontend access  
✅ **Input Validation**: All API inputs validated  
✅ **Error Handling**: Graceful fallbacks for API failures  

## 📡 API Endpoints

### Weather Forecast
```javascript
POST /api/weather/forecast
{
  "city": "Mumbai",
  "days": 14
}
```

### Market Prices
```javascript
POST /api/market/prices
{
  "state": "Maharashtra",
  "district": "Pune",
  "limit": 2000
}
```

### Chatbot
```javascript
POST /api/chatbot/message
{
  "message": "What is the best time to sow wheat?"
}
```

## 🚀 Deployment

### Development
- Backend: `http://localhost:8000`
- Frontend: Open HTML files directly or use live server

### Production
1. **Backend**: Deploy to cloud platform (Heroku, AWS, etc.)
2. **Environment Variables**: Set in hosting platform
3. **Frontend**: Deploy to static hosting (Netlify, Vercel, etc.)
4. **Update URLs**: Change `BACKEND_URL` in `frontend/js/config.js`

## 🔧 Troubleshooting

### Backend Not Starting
```bash
# Check Python version (3.8+ required)
python --version

# Check virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend Not Connecting
1. Ensure backend is running on port 8000
2. Check browser console for CORS errors
3. Verify `BACKEND_URL` in `frontend/js/config.js`

### API Errors
1. Check `.env` file has correct API keys
2. Verify API keys are valid and active
3. Check API provider documentation for changes

## 📁 Project Structure

```
KrishyaSetu/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example        # Environment template
│   ├── .env                # API keys (create this)
│   ├── start.sh            # Linux/Mac startup script
│   ├── start.bat           # Windows startup script
│   └── README.md           # Backend documentation
├── frontend/
│   ├── js/
│   │   ├── config.js       # Frontend configuration
│   │   └── functional/     # Updated to use backend
│   ├── *.html              # HTML files
│   └── css/                # Styles
├── .env                    # Root environment (backup)
├── .gitignore              # Git ignore rules
└── SETUP-GUIDE.md          # This guide
```

## 🎉 Next Steps

1. **Regenerate API Keys** from all providers
2. **Update `backend/.env`** with new keys
3. **Start the backend** using `start.bat` or `start.sh`
4. **Test frontend functionality**
5. **Deploy to production** when ready

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend logs for error messages
3. Verify API key validity with providers
4. Test API endpoints using the Swagger UI at `/docs`

---

**🔐 Your API keys are now secure!**

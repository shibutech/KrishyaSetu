// Configuration file - Production safe version
// Backend API proxy for secure API key handling

const config = {
    // Backend API Configuration
    BACKEND_URL: 'http://localhost:8000', // Update this for production
    
    // Weather API Configuration (proxied through backend)
    WEATHER_API_KEY: 'proxied-through-backend',
    WEATHER_API_ENDPOINT: `${window.location.protocol}//${window.location.hostname}:8000/api/weather/forecast`,
    
    // Market Data API Configuration (proxied through backend)
    MARKET_DATA_API_KEY: 'proxied-through-backend',
    MARKET_DATA_API_ENDPOINT: `${window.location.protocol}//${window.location.hostname}:8000/api/market/prices`,
    
    // Chatbot API Configuration (proxied through backend)
    CHATBOT_API_KEY: 'proxied-through-backend',
    CHATBOT_API_ENDPOINT: `${window.location.protocol}//${window.location.hostname}:8000/api/chatbot/message`
};

// Export configuration
window.APP_CONFIG = config;

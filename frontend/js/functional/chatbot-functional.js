/*
===========================================
KRISHYASETU CHATBOT FUNCTIONALITY
===========================================
Complete chatbot functionality with all features
=======================================
*/

class ChatbotHuggingFace {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.isRecording = false;
        this.recognition = null;
        this.isInitialized = false;
        this.maxMessages = 50;
        this.maxStorageSize = 1024 * 1024; // 1MB storage limit
    }

    // Initialize chatbot functionality
    init() {
        if (this.isInitialized) return;

        this.loadStoredMessages();
        this.initializeSpeechRecognition();
        this.bindEvents();
        this.renderMessages();
        this.checkPreMessage();
        this.isInitialized = true;
    }

    // Load stored messages
    loadStoredMessages() {
        const storedMessages = localStorage.getItem('chatbotMessages');
        this.messages = storedMessages ? JSON.parse(storedMessages) : [];

        // Add welcome message if no messages
        if (this.messages.length === 0) {
            this.addBotMessage('🌱 Welcome to KrishyaSetu! I\'m here to help you with all your farming needs. How can I assist you today?');
        }

        // Enforce message limit and cleanup old messages
        this.enforceMessageLimit();
    }

    // Save messages to localStorage with storage quota management
    saveMessages() {
        try {
            // Check storage quota before saving
            const storageSize = JSON.stringify(this.messages).length;
            const maxSize = this.maxStorageSize;

            if (storageSize > maxSize) {
                console.warn('Chat storage approaching limit, cleaning up old messages');
                this.cleanupOldMessages();
            }

            localStorage.setItem('chatbotMessages', JSON.stringify(this.messages));
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.warn('Storage quota exceeded, cleaning up messages');
                this.cleanupOldMessages();
                // Retry saving after cleanup
                try {
                    localStorage.setItem('chatbotMessages', JSON.stringify(this.messages));
                } catch (retryError) {
                    console.error('Failed to save messages after cleanup:', retryError);
                    // Show user notification
                    if (window.toast) {
                        window.toast.warning('Chat history is full. Some old messages have been removed.');
                    }
                }
            } else {
                console.error('Error saving messages:', error);
            }
        }
    }

    // Prevent memory leaks by cleaning up old messages
    cleanupOldMessages() {
        // Remove oldest 25% of messages if storage is full
        const cleanupCount = Math.floor(this.messages.length * 0.25);
        this.messages.splice(0, cleanupCount);
        console.log(`Cleaned up ${cleanupCount} old messages due to storage constraints`);
    }

    // Clear chat history with proper cleanup
    clearChatHistory() {
        this.messages = [];

        try {
            localStorage.removeItem('chatbotMessages');
            console.log('Chat history cleared');

            if (window.toast) {
                window.toast.success('Chat history cleared successfully');
            }
        } catch (error) {
            console.error('Error clearing chat history:', error);
            if (window.toast) {
                window.toast.error('Failed to clear chat history');
            }
        }

        this.renderMessages();
    }

    // Cleanup resources on destroy
    destroy() {
        this.messages = [];

        if (this.recognition) {
            this.recognition.stop();
            this.recognition = null;
        }

        // Clean up any event listeners
        const sendButton = document.getElementById('sendButton');
        const messageInput = document.getElementById('messageInput');
        const voiceButton = document.getElementById('voiceButton');

        if (sendButton) sendButton.removeEventListener('click', this.handleSendMessage);
        if (messageInput) messageInput.removeEventListener('keypress', this.handleKeyPress);
        if (voiceButton) voiceButton.removeEventListener('click', this.toggleVoiceRecording);

        this.isInitialized = false;
        console.log('Chatbot resources cleaned up');
    }

    // Check for pre-filled message
    checkPreMessage() {
        // Check both sessionStorage and localStorage for pre-filled messages
        const preMessage = sessionStorage.getItem('chatbotPreMessage') ||
            localStorage.getItem('chatbotPreMessage') ||
            localStorage.getItem('verdantContext');

        if (preMessage) {
            // Wait a small bit to ensure UI is ready
            setTimeout(() => {
                this.sendMessage(preMessage);

                // Clear all possible keys
                sessionStorage.removeItem('chatbotPreMessage');
                localStorage.removeItem('chatbotPreMessage');
                localStorage.removeItem('verdantContext');
            }, 500);
        }
    }

    // Initialize speech recognition
    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isRecording = true;
                this.updateRecordingUI(true);
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.setInputText(transcript);
                this.sendMessage(transcript);
            };

            this.recognition.onerror = (event) => {
                console.warn('Speech recognition error:', event.error);
                this.isRecording = false;
                this.updateRecordingUI(false);

                if (event.error === 'not-allowed') {
                    this.showNotification('Microphone access denied. Please allow microphone access.', 'error');
                } else {
                    this.showNotification('Speech recognition failed. Please try again.', 'error');
                }
            };

            this.recognition.onend = () => {
                this.isRecording = false;
                this.updateRecordingUI(false);
            };
        }
    }

    // Bind chatbot events
    bindEvents() {
        // Send button
        const sendBtn = document.getElementById('sendMessageBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.handleSendMessage();
            });
        }

        // Message input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });

            // Auto-resize textarea
            messageInput.addEventListener('input', () => {
                this.autoResizeTextarea(messageInput);
            });
        }

        // Microphone button
        const micBtn = document.getElementById('micBtn');
        if (micBtn) {
            micBtn.addEventListener('click', () => {
                this.toggleRecording();
            });
        }

        // File attachment button
        const fileBtn = document.getElementById('fileBtn');
        if (fileBtn) {
            fileBtn.addEventListener('click', () => {
                this.openFileAttachment();
            });
        }

        // Quick action buttons
        this.bindQuickActions();
    }

    // Handle send message
    handleSendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();

        if (!message) return;

        try {
            this.sendMessage(message);
        } catch (error) {
            console.error('Error in handleSendMessage:', error);
        } finally {
            messageInput.value = '';
            this.autoResizeTextarea(messageInput);
        }
    }

    // Send message
    sendMessage(text) {
        if (!text.trim()) return;

        // Check storage before adding new message
        const stats = this.getStorageStats();
        if (stats.usagePercent > 90) {
            if (window.toast) {
                window.toast.warning('Chat storage is almost full. Consider clearing chat history.');
            }
        }

        // Add user message
        this.addUserMessage(text);

        // Show typing indicator
        this.showTypingIndicator();

        // Generate bot response
        setTimeout(() => {
            this.generateBotResponse(text);
        }, 1000 + Math.random() * 1000);
    }

    // Add user message
    addUserMessage(text) {
        // Prevent memory leaks by cleaning up before adding new messages
        this.enforceMessageLimit();

        const message = {
            id: Date.now(),
            type: 'user',
            text: text,
            timestamp: new Date().toISOString()
        };

        this.messages.push(message);
        this.saveMessages();
        this.renderMessages();
        this.scrollToBottom();
    }

    // Add bot message
    addBotMessage(text, options = {}) {
        // Prevent memory leaks by cleaning up before adding new messages
        this.enforceMessageLimit();

        const message = {
            id: Date.now(),
            type: 'bot',
            text: text,
            timestamp: new Date().toISOString(),
            ...options
        };

        this.messages.push(message);
        this.saveMessages();
        this.renderMessages();
        this.scrollToBottom();
    }

    // Generate bot response
    async generateBotResponse(userMessage) {
        try {
            const response = await this.getBotResponse(userMessage);
            this.hideTypingIndicator();
            this.addBotMessage(response.text, response.options);
        } catch (error) {
            console.error('Error generating bot response:', error);
            this.hideTypingIndicator();
            this.addBotMessage('I apologize, but I\'m having trouble processing your request right now. Please try again later.');
        }
    }

    // Get bot response based on user message
    async getBotResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Try to get response from AI service first
        try {
            return await this.getAIResponse(message);
        } catch (error) {
            console.warn('AI service unavailable, using fallback responses:', error);
            return this.getFallbackResponse(lowerMessage);
        }
    }

    // Get response from AI service
    async getAIResponse(message) {
        const API_ENDPOINT = window.APP_CONFIG.CHATBOT_API_ENDPOINT;

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    context: 'farming_advisor',
                    language: 'en'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'API returned error');
            }

            return {
                text: data.response || data.message || 'I apologize, but I couldn\'t process your request.',
                options: {
                    source: 'ai',
                    confidence: data.confidence || 0.8
                }
            };
        } catch (error) {
            console.error('AI API error:', error);
            throw error; // Re-throw to trigger fallback
        }
    }

    // Fallback responses when AI service is unavailable
    getFallbackResponse(lowerMessage) {

        // Government schemes responses
        if (lowerMessage.includes('pm kisan') || lowerMessage.includes('kisan samman')) {
            return {
                text: '📋 **PM Kisan Samman Nidhi**\n\nPM Kisan Samman Nidhi is a central sector scheme providing income support to all landholding farmer families. \n\n**Key Features:**\n• ₹6,000 per year per farmer family\n• Paid in 3 equal installments of ₹2,000\n• Direct benefit transfer to bank accounts\n• Covers both small and marginal farmers\n\n**Eligibility:**\n• All landholding farmer families\n• Must have cultivable land\n• Aadhaar and bank account required\n\n**How to Apply:**\n1. Visit your nearest Common Service Center (CSC)\n2. Or apply online at pmkisan.gov.in\n3. Provide land records and bank details\n\nWould you like help with the application process?'
            };
        }

        if (lowerMessage.includes('fasal bima') || lowerMessage.includes('crop insurance')) {
            return {
                text: '🌾 **Pradhan Mantri Fasal Bima Yojana (PMFBY)**\n\nPMFBY provides comprehensive crop insurance coverage against non-preventable natural risks.\n\n**Coverage:**\n• Prevented sowing/planting risks\n• Post-harvest losses\n• Localized calamities\n• Mid-season adversities\n\n**Premium Rates:**\n• Kharif crops: 2% of sum insured\n• Rabi crops: 1.5% of sum insured\n• Commercial/horticultural crops: 5%\n\n**Benefits:**\n• Low premium rates\n• Fast claim settlement\n• Use of technology for assessment\n\n**Documents Required:**\n• Land records\n• Bank account details\n• Aadhaar card\n• Crop details\n\nNeed help with claim process?'
            };
        }

        if (lowerMessage.includes('soil health') || lowerMessage.includes('soil card')) {
            return {
                text: '🌱 **Soil Health Card Scheme**\n\nSoil Health Card provides farmers with soil nutrient status and recommendations for appropriate fertilizer usage.\n\n**Benefits:**\n• Know your soil health\n• Get fertilizer recommendations\n• Increase crop yield\n• Reduce fertilizer costs\n• Improve soil fertility\n\n**Process:**\n1. Soil sample collection\n2. Laboratory testing\n3. Soil health card generation\n4. Recommendations provided\n\n**What it shows:**\n• Soil pH level\n• Nutrient status (NPK)\n• Organic carbon\n• Micronutrients\n• Fertilizer recommendations\n\n**How to Apply:**\n• Contact agriculture department\n• Or visit soilhealth.dac.gov.in\n\nWant to know how to collect soil samples properly?'
            };
        }

        // Crop related responses
        if (lowerMessage.includes('wheat') || lowerMessage.includes('गेंहू')) {
            return {
                text: '🌾 **Wheat Cultivation Guide**\n\n**Best Time for Planting:**\n• October-November (Rabi season)\n• Optimal temperature: 15-25°C\n\n**Varieties:**\n• HD 2967, PBW 343, Lok 1 (popular choices)\n• Choose based on your region\n\n**Soil Requirements:**\n• Well-drained loamy soil\n• pH: 6.0-7.5\n• Good organic matter\n\n**Irrigation Schedule:**\n• First irrigation: 20-25 days after sowing\n• Subsequent: Every 15-20 days\n• Total: 4-5 irrigations\n\n**Fertilizer Application:**\n• Basal: 60kg N + 30kg P + 30kg K per hectare\n• Top dressing: 30kg N at crown root initiation\n\n**Common Pests & Diseases:**\n• Wheat rust, Karnal bunt\n• Aphids, termites\n• Use resistant varieties\n\n**Harvesting:**\n• April-May (120-140 days)\n• Moisture content: 12-14%\n\nNeed specific advice for your region?'
            };
        }

        if (lowerMessage.includes('rice') || lowerMessage.includes('धान')) {
            return {
                text: '🌾 **Rice Cultivation Guide**\n\n**Best Time for Planting:**\n• June-July (Kharif season)\n• Requires 25-35°C temperature\n\n**Varieties:**\n• Basmati: Pusa Basmati 1121, 1509\n• Non-Basmati: Swarna, MTU 1010\n\n**Water Requirements:**\n• 1500-2500mm rainfall\n• Standing water: 5-10cm during growth\n\n**Soil Requirements:**\n• Clay to clay loam soil\n• pH: 5.5-7.0\n• Good water retention\n\n**Nursery Management:**\n• Seed rate: 40-50kg/ha\n• Nursery duration: 25-30 days\n• Apply basal fertilizer\n\n**Transplanting:**\n• Spacing: 20x15cm\n• 2-3 seedlings per hill\n\n**Fertilizer Application:**\n• 80kg N + 40kg P + 40kg K per hectare\n• Split N application: 50% basal, 25% at tillering, 25% at panicle initiation\n\n**Harvesting:**\n• October-November (120-150 days)\n• Moisture: 18-20%\n\nNeed help with water management?'
            };
        }

        // Weather related responses
        if (lowerMessage.includes('weather') || lowerMessage.includes('मौसम')) {
            return {
                text: '🌤️ **Weather Information**\n\nI can help you with weather information for farming decisions.\n\n**Current Weather Features:**\n• Temperature and humidity\n• Rainfall predictions\n• Wind speed and direction\n• UV index\n• Farming advisories\n\n**Weather-Based Farming Tips:**\n\n**Sunny Days (25-35°C):**\n• Good for field preparation\n• Ideal for pesticide application\n• Monitor irrigation needs\n\n**Rainy Days:**\n• Avoid fertilizer application\n• Check drainage systems\n• Monitor for fungal diseases\n\n**Cloudy Days:**\n• Good for transplanting\n• Reduced water stress\n• Monitor for pests\n\n**Cold Days (<15°C):**\n• Delay planting\n• Protect young plants\n• Use frost protection if needed\n\n**Hot Days (>35°C):**\n• Increase irrigation frequency\n• Provide shade to seedlings\n• Monitor for heat stress\n\nTo get specific weather for your location, please check the weather widget on your dashboard.\n\nWould you like weather-based farming recommendations for your crops?'
            };
        }

        // Pest and disease responses
        if (lowerMessage.includes('pest') || lowerMessage.includes('disease') || lowerMessage.includes('कीट') || lowerMessage.includes('रोग')) {
            return {
                text: '🐛 **Pest and Disease Management**\n\n**Common Wheat Pests:**\n• **Aphids:** Spray neem oil or use ladybird beetles\n• **Termites:** Use chlorpyrifos 20% EC\n• **Armyworm:** Use appropriate insecticides\n\n**Common Rice Pests:**\n• **Brown Planthopper:** Use resistant varieties\n• **Stem Borer:** Remove infected plants\n• **Rice Hispa:** Use appropriate pesticides\n\n**Disease Management:**\n\n**Fungal Diseases:**\n• Use fungicides like copper oxychloride\n• Improve air circulation\n• Avoid overwatering\n\n**Bacterial Diseases:**\n• Use disease-free seeds\n• Crop rotation\n• Proper field sanitation\n\n**Viral Diseases:**\n• Use resistant varieties\n• Control vector insects\n• Remove infected plants\n\n**Integrated Pest Management (IPM):**\n1. Monitor crops regularly\n2. Use natural predators\n3. Apply pesticides only when necessary\n4. Follow recommended doses\n5. Maintain field hygiene\n\n**Organic Alternatives:**\n• Neem-based products\n• Garlic-chili spray\n• Trichoderma bio-fungicide\n• Pheromone traps\n\nNeed specific help with a pest or disease issue?'
            };
        }

        // Fertilizer responses
        if (lowerMessage.includes('fertilizer') || lowerMessage.includes('खाद')) {
            return {
                text: '🌱 **Fertilizer Management**\n\n**NPK Fertilizers:**\n\n**Nitrogen (N):**\n• Promotes leaf growth\n• Apply during active growth\n• Sources: Urea, Ammonium sulfate\n\n**Phosphorus (P):**\n• Promotes root development\n• Apply at planting time\n• Sources: DAP, Superphosphate\n\n**Potassium (K):**\n• Improves disease resistance\n• Apply before flowering\n• Sources: MOP, SOP\n\n**Application Guidelines:**\n\n**Wheat:**\n• Basal: 60kg N + 30kg P + 30kg K per hectare\n• Top dressing: 30kg N at crown root initiation\n\n**Rice:**\n• Basal: 40kg N + 40kg P + 40kg K per hectare\n• Split N: 2-3 applications during growth\n\n**Organic Fertilizers:**\n• Farmyard manure: 10-15 tons/ha\n• Vermicompost: 2-3 tons/ha\n• Green manure: Grow and incorporate\n\n**Bio-fertilizers:**\n• Rhizobium for legumes\n• Azotobacter for cereals\n• Phosphate solubilizing bacteria\n\n**Application Tips:**\n• Soil test before application\n• Apply based on crop needs\n• Split applications for better efficiency\n• Avoid over-fertilization\n\nNeed help with specific crop fertilizer schedule?'
            };
        }

        // Market price responses
        if (lowerMessage.includes('market') || lowerMessage.includes('price') || lowerMessage.includes('मंडी') || lowerMessage.includes('कीमत')) {
            return {
                text: '💰 **Market Price Information**\n\n**Current Market Features:**\n• Real-time commodity prices\n• State and district level data\n• Price trends and analysis\n• Market recommendations\n\n**Major Commodities:**\n• Wheat, Rice, Maize\n• Pulses, Oilseeds\n• Vegetables, Fruits\n• Spices\n\n**Price Influencing Factors:**\n• Seasonal demand\n• Weather conditions\n• Government policies\n• Export/import situation\n• Storage availability\n\n**Market Timing Tips:**\n\n**Best Time to Sell:**\n• Harvest season: Usually lower prices\n• Off-season: Higher prices\n• Festival times: Increased demand\n\n**Storage Benefits:**\n• Wait for better prices\n• Reduce market glut\n• Better price realization\n\n**Government Support:**\n• MSP (Minimum Support Price)\n• Market interventions\n• Procurement centers\n\n**How to Check Prices:**\n1. Visit the Market page in the app\n2. Select your state and district\n3. Choose commodity\n4. View current and historical prices\n\n**Price Negotiation Tips:**\n• Know market rates\n• Quality matters\n• Bulk selling advantage\n• Timing is crucial\n\nWould you like to know current prices for specific crops in your area?'
            };
        }

        // Irrigation responses
        if (lowerMessage.includes('irrigation') || lowerMessage.includes('water') || lowerMessage.includes('सिंचाई')) {
            return {
                text: '💧 **Irrigation Management**\n\n**Irrigation Methods:**\n\n**Flood Irrigation:**\n• Traditional method\n• 30-40% water efficiency\n• Low cost, high water use\n\n**Drip Irrigation:**\n• 90-95% water efficiency\n• Direct to roots\n• Reduces weed growth\n\n**Sprinkler Irrigation:**\n• 70-80% water efficiency\n• Uniform application\n• Can be automated\n\n**Irrigation Scheduling:**\n\n**Wheat:**\n• First: 20-25 days after sowing\n• Subsequent: Every 15-20 days\n• Total: 4-5 irrigations\n• Stop 10-15 days before harvest\n\n**Rice:**\n• Maintain 5-10cm standing water\n• Drain before harvest\n• Total water: 1500-2500mm\n\n**Vegetables:**\n• Light, frequent irrigation\n• 2-3 days interval\n• Avoid water stress\n\n**Water Quality:**\n• EC < 2 dS/m (good)\n• pH 6.5-8.0\n• Low sodium content\n\n**Irrigation Tips:**\n• Irrigate early morning or evening\n• Check soil moisture before watering\n• Use mulch to reduce evaporation\n• Monitor weather forecasts\n\n**Water Conservation:**\n• Use drought-resistant varieties\n• Proper land leveling\n• Mulching techniques\n• Rainwater harvesting\n\nNeed help with irrigation system setup?'
            };
        }

        // General help responses
        if (lowerMessage.includes('help') || lowerMessage.includes('सहायता')) {
            return {
                text: '🤝 **How I Can Help You**\n\nI can assist you with various farming topics:\n\n📋 **Government Schemes:**\n• PM Kisan Samman Nidhi\n• Crop Insurance (PMFBY)\n• Soil Health Card\n• Subsidy programs\n\n🌾 **Crop Information:**\n• Wheat, Rice, Maize cultivation\n• Vegetable farming\n• Fruit orchard management\n• Organic farming\n\n🐛 **Pest & Disease:**\n• Identification and control\n• Organic solutions\n• Chemical treatments\n• Prevention methods\n\n🌱 **Soil & Fertilizers:**\n• Soil testing\n• Fertilizer recommendations\n• Organic manures\n• Bio-fertilizers\n\n💧 **Irrigation:**\n• Water management\n• Irrigation systems\n• Water conservation\n• Scheduling\n\n💰 **Market Information:**\n• Current prices\n• Market trends\n• Selling tips\n• Storage advice\n\n🌤️ **Weather:**\n• Weather-based farming\n• Seasonal advice\n• Risk management\n\n**How to Use:**\n1. Type your question in simple language\n2. Be specific about your crop/location\n3. Use English or Hindi\n4. I\'ll provide detailed, practical advice\n\n**Quick Commands:**\n• "Tell me about wheat farming"\n• "PM Kisan scheme details"\n• "How to control aphids"\n• "Current market prices"\n\nWhat would you like to know about?'
            };
        }

        // Default response
        return {
            text: '🌱 I understand you\'re asking about: "' + message + '"\n\nI can help you with farming-related topics including:\n\n• Government schemes (PM Kisan, crop insurance, soil health card)\n• Crop cultivation (wheat, rice, vegetables, fruits)\n• Pest and disease management\n• Fertilizer and soil management\n• Irrigation and water management\n• Market prices and selling tips\n• Weather-based farming advice\n\nPlease try asking more specifically about any of these topics. For example:\n• "Tell me about PM Kisan scheme"\n• "How to grow wheat"\n• "What fertilizer to use for rice"\n• "Current market prices"\n\nI\'m here to help with all your farming needs! 🚜'
        };
    }

    // Render messages
    renderMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        const messagesHTML = this.messages.map(message => `
            <div class="message ${message.type}">
                <div class="message-bubble">
                    ${message.type === 'bot' ? '<div class="bot-avatar" style="background: transparent;"><img src="pwa/icons/Verdant.png" alt="Verdant Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;"></div>' : ''}
                    <div class="message-content">
                        ${this.formatMessageText(message.text)}
                        ${message.attachments ? this.renderAttachments(message.attachments) : ''}
                    </div>
                    ${message.type === 'user' ? '<div class="user-avatar">👤</div>' : ''}
                </div>
                <div class="message-time">${this.formatMessageTime(message.timestamp)}</div>
            </div>
        `).join('');

        messagesContainer.innerHTML = messagesHTML;
    }

    // Format message text (handle markdown)
    formatMessageText(text) {
        // Convert **bold** to <strong>
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Convert line breaks to <br>
        text = text.replace(/\n/g, '<br>');

        return text;
    }

    // Render attachments
    renderAttachments(attachments) {
        return attachments.map(attachment => `
            <div class="message-attachment">
                <div class="attachment-preview">
                    ${attachment.type === 'image' ?
                `<img src="${attachment.url}" alt="${attachment.name}">` :
                `<div class="file-icon">📄</div>`
            }
                </div>
                <div class="attachment-info">
                    <div class="attachment-name">${attachment.name}</div>
                    <div class="attachment-size">${attachment.size}</div>
                </div>
            </div>
        `).join('');
    }

    // Format message time
    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Scroll to bottom of messages
    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Show typing indicator
    showTypingIndicator() {
        const typingHTML = `
            <div class="message bot typing-indicator" id="typingIndicator">
                <div class="message-bubble">
                    <div class="bot-avatar" style="background: transparent;"><img src="pwa/icons/Verdant.png" alt="Verdant Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;"></div>
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;

        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
            this.scrollToBottom();
        }
    }

    // Hide typing indicator
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Toggle recording
    toggleRecording() {
        if (!this.recognition) {
            this.showNotification('Speech recognition not supported in your browser', 'error');
            return;
        }

        if (this.isRecording) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    // Update recording UI
    updateRecordingUI(isRecording) {
        const micBtn = document.getElementById('micBtn');
        if (!micBtn) return;

        if (isRecording) {
            micBtn.classList.add('recording');
            micBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            micBtn.title = 'Stop Recording';
        } else {
            micBtn.classList.remove('recording');
            micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            micBtn.title = 'Start Voice Input';
        }
    }

    // Set input text
    setInputText(text) {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = text;
            this.autoResizeTextarea(messageInput);
        }
    }

    // Auto-resize textarea
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }

    // Open file attachment
    openFileAttachment() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*,application/pdf,text/*';
        fileInput.multiple = true;

        fileInput.addEventListener('change', (e) => {
            this.handleFileAttachment(e.target.files);
        });

        fileInput.click();
    }

    // Handle file attachment
    handleFileAttachment(files) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const attachment = {
                    name: file.name,
                    size: this.formatFileSize(file.size),
                    type: file.type.startsWith('image/') ? 'image' : 'file',
                    url: e.target.result
                };

                this.addAttachmentToMessage(attachment);
            };

            reader.readAsDataURL(file);
        });
    }

    // Add attachment to current message
    addAttachmentToMessage(attachment) {
        // For now, just send a message about the file
        this.sendMessage(`📎 Shared file: ${attachment.name}`);
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Bind quick action buttons
    bindQuickActions() {
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.target.textContent.trim();
                this.sendMessage(message);
            });
        });
    }

    // Show notification
    showNotification(message, type = 'info') {
        if (window.notificationFunctional) {
            window.notificationFunctional.showNotification({
                title: type === 'error' ? 'Error' : 'Info',
                message: message,
                type: type
            });
        }
    }

    // Clear chat history
    clearChat() {
        if (confirm('Are you sure you want to clear all messages?')) {
            this.messages = [];
            this.saveMessages();
            this.renderMessages();
            this.addBotMessage('🌱 Chat history cleared. How can I help you today?');
        }
    }

    // Export chat history
    exportChat() {
        const chatData = {
            messages: this.messages,
            exportDate: new Date().toISOString(),
            totalMessages: this.messages.length
        };

        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chatbot-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Chat history exported successfully', 'success');
    }
}

// Initialize chatbot functionality
window.chatbotFunctional = new ChatbotHuggingFace();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chatbotFunctional.init();
});

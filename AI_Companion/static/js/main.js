// main.js - Main application functionality with AI conversation
class CompanionApp {
    constructor() {
        this.conversationHistory = [];
        this.currentEmotion = 'Neutral';
        this.messageCount = 1;
        this.sessionStart = new Date();
        this.speechEnabled = true;
        this.isTyping = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadConversationHistory();
        this.startSessionTimer();
        this.initializeCharts();
        this.setupRealTimeUpdates();
    }

    setupEventListeners() {
        // Send message
        document.getElementById('sendBtn')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('userInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Voice button
        document.getElementById('voiceBtn')?.addEventListener('click', () => {
            this.toggleVoiceInput();
        });

        // Clear chat
        document.getElementById('clearChat')?.addEventListener('click', () => {
            this.clearChat();
        });

        // Toggle speech
        document.getElementById('toggleSpeech')?.addEventListener('click', () => {
            this.toggleSpeechOutput();
        });

        // Emotion selection
        document.querySelectorAll('.emotion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setCurrentEmotion(e.target.dataset.emotion);
            });
        });

        // Quick tools
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleQuickTool(e.target.dataset.emotion);
            });
        });

        // Real emotion detection simulation
        this.setupEmotionDetection();
    }

    async sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addMessageToChat('user', message);
        input.value = '';
        this.messageCount++;

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send to server
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    emotion: this.currentEmotion
                })
            });

            const data = await response.json();
            
            // Remove typing indicator
            this.hideTypingIndicator();

            if (data.response) {
                // Add AI response to chat
                this.addMessageToChat('bot', data.response);
                
                // Speak response if enabled
                if (this.speechEnabled && window.speechManager) {
                    window.speechManager.speakResponse(data.response);
                }

                // Update emotion display
                this.setCurrentEmotion(data.emotion);

                // Update stats
                this.updateStats();

                // Check for drug mentions
                if (data.has_drug_mention) {
                    this.showDrugMentionAlert();
                }
            }

        } catch (error) {
            console.error('Chat error:', error);
            this.hideTypingIndicator();
            this.addMessageToChat('bot', "I'm having trouble connecting right now. Please try again in a moment.");
        }
    }

    addMessageToChat(sender, message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = sender === 'user' ? '🧑‍🚀' : '🤖';
        const name = sender === 'user' ? 'You' : 'Dr. Aurora';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <strong>${name}:</strong> ${this.formatMessage(message)}
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add to conversation history
        this.conversationHistory.push({
            sender: sender,
            message: message,
            timestamp: new Date(),
            emotion: this.currentEmotion
        });

        // Save to local storage
        this.saveConversationHistory();
    }

    formatMessage(message) {
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return message.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'message bot-message typing';
        typingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <strong>Dr. Aurora:</strong>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        this.isTyping = true;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
    }

    setCurrentEmotion(emotion) {
        this.currentEmotion = emotion;
        
        // Update emotion display
        const emotionElement = document.getElementById('currentEmotion');
        const emotionIcon = this.getEmotionIcon(emotion);
        
        if (emotionElement) {
            emotionElement.textContent = `${emotionIcon} ${emotion}`;
        }

        // Add to emotion history
        this.addToEmotionHistory(emotion);

        // Update robot expression
        this.updateRobotExpression(emotion);
    }

    getEmotionIcon(emotion) {
        const icons = {
            'Happy': '😊',
            'Sad': '😢',
            'Angry': '😠',
            'Anxious': '😰',
            'Neutral': '😐',
            'Surprise': '😲',
            'Disgust': '🤢'
        };
        return icons[emotion] || '🤖';
    }

    addToEmotionHistory(emotion) {
        const historyElement = document.getElementById('emotionHistory');
        if (!historyElement) return;

        const now = new Date();
        const timeString = this.formatTime(now);

        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <span class="emotion-badge ${emotion.toLowerCase()}">${emotion}</span>
            <span class="time-ago">${timeString}</span>
        `;

        // Add to top
        historyElement.insertBefore(historyItem, historyElement.firstChild);

        // Keep only last 5 items
        while (historyElement.children.length > 5) {
            historyElement.removeChild(historyElement.lastChild);
        }

        // Update emotion chart
        this.updateEmotionChart(emotion);
    }

    updateRobotExpression(emotion) {
        const robot = document.querySelector('.robot-avatar');
        if (!robot) return;

        // Remove existing emotion classes
        const emotionClasses = ['happy', 'sad', 'angry', 'anxious', 'neutral'];
        robot.classList.remove(...emotionClasses);

        // Add current emotion class
        robot.classList.add(emotion.toLowerCase());
    }

    setupEmotionDetection() {
        // Simulate emotion changes for demo
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every 10 seconds
                const emotions = ['Happy', 'Sad', 'Angry', 'Anxious', 'Neutral', 'Surprise'];
                const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
                this.setCurrentEmotion(randomEmotion);
            }
        }, 10000);
    }

    initializeCharts() {
        const ctx = document.getElementById('emotionChart');
        if (!ctx) return;

        this.emotionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Emotion Level',
                    data: [],
                    borderColor: '#4FC3F7',
                    backgroundColor: 'rgba(79, 195, 247, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        display: false
                    },
                    x: {
                        display: false
                    }
                }
            }
        });
    }

    updateEmotionChart(emotion) {
        if (!this.emotionChart) return;

        const emotionValues = {
            'Happy': 90,
            'Neutral': 50,
            'Sad': 30,
            'Anxious': 40,
            'Angry': 20,
            'Surprise': 70,
            'Disgust': 25
        };

        const value = emotionValues[emotion] || 50;
        
        this.emotionChart.data.labels.push('');
        this.emotionChart.data.datasets[0].data.push(value);

        // Keep only last 10 data points
        if (this.emotionChart.data.labels.length > 10) {
            this.emotionChart.data.labels.shift();
            this.emotionChart.data.datasets[0].data.shift();
        }

        this.emotionChart.update('none');
    }

    startSessionTimer() {
        setInterval(() => {
            const now = new Date();
            const diff = Math.floor((now - this.sessionStart) / 1000);
            const minutes = Math.floor(diff / 60);
            const seconds = diff % 60;
            
            const timerElement = document.getElementById('sessionTimer');
            if (timerElement) {
                timerElement.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    updateStats() {
        const messageCountElement = document.getElementById('messageCount');
        if (messageCountElement) {
            messageCountElement.textContent = this.messageCount;
        }
    }

    toggleVoiceInput() {
        if (window.speechManager) {
            window.speechManager.toggleSpeechRecognition();
        } else {
            this.showNotification('Speech recognition not available', 'error');
        }
    }

    toggleSpeechOutput() {
        this.speechEnabled = !this.speechEnabled;
        
        const toggleBtn = document.getElementById('toggleSpeech');
        if (toggleBtn) {
            if (this.speechEnabled) {
                toggleBtn.innerHTML = '<i class="fas fa-volume-up"></i> Speech Enabled';
            } else {
                toggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Speech Disabled';
            }
        }
        
        this.showNotification(
            this.speechEnabled ? 'Speech output enabled' : 'Speech output disabled',
            this.speechEnabled ? 'success' : 'warning'
        );
    }

    handleQuickTool(tool) {
        const tools = {
            'stress': {
                message: "I'm feeling really stressed about colony life.",
                response: "Let's try a quick breathing exercise together. The 4-7-8 technique can help calm your nervous system quickly."
            },
            'anxious': {
                message: "I'm feeling anxious and overwhelmed.",
                response: "Anxiety can make everything feel bigger. Let's practice some grounding techniques to bring you back to the present moment."
            },
            'grounding': {
                message: "I need help staying grounded.",
                response: "Grounding helps when things feel overwhelming. Let's try the 5-4-3-2-1 technique to connect with your senses."
            },
            'emergency': {
                message: "I need immediate help.",
                response: "For immediate assistance, contact Medical Bay at Extension 711. For mental health crisis, Extension 842 is available 24/7. I'm here with you while you reach out."
            }
        };

        const toolData = tools[tool];
        if (toolData) {
            // Auto-fill the input and send
            const input = document.getElementById('userInput');
            input.value = toolData.message;
            this.sendMessage();
        }
    }

    showDrugMentionAlert() {
        this.showNotification(
            'Remember: The colony offers confidential support for substance use at Extension 933.',
            'info',
            5000
        );
    }

    clearChat() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        // Add welcome message back
        this.addMessageToChat('bot', 
            "Hello! I'm Dr. Aurora, your AI mental health companion. I'm here to support you through your journey in the Saturn colonies. How are you feeling today?"
        );
        
        this.messageCount = 1;
        this.conversationHistory = [];
        this.saveConversationHistory();
        
        this.showNotification('Chat cleared', 'success');
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('companionConversation');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
                
                // Restore messages to chat (limited to last 10)
                const recentMessages = this.conversationHistory.slice(-10);
                recentMessages.forEach(msg => {
                    this.addMessageToChat(msg.sender, msg.message, true);
                });
            }
        } catch (error) {
            console.log('No conversation history found');
        }
    }

    saveConversationHistory() {
        localStorage.setItem('companionConversation', 
            JSON.stringify(this.conversationHistory.slice(-50)) // Keep last 50 messages
        );
    }

    setupRealTimeUpdates() {
        // Update user insights periodically
        setInterval(() => {
            this.updateUserInsights();
        }, 30000); // Every 30 seconds

        // Initial insights load
        this.updateUserInsights();
    }

    async updateUserInsights() {
        try {
            const response = await fetch('/api/user_insights');
            const insights = await response.json();
            
            // Update UI with insights
            this.displayUserInsights(insights);
        } catch (error) {
            console.error('Failed to load insights:', error);
        }
    }

    displayUserInsights(insights) {
        // You could update various parts of the UI with these insights
        console.log('User insights:', insights);
        
        // Example: Update a insights panel if you have one
        const insightsElement = document.getElementById('userInsights');
        if (insightsElement) {
            insightsElement.innerHTML = `
                <div class="insight-item">
                    <strong>Most Common Mood:</strong> ${insights.most_common_emotion}
                </div>
                <div class="insight-item">
                    <strong>Total Sessions:</strong> ${insights.total_interactions}
                </div>
                <div class="insight-item">
                    <strong>Recent Drug Mentions:</strong> ${insights.recent_drug_mentions}
                </div>
            `;
        }
    }

    formatTime(date) {
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // Difference in seconds
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Use the speech manager's notification system if available
        if (window.speechManager) {
            window.speechManager.showNotification(message, type, duration);
        } else {
            // Fallback simple notification
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.companionApp = new CompanionApp();
    
    // Add typing indicator CSS
    const styles = `
    .typing-dots {
        display: inline-flex;
        gap: 2px;
        margin-left: 5px;
    }
    
    .typing-dots span {
        width: 4px;
        height: 4px;
        background: #B3E5FC;
        border-radius: 50%;
        animation: typing-bounce 1.4s infinite ease-in-out;
    }
    
    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes typing-bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
    }
    
    .insight-item {
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 5px;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
    }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
});
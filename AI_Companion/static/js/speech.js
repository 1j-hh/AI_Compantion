// speech.js - Speech recognition and text-to-speech
class SpeechManager {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSpeaking = false;
        this.speechEnabled = true;
        this.init();
    }

    init() {
        this.setupSpeechRecognition();
        this.setupEventListeners();
        this.loadSpeechPreferences();
    }

    setupSpeechRecognition() {
        // Check browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported in this browser');
            this.showSpeechSupportWarning();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUIListeningState(true);
            console.log('Speech recognition started');
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Update input field with interim results
            if (interimTranscript) {
                this.updateInputField(interimTranscript);
            }

            // Process final result
            if (finalTranscript) {
                this.processSpeechResult(finalTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.updateUIListeningState(false);
            
            if (event.error === 'not-allowed') {
                this.showMicrophonePermissionError();
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUIListeningState(false);
            console.log('Speech recognition ended');
        };
    }

    setupEventListeners() {
        // Voice button click
        document.addEventListener('click', (e) => {
            if (e.target.closest('#voiceBtn')) {
                this.toggleSpeechRecognition();
            }
        });

        // Keyboard shortcut for speech (Ctrl+Space)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.code === 'Space') {
                e.preventDefault();
                this.toggleSpeechRecognition();
            }
        });

        // Text-to-speech toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('#toggleSpeech')) {
                this.toggleTextToSpeech();
            }
        });
    }

    toggleSpeechRecognition() {
        if (!this.recognition) {
            this.showSpeechSupportWarning();
            return;
        }

        if (this.isListening) {
            this.stopSpeechRecognition();
        } else {
            this.startSpeechRecognition();
        }
    }

    startSpeechRecognition() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
                this.showListeningIndicator();
            } catch (error) {
                console.error('Failed to start speech recognition:', error);
            }
        }
    }

    stopSpeechRecognition() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.hideListeningIndicator();
        }
    }

    processSpeechResult(transcript) {
        console.log('Speech recognized:', transcript);
        
        // Update input field
        this.updateInputField(transcript);
        
        // Auto-send if certain conditions are met
        if (this.shouldAutoSend(transcript)) {
            this.autoSendMessage(transcript);
        }
        
        // Track speech usage
        this.trackSpeechUsage(transcript);
    }

    shouldAutoSend(transcript) {
        const hasQuestion = transcript.includes('?');
        const hasGreeting = ['hello', 'hi', 'hey'].some(word => 
            transcript.toLowerCase().includes(word)
        );
        const isLongEnough = transcript.split(' ').length >= 3;
        
        return hasQuestion || hasGreeting || isLongEnough;
    }

    autoSendMessage(transcript) {
        const inputField = document.getElementById('userInput');
        const sendButton = document.getElementById('sendBtn');
        
        if (inputField && sendButton) {
            // Simulate click on send button
            setTimeout(() => {
                sendButton.click();
            }, 500);
        }
    }

    updateInputField(text) {
        const inputField = document.getElementById('userInput');
        if (inputField) {
            inputField.value = text;
            
            // Trigger input event for any listeners
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    updateUIListeningState(listening) {
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            if (listening) {
                voiceBtn.classList.add('listening');
                voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            } else {
                voiceBtn.classList.remove('listening');
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            }
        }
    }

    // Text-to-Speech Functions
    speakText(text, options = {}) {
        if (!this.speechEnabled || !this.synthesis) return;

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set options
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 0.8;
        utterance.lang = 'en-US';

        // Robot mouth animation
        this.startMouthAnimation();

        utterance.onstart = () => {
            this.isSpeaking = true;
            console.log('Started speaking:', text);
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.stopMouthAnimation();
            console.log('Finished speaking');
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isSpeaking = false;
            this.stopMouthAnimation();
        };

        this.synthesis.speak(utterance);
    }

    toggleTextToSpeech() {
        this.speechEnabled = !this.speechEnabled;
        
        const toggleBtn = document.getElementById('toggleSpeech');
        if (toggleBtn) {
            if (this.speechEnabled) {
                toggleBtn.innerHTML = '<i class="fas fa-volume-up"></i> Speech Enabled';
                toggleBtn.classList.remove('btn-outline');
                toggleBtn.classList.add('btn');
            } else {
                toggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Speech Disabled';
                toggleBtn.classList.remove('btn');
                toggleBtn.classList.add('btn-outline');
            }
        }
        
        this.saveSpeechPreferences();
        
        // Show notification
        this.showNotification(
            this.speechEnabled ? 'Text-to-speech enabled' : 'Text-to-speech disabled',
            this.speechEnabled ? 'success' : 'warning'
        );
    }

    startMouthAnimation() {
        const robot = document.querySelector('.robot-avatar');
        if (robot) {
            robot.classList.add('robot-speaking');
        }
    }

    stopMouthAnimation() {
        const robot = document.querySelector('.robot-avatar');
        if (robot) {
            robot.classList.remove('robot-speaking');
        }
    }

    // Utility Functions
    showListeningIndicator() {
        // Create or show listening indicator
        let indicator = document.getElementById('listeningIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'listeningIndicator';
            indicator.className = 'listening-indicator';
            indicator.innerHTML = `
                <div class="listening-pulse"></div>
                <span>Listening...</span>
            `;
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'block';
    }

    hideListeningIndicator() {
        const indicator = document.getElementById('listeningIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    showSpeechSupportWarning() {
        this.showNotification(
            'Speech recognition is not supported in your browser. Try Chrome or Edge.',
            'error',
            5000
        );
    }

    showMicrophonePermissionError() {
        this.showNotification(
            'Microphone access is required for speech recognition. Please allow microphone permissions.',
            'error',
            5000
        );
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Remove existing notification
        const existingNotification = document.querySelector('.speech-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `speech-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Preferences
    saveSpeechPreferences() {
        const prefs = {
            speechEnabled: this.speechEnabled,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('companionSpeechPrefs', JSON.stringify(prefs));
    }

    loadSpeechPreferences() {
        try {
            const prefs = JSON.parse(localStorage.getItem('companionSpeechPrefs'));
            if (prefs && typeof prefs.speechEnabled === 'boolean') {
                this.speechEnabled = prefs.speechEnabled;
                
                // Update UI
                const toggleBtn = document.getElementById('toggleSpeech');
                if (toggleBtn) {
                    if (this.speechEnabled) {
                        toggleBtn.innerHTML = '<i class="fas fa-volume-up"></i> Speech Enabled';
                        toggleBtn.classList.remove('btn-outline');
                        toggleBtn.classList.add('btn');
                    } else {
                        toggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Speech Disabled';
                        toggleBtn.classList.remove('btn');
                        toggleBtn.classList.add('btn-outline');
                    }
                }
            }
        } catch (error) {
            console.log('No speech preferences found');
        }
    }

    trackSpeechUsage(transcript) {
        const usageData = {
            type: 'speech_input',
            transcript: transcript,
            timestamp: new Date().toISOString(),
            wordCount: transcript.split(' ').length,
            autoSent: this.shouldAutoSend(transcript)
        };

        // In a real app, this would send to analytics
        console.log('Speech usage:', usageData);
        
        // Save to local storage for demo
        this.saveSpeechUsageToLocal(usageData);
    }

    saveSpeechUsageToLocal(usageData) {
        let speechHistory = JSON.parse(localStorage.getItem('speechUsageHistory') || '[]');
        speechHistory.push(usageData);
        
        // Keep only last 50 entries
        if (speechHistory.length > 50) {
            speechHistory = speechHistory.slice(-50);
        }
        
        localStorage.setItem('speechUsageHistory', JSON.stringify(speechHistory));
    }

    // Public methods for other components to use
    speakResponse(text) {
        if (this.speechEnabled) {
            this.speakText(text);
        }
    }

    isSpeechAvailable() {
        return !!this.recognition;
    }
}

// Add CSS for speech components
const speechStyles = `
.listening-indicator {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(79, 195, 247, 0.9);
    color: white;
    padding: 1rem 2rem;
    border-radius: 25px;
    z-index: 10000;
    display: none;
    backdrop-filter: blur(10px);
    border: 2px solid #4FC3F7;
}

.listening-pulse {
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    margin: 0 auto 0.5rem;
    animation: pulse 1s infinite;
}

.speech-notification {
    position: fixed;
    top: 100px;
    right: 20px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid;
    border-radius: 10px;
    padding: 1rem;
    color: white;
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 300px;
}

.speech-notification.show {
    transform: translateX(0);
}

.speech-notification.success {
    border-color: #4CAF50;
    background: rgba(76, 175, 80, 0.2);
}

.speech-notification.error {
    border-color: #F44336;
    background: rgba(244, 67, 54, 0.2);
}

.speech-notification.warning {
    border-color: #FF9800;
    background: rgba(255, 152, 0, 0.2);
}

.speech-notification.info {
    border-color: #4FC3F7;
    background: rgba(79, 195, 247, 0.2);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.7; }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = speechStyles;
document.head.appendChild(styleSheet);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.speechManager = new SpeechManager();
});
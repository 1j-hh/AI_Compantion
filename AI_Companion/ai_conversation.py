import random
import json
from datetime import datetime

class ConversationAI:
    def __init__(self):
        self.responses = {
            'happy': [
                "It's wonderful to see you feeling happy! What's bringing you joy today?",
                "Your positive energy is contagious! Tell me more about what's making you smile.",
                "Happiness looks good on you! Want to share what's going well?"
            ],
            'sad': [
                "I'm here for you during this difficult time. Would you like to talk about what's bothering you?",
                "It's okay to feel sad sometimes. I'm listening if you want to share what's on your mind.",
                "I can sense you're feeling down. Remember that difficult moments don't last forever."
            ],
            'angry': [
                "I can see you're feeling frustrated. Would it help to talk about what's upsetting you?",
                "Anger is a natural emotion. Let's work through this together - what's triggering these feelings?",
                "I'm here to help you process these strong emotions. What's causing you to feel this way?"
            ],
            'anxious': [
                "It sounds like you're feeling anxious. Let's take a deep breath together and talk through it.",
                "Anxiety can be overwhelming. I'm here to help you work through these thoughts.",
                "Let's break this down together. What specific concerns are on your mind right now?"
            ],
            'neutral': [
                "Thanks for checking in! How are you feeling today?",
                "I'm here to listen. What would you like to talk about?",
                "How has your day been going? I'm interested in hearing about it."
            ]
        }
    
    def generate_response(self, user_input, user_id, detected_emotion, conversation_history=None):
        # Simple rule-based response system
        user_input_lower = user_input.lower()
        
        # Check for specific keywords
        if any(word in user_input_lower for word in ['help', 'struggling', 'hard', 'difficult']):
            return "I hear that you're going through a challenging time. Remember that it's okay to ask for help when you need it. Would you like to talk more about what's making things difficult?"
        
        elif any(word in user_input_lower for word in ['thank', 'thanks', 'appreciate']):
            return "You're very welcome! I'm glad I can be here for you. How else can I support you today?"
        
        elif any(word in user_input_lower for word in ['hello', 'hi', 'hey', 'greetings']):
            return "Hello! I'm your AI companion. I'm here to listen and support you. How are you feeling today?"
        
        elif any(word in user_input_lower for word in ['bye', 'goodbye', 'see you']):
            return "Take care! Remember I'm here whenever you need someone to talk to. Wishing you well until we chat again!"
        
        # Emotion-based responses
        emotion = detected_emotion.lower() if detected_emotion else 'neutral'
        if emotion in self.responses:
            return random.choice(self.responses[emotion])
        else:
            return random.choice(self.responses['neutral'])

# Create global instance
conversation_ai = ConversationAI()
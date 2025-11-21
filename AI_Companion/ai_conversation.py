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
        # Simple rule-based response system with conversation context
        user_input_lower = user_input.lower()
        
        # Get last conversation context if available
        last_user_message = None
        last_ai_response = None
        if conversation_history and len(conversation_history) > 0:
            last_exchange = conversation_history[-1]
            last_user_message = last_exchange.get('user_input', '').lower() if last_exchange.get('user_input') else None
            last_ai_response = last_exchange.get('ai_response', '').lower() if last_exchange.get('ai_response') else None
        
        # Check for crisis keywords FIRST (highest priority)
        crisis_keywords = ['suicide', 'suicidal', 'kill myself', 'end it all', 'not worth living', 'want to die', 'hurt myself', 'self harm', 'end my life', 'no point living']
        if any(keyword in user_input_lower for keyword in crisis_keywords):
            return "🚨 I'm deeply concerned about what you're sharing. Your life matters. Please reach out immediately to the Mental Health Crisis Line at Extension 842 - they're available 24/7 and can provide immediate support. You don't have to face this alone. Can I help you connect with them right now?"
        
        # Check for recovery/positive drug-related messages
        recovery_keywords = ['quit', 'stop', 'stopped', 'stopping', 'quitting', 'sober', 'sobriety', 'clean', 'recovery', 'don\'t want', 'do not want', 'never again', 'done with', 'no more']
        drug_keywords = ['drug', 'drugs', 'substance', 'addiction', 'addicted', 'addict', 'drinking', 'drunk', 'alcohol', 'alcoholic', 'using', 'high', 'smoking', 'weed', 'marijuana']
        
        # Check if talking about wanting to quit/stop drugs
        if any(recovery in user_input_lower for recovery in recovery_keywords) and any(drug in user_input_lower for drug in drug_keywords):
            return "That's incredible strength you're showing! 💪✨ Deciding to stop is one of the hardest and bravest steps anyone can take. I'm so proud of you for making this choice. The colony has recovery support services at Extension 933 who can help you on this journey. Would you like to talk about what led you to this decision? I'm here to support you every step of the way."
        
        # Check if talking about wanting to use drugs
        want_to_use_keywords = ['want to', 'thinking about', 'considering', 'tempted', 'craving', 'need', 'wish i could', 'miss']
        if any(want in user_input_lower for want in want_to_use_keywords) and any(drug in user_input_lower for drug in drug_keywords):
            return "I hear that you're struggling with these urges right now. That must be really difficult. 💙 These feelings are part of the journey, and it's brave of you to talk about them instead of acting on them. The colony's support services at Extension 933 can provide immediate help with cravings and urges - they're available 24/7. Can we talk about what's triggering these feelings right now? Sometimes understanding the trigger can help manage the craving."
        
        # General drug mention (neutral context)
        if any(word in user_input_lower for word in drug_keywords):
            return "I hear you're dealing with substance-related concerns. This takes courage to discuss. 💙 The colony offers confidential support services at Extension 933, available 24/7. I'm here to listen without judgment. Would you like to talk more about what you're experiencing?"
        
        # Greeting detection
        if any(word in user_input_lower for word in ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy']):
            return "Hello! ✨ I'm Phoebe, your AI companion here in the Saturn colonies. I'm here to listen and support you. How are you feeling today?"
        
        # Goodbye detection
        if any(word in user_input_lower for word in ['bye', 'goodbye', 'see you', 'later', 'gotta go', 'talk later', 'ttyl']):
            return "Take care! 🌙 Remember I'm here whenever you need someone to talk to. Wishing you well among the stars until we chat again!"
        
        # Thank you detection
        if any(word in user_input_lower for word in ['thank', 'thanks', 'appreciate', 'grateful', 'gratitude']):
            return "You're very welcome! 💫 I'm glad I can be here for you. How else can I support you today?"
        
        # Check for follow-up responses to emotional conversations
        if last_ai_response and last_user_message:
            # If previously discussed sadness and user is responding
            if 'sad' in last_user_message or 'sad' in last_ai_response:
                if any(word in user_input_lower for word in ['yes', 'yeah', 'i guess', 'sure', 'okay', 'i think so']):
                    return "I'm glad you're willing to open up. 💙 Sometimes just talking about it can help lighten the burden. What's been the hardest part for you lately? Take your time - there's no rush."
                elif any(word in user_input_lower for word in ['better', 'helped', 'feel okay', 'feeling okay', 'little better']):
                    return "I'm so glad to hear that! ✨ It takes strength to work through difficult emotions. Remember, it's okay to have ups and downs - healing isn't always linear. What helped you feel a bit better?"
            
            # If previously discussed anxiety and user is responding
            if 'anxious' in last_user_message or 'anxiety' in last_ai_response or 'worried' in last_user_message:
                if any(word in user_input_lower for word in ['yes', 'yeah', 'still', 'very', 'really']):
                    return "Let's work through this together. 🌊 When you notice the anxiety building, try to focus on your breathing - in through your nose for 4 counts, hold for 4, out for 4. What specific situation is making you feel most anxious right now?"
                elif any(word in user_input_lower for word in ['better', 'calmer', 'helped', 'not as bad']):
                    return "That's wonderful progress! ✨ You're doing great at managing these feelings. What technique or thought helped you feel calmer? It might be useful to remember for next time."
            
            # If previously discussed anger/frustration
            if 'angry' in last_user_message or 'frustrated' in last_user_message or 'anger' in last_ai_response:
                if any(word in user_input_lower for word in ['yes', 'still', 'very', 'really', 'so angry']):
                    return "I understand. That frustration is real and valid. 🔥 It's important to express these feelings safely. Would it help to talk through what happened? Sometimes breaking down the situation can help us see it more clearly."
                elif any(word in user_input_lower for word in ['better', 'calmed down', 'okay now', 'fine']):
                    return "I'm glad you're feeling more settled. ✨ Processing anger takes real emotional work. How did you manage to calm yourself down? That's a valuable skill."
        
        # Check for emotion keywords in user input and provide specific responses
        if any(word in user_input_lower for word in ['anxious', 'anxiety', 'worried', 'nervous', 'stressed', 'stress', 'panic', 'panicking', 'fear', 'scared', 'overwhelmed', 'tense', 'restless']):
            return "I can sense you're feeling anxious right now. 🌊 That's a completely valid feeling, especially in the unique environment of the Saturn colonies. Let's take this one step at a time. Would you like to try a breathing exercise, or would you prefer to talk about what's causing these feelings?"
        
        elif any(word in user_input_lower for word in ['sad', 'sadness', 'depressed', 'depression', 'down', 'upset', 'blue', 'unhappy', 'miserable', 'hopeless', 'lonely', 'alone', 'crying', 'tears', 'heartbroken']):
            return "I'm here with you during this difficult time. 💙 It's okay to feel sad - your emotions are valid. Sometimes the isolation of space can amplify these feelings. Would you like to talk about what's weighing on your mind? I'm listening."
        
        elif any(word in user_input_lower for word in ['angry', 'anger', 'mad', 'furious', 'annoyed', 'frustrated', 'frustration', 'irritated', 'rage', 'pissed', 'livid', 'upset']):
            return "I can hear the frustration in your words. 🔥 Anger is a natural emotion, and it's important to express it safely. Living in close quarters in the colonies can certainly be challenging. What's triggering these feelings? Let's work through this together."
        
        elif any(word in user_input_lower for word in ['happy', 'happiness', 'joy', 'joyful', 'excited', 'excitement', 'great', 'wonderful', 'amazing', 'fantastic', 'good', 'pleased', 'glad', 'cheerful', 'delighted', 'love', 'loving']):
            return "It's wonderful to see you feeling positive! ✨ Your happiness brightens the atmosphere. What's bringing you joy today? I'd love to hear more about it!"
        
        # Help-seeking behavior
        elif any(word in user_input_lower for word in ['help', 'help me', 'struggling', 'hard', 'difficult', 'can\'t cope', 'cant cope', 'need support']):
            return "I hear that you're going through a challenging time. 🤝 Remember that asking for help is a sign of strength, not weakness. Would you like to talk more about what's making things difficult? I'm here to support you, and we can explore resources together."
        
        # Default neutral responses with context awareness
        neutral_responses = [
            "I'm here to listen. 🌙 What would you like to talk about today?",
            "Thanks for sharing with me. How are you feeling right now?",
            "I'm listening. Tell me more about what's on your mind.",
            "Your thoughts and feelings matter. What would help you most right now?",
            "I appreciate you opening up to me. How has your day been in the colonies?"
        ]
        
        return random.choice(neutral_responses)

# Create global instance
conversation_ai = ConversationAI()
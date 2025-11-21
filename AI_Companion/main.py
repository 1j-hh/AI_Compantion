from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from database import db, User, Session, EmotionRecord
from datetime import datetime
import random

# Responses for the AI to use based on detected emotions
class SimpleConversationAI:
    def generate_response(self, user_input, user_id, detected_emotion, conversation_history=None):
        responses = {
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
        
        emotion_responses = responses.get(detected_emotion.lower(), responses['neutral']) # if emotion is not recognized we assume neutral
        return random.choice(emotion_responses) # return a random response from the selected emotion category

conversation_ai = SimpleConversationAI() # Initialize the AI

main_bp = Blueprint('main', __name__) # Blueprint for main routes

@main_bp.route('/profile') # User profile route
def profile(): # Display user profile and stats
    if 'user_id' not in session: # Check if user is logged in
        return redirect('/auth/login') # Redirect to login if not authenticated
    
    user = User.query.get(session['user_id']) # Get user is from the database
    
    # Get user stats from the data base so that we can display them on the ui
    total_conversations = EmotionRecord.query.filter_by(user_id=user.id).count() # Number of total conversations
    emotion_stats = db.session.query( # Emotion statistics
        EmotionRecord.emotion, # Emotion type like happy, sad, anxious, neutral
        db.func.count(EmotionRecord.id).label('count') # count of each emotion
    ).filter_by(user_id=user.id).group_by(EmotionRecord.emotion).all() # Group by emotion type
    
    # Render the profile template with user data and stats
    return render_template('profile.html',  
                         username=user.username,
                         email=user.email,
                         joined_date=user.created_at,
                         total_conversations=total_conversations,
                         emotion_stats=emotion_stats)

@main_bp.route('/dashboard') # dashboard route
def dashboard(): # Display user dashboard with conversation history
    if 'user_id' not in session: # check if the user id is logged in
        return redirect('/auth/login') # redirect to login if not authenticated
    
    user = User.query.get(session['user_id']) # get user from the database
    
    # Get conversation history for the AI context
    emotion_history = EmotionRecord.query.filter_by(
        user_id=user.id # get emotion records for the user
    ).order_by(EmotionRecord.timestamp.desc()).limit(10).all() # get the last 10 records
    
    # Convert to conversation format for AI
    conversation_history = []
    for record in reversed(emotion_history):  # Oldest first
        if record.user_input and record.ai_response: # only include records with both the user and the ai responses
            conversation_history.append({ # append to the conversation history
                'user_input': record.user_input, # user input text
                'ai_response': record.ai_response, # AI response text
                'emotion': record.emotion, # Detected emotion
                'timestamp': record.timestamp # Timestamp of the record
            })
    
    # render the dashboard template with the user and conversation history
    return render_template('main.html', 
                         username=user.username,
                         conversation_history=conversation_history)

@main_bp.route('/api/chat', methods=['POST']) # API route for the chat
def chat(): # handle chat messages
    if 'user_id' not in session: # check if user is logged in
        return jsonify({'error': 'Not authenticated'}), 401 # return error if not authenticated
    
    data = request.json # get the data from the data request
    user_input = data.get('message', '').strip() # get the user message
    detected_emotion = data.get('emotion', 'neutral') # get the detected emotion from the user input
    
    if not user_input: # check if the user input is empty
        return jsonify({'error': 'Empty message'}), 400 # return error if message is empty
    
    # Get conversation history for context
    emotion_history = EmotionRecord.query.filter_by(
        user_id=session['user_id'] # get records for the user
    ).order_by(EmotionRecord.timestamp.desc()).limit(10).all() # get the last 10 records
    
    conversation_history = [] # prepare the conversation history
    for record in reversed(emotion_history): # oldest first
        if record.user_input and record.ai_response: # only include records with both user and ai responses
            conversation_history.append({ # append to the conversation history
                'user_input': record.user_input, # user input text
                'ai_response': record.ai_response #Ai generated response text
            })
    
    # Generate AI response
    try:
        ai_response = conversation_ai.generate_response(
            user_input=user_input,
            user_id=session['user_id'],
            detected_emotion=detected_emotion,
            conversation_history=conversation_history
        )
    except Exception as e:
        print(f"AI response error: {e}")
        ai_response = "I'm here to listen. Could you tell me more about what you're experiencing?"
    
    # Check for drug-related content based on the keywords
    drug_keywords = ['drug', 'drugs', 'substance', 'addiction', 'addicted', 'withdrawal', 'relapse', 'pill', 'pills', 'medication', 'meds', 'cocaine', 'heroin', 'meth', 'marijuana', 'alcohol', 'drinking', 'drunk', 'high', 'stoned']
    has_drug_mention = any(keyword in user_input.lower() for keyword in drug_keywords) # check if any drug keywords are mentioned in the user input
    
    # Save emotions/drug mentions to database
    emotion_record = EmotionRecord(
        user_id=session['user_id'],
        emotion=detected_emotion,
        user_input=user_input,
        ai_response=ai_response,
        drug_mentions=has_drug_mention
    )
    
    db.session.add(emotion_record) # add the record to the session
    db.session.commit() # commit the session to save to the database
    
    return jsonify({ # return the ai response and detected emotion
        'response': ai_response,
        'emotion': detected_emotion,
        'has_drug_mention': has_drug_mention,
        'timestamp': datetime.utcnow().isoformat()
    })

@main_bp.route('/api/conversation_history') # API route for conversation history
def conversation_history(): # get the conversation history
    if 'user_id' not in session: # check if user is logged in
        return jsonify({'error': 'Not authenticated'}), 401 # return error if not authenticated
    
    emotions = EmotionRecord.query.filter_by( # get the emotion records for the user from the database
        user_id=session['user_id'] # filter by user id
    ).order_by(EmotionRecord.timestamp.desc()).limit(50).all() # get the last 50 records
    
    # Convert to list of dicts for database response
    history = [{
        'emotion': e.emotion,
        'timestamp': e.timestamp.isoformat(),
        'user_input': e.user_input,
        'ai_response': e.ai_response,
        'drug_mention': e.drug_mentions
    } for e in emotions] # prepare the history list
    
    return jsonify(history) # return the history

@main_bp.route('/api/user_insights') # API route for user insights
def user_insights(): # get user insights
    if 'user_id' not in session: # check if user is logged in
        return jsonify({'error': 'Not authenticated'}), 401 # return error if not authenticated
    
    user_id = session['user_id'] # get the user id from the session
    
    # Get emotion statistics
    emotion_stats = db.session.query(
        EmotionRecord.emotion,
        db.func.count(EmotionRecord.id).label('count')
    ).filter_by(user_id=user_id).group_by(EmotionRecord.emotion).all() # group by emotion type
    
    # Get recent drug mentions
    recent_drug_mentions = EmotionRecord.query.filter_by(
        user_id=user_id,
        drug_mentions=True
    ).order_by(EmotionRecord.timestamp.desc()).limit(5).all() # get the last 5 drug mention records
    
    # Calculate engagement metrics
    total_sessions = EmotionRecord.query.filter_by(user_id=user_id).count()
    avg_session_length = db.session.query( # average length of the user messages
        db.func.avg(db.func.length(EmotionRecord.user_input)) # average length of user input
    ).filter_by(user_id=user_id).scalar() or 0 # scalar value or 0 if none
    
    # prepare insights data with emotion distribution, total interactions, average message length, recent drug mentions, and the most common emotion for the user
    insights = {
        'emotion_distribution': {stat.emotion: stat.count for stat in emotion_stats},
        'total_interactions': total_sessions,
        'avg_message_length': round(avg_session_length, 1),
        'recent_drug_mentions': len(recent_drug_mentions),
        'most_common_emotion': max(emotion_stats, key=lambda x: x.count).emotion if emotion_stats else 'Neutral'
    }
    
    return jsonify(insights) # return the insights

# Add a simple home route
@main_bp.route('/')
def home(): # home route
    if 'user_id' in session: # check if user is logged in
        return redirect('/dashboard') # redirect to dashboard if logged in
    return redirect('/auth/login') # redirect to login if not logged in
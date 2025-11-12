# main.py - Updated with AI conversation capabilities
from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from database import db, User, Session, EmotionRecord
from datetime import datetime
from ai_conversation import conversation_ai
import random

main_bp = Blueprint('main', __name__)

@main_bp.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    
    user = User.query.get(session['user_id'])
    
    # Get conversation history for the AI context
    emotion_history = EmotionRecord.query.filter_by(
        user_id=user.id
    ).order_by(EmotionRecord.timestamp.desc()).limit(10).all()
    
    # Convert to conversation format for AI
    conversation_history = []
    for record in reversed(emotion_history):  # Oldest first
        if record.user_input and record.ai_response:
            conversation_history.append({
                'user_input': record.user_input,
                'ai_response': record.ai_response,
                'emotion': record.emotion,
                'timestamp': record.timestamp
            })
    
    return render_template('main.html', 
                         username=user.username,
                         conversation_history=conversation_history)

@main_bp.route('/api/chat', methods=['POST'])
def chat():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.json
    user_input = data.get('message', '').strip()
    detected_emotion = data.get('emotion', 'Neutral')
    
    if not user_input:
        return jsonify({'error': 'Empty message'}), 400
    
    # Get conversation history for context
    emotion_history = EmotionRecord.query.filter_by(
        user_id=session['user_id']
    ).order_by(EmotionRecord.timestamp.desc()).limit(10).all()
    
    conversation_history = []
    for record in reversed(emotion_history):
        if record.user_input and record.ai_response:
            conversation_history.append({
                'user_input': record.user_input,
                'ai_response': record.ai_response
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
    
    # Check for drug-related content
    drug_keywords = ['drug', 'substance', 'addiction', 'withdrawal', 'relapse', 'pill', 'medication']
    has_drug_mention = any(keyword in user_input.lower() for keyword in drug_keywords)
    
    # Save to database
    emotion_record = EmotionRecord(
        user_id=session['user_id'],
        emotion=detected_emotion,
        user_input=user_input,
        ai_response=ai_response,
        drug_mentions=has_drug_mention
    )
    
    db.session.add(emotion_record)
    db.session.commit()
    
    return jsonify({
        'response': ai_response,
        'emotion': detected_emotion,
        'has_drug_mention': has_drug_mention,
        'timestamp': datetime.utcnow().isoformat()
    })

@main_bp.route('/api/conversation_history')
def conversation_history():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    emotions = EmotionRecord.query.filter_by(
        user_id=session['user_id']
    ).order_by(EmotionRecord.timestamp.desc()).limit(50).all()
    
    history = [{
        'emotion': e.emotion,
        'timestamp': e.timestamp.isoformat(),
        'user_input': e.user_input,
        'ai_response': e.ai_response,
        'drug_mention': e.drug_mentions
    } for e in emotions]
    
    return jsonify(history)

@main_bp.route('/api/user_insights')
def user_insights():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user_id = session['user_id']
    
    # Get emotion statistics
    emotion_stats = db.session.query(
        EmotionRecord.emotion,
        db.func.count(EmotionRecord.id).label('count')
    ).filter_by(user_id=user_id).group_by(EmotionRecord.emotion).all()
    
    # Get recent drug mentions
    recent_drug_mentions = EmotionRecord.query.filter_by(
        user_id=user_id,
        drug_mentions=True
    ).order_by(EmotionRecord.timestamp.desc()).limit(5).all()
    
    # Calculate engagement metrics
    total_sessions = EmotionRecord.query.filter_by(user_id=user_id).count()
    avg_session_length = db.session.query(
        db.func.avg(db.func.length(EmotionRecord.user_input))
    ).filter_by(user_id=user_id).scalar() or 0
    
    insights = {
        'emotion_distribution': {stat.emotion: stat.count for stat in emotion_stats},
        'total_interactions': total_sessions,
        'avg_message_length': round(avg_session_length, 1),
        'recent_drug_mentions': len(recent_drug_mentions),
        'most_common_emotion': max(emotion_stats, key=lambda x: x.count).emotion if emotion_stats else 'Neutral'
    }
    
    return jsonify(insights)
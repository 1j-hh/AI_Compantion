from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sessions = db.relationship('Session', backref='user', lazy=True)
    emotions = db.relationship('EmotionRecord', backref='user', lazy=True)

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    session_data = db.Column(db.Text)

    def get_session_data(self):
        return json.loads(self.session_data) if self.session_data else {}
    
    def set_session_data(self, data):
        self.session_data = json.dumps(data)

class EmotionRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    emotion = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    session_id = db.Column(db.Integer, db.ForeignKey('session.id'))
    user_input = db.Column(db.Text)
    ai_response = db.Column(db.Text)
    drug_mentions = db.Column(db.Boolean, default=False)

def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
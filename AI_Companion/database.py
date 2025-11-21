from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy() # initialize the SQLAlchemy

# Define user, session, and emotion record models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True) # user id
    username = db.Column(db.String(80), unique=True, nullable=False) # username
    email = db.Column(db.String(120), unique=True, nullable=False) # email
    password_hash = db.Column(db.String(128)) # password
    created_at = db.Column(db.DateTime, default=datetime.utcnow) # when the user account was created

    sessions = db.relationship('Session', backref='user', lazy=True) # user sessions
    emotions = db.relationship('EmotionRecord', backref='user', lazy=True) # user emotion records

# session model to track user sessions
class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True) # session id
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # foreign key to user
    start_time = db.Column(db.DateTime, default=datetime.utcnow) # session start time
    end_time = db.Column(db.DateTime) # session end time
    session_data = db.Column(db.Text) # additional session data

    def get_session_data(self): # retrieve session data as dictionary
        return json.loads(self.session_data) if self.session_data else {} # return empty dictionary if there is no data
    
    def set_session_data(self, data): # set session data from the dictionary
        self.session_data = json.dumps(data) # covert dictionary to JSON string

# emotion record model to log detected emotions
class EmotionRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True) # record id
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # foreign key to user
    emotion = db.Column(db.String(50), nullable=False) # detected emotion
    confidence = db.Column(db.Float) # confidence level of the detected emotion
    timestamp = db.Column(db.DateTime, default=datetime.utcnow) # timestamp of the record
    session_id = db.Column(db.Integer, db.ForeignKey('session.id')) # foreign key to session
    user_input = db.Column(db.Text) # user input text
    ai_response = db.Column(db.Text) # AI response text
    drug_mentions = db.Column(db.Boolean, default=False) # whether drug mentions were detected

def init_db(app): # initialize the database with the Flask app
    db.init_app(app) # bind the database to teh app
    with app.app_context(): # create all tables
        db.create_all() # create database tables
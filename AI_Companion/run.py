from flask import Flask, render_template, jsonify, session, redirect, url_for
from database import init_db, db
import os

app = Flask(__name__)
app.secret_key = 'dev-key-123'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ai_companion.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
init_db(app)

@app.route('/')
def index():
    return """
    <html>
        <head><title>AI Companion</title></head>
        <body>
            <h1>AI Companion is Running! 🎉</h1>
            <p>Your Flask app is working correctly.</p>
            <p><a href="/dashboard">Go to Dashboard</a></p>
        </body>
    </html>
    """

@app.route('/dashboard')
def dashboard():
    return """
    <html>
        <head><title>Dashboard</title></head>
        <body>
            <h1>Dashboard</h1>
            <p>Basic dashboard is working!</p>
            <p><a href="/">Back to Home</a></p>
        </body>
    </html>
    """

if __name__ == '__main__':
    print("Starting AI Companion...")
    print("Open your browser and go to: http://localhost:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)
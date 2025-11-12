from flask import Flask, render_template, session, redirect, url_for
from database import init_db, db
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ai_companion.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
init_db(app)

# Import and register blueprints
from main import main_bp
app.register_blueprint(main_bp)

# Try to register other blueprints if they exist
try:
    from auth import auth_bp
    app.register_blueprint(auth_bp)
    print("Auth blueprint registered")
except ImportError as e:
    print(f"Auth blueprint not found: {e}")

try:
    from resources import resources_bp
    app.register_blueprint(resources_bp)
    print("Resources blueprint registered")
except ImportError as e:
    print(f"Resources blueprint not found: {e}")

# Main route
@app.route('/')
def index():
    # Check if user is logged in, redirect to dashboard if so
    if 'user_id' in session:
        return redirect(url_for('main.dashboard'))
    # Otherwise show login page or landing page
    try:
        return render_template('index.html')
    except:
        return """
        <html>
            <head><title>AI Companion</title></head>
            <body>
                <h1>AI Companion</h1>
                <p><a href="/dashboard">Go to Dashboard</a></p>
                <p><a href="/auth/login">Login</a></p>
            </body>
        </html>
        """

if __name__ == '__main__':

    
    print("\nOpen your browser and go to: http://localhost:5000")
    print("   Available routes:")
    print("   - http://localhost:5000/ (Home)")
    print("   - http://localhost:5000/dashboard (Main Dashboard)")
    print("   - http://localhost:5000/auth/login (Login)")
    print("\nPress CTRL+C to stop the server")
    
    app.run(debug=True, host='127.0.0.1', port=5000)
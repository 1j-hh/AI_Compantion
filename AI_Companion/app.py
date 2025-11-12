from flask import Flask, redirect, url_for
from config import Config
from database import init_db

app = Flask(__name__)
app.config.from_object(Config)

# Initialize database
init_db(app)

# Import and register blueprints
from main import main_bp
from auth import auth_bp
from resources import resources_bp

app.register_blueprint(main_bp)
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(resources_bp, url_prefix='/resources')

@app.route('/')
def index():
    return redirect(url_for('auth.login'))

if __name__ == '__main__':
    print("Available URLs:")
    print("   - http://localhost:5000/ (redirects to login)")
    print("   - http://localhost:5000/auth/login")
    print("   - http://localhost:5000/auth/register") 
    print("   - http://localhost:5000/dashboard")
    print("   - http://localhost:5000/resources/resources")
    app.run(debug=True)
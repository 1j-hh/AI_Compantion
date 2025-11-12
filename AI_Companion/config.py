import os

class config:
    SECRET_KEY = os.environ.get('SECRET_KEY') 
    SQLALCHEMY_DATABASE_URI = 'sqlite:///companion.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from database import db, User
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method =='POST':
        username = request.form['username']
        password = request.form['password']

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            session['username'] = user.username
            flash('Login Successful!', 'success')
            return redirect(url_for('main.dashboard'))
        
        else:
            flash('Invalid.', 'error')

    return render_template('login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']

        if User.query.filter_by(username=username).first():
            flash('Error', 'error')
            return render_template('register.html')
        
        if User.query.filter_by(email=email).first():
            flash('Email already exists', 'error')
            return render_template('register.html')
        
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )

        db.session.add(user)
        db.session.commit()

        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('register.html')

@auth_bp.route('/logout')
def logout():
    session.clear()
    flash('Logged out successfully', 'success')
    return redirect(url_for(auth.login))

        
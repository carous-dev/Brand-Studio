"""
Authentication Routes for Brand Dashboard
Handles login, logout, and user management
"""

from flask import Blueprint, request, jsonify, session, render_template_string, render_template
from auth import auth_manager
from pathlib import Path

# Create blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# Minimal login page template using dashboard theme
LOGIN_TEMPLATE = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Carous Limited</title>
    <link rel="stylesheet" href="/static/style.css">
    <style>
        /* Login page specific styles - using variables from static/style.css */

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg-primary);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            color: var(--text-primary);
        }
        
        .login-container {
            width: 100%;
            max-width: 400px;
        }
        
        .login-card {
            background: var(--bg-card);
            border: 1px solid var(--border-primary);
            border-radius: var(--radius-xl);
            padding: var(--spacing-8);
            box-shadow: var(--shadow-lg);
        }
        
        .login-header {
            text-align: center;
            margin-bottom: var(--spacing-8);
        }
        
        .login-logo {
            width: 120px;
            height: 48px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: var(--spacing-4);
        }
        
        .login-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        
        .login-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 var(--spacing-2) 0;
        }
        
        .login-subtitle {
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin: 0;
        }
        
        .form-group {
            margin-bottom: var(--spacing-6);
        }
        
        .form-label {
            display: block;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: var(--spacing-2);
            font-size: 0.875rem;
        }
        
        .password-input-wrapper {
            position: relative;
            width: 100%;
        }
        
        .form-input {
            width: 100%;
            padding: var(--spacing-3) var(--spacing-10) var(--spacing-3) var(--spacing-4);
            border: 1px solid var(--border-primary);
            border-radius: var(--radius-md);
            font-size: 0.875rem;
            transition: all 0.2s ease;
            background: var(--bg-secondary);
            color: var(--text-primary);
        }
        
        .password-toggle {
            position: absolute;
            right: var(--spacing-3);
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: var(--spacing-1);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s ease;
        }
        
        .password-toggle:hover {
            color: var(--text-secondary);
        }
        
        .password-toggle svg {
            width: 18px;
            height: 18px;
        }
        
        .form-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .form-input::placeholder {
            color: var(--text-muted);
        }
        
        .form-options {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: var(--spacing-6);
            font-size: 0.875rem;
        }
        
        .checkbox {
            display: flex;
            align-items: center;
            cursor: pointer;
            color: var(--text-secondary);
        }
        
        .checkbox input {
            margin-right: var(--spacing-2);
        }
        
        .forgot-link {
            color: var(--primary);
            text-decoration: none;
        }
        
        .forgot-link:hover {
            text-decoration: underline;
        }
        
        .login-btn {
            width: 100%;
            padding: var(--spacing-3) var(--spacing-4);
            background: var(--primary);
            border: none;
            border-radius: var(--radius-md);
            color: white;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-2);
        }
        
        .login-btn:hover {
            background: var(--primary-600);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }
        
        .login-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .alert {
            padding: var(--spacing-3) var(--spacing-4);
            border-radius: var(--radius-md);
            margin-bottom: var(--spacing-6);
            font-size: 0.875rem;
        }
        
        .alert-error {
            background: var(--error-50);
            border: 1px solid var(--error-200);
            color: var(--error-600);
        }
        
        .alert-success {
            background: var(--success-50);
            border: 1px solid var(--success-200);
            color: var(--success-600);
        }
        
        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <div class="login-logo">
                    <img src="/static/images/carous-logo.png" alt="Carous Limited Logo">
                </div>
                <h1 class="login-title">Carous Limited</h1>
                <p class="login-subtitle">Sign in to manage your dealership brands</p>
            </div>

            <div id="message"></div>

            <form id="loginForm">
                <div class="form-group">
                    <label class="form-label" for="email">Email</label>
                    <input type="email" id="email" class="form-input" placeholder="Enter your email" required>
                </div>

                <div class="form-group">
                    <label for="password" class="form-label">Password</label>
                    <div class="password-input-wrapper">
                        <input type="password" id="password" name="password" class="form-input" placeholder="Enter your password" required>
                        <button type="button" class="password-toggle" id="passwordToggle" aria-label="Toggle password visibility">
                            <svg id="eyeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <svg id="eyeOffIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="form-options">
                    <label class="checkbox">
                        <input type="checkbox" id="remember">
                        Remember me
                    </label>
                    <a href="#" class="forgot-link">Forgot password?</a>
                </div>

                <button type="submit" class="login-btn" id="loginBtn">
                    <span>Sign In</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14"></path>
                        <polyline points="12,5 19,12 12,19"></polyline>
                    </svg>
                </button>
            </form>
        </div>
    </div>

    <script>
        // Password toggle functionality
        const passwordToggle = document.getElementById('passwordToggle');
        const passwordInput = document.getElementById('password');
        const eyeIcon = document.getElementById('eyeIcon');
        const eyeOffIcon = document.getElementById('eyeOffIcon');
        
        passwordToggle.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.style.display = 'none';
                eyeOffIcon.style.display = 'block';
                passwordToggle.setAttribute('aria-label', 'Hide password');
            } else {
                passwordInput.type = 'password';
                eyeIcon.style.display = 'block';
                eyeOffIcon.style.display = 'none';
                passwordToggle.setAttribute('aria-label', 'Show password');
            }
        });
        
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            const messageDiv = document.getElementById('message');
            const loginBtn = document.getElementById('loginBtn');
            
            const originalContent = loginBtn.innerHTML;
            loginBtn.innerHTML = '<span>Signing in...</span><div class="spinner"></div>';
            loginBtn.disabled = true;
            
            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, remember })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    messageDiv.innerHTML = '<div class="alert alert-success">Login successful! Redirecting...</div>';
                    setTimeout(() => window.location.href = '/dashboard', 1000);
                } else {
                    messageDiv.innerHTML = `<div class="alert alert-error">${result.message}</div>`;
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="alert alert-error">Network error. Please try again.</div>';
            } finally {
                loginBtn.innerHTML = originalContent;
                loginBtn.disabled = false;
            }
        });
    </script>
</body>
</html>
'''

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Handle user login"""
    # Check if user is already authenticated
    if 'user_token' in session and session.get('email'):
        # User is already logged in, redirect to dashboard
        from flask import redirect, url_for
        return redirect(url_for('dashboard'))
    
    if request.method == 'GET':
        return render_template_string(LOGIN_TEMPLATE)
    
    elif request.method == 'POST':
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        remember = data.get('remember', False)
        
        if not email or not password:
            return jsonify({
                'success': False, 
                'message': 'Email and password are required fields',
                'error_code': 'MISSING_FIELDS',
                'missing_fields': ['email' if not email else None, 'password' if not password else None]
            }), 400
        
        # Get client info
        ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', 'unknown'))
        user_agent = request.headers.get('User-Agent', 'unknown')

        # Authenticate with external API
        result = auth_manager.authenticate_with_api(email, password, ip_address, user_agent)
        
        if result['success']:
            # Set Flask session with token
            session['user_token'] = result['token']
            session['email'] = result['user']['email']
            session['name'] = result['user']['name']
            session['role'] = result['user']['role']
            session.permanent = remember  # This controls browser session behavior

            return jsonify({
                'success': True,
                'message': f"Welcome back, {result['user']['name']}! You have successfully logged in.",
                'user': result['user']
            })
        else:
            
            return jsonify({
                'success': False, 
                'message': result.get('message', 'Invalid authentication response'),
                'error_code': result.get('error_code', 'AUTH_FAILED'),
                'details': result.get('error_details', 'No additional details available')
            }), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Handle user logout"""
    # Get user info before clearing session
    user_name = session.get('name', 'Unknown User')

    # Clear Flask session
    session.clear()

    if request.is_json:
        return jsonify({
            'success': True, 
            'message': f'You have been successfully logged out, {user_name}!'
        })
    else:
        return jsonify({
            'success': True,
            'redirect': '/auth/login'
        })

@auth_bp.route('/logout', methods=['GET'])
def logout_get():
    """Handle GET logout request - redirect to login page"""
    # Clear session
    session.clear()
    
    # Redirect to login page
    from flask import redirect, url_for
    return redirect(url_for('auth.login'))

@auth_bp.route('/check', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if hasattr(request, 'user') and request.user:
        
        return jsonify({
            'authenticated': True,
            'user': request.user
        })
    else:
        
        return jsonify({
            'authenticated': False,
            'message': 'No active session found'
        })

@auth_bp.route('/access-denied', methods=['GET'])
def access_denied():
    """Render access denied page for non-admin users"""
    return render_template('access_denied.html')

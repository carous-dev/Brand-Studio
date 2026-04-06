"""
Authentication System for Brand Dashboard
Handles user authentication, session management, and route protection
"""

import hashlib
import secrets
import requests
import json
import base64
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify, session, g, redirect, url_for
from pathlib import Path
import os
import hmac

# Auth database path
AUTH_DB = Path(__file__).parent / 'app' / 'data' / 'auth.db'

class AuthManager:
    def __init__(self, app: Flask = None):
        self.app = app
        self.secret_key = None
        self.token_expiry = timedelta(hours=24)
        self.api_url = "https://api.carous.co.uk/v1/login"
        if app:
            self.init_app(app)
    
    def init_app(self, app: Flask):
        """Initialize authentication with Flask app"""
        self.app = app
        # Flask's default config contains SECRET_KEY=None. Using `dict.get('SECRET_KEY', ...)`
        # would return None and break token signing (NoneType has no attribute 'encode').
        self.secret_key = (
            app.config.get('SECRET_KEY')
            or os.environ.get('SECRET_KEY')
            or 'dev-secret-key-change-in-production'
        )

        # Ensure Flask session signing uses the same key.
        app.config['SECRET_KEY'] = self.secret_key
        app.secret_key = self.secret_key

        if self.secret_key == 'dev-secret-key-change-in-production':
            pass  # Development fallback - remove in production
        
        # Configure session to expire when browser closes
        app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)  # For "remember me"
        
        # Register before request handler
        app.before_request(self.load_user)
        
        # Add context processor for templates
        app.context_processor(self.inject_user)
    
    def authenticate_with_api(self, email: str, password: str, ip_address: str = None, user_agent: str = None) -> dict:
        """Authenticate user with external API"""
        try:
            # Prepare payload for external API
            payload = f'email={email}&password={password}'
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            # Make request to external API
            response = requests.post(self.api_url, headers=headers, data=payload, timeout=10)
            
            if response.status_code == 200:
                # Parse API response
                try:
                    api_data = response.json()
                    
                    # Extract user information from API response
                    user_data = self.extract_user_data(api_data)
                    
                    if user_data:
                        # Check if user is admin - only admins can access
                        if user_data.get('role') != 'admin':
                            error_msg = f"Access denied. User '{user_data.get('name')}' (role: {user_data.get('role')}) is not an admin. Only admin users can access this system."
                            return {
                                'success': False, 
                                'message': error_msg,
                                'error_code': 'ACCESS_DENIED',
                                'user_role': user_data.get('role'),
                                'user_name': user_data.get('name')
                            }
                        
                        # Generate local JWT token
                        token = self.generate_token(user_data['email'], user_data)
                        
                        success_msg = f"Welcome back, {user_data.get('name')}! Authentication successful."
                        
                        return {
                            'success': True,
                            'message': success_msg,
                            'token': token,
                            'user': {
                                'email': user_data['email'],
                                'name': user_data.get('name', 'User'),
                                'role': user_data.get('role', 'user'),
                                'client_id': user_data.get('client_id'),
                                'access_key': user_data.get('access_key'),
                                'api_id': user_data.get('api_id')
                            },
                            'api_data': user_data
                        }
                    else:
                        # Check if API returned a specific error message
                        api_error = api_data.get('error')
                        if api_error:
                            # Try local fallback for user not found errors
                            if "no such user" in api_error.lower() or "user not found" in api_error.lower() or "contact admin" in api_error.lower():
                                return self.authenticate_with_local_db(email, password)
                            else:
                                error_msg = f"Authentication failed: {api_error}"
                                return {
                                    'success': False,
                                    'message': api_error,
                                    'error_code': 'INVALID_CREDENTIALS'
                                }
                        else:
                            error_msg = f"Invalid API response format. Expected 'user' object in response but got: {list(api_data.keys()) if isinstance(api_data, dict) else type(api_data)}"
                            return {
                                'success': False, 
                                'message': error_msg,
                                'error_code': 'INVALID_RESPONSE',
                                'api_response': api_data
                            }
                except json.JSONDecodeError as e:
                    # Try local fallback
                    return self.authenticate_with_local_db(email, password)
            else:
                # Try local fallback
                return self.authenticate_with_local_db(email, password)
                
        except requests.exceptions.RequestException as e:
            # Try local fallback for network errors
            return self.authenticate_with_local_db(email, password)
        except Exception as e:
            return {
                'success': False, 
                'message': 'An unexpected error occurred during authentication. Please contact support.',
                'error_code': 'UNEXPECTED_ERROR',
                'error_details': str(e)
            }
    
    def extract_user_data(self, api_data: dict) -> dict:
        """Extract user data from API response"""
        if isinstance(api_data, dict):
            # Check if API returned an error
            if api_data.get('error'):
                return None
            
            # Check if user object exists and is not null
            if api_data.get('user') and isinstance(api_data['user'], dict):
                user_info = api_data['user']
                return {
                    'email': user_info.get('email'),
                    'name': user_info.get('name'),
                    'role': user_info.get('role', 'user'),
                    'client_id': user_info.get('client_id'),
                    'access_key': user_info.get('access_key'),
                    'api_id': user_info.get('id'),
                    'raw_data': api_data
                }
            else:
                return None
        else:
            return None

    def authenticate_with_local_db(self, email: str, password: str) -> dict:
        """Authenticate user with local database as fallback"""
        try:
            import pymysql
            
            # Get database connection
            connection = self.get_db_connection()
            if not connection:
                return {
                    'success': False,
                    'message': 'Local database is currently unavailable',
                    'error_code': 'DB_CONNECTION_FAILED'
                }
            
            with connection.cursor() as cursor:
                # Find user by email
                cursor.execute(
                    "SELECT id, name, email, password_hash, role, is_active FROM auth_users WHERE email = %s",
                    (email.lower().strip(),)
                )
                user = cursor.fetchone()
                
                if not user:
                    connection.close()
                    return {
                        'success': False,
                        'message': 'Invalid email or password',
                        'error_code': 'INVALID_CREDENTIALS'
                    }
                
                # Check if user is active
                if not user['is_active']:
                    connection.close()
                    return {
                        'success': False,
                        'message': 'Account is deactivated. Please contact administrator.',
                        'error_code': 'ACCOUNT_INACTIVE'
                    }
                
                # Verify password
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                if not hmac.compare_digest(password_hash, user['password_hash']):
                    connection.close()
                    return {
                        'success': False,
                        'message': 'Invalid email or password',
                        'error_code': 'INVALID_CREDENTIALS'
                    }
                
                # Update last login
                cursor.execute(
                    "UPDATE auth_users SET last_login = NOW() WHERE id = %s",
                    (user['id'],)
                )
                connection.commit()
                connection.close()
                
                # Prepare user data
                user_data = {
                    'email': user['email'],
                    'name': user['name'],
                    'role': user['role'],
                    'id': user['id']
                }
                
                # Generate token
                token = self.generate_token(user['email'], user_data)
                
                return {
                    'success': True,
                    'message': f"Welcome back, {user['name']}! Authentication successful.",
                    'token': token,
                    'user': {
                        'email': user['email'],
                        'name': user['name'],
                        'role': user['role'],
                        'id': user['id']
                    },
                    'auth_source': 'local_db'
                }
                
        except Exception as e:
            return {
                'success': False,
                'message': 'An error occurred during local authentication',
                'error_code': 'LOCAL_AUTH_ERROR',
                'error_details': str(e)
            }
    
    def get_db_connection(self):
        """Get database connection using environment variables"""
        try:
            import pymysql
            connection = pymysql.connect(
                host=os.environ.get('MYSQL_HOST', 'localhost'),
                user=os.environ.get('MYSQL_USER', 'root'),
                password=os.environ.get('MYSQL_PASSWORD', ''),
                database=os.environ.get('MYSQL_DATABASE', 'dealers_previews'),
                port=int(os.environ.get('MYSQL_PORT', 3306)),
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor
            )
            return connection
        except Exception as e:
            return None

    def generate_token(self, email: str, user_data: dict) -> str:
        """Generate simple token for user"""
        payload = {
            'email': email,
            'name': user_data.get('name'),
            'role': user_data.get('role'),
            'client_id': user_data.get('client_id'),
            'access_key': user_data.get('access_key'),
            'api_id': user_data.get('api_id'),
            'exp': (datetime.utcnow() + self.token_expiry).timestamp(),
            'iat': datetime.utcnow().timestamp()
        }
        
        # Create a simple token using base64 encoding + HMAC signature
        payload_json = json.dumps(payload, separators=(',', ':'))
        payload_b64 = base64.urlsafe_b64encode(payload_json.encode()).decode().rstrip('=')
        
        # Create signature
        signature = hmac.new(
            self.secret_key.encode(),
            payload_b64.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Combine payload and signature
        token = f"{payload_b64}.{signature}"
        
        return token
    
    def verify_token(self, token: str) -> dict:
        """Verify simple token and return payload"""
        try:
            if '.' not in token:
                return None
                
            payload_b64, signature = token.split('.', 1)
            
            # Verify signature
            expected_signature = hmac.new(
                self.secret_key.encode(),
                payload_b64.encode(),
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(signature, expected_signature):
                return None
            
            # Decode payload
            # Add padding back to base64 string
            payload_b64_padded = payload_b64 + '=' * (-len(payload_b64) % 4)
            payload_json = base64.urlsafe_b64decode(payload_b64_padded.encode()).decode()
            payload = json.loads(payload_json)
            
            # Check expiration
            if datetime.utcnow().timestamp() > payload.get('exp', 0):
                return None
                
            return payload
            
        except Exception as e:
            return None
    
    def load_user(self):
        """Load user from session token"""
        # Check session first
        if 'user_token' in session:
            token = session['user_token']
            payload = self.verify_token(token)
            
            if payload:
                g.user = {
                    'email': payload['email'],
                    'name': payload['name'],
                    'role': payload['role'],
                    'client_id': payload.get('client_id'),
                    'access_key': payload.get('access_key'),
                    'api_id': payload.get('api_id')
                }
                return
        
        # Check Authorization header for API requests
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header[7:]
            payload = self.verify_token(token)
            
            if payload:
                g.user = {
                    'email': payload['email'],
                    'name': payload['name'],
                    'role': payload['role'],
                    'client_id': payload.get('client_id'),
                    'access_key': payload.get('access_key'),
                    'api_id': payload.get('api_id')
                }
                return
        
        g.user = None
    
    def inject_user(self):
        """Inject user into template context"""
        return {'current_user': getattr(g, 'user', None)}
    
    def login_required(self, f):
        """Decorator to require authentication"""
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(g, 'user') or not g.user:
                if request.is_json or request.path.startswith('/api/'):
                    return jsonify({
                        'error': 'Authentication required', 
                        'code': 'AUTH_REQUIRED',
                        'message': 'Please login to access this resource'
                    }), 401
                # For browser requests (HTML), perform an actual redirect to login
                next_path = request.path or '/'
                # avoid open redirects: only allow internal paths
                if not next_path.startswith('/'):
                    next_path = '/'
                return redirect(url_for('auth.login', next=next_path))
            return f(*args, **kwargs)
        return decorated_function
    
    def admin_required(self, f):
        """Decorator to require admin role"""
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(g, 'user') or not g.user:
                if request.is_json or request.path.startswith('/api/'):
                    return jsonify({
                        'error': 'Authentication required', 
                        'code': 'AUTH_REQUIRED'
                    }), 401
                else:
                    return jsonify({
                        'error': 'Authentication required',
                        'code': 'AUTH_REQUIRED',
                        'redirect': '/auth/login'
                    }), 401
            
            if g.user.get('role') != 'admin':
                if request.is_json or request.path.startswith('/api/'):
                    return jsonify({
                        'error': 'Admin access required',
                        'code': 'ADMIN_REQUIRED'
                    }), 403
                else:
                    # Redirect to access denied page for web requests
                    from flask import redirect, url_for
                    return redirect(url_for('auth.access_denied'))
            
            return f(*args, **kwargs)
        return decorated_function

# Global auth manager instance
auth_manager = AuthManager()

def init_auth(app: Flask):
    """Initialize authentication system"""
    auth_manager.init_app(app)
    return auth_manager

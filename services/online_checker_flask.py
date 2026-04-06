"""
Flask Integration for Online Checker Service
Provides Flask routes and utilities for the online checker
"""

from flask import Blueprint, jsonify, request
import threading
import time
from .online_checker import get_service, start_service, stop_service

# Create Blueprint
online_checker_bp = Blueprint('online_checker', __name__, url_prefix='/api/online-checker')

# Add cache control decorator for online checker routes
def no_cache_response(f):
    """Decorator to add no-cache headers to online checker responses"""
    import functools
    
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        response = f(*args, **kwargs)
        if hasattr(response, 'headers'):
            response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Headers'] = 'Cache-Control, Content-Type'
        return response
    return decorated_function

@online_checker_bp.route('/status', methods=['GET'])
@no_cache_response
def get_checker_status():
    """Get the current status of the online checker service"""
    try:
        service = get_service()
        status = service.get_queue_status()
        
        return jsonify({
            'success': True,
            'status': status
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@online_checker_bp.route('/start', methods=['POST'])
@no_cache_response
def start_checker_service():
    """Start the online checker service"""
    try:
        service = start_service()
        return jsonify({
            'success': True,
            'message': 'Online checker service started',
            'status': service.get_queue_status()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@online_checker_bp.route('/stop', methods=['POST'])
@no_cache_response
def stop_checker_service():
    """Stop the online checker service"""
    try:
        stop_service()
        return jsonify({
            'success': True,
            'message': 'Online checker service stopped'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@online_checker_bp.route('/check', methods=['POST'])
@no_cache_response
def check_single_domain():
    """Check a single domain immediately"""
    try:
        data = request.get_json()
        if not data or 'domain' not in data:
            return jsonify({
                'success': False,
                'error': 'Domain is required'
            }), 400
        
        domain = data['domain']
        service = get_service()
        status = service.check_single_domain(domain)
        
        return jsonify({
            'success': True,
            'domain': domain,
            'status': status,
            'timestamp': time.time()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@online_checker_bp.route('/previews', methods=['GET'])
@no_cache_response
def get_previews_status():
    """Get all previews with their online status"""
    try:
        import pymysql
        import os
        
        # Database connection
        connection = pymysql.connect(
            host=os.environ.get('MYSQL_HOST', 'localhost'),
            user=os.environ.get('MYSQL_USER', 'root'),
            password=os.environ.get('MYSQL_PASSWORD', ''),
            database=os.environ.get('MYSQL_DATABASE', 'dealers_previews'),
            port=int(os.environ.get('MYSQL_PORT', 3306)),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with connection.cursor() as cursor:
            # Get pagination parameters
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 50))
            offset = (page - 1) * limit
            
            # Get status filter
            status_filter = request.args.get('status', '')
            
            # Build query
            where_clause = ""
            params = []
            
            if status_filter in ['online', 'offline']:
                where_clause = "WHERE status = %s"
                params.append(status_filter)
            
            # Get total count
            count_query = f"SELECT COUNT(*) as total FROM previews {where_clause}"
            cursor.execute(count_query, params)
            total = cursor.fetchone()['total']
            
            # Get previews
            query = f"""
                SELECT id, domain, status, updated_at, created_at
                FROM previews 
                {where_clause}
                ORDER BY updated_at DESC 
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, params + [limit, offset])
            previews = cursor.fetchall()
        
        connection.close()
        
        return jsonify({
            'success': True,
            'data': previews,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@online_checker_bp.route('/stats', methods=['GET'])
@no_cache_response
def get_checker_stats():
    """Get statistics about the online checker"""
    try:
        import pymysql
        import os
        
        # Database connection
        connection = pymysql.connect(
            host=os.environ.get('MYSQL_HOST', 'localhost'),
            user=os.environ.get('MYSQL_USER', 'root'),
            password=os.environ.get('MYSQL_PASSWORD', ''),
            database=os.environ.get('MYSQL_DATABASE', 'dealers_previews'),
            port=int(os.environ.get('MYSQL_PORT', 3306)),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with connection.cursor() as cursor:
            # Get status statistics
            cursor.execute("""
                SELECT 
                    status,
                    COUNT(*) as count,
                    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM previews), 2) as percentage
                FROM previews 
                GROUP BY status
            """)
            status_stats = cursor.fetchall()
            
            # Get recent activity
            cursor.execute("""
                SELECT 
                    DATE(updated_at) as date,
                    status,
                    COUNT(*) as count
                FROM previews 
                WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE(updated_at), status
                ORDER BY date DESC
            """)
            recent_activity = cursor.fetchall()
            
            # Get total counts
            cursor.execute("SELECT COUNT(*) as total FROM previews")
            total_previews = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) as count FROM previews WHERE domain IS NOT NULL AND domain != ''")
            with_domain = cursor.fetchone()['count']
        
        connection.close()
        
        service = get_service()
        queue_status = service.get_queue_status()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_previews': total_previews,
                'with_domain': with_domain,
                'without_domain': total_previews - with_domain,
                'status_distribution': status_stats,
                'recent_activity': recent_activity,
                'service_status': queue_status
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


def init_flask_app(app):
    """Initialize the online checker with Flask app"""
    # Register blueprint
    app.register_blueprint(online_checker_bp)
    
    # Check auto-start configuration
    auto_start = app.config.get('ONLINE_CHECKER_AUTO_START', False)
    print(f"🔧 Online checker init_flask_app: auto_start = {auto_start}")
    
    # Start service automatically if configured
    if auto_start:
        try:
            start_service()
            print("✅ Online checker service auto-started with Flask app")
        except Exception as e:
            print(f"❌ Failed to auto-start online checker service: {e}")
    else:
        print("ℹ️ Online checker service auto-start is disabled")
    
    return app


# Utility functions for manual integration
def update_preview_status_manually(preview_id: int, status: str):
    """Manually update a preview's status"""
    try:
        import pymysql
        import os
        
        connection = pymysql.connect(
            host=os.environ.get('MYSQL_HOST', 'localhost'),
            user=os.environ.get('MYSQL_USER', 'root'),
            password=os.environ.get('MYSQL_PASSWORD', ''),
            database=os.environ.get('MYSQL_DATABASE', 'dealers_previews'),
            port=int(os.environ.get('MYSQL_PORT', 3306)),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE previews 
                SET status = %s, updated_at = NOW() 
                WHERE id = %s
            """, (status, preview_id))
            connection.commit()
        
        connection.close()
        return True
    except Exception as e:
        print(f"Error updating preview status: {e}")
        return False


def force_check_preview(preview_id: int):
    """Force check a specific preview immediately"""
    try:
        import pymysql
        import os
        
        connection = pymysql.connect(
            host=os.environ.get('MYSQL_HOST', 'localhost'),
            user=os.environ.get('MYSQL_USER', 'root'),
            password=os.environ.get('MYSQL_PASSWORD', ''),
            database=os.environ.get('MYSQL_DATABASE', 'dealers_previews'),
            port=int(os.environ.get('MYSQL_PORT', 3306)),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, domain FROM previews WHERE id = %s", (preview_id,))
            preview = cursor.fetchone()
            
            if preview and preview['domain']:
                service = get_service()
                status = service.check_single_domain(preview['domain'])
                update_preview_status_manually(preview_id, status)
                return status
        
        connection.close()
        return None
    except Exception as e:
        print(f"Error force checking preview: {e}")
        return None

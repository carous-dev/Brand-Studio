"""
Online Checker Service
Independent module to check if preview domains are online/offline and update status in database
Uses queue-based system for efficient processing
"""

import time
import threading
import requests
import pymysql
import queue
import logging
from datetime import datetime, timedelta
from urllib.parse import urlparse
import socket
import os
from typing import Dict, Optional, List

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    # Load .env file from project root
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(project_root, '.env')
    load_dotenv(env_path)
    print(f"Loaded .env from: {env_path}")
except ImportError:
    print("Warning: python-dotenv not installed. Loading .env manually...")
    # Manual .env loading
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(project_root, '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()
        print(f"Manually loaded .env from: {env_path}")
    else:
        print(f"Warning: .env file not found at: {env_path}")
except Exception as e:
    print(f"Warning: Could not load .env file: {e}")

# Suppress SSL warnings
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configure logging with rotation
import logging.handlers

def setup_logging(config: Dict):
    """Setup logging with rotation and flushing"""
    log_file = config.get('log_file', 'online_checker.log')
    log_max_size = config.get('log_max_size', 10 * 1024 * 1024)  # 10MB default
    log_backup_count = config.get('log_backup_count', 5)  # Keep 5 backup files
    log_level = getattr(logging, config.get('log_level', 'INFO').upper())
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Setup rotating file handler
    file_handler = logging.handlers.RotatingFileHandler(
        log_file,
        maxBytes=log_max_size,
        backupCount=log_backup_count,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(log_level)
    
    # Setup console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove existing handlers to avoid duplicates
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Add new handlers
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)
    
    return root_logger

class OnlineCheckerService:
    """
    Queue-based service to check online status of preview domains
    """
    
    def __init__(self, config: Dict = None):
        """
        Initialize the online checker service
        
        Args:
            config: Configuration dictionary
        """
        self.config = config or {}
        
        # Setup logging with rotation
        self.logger = setup_logging(self.config)
        
        # Get configuration values
        self.num_workers = self.config.get('num_workers', 5)
        self.check_interval = self.config.get('check_interval', 300)  # 5 minutes
        self.request_timeout = self.config.get('request_timeout', 10)
        self.max_retries = self.config.get('max_retries', 3)
        self.retry_delay = self.config.get('retry_delay', 1)
        self.batch_size = self.config.get('batch_size', 50)
        
        # Log flushing configuration
        self.log_flush_interval = self.config.get('log_flush_interval', 300)  # 5 minutes
        self.last_log_flush = time.time()
        
        # Database connection
        self.db_config = {
            'host': os.environ.get('MYSQL_HOST', 'localhost'),
            'user': os.environ.get('MYSQL_USER', 'root'),
            'password': os.environ.get('MYSQL_PASSWORD', ''),
            'database': os.environ.get('MYSQL_DATABASE', 'dealers_previews'),
            'port': int(os.environ.get('MYSQL_PORT', 3306)),
            'charset': 'utf8mb4',
            'cursorclass': pymysql.cursors.DictCursor,
            'autocommit': True
        }
        
        # Debug: Print database config (without password)
        debug_config = self.db_config.copy()
        debug_config['password'] = '***' if debug_config['password'] else '(empty)'
        self.logger.info(f"Database config: {debug_config}")
        
        self.logger.info("Online Checker Service initialized")
        self.logger.info(f"Workers: {self.num_workers}, Check interval: {self.check_interval}s")
        
        # Initialize state
        self.running = False
        self.check_queue = queue.Queue(maxsize=self.config.get('queue_max_size', 1000))
        self.workers = []
        self.worker_threads = []  # Add this line
        self.scheduler_thread = None

    def _get_default_config(self) -> Dict:
        """Get default configuration"""
        return {
            'num_workers': 5,
            'check_interval': 300,  # 5 minutes
            'request_timeout': 10,
            'max_retries': 3,
            'batch_size': 50
        }
    
    def start(self):
        """Start the online checker service"""
        if self.running:
            self.logger.warning("Service is already running")
            return
        
        self.running = True
        self.logger.info("Starting Online Checker Service...")
        
        # Start worker threads
        for i in range(self.num_workers):
            worker = threading.Thread(target=self._worker, name=f"Checker-{i+1}")
            worker.daemon = True
            worker.start()
            self.worker_threads.append(worker)
            self.logger.info(f"Started worker thread: {worker.name}")
        
        # Start scheduler thread
        scheduler = threading.Thread(target=self._scheduler, name="Scheduler")
        scheduler.daemon = True
        scheduler.start()
        self.logger.info("Started scheduler thread")
        
        self.logger.info("Online Checker Service started successfully")
        self.logger.info("Service is now running and will start checking domains...")
    
    def stop(self):
        """Stop the online checker service"""
        self.logger.info("Stopping Online Checker Service...")
        self.running = False
        
        # Wait for threads to finish
        for thread in self.worker_threads:
            thread.join(timeout=5)
        
        self.logger.info("Online Checker Service stopped")
    
    def _scheduler(self):
        """Scheduler thread that periodically fetches previews and flushes logs"""
        thread_name = threading.current_thread().name
        self.logger.info(f"Started {thread_name}")
        
        while self.running:
            try:
                # Fetch previews for checking
                self.logger.info("Fetching previews for status check...")
                previews = self._get_pending_previews()
                
                if previews:
                    self.logger.info(f"Found {len(previews)} previews to check")
                    for preview in previews:
                        if self.running:
                            self.check_queue.put(preview)
                        else:
                            break
                else:
                    self.logger.info("No pending previews found")
                
                # Check if it's time to flush logs
                current_time = time.time()
                if current_time - self.last_log_flush >= self.log_flush_interval:
                    self._flush_logs()
                    self.last_log_flush = current_time
                
                # Wait for next check cycle
                time.sleep(self.check_interval)
                
            except Exception as e:
                self.logger.error(f"Error in {thread_name}: {e}")
                time.sleep(60)  # Wait 1 minute before retrying
        
        self.logger.info(f"{thread_name} stopped")
    
    def _worker(self):
        """Worker thread to process domain checks"""
        thread_name = threading.current_thread().name
        self.logger.info(f"{thread_name} started")
        
        while self.running:
            try:
                # Get preview from queue (blocking with timeout)
                preview = self.check_queue.get(timeout=10)
                
                if preview is None:  # Poison pill
                    break
                
                self.logger.info(f"{thread_name} checking: {preview.get('name', preview.get('slug', 'unknown'))}")
                
                # Extract domain from config (JSON field)
                domain = self._extract_domain_from_config(preview.get('config', ''))
                
                if not domain:
                    self.logger.warning(f"{thread_name} no domain found for {preview.get('slug', 'unknown')}")
                    status = 'offline'
                else:
                    status = self._check_domain_status(domain)
                
                # Update database
                primary_key_value = preview.get('slug') or preview.get('id') or list(preview.values())[0]
                self._update_preview_status(primary_key_value, status)
                self.logger.info(f"{thread_name} updated {preview.get('name', preview.get('slug', 'unknown'))} -> {status} (domain: {domain})")
                
                self.check_queue.task_done()
                
            except queue.Empty:
                continue
            except Exception as e:
                self.logger.error(f"{thread_name} error: {e}")
                continue
        
        self.logger.info(f"{thread_name} stopped")
    
    def _extract_domain_from_config(self, config_str: str) -> Optional[str]:
        """
        Extract domain from the config JSON field
        
        Args:
            config_str: JSON string from the config field
            
        Returns:
            Domain string or None if not found
        """
        if not config_str:
            return None
        
        try:
            import json
            config = json.loads(config_str)
            
            # Try different possible domain field names
            domain_fields = ['domain', 'url', 'site_url', 'website', 'host']
            
            for field in domain_fields:
                if field in config and config[field]:
                    return config[field]
            
            # Check nested objects
            if 'brand' in config and isinstance(config['brand'], dict):
                for field in domain_fields:
                    if field in config['brand'] and config['brand'][field]:
                        return config['brand'][field]
            
            # Check theme or other nested structures
            for key in config:
                if isinstance(config[key], dict):
                    for field in domain_fields:
                        if field in config[key] and config[key][field]:
                            return config[key][field]
            
            return None
            
        except (json.JSONDecodeError, Exception) as e:
            self.logger.debug(f"Failed to parse config JSON: {e}")
            return None
    
    def _flush_logs(self):
        """Flush all log handlers to ensure logs are written to disk"""
        try:
            root_logger = logging.getLogger()
            for handler in root_logger.handlers:
                if hasattr(handler, 'flush'):
                    handler.flush()
            self.logger.debug("Logs flushed to disk")
        except Exception as e:
            self.logger.error(f"Error flushing logs: {e}")
    
    def _get_pending_previews(self) -> List[Dict]:
        """Get previews that need status checking"""
        try:
            connection = pymysql.connect(**self.db_config)
            
            with connection.cursor() as cursor:
                # First, check the table structure
                cursor.execute("DESCRIBE previews")
                columns = cursor.fetchall()
                column_names = [col['Field'] for col in columns]
                
                self.logger.info(f"Previews table columns: {column_names}")
                
                # Determine primary key column
                primary_key = None
                if 'id' in column_names:
                    primary_key = 'id'
                elif 'preview_id' in column_names:
                    primary_key = 'preview_id'
                elif 'slug' in column_names:
                    primary_key = 'slug'
                else:
                    # Use the first column as fallback
                    primary_key = column_names[0] if column_names else 'id'
                
                self.logger.info(f"Using primary key: {primary_key}")
                
                # Check if status column exists
                has_status_column = 'status' in column_names
                if not has_status_column:
                    self.logger.warning("Status column not found in previews table. Please run the migration.")
                    return []
                
                # Build query based on available columns
                select_columns = [primary_key]
                if 'name' in column_names:
                    select_columns.append('name')
                if 'config' in column_names:
                    select_columns.append('config')
                if 'status' in column_names:
                    select_columns.append('status')
                if 'updated_at' in column_names:
                    select_columns.append('updated_at')
                if 'status_checked_at' in column_names:
                    select_columns.append('status_checked_at')

                # Pick previews whose last status probe is stale.
                # IMPORTANT: filter on status_checked_at (when the checker last
                # ran), NOT updated_at (which the editor bumps on every save).
                # Falls back to updated_at only for legacy schemas where the
                # migration to add status_checked_at hasn't run yet.
                where_conditions = []
                params = []

                if 'status_checked_at' in column_names:
                    where_conditions.append(
                        "(status_checked_at IS NULL OR status_checked_at < DATE_SUB(NOW(), INTERVAL %s SECOND))"
                    )
                    params.append(self.check_interval)
                    order_col = 'status_checked_at'
                elif 'updated_at' in column_names:
                    where_conditions.append(
                        "(updated_at IS NULL OR updated_at < DATE_SUB(NOW(), INTERVAL %s SECOND))"
                    )
                    params.append(self.check_interval)
                    order_col = 'updated_at'
                else:
                    order_col = primary_key

                where_clause = " WHERE " + " AND ".join(where_conditions) if where_conditions else ""

                query = f"""
                    SELECT {', '.join(select_columns)}
                    FROM previews
                    {where_clause}
                    ORDER BY {order_col} ASC
                    LIMIT %s
                """
                params.append(self.config.get('batch_size', 50))
                
                self.logger.info(f"Executing query: {query}")
                self.logger.info(f"Parameters: {params}")
                
                cursor.execute(query, params)
                previews = cursor.fetchall()
                
                self.logger.info(f"Found {len(previews)} previews to check")
                
            connection.close()
            return previews
            
        except Exception as e:
            self.logger.error(f"Error fetching previews: {e}")
            return []
    
    def _check_domain_status(self, domain: str) -> str:
        """
        Check if a domain is online or offline
        
        Args:
            domain: Domain to check
            
        Returns:
            'online' or 'offline'
        """
        if not domain:
            return 'offline'
        
        # Clean domain
        domain = self._clean_domain(domain)
        if not domain:
            return 'offline'
        
        # Try multiple methods to determine status
        for attempt in range(self.max_retries):
            try:
                # Method 1: HTTP request
                if self._check_http(domain):
                    return 'online'
                
                # Method 2: DNS resolution
                if self._check_dns(domain):
                    return 'online'
                
                # Method 3: Socket connection
                if self._check_socket(domain):
                    return 'online'
                
                time.sleep(1)  # Wait between retries
                
            except Exception as e:
                self.logger.debug(f"Check attempt {attempt + 1} failed for {domain}: {e}")
                continue
        
        return 'offline'
    
    def _clean_domain(self, domain: str) -> Optional[str]:
        """Clean and validate domain"""
        if not domain:
            return None
        
        # Remove protocol
        if domain.startswith(('http://', 'https://')):
            domain = domain.split('://', 1)[1]
        
        # Remove path and query
        domain = domain.split('/', 1)[0]
        domain = domain.split('?', 1)[0]
        
        # Remove port if specified
        if ':' in domain and not domain.endswith(':80') and not domain.endswith(':443'):
            domain = domain.split(':')[0]
        
        # Basic validation
        if not domain or len(domain) < 3:
            return None
        
        return domain.lower().strip()
    
    def _check_http(self, domain: str) -> bool:
        """Check domain via HTTP request"""
        try:
            urls = [
                f"https://{domain}",
                f"http://{domain}"
            ]
            
            for url in urls:
                try:
                    response = requests.head(
                        url,
                        timeout=self.request_timeout,
                        allow_redirects=True,
                        verify=False  # Ignore SSL cert issues
                    )
                    if response.status_code < 500:  # Accept 2xx, 3xx, 4xx
                        return True
                except requests.exceptions.RequestException:
                    continue
            
            return False
            
        except Exception:
            return False
    
    def _check_dns(self, domain: str) -> bool:
        """Check domain via DNS resolution"""
        try:
            socket.gethostbyname(domain)
            return True
        except socket.gaierror:
            return False
    
    def _check_socket(self, domain: str) -> bool:
        """Check domain via socket connection"""
        try:
            # Try common ports
            ports = [80, 443, 8080]
            
            for port in ports:
                try:
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.settimeout(self.request_timeout)
                    result = sock.connect_ex((domain, port))
                    sock.close()
                    
                    if result == 0:
                        return True
                except:
                    continue
            
            return False
            
        except Exception:
            return False
    
    def _update_preview_status(self, preview_id: int, status: str):
        """Update preview status in database"""
        try:
            connection = pymysql.connect(**self.db_config)
            
            with connection.cursor() as cursor:
                # Get table structure to find primary key
                cursor.execute("DESCRIBE previews")
                columns = cursor.fetchall()
                column_names = [col['Field'] for col in columns]
                
                # Determine primary key column
                primary_key = None
                if 'id' in column_names:
                    primary_key = 'id'
                elif 'preview_id' in column_names:
                    primary_key = 'preview_id'
                elif 'slug' in column_names:
                    primary_key = 'slug'
                else:
                    primary_key = column_names[0] if column_names else 'id'
                
                # Check if status column exists
                if 'status' not in column_names:
                    self.logger.warning("Status column not found in previews table. Skipping update.")
                    return
                
                # Build update query.
                # Status probes are NOT data edits — never bump updated_at here,
                # otherwise the dashboard's "recently updated" ordering and the
                # editor-pause heuristic break. status_checked_at is the right
                # column to advance (added in preview_store init_schema).
                set_clauses = ["status = %s"]
                params = [status]

                if 'status_checked_at' in column_names:
                    set_clauses.append("status_checked_at = NOW()")

                query = f"""
                    UPDATE previews
                    SET {', '.join(set_clauses)}
                    WHERE {primary_key} = %s
                """
                params.append(preview_id)

                self.logger.info(f"Updating status: {query} with params {[status, preview_id]}")
                cursor.execute(query, params)
                connection.commit()
            
            connection.close()
            
        except Exception as e:
            self.logger.error(f"Error updating status for preview {preview_id}: {e}")
    
    def check_single_domain(self, domain: str) -> str:
        """
        Check a single domain immediately (for manual checks)

        Args:
            domain: Domain to check

        Returns:
            'online' or 'offline'
        """
        return self._check_domain_status(domain)

    def recheck_slug(self, slug: str, domain: str) -> Optional[str]:
        """Probe a single preview's domain right now and persist the result.

        Used by app.py after every preview upsert so the dashboard badge
        reflects current reality instead of waiting for the next batch cycle
        (up to check_interval seconds in production).
        """
        if not slug or not domain:
            return None
        try:
            status = self._check_domain_status(domain)
            self._update_preview_status(slug, status)
            return status
        except Exception as e:
            self.logger.error(f"recheck_slug failed for {slug}: {e}")
            return None
    
    def get_queue_status(self) -> Dict:
        """Get current queue status"""
        return {
            'queue_size': self.check_queue.qsize(),
            'running': self.running,
            'workers': len(self.worker_threads),
            'check_interval': self.check_interval
        }


# Singleton instance
_service_instance = None

def get_service() -> OnlineCheckerService:
    """Get the singleton service instance"""
    global _service_instance
    if _service_instance is None:
        _service_instance = OnlineCheckerService()
    return _service_instance


def start_service():
    """Start the online checker service"""
    service = get_service()
    service.start()
    return service


def stop_service():
    """Stop the online checker service"""
    service = get_service()
    service.stop()


if __name__ == "__main__":
    # Run as standalone service
    import signal
    import sys
    
    def signal_handler(sig, frame):
        logger.info("Received shutdown signal")
        stop_service()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Start service
    service = start_service()
    
    try:
        logger.info("Online Checker Service running. Press Ctrl+C to stop.")
        # Keep main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down...")
        stop_service()

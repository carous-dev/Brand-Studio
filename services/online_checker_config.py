"""
Online Checker Service Configuration
"""

# Default configuration for the online checker service
ONLINE_CHECKER_CONFIG = {
    # Worker configuration
    'num_workers': 5,                    # Number of worker threads
    'check_interval': 300,               # Check interval in seconds (5 minutes)
    'batch_size': 50,                    # Number of previews to process per batch
    
    # Request configuration
    'request_timeout': 10,               # HTTP request timeout in seconds
    'max_retries': 3,                    # Maximum retry attempts per domain
    'retry_delay': 1,                   # Delay between retries in seconds
    
    # Database configuration
    'db_connection_timeout': 30,         # Database connection timeout
    'db_retry_attempts': 3,              # Database retry attempts
    
    # Logging configuration
    'log_level': 'INFO',                # Logging level
    'log_file': 'online_checker.log',    # Log file name
    'log_max_size': 10 * 1024 * 1024,   # Max log file size (10MB)
    'log_backup_count': 5,              # Number of backup logs to keep
    'log_flush_interval': 300,          # Log flush interval in seconds (5 minutes)
    
    # Performance tuning
    'queue_max_size': 1000,              # Maximum queue size
    'worker_idle_timeout': 60,          # Worker idle timeout in seconds
    
    # Status thresholds
    'offline_threshold': 3,              # Consecutive failures to mark as offline
    'online_threshold': 1,               # Successes needed to mark as online
    
    # Domain checking preferences
    'prefer_https': True,                # Try HTTPS first
    'follow_redirects': True,            # Follow HTTP redirects
    'verify_ssl': False,                 # Verify SSL certificates
}

# Environment-specific configurations
DEVELOPMENT_CONFIG = ONLINE_CHECKER_CONFIG.copy()
DEVELOPMENT_CONFIG.update({
    'num_workers': 2,
    'check_interval': 60,  # 1 minute for development
    'log_level': 'DEBUG',
})

PRODUCTION_CONFIG = ONLINE_CHECKER_CONFIG.copy()
PRODUCTION_CONFIG.update({
    'num_workers': 10,
    'check_interval': 600,  # 10 minutes for production
    'batch_size': 100,
    'log_level': 'INFO',
})

def get_config(environment='production'):
    """Get configuration for specific environment"""
    if environment.lower() == 'development':
        return DEVELOPMENT_CONFIG
    elif environment.lower() == 'production':
        return PRODUCTION_CONFIG
    else:
        return ONLINE_CHECKER_CONFIG

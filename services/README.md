# Online Checker Service

An efficient queue-based service to monitor the online/offline status of preview domains and update the database accordingly.

## Features

- **Queue-based Processing**: Efficient multi-threaded processing of domain checks
- **Multiple Check Methods**: HTTP requests, DNS resolution, and socket connections
- **Configurable**: Adjustable worker count, check intervals, and timeouts
- **Database Integration**: Automatically updates the `status` column in `previews` table
- **Flask Integration**: Ready-to-use API endpoints for monitoring and control
- **Logging**: Comprehensive logging with file and console output
- **Graceful Shutdown**: Proper handling of shutdown signals

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Scheduler     │───▶│   Queue System   │───▶│  Worker Threads │
│ (Periodic Job)  │    │ (Thread-Safe)    │    │ (Domain Checks) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │   Database      │
                                              │ (Update Status) │
                                              └─────────────────┘
```

## Installation

1. **Install Dependencies**:
   ```bash
   pip install requests pymysql
   ```

2. **Run Database Migration**:
   ```sql
   -- Run the migration to add status column
   mysql -u root -p dealers_previews < migrations/20251202_add_previews_status.sql
   ```

## Usage

### Option 1: Standalone Service

Run as a standalone process:

```bash
# Production mode
python services/start_online_checker.py --env production

# Development mode (faster checking)
python services/start_online_checker.py --env development

# Custom configuration
python services/start_online_checker.py --workers 10 --interval 300
```

### Option 2: Flask Integration

Add to your main Flask app (`app.py`):

```python
# Add these imports at the top
from services.online_checker_flask import init_flask_app

# Initialize with your Flask app
app = init_flask_app(app)

# Auto-start service (optional)
app.config['ONLINE_CHECKER_AUTO_START'] = True
```

### Option 3: Manual Integration

```python
from services.online_checker import get_service, start_service

# Start service
service = start_service()

# Check single domain
status = service.check_single_domain('example.com')

# Get queue status
status_info = service.get_queue_status()
```

## API Endpoints

When integrated with Flask, these endpoints are available:

### GET /api/online-checker/status
Get the current service status and queue information.

### POST /api/online-checker/start
Start the online checker service.

### POST /api/online-checker/stop
Stop the online checker service.

### POST /api/online-checker/check
Check a single domain immediately.

**Request:**
```json
{
  "domain": "example.com"
}
```

**Response:**
```json
{
  "success": true,
  "domain": "example.com",
  "status": "online",
  "timestamp": 1638360000
}
```

### GET /api/online-checker/previews
Get all previews with their online status.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `status`: Filter by status ('online', 'offline')

### GET /api/online-checker/stats
Get statistics about the online checker and preview statuses.

## Configuration

### Environment Variables

```bash
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=dealers_previews
MYSQL_PORT=3306

# Service Configuration
ONLINE_CHECKER_AUTO_START=true
```

### Configuration Options

Edit `services/online_checker_config.py`:

```python
ONLINE_CHECKER_CONFIG = {
    'num_workers': 5,                    # Worker threads
    'check_interval': 300,               # Check interval (seconds)
    'batch_size': 50,                    # Batch size
    'request_timeout': 10,               # HTTP timeout
    'max_retries': 3,                    # Retry attempts
    'log_level': 'INFO',                 # Logging level
}
```

## Database Schema

The service expects a `previews` table with this structure:

```sql
CREATE TABLE `previews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domain` varchar(255) DEFAULT NULL,
  `status` enum('online','offline') NOT NULL DEFAULT 'offline',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- other columns...
  PRIMARY KEY (`id`)
);
```

## Status Values

- **online**: The domain is accessible and responding
- **offline**: The domain is not accessible or responding

## Checking Methods

The service uses multiple methods to determine if a domain is online:

1. **HTTP Request**: HEAD request to HTTP/HTTPS endpoints
2. **DNS Resolution**: Check if domain resolves to an IP
3. **Socket Connection**: Try to connect to common ports (80, 443, 8080)

A domain is considered online if any method succeeds.

## Monitoring

### Logs

Logs are written to `online_checker.log` and console:

```bash
# Follow logs
tail -f online_checker.log

# Filter for errors
grep "ERROR" online_checker.log
```

### Queue Status

Check the current queue status:

```python
from services.online_checker import get_service
service = get_service()
status = service.get_queue_status()
print(status)
```

## Performance Tuning

### For High Traffic

```python
# Increase workers and batch size
config = {
    'num_workers': 20,
    'batch_size': 200,
    'check_interval': 600,  # 10 minutes
}
```

### For Low Traffic

```python
# Reduce resource usage
config = {
    'num_workers': 2,
    'batch_size': 10,
    'check_interval': 1800,  # 30 minutes
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check MySQL credentials
   - Ensure database exists
   - Verify network connectivity

2. **High Memory Usage**
   - Reduce `num_workers`
   - Decrease `batch_size`
   - Increase `check_interval`

3. **False Offline Status**
   - Increase `request_timeout`
   - Increase `max_retries`
   - Check firewall settings

### Debug Mode

Run in development mode for detailed logging:

```bash
python services/start_online_checker.py --env development
```

## Production Deployment

### Systemd Service

Create `/etc/systemd/system/online-checker.service`:

```ini
[Unit]
Description=Online Checker Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/project
Environment=PYTHONPATH=/path/to/your/project
ExecStart=/usr/bin/python3 services/start_online_checker.py --env production
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Start the service:

```bash
sudo systemctl enable online-checker
sudo systemctl start online-checker
sudo systemctl status online-checker
```

### Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["python", "services/start_online_checker.py", "--env", "production"]
```

## License

This service is part of the FairField Cars project.

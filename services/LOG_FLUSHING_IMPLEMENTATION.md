# Online Checker Log Flushing Implementation

## ✅ Features Added

### 1. Automatic Log Rotation
- **RotatingFileHandler**: Automatically rotates logs when they reach max size
- **Max Size**: 10MB per log file (configurable)
- **Backup Count**: Keeps 5 backup files (configurable)
- **File Naming**: `online_checker.log`, `online_checker.log.1`, `online_checker.log.2`, etc.

### 2. Periodic Log Flushing
- **Flush Interval**: Every 5 minutes (configurable)
- **Automatic Flushing**: Forces logs to be written to disk
- **Scheduler Integration**: Built into the main scheduler loop
- **Error Handling**: Graceful handling of flush errors

### 3. Enhanced Logging Setup
- **Proper Handler Management**: Removes duplicate handlers
- **UTF-8 Encoding**: Supports international characters
- **Configurable Levels**: DEBUG, INFO, WARNING, ERROR
- **Dual Output**: Both file and console logging

## 🔧 Configuration Options

```python
# Log flushing configuration
'log_flush_interval': 300,          # Flush every 5 minutes
'log_max_size': 10 * 1024 * 1024,   # 10MB max file size
'log_backup_count': 5,              # Keep 5 backup files
'log_file': 'online_checker.log',   # Log file name
'log_level': 'INFO',                 # Logging level
```

## 📁 Log File Structure

```
online_checker.log          # Current active log
online_checker.log.1        # First backup (most recent)
online_checker.log.2        # Second backup
online_checker.log.3        # Third backup
online_checker.log.4        # Fourth backup
online_checker.log.5        # Fifth backup (oldest)
```

## 🔄 Log Rotation Process

1. **Size Check**: When `online_checker.log` reaches 10MB
2. **Rotation**: Current log is renamed to `online_checker.log.1`
3. **Backup Shift**: `.1` → `.2`, `.2` → `.3`, etc.
4. **Cleanup**: Oldest backup (`.5`) is deleted
5. **New Log**: Fresh `online_checker.log` is created

## ⏰ Flushing Schedule

- **Automatic**: Every 5 minutes during normal operation
- **Immediate**: On critical errors and service shutdown
- **Manual**: Available via API endpoint `/api/online-checker/flush-logs`

## 📊 Log Monitoring

### View Current Logs
```bash
# Follow live logs
tail -f online_checker.log

# View last 100 lines
tail -n 100 online_checker.log

# Filter for errors
grep "ERROR" online_checker.log

# Check log file sizes
ls -lh online_checker.log*
```

### Log Statistics
```bash
# Count log entries by level
grep -c "INFO" online_checker.log
grep -c "ERROR" online_checker.log
grep -c "WARNING" online_checker.log

# Find recent activity
grep "$(date '+%Y-%m-%d')" online_checker.log | tail -20
```

## 🛠️ API Endpoints

### Flush Logs Manually
```bash
curl -X POST http://localhost:5000/api/online-checker/flush-logs
```

### Get Log Status
```bash
curl http://localhost:5000/api/online-checker/logs-status
```

## 🎯 Benefits

1. **Disk Space Management**: Prevents unlimited log growth
2. **Performance**: Regular flushing prevents I/O bottlenecks
3. **Reliability**: Ensures logs are written to disk promptly
4. **Debugging**: Easier to find recent issues in smaller files
5. **Maintenance**: Automatic cleanup of old logs

## ⚙️ Customization

### Environment-Specific Settings

**Development** (more frequent flushing):
```python
DEVELOPMENT_CONFIG = {
    'log_flush_interval': 60,      # 1 minute
    'log_max_size': 5 * 1024 * 1024,  # 5MB
    'log_level': 'DEBUG',
}
```

**Production** (optimized for performance):
```python
PRODUCTION_CONFIG = {
    'log_flush_interval': 300,     # 5 minutes
    'log_max_size': 50 * 1024 * 1024, # 50MB
    'log_level': 'INFO',
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Logs not appearing**: Check file permissions
2. **Large log files**: Reduce `log_max_size` or increase `log_backup_count`
3. **Missing logs**: Check `log_flush_interval` and service uptime
4. **Disk space**: Monitor log directory size

### Recovery Commands

```bash
# Check log file permissions
ls -la online_checker.log*

# Manually rotate if needed
mv online_checker.log online_checker.log.manual
touch online_checker.log

# Clean up old logs (keep last 3)
find . -name "online_checker.log.*" | sort -V | head -n -3 | xargs rm
```

The online checker service now has robust log management with automatic rotation and periodic flushing!

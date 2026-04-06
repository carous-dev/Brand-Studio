# Online Checker Auto-Start Configuration

## ✅ Environment Variable Control

The online checker service can be configured to automatically start with the Flask app using an environment variable.

### 🔧 Configuration

Add this to your `.env` file:

```bash
# Enable auto-start (starts with Flask app)
ONLINE_CHECKER_AUTO_START=true

# Disable auto-start (manual start only)
ONLINE_CHECKER_AUTO_START=false
```

## 🚀 Usage Options

### Option 1: Auto-Start Enabled
```bash
# Set in .env
ONLINE_CHECKER_AUTO_START=true

# Start Flask app - online checker starts automatically
py app.py
```

**Output:**
```
✅ Online checker service auto-started with Flask app
```

### Option 2: Auto-Start Disabled
```bash
# Set in .env
ONLINE_CHECKER_AUTO_START=false

# Start Flask app - online checker does NOT start
py app.py
```

**Output:**
```
Flask app started (online checker not started)
```

### Option 3: Manual Start (When Auto-Start Disabled)
```bash
# Start Flask app first
py app.py

# Then start online checker separately
py services/start_online_checker.py --env production
```

## 📋 Environment Variable Details

| Variable | Default | Values | Description |
|----------|---------|--------|-------------|
| `ONLINE_CHECKER_AUTO_START` | `false` | `true`, `false` | Whether to start online checker with Flask app |

## 🔄 Service States

### When Auto-Start is Enabled:
- ✅ Online checker starts immediately with Flask app
- ✅ API endpoints available at `/api/online-checker/*`
- ✅ Domain checking begins automatically
- ✅ Logs start writing to `online_checker.log`

### When Auto-Start is Disabled:
- ❌ Online checker does NOT start with Flask app
- ❌ API endpoints return 503 Service Unavailable
- ❌ No domain checking occurs
- ❌ No log files created

## 🛠️ API Availability

### Auto-Start Enabled:
```bash
# All endpoints available
curl http://localhost:5000/api/online-checker/status
curl http://localhost:5000/api/online-checker/start
curl http://localhost:5000/api/online-checker/stop
curl http://localhost:5000/api/online-checker/stats
```

### Auto-Start Disabled:
```bash
# Endpoints return service unavailable
curl http://localhost:5000/api/online-checker/status
# Response: {"error": "Online checker service not running"}
```

## 🎯 Use Cases

### Development (Auto-Start Disabled):
```bash
ONLINE_CHECKER_AUTO_START=false
```
- Faster Flask app startup
- Manual control over when to run domain checks
- Save resources during development
- Debug Flask app without online checker interference

### Production (Auto-Start Enabled):
```bash
ONLINE_CHECKER_AUTO_START=true
```
- Automatic domain monitoring
- Continuous status updates
- Single process deployment
- High availability

### Testing (Auto-Start Disabled):
```bash
ONLINE_CHECKER_AUTO_START=false
```
- Isolate testing to specific components
- Manual service control for test scenarios
- Prevent interference during tests

## 🔍 Troubleshooting

### Service Not Starting:
1. Check environment variable:
   ```bash
   echo $ONLINE_CHECKER_AUTO_START
   ```

2. Verify .env file:
   ```bash
   grep ONLINE_CHECKER_AUTO_START .env
   ```

3. Check Flask app logs for startup message

### Service Starting Unexpectedly:
1. Ensure `ONLINE_CHECKER_AUTO_START=false` in .env
2. Restart Flask app
3. Verify no auto-start message appears

### API Endpoints Not Working:
1. Check if service is running:
   ```bash
   curl http://localhost:5000/api/online-checker/status
   ```

2. If not running, start manually:
   ```bash
   curl -X POST http://localhost:5000/api/online-checker/start
   ```

## 📊 Performance Impact

### Auto-Start Enabled:
- **Startup Time**: +2-3 seconds (service initialization)
- **Memory Usage**: +20-50MB (worker threads)
- **CPU Usage**: Minimal when idle, spikes during checks
- **Disk I/O**: Log file writes

### Auto-Start Disabled:
- **Startup Time**: Faster Flask startup
- **Memory Usage**: Lower baseline
- **CPU Usage**: Only Flask app overhead
- **Disk I/O**: No online checker logs

## 🔄 Switching Modes

### Enable Auto-Start:
```bash
# 1. Update .env
sed -i 's/ONLINE_CHECKER_AUTO_START=false/ONLINE_CHECKER_AUTO_START=true/' .env

# 2. Restart Flask app
# Stop current app and restart
py app.py
```

### Disable Auto-Start:
```bash
# 1. Update .env
sed -i 's/ONLINE_CHECKER_AUTO_START=true/ONLINE_CHECKER_AUTO_START=false/' .env

# 2. Restart Flask app
# Stop current app and restart
py app.py
```

The online checker service now offers flexible deployment options based on your needs!

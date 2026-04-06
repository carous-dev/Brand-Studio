"""
SSE Log Manager - Handles real-time log streaming for Server-Sent Events
"""

import json
import time
import threading
from queue import Queue, Empty
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum


class LogLevel(Enum):
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class LogEntry:
    def __init__(self, level: LogLevel, message: str, source: str = "app", metadata: Optional[Dict] = None):
        self.timestamp = datetime.utcnow().isoformat()
        self.level = level.value
        self.message = message
        self.source = source
        self.metadata = metadata or {}
    
    def to_dict(self) -> Dict:
        return {
            "timestamp": self.timestamp,
            "level": self.level,
            "message": self.message,
            "source": self.source,
            "metadata": self.metadata
        }


class SSELogManager:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._initialized = False
            return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self._initialized = True
        self._subscribers: Dict[str, Queue] = {}
        self._log_history: List[LogEntry] = []
        self._max_history = 1000
        self._lock = threading.Lock()
        
        # Start cleanup thread
        self._cleanup_thread = threading.Thread(target=self._cleanup_old_logs, daemon=True)
        self._cleanup_thread.start()
    
    def subscribe(self, client_id: str) -> Queue:
        """Subscribe a client to log updates"""
        with self._lock:
            if client_id not in self._subscribers:
                self._subscribers[client_id] = Queue(maxsize=100)
            
            # Send recent logs to new subscriber
            queue = self._subscribers[client_id]
            for log_entry in self._log_history[-50:]:  # Send last 50 logs
                try:
                    queue.put_nowait({
                        "type": "log",
                        "data": log_entry.to_dict()
                    })
                except:
                    # Queue is full, skip
                    pass
            
            return queue
    
    def unsubscribe(self, client_id: str):
        """Unsubscribe a client from log updates"""
        with self._lock:
            if client_id in self._subscribers:
                del self._subscribers[client_id]
    
    def log(self, level: LogLevel, message: str, source: str = "app", metadata: Optional[Dict] = None):
        """Add a log entry and broadcast to subscribers"""
        log_entry = LogEntry(level, message, source, metadata)
        
        with self._lock:
            # Add to history
            self._log_history.append(log_entry)
            
            # Trim history if needed
            if len(self._log_history) > self._max_history:
                self._log_history = self._log_history[-self._max_history:]
            
            # Broadcast to subscribers
            message_data = {
                "type": "log",
                "data": log_entry.to_dict()
            }
            
            # Remove inactive subscribers
            inactive_clients = []
            for client_id, queue in self._subscribers.items():
                try:
                    queue.put_nowait(message_data)
                except:
                    inactive_clients.append(client_id)
            
            for client_id in inactive_clients:
                del self._subscribers[client_id]
    
    def debug(self, message: str, source: str = "app", metadata: Optional[Dict] = None):
        """Log debug message"""
        self.log(LogLevel.DEBUG, message, source, metadata)
    
    def info(self, message: str, source: str = "app", metadata: Optional[Dict] = None):
        """Log info message"""
        self.log(LogLevel.INFO, message, source, metadata)
    
    def warning(self, message: str, source: str = "app", metadata: Optional[Dict] = None):
        """Log warning message"""
        self.log(LogLevel.WARNING, message, source, metadata)
    
    def error(self, message: str, source: str = "app", metadata: Optional[Dict] = None):
        """Log error message"""
        self.log(LogLevel.ERROR, message, source, metadata)
    
    def critical(self, message: str, source: str = "app", metadata: Optional[Dict] = None):
        """Log critical message"""
        self.log(LogLevel.CRITICAL, message, source, metadata)
    
    def get_recent_logs(self, count: int = 100) -> List[Dict]:
        """Get recent log entries"""
        with self._lock:
            return [entry.to_dict() for entry in self._log_history[-count:]]
    
    def clear_logs(self):
        """Clear all log history"""
        with self._lock:
            self._log_history.clear()
    
    def get_subscriber_count(self) -> int:
        """Get number of active subscribers"""
        with self._lock:
            return len(self._subscribers)
    
    def _cleanup_old_logs(self):
        """Background thread to clean up old logs periodically"""
        while True:
            try:
                time.sleep(300)  # Run every 5 minutes
                
                with self._lock:
                    # Keep only recent logs (last hour for debug, 24 hours for others)
                    cutoff_time = datetime.utcnow().timestamp() - 3600  # 1 hour ago
                    
                    self._log_history = [
                        entry for entry in self._log_history
                        if entry.level in ["warning", "error", "critical"] or 
                        datetime.fromisoformat(entry.timestamp).timestamp() > cutoff_time
                    ]
                    
                    # Also trim to max history
                    if len(self._log_history) > self._max_history:
                        self._log_history = self._log_history[-self._max_history:]
                        
            except Exception as e:
                # Don't let cleanup thread crash
                pass
    
    def generate_events(self, client_id: str):
        """Generator function for SSE streaming"""
        queue = self.subscribe(client_id)
        
        try:
            # Send initial connection message
            yield f"data: {json.dumps({'type': 'status', 'message': 'Connected to log stream'})}\n\n"
            
            while True:
                try:
                    message = queue.get(timeout=30)  # 30 second timeout
                    
                    # Format as SSE event
                    if message.get('type') == 'log':
                        log_data = message['data']
                        event_type = f"event: {log_data.get('level', 'info')}\n"
                    else:
                        event_type = "event: message\n"
                    
                    data_str = json.dumps(message['data'] if 'data' in message else message)
                    yield f"{event_type}data: {data_str}\n\n"
                    
                except Empty:
                    # Send heartbeat to keep connection alive
                    yield f"data: {json.dumps({'type': 'heartbeat', 'timestamp': datetime.utcnow().isoformat()})}\n\n"
                except Exception as e:
                    # Error occurred, break the generator
                    break
                    
        finally:
            self.unsubscribe(client_id)


# Global instance
sse_log_manager = SSELogManager()

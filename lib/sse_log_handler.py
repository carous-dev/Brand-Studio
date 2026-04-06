import logging
from typing import Optional

from lib.sse_log_manager import sse_log_manager, LogLevel


class SSELogHandler(logging.Handler):
    """
    Logging handler that forwards log records to the SSE log manager so they
    appear in the Backend Activity modal via /api/logs/stream.
    """

    level_map = {
        "debug": LogLevel.DEBUG,
        "info": LogLevel.INFO,
        "warning": LogLevel.WARNING,
        "warn": LogLevel.WARNING,
        "error": LogLevel.ERROR,
        "critical": LogLevel.CRITICAL,
    }

    def emit(self, record: logging.LogRecord) -> None:
        try:
            msg = self.format(record)
            level_name = record.levelname.lower()
            log_level: Optional[LogLevel] = self.level_map.get(level_name, LogLevel.INFO)
            metadata = {
                "logger": record.name,
                "module": record.module,
                "line": record.lineno,
                "pathname": record.pathname,
            }
            sse_log_manager.log(log_level, msg, source="flask", metadata=metadata)
        except Exception:
            # Never let logging handler raise
            self.handleError(record)

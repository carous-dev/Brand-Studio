"""PreviewStore: MySQL db backend for preview configs

Uses MySQL for storing and retrieving preview configurations.

Provides the API expected by `app.py`:
- init_schema()
- list_rows()
- list_paginated_rows(limit, offset, search=None) -> (total, rows)
- load_row(slug)
- exists(slug)
- upsert_row(slug, name, created_at, updated_at, config_json)
- delete_row(slug)
- location()
"""
from __future__ import annotations

import os
from typing import Any, Dict, List, Optional, Tuple
import uuid

# Import pymysql (required dependency)
import pymysql
from pymysql.cursors import DictCursor


class PreviewStore:
    def __init__(self) -> None:
        self._mysql_host = os.getenv('MYSQL_HOST')
        self._mysql_user = os.getenv('MYSQL_USER')
        self._mysql_password = os.getenv('MYSQL_PASSWORD')
        self._mysql_db = os.getenv('MYSQL_DATABASE')
        self._mysql_port = int(os.getenv('MYSQL_PORT') or 3306)

        # Validate MySQL configuration
        if not all([self._mysql_host, self._mysql_user, self._mysql_db]):
            raise RuntimeError(
                "MySQL configuration missing. Required environment variables: "
                "MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE"
            )

    def location(self) -> str:
        return f"mysql://{self._mysql_user}@{self._mysql_host}:{self._mysql_port}/{self._mysql_db}"

    # --- connection helpers ---
    def _get_mysql_conn(self):
        return pymysql.connect(
            host=self._mysql_host,
            user=self._mysql_user,
            password=self._mysql_password or '',
            database=self._mysql_db,
            port=self._mysql_port,
            cursorclass=DictCursor,
            autocommit=True,
        )

    # --- schema ---
    def init_schema(self) -> None:
        """Create the preview tables if they don't exist."""
        sql = """
        CREATE TABLE IF NOT EXISTS previews (
            slug VARCHAR(255) NOT NULL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            config TEXT NOT NULL,
            created_at VARCHAR(64),
            updated_at VARCHAR(64),
            status ENUM('online', 'offline') NOT NULL DEFAULT 'offline',
            status_checked_at DATETIME NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(sql)

                # Check if status column exists and add it if it doesn't
                cur.execute("SHOW COLUMNS FROM previews LIKE 'status'")
                if not cur.fetchone():
                    cur.execute("""
                        ALTER TABLE previews
                        ADD COLUMN status ENUM('online', 'offline') NOT NULL DEFAULT 'offline'
                    """)

                # status_checked_at decouples "when was status last probed" from
                # updated_at (which the editor bumps on every save). Without it,
                # the online-checker's stale filter keeps skipping freshly-edited
                # brands and the status badge sticks at the INSERT default.
                cur.execute("SHOW COLUMNS FROM previews LIKE 'status_checked_at'")
                if not cur.fetchone():
                    cur.execute("""
                        ALTER TABLE previews
                        ADD COLUMN status_checked_at DATETIME NULL
                    """)

                # `special` flags the hot-lead previews the sales side wants to
                # monitor live. It's a dashboard focus filter — analytics are
                # collected for every preview regardless of this flag.
                cur.execute("SHOW COLUMNS FROM previews LIKE 'special'")
                if not cur.fetchone():
                    cur.execute("""
                        ALTER TABLE previews
                        ADD COLUMN special TINYINT(1) NOT NULL DEFAULT 0
                    """)

                cur.execute("""
                    CREATE TABLE IF NOT EXISTS preview_sessions (
                        id VARCHAR(36) NOT NULL PRIMARY KEY,
                        slug VARCHAR(255) NOT NULL,
                        started_at DATETIME NOT NULL,
                        last_heartbeat_at DATETIME NOT NULL,
                        ended_at DATETIME NULL,
                        elapsed_seconds INT NOT NULL DEFAULT 0,
                        status ENUM('active', 'locked', 'ended') NOT NULL DEFAULT 'active',
                        ip_address VARCHAR(64) NULL,
                        user_agent VARCHAR(512) NULL,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        KEY idx_preview_sessions_slug (slug),
                        KEY idx_preview_sessions_status (status),
                        KEY idx_preview_sessions_last_heartbeat (last_heartbeat_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)

                # --- engagement analytics (always-on, decoupled from the gate) ---
                # One row per visit to a preview site. active_seconds accumulates
                # via the same capped-delta trick the gate uses so a sleeping tab
                # can't bank hours of "time spent" in one heartbeat.
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS preview_analytics_sessions (
                        id VARCHAR(36) NOT NULL PRIMARY KEY,
                        slug VARCHAR(255) NOT NULL,
                        started_at DATETIME NOT NULL,
                        last_heartbeat_at DATETIME NOT NULL,
                        ended_at DATETIME NULL,
                        active_seconds INT NOT NULL DEFAULT 0,
                        page_count INT NOT NULL DEFAULT 0,
                        status ENUM('active', 'ended') NOT NULL DEFAULT 'active',
                        ip_address VARCHAR(64) NULL,
                        user_agent VARCHAR(512) NULL,
                        referrer VARCHAR(512) NULL,
                        device_type VARCHAR(16) NULL,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        KEY idx_pa_sessions_slug (slug),
                        KEY idx_pa_sessions_status (status),
                        KEY idx_pa_sessions_last_heartbeat (last_heartbeat_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                """)

                # One row per page a visitor lands on within a session. The most
                # recent open pageview (ended_at IS NULL) accrues seconds_on_page
                # on each heartbeat and is closed when the next pageview arrives.
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS preview_analytics_pageviews (
                        id VARCHAR(36) NOT NULL PRIMARY KEY,
                        session_id VARCHAR(36) NOT NULL,
                        slug VARCHAR(255) NOT NULL,
                        path VARCHAR(512) NOT NULL,
                        title VARCHAR(255) NULL,
                        entered_at DATETIME NOT NULL,
                        last_heartbeat_at DATETIME NOT NULL,
                        ended_at DATETIME NULL,
                        seconds_on_page INT NOT NULL DEFAULT 0,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        KEY idx_pa_pageviews_session (session_id),
                        KEY idx_pa_pageviews_slug (slug),
                        KEY idx_pa_pageviews_path (path)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                """)
        finally:
            conn.close()

    # --- CRUD operations ---
    def list_rows(self) -> List[Dict[str, Any]]:
        """Return all preview rows ordered by created_at desc (newest first)."""
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                # Force MySQL to bypass cache and order by most recent created_at first
                cur.execute(
                    "SELECT SQL_NO_CACHE slug, name, config, created_at, updated_at, status, special "
                    "FROM previews ORDER BY created_at DESC, updated_at DESC, slug ASC"
                )
                return list(cur.fetchall())
        finally:
            conn.close()

    def list_paginated_rows(self, *, limit: int = 10, offset: int = 0, search: Optional[str] = None, **_ignored) -> Tuple[int, List[Dict[str, Any]]]:
        """Return (total, rows) for pagination, optionally filtered by a search query."""
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                where_clause = ""
                params: List[Any] = []
                if search:
                    search_like = f"%{search.lower()}%"
                    where_clause = (
                        "WHERE LOWER(slug) LIKE %s "
                        "OR LOWER(name) LIKE %s "
                        "OR LOWER(config) LIKE %s"
                    )
                    params.extend([search_like, search_like, search_like])

                # COUNT with SQL_NO_CACHE keeps totals current when data churns
                count_sql = f"SELECT SQL_NO_CACHE COUNT(*) as count FROM previews {where_clause}"
                cur.execute(count_sql, params)
                total = int(cur.fetchone()['count'])

                rows_sql = (
                    "SELECT SQL_NO_CACHE slug, name, config, created_at, updated_at, status, special "
                    f"FROM previews {where_clause} "
                    "ORDER BY created_at DESC, updated_at DESC, slug ASC LIMIT %s OFFSET %s"
                )
                cur.execute(rows_sql, params + [limit, offset])
                rows = list(cur.fetchall())
                return (total, rows)
        finally:
            conn.close()

    def load_row(self, slug: str) -> Optional[Dict[str, Any]]:
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT SQL_NO_CACHE slug, name, config, created_at, updated_at, status, special "
                    "FROM previews WHERE slug=%s",
                    (slug,),
                )
                r = cur.fetchone()
                return r if r else None
        finally:
            conn.close()

    # Backwards-compat alias used by some legacy routes
    def get_preview(self, slug: str) -> Optional[Dict[str, Any]]:
        return self.load_row(slug)

    def exists(self, slug: str) -> bool:
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT SQL_NO_CACHE 1 FROM previews WHERE slug=%s LIMIT 1", (slug,))
                return cur.fetchone() is not None
        finally:
            conn.close()

    def upsert_row(self, *, slug: str, name: str, created_at: str, updated_at: str, config_json: str) -> None:
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO previews (slug, name, config, created_at, updated_at, status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        name=VALUES(name),
                        config=VALUES(config),
                        updated_at=VALUES(updated_at)
                    """,
                    (slug, name, config_json, created_at, updated_at, 'offline'),
                )
        finally:
            conn.close()

    def delete_row(self, slug: str) -> None:
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM previews WHERE slug=%s", (slug,))
        finally:
            conn.close()

    # --- preview gate sessions ---
    def get_preview_usage_seconds(self, slug: str) -> int:
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT COALESCE(SUM(elapsed_seconds), 0) AS used_seconds "
                    "FROM preview_sessions WHERE slug=%s",
                    (slug,),
                )
                row = cur.fetchone() or {}
                return int(row.get('used_seconds') or 0)
        finally:
            conn.close()

    def count_preview_visits(self, slug: str) -> int:
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) AS count FROM preview_sessions WHERE slug=%s", (slug,))
                row = cur.fetchone() or {}
                return int(row.get('count') or 0)
        finally:
            conn.close()

    def create_preview_session(self, *, slug: str, ip_address: str = '', user_agent: str = '') -> Dict[str, Any]:
        session_id = str(uuid.uuid4())
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO preview_sessions (
                        id, slug, started_at, last_heartbeat_at, elapsed_seconds,
                        status, ip_address, user_agent
                    )
                    VALUES (%s, %s, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 0, 'active', %s, %s)
                    """,
                    (session_id, slug, ip_address[:64] or None, user_agent[:512] or None),
                )
                cur.execute(
                    "SELECT * FROM preview_sessions WHERE id=%s",
                    (session_id,),
                )
                return dict(cur.fetchone() or {})
        finally:
            conn.close()

    def heartbeat_preview_session(self, *, session_id: str, max_delta_seconds: int = 20) -> Optional[Dict[str, Any]]:
        """Advance an active session by the time since the previous heartbeat.

        The delta is capped so a sleeping tab, network pause, or delayed timer
        cannot accidentally consume hours of preview time at once.
        """
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE preview_sessions
                    SET
                        elapsed_seconds = elapsed_seconds + LEAST(
                            GREATEST(TIMESTAMPDIFF(SECOND, last_heartbeat_at, UTC_TIMESTAMP()), 0),
                            %s
                        ),
                        last_heartbeat_at = UTC_TIMESTAMP()
                    WHERE id=%s AND status='active'
                    """,
                    (max_delta_seconds, session_id),
                )
                cur.execute("SELECT * FROM preview_sessions WHERE id=%s", (session_id,))
                row = cur.fetchone()
                return dict(row) if row else None
        finally:
            conn.close()

    def close_preview_session(self, *, session_id: str, status: str = 'ended') -> None:
        safe_status = status if status in ('active', 'locked', 'ended') else 'ended'
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE preview_sessions
                    SET status=%s, ended_at=COALESCE(ended_at, UTC_TIMESTAMP())
                    WHERE id=%s
                    """,
                    (safe_status, session_id),
                )
        finally:
            conn.close()

    # --- special flag ---
    def set_preview_special(self, *, slug: str, special: bool) -> bool:
        """Toggle the hot-lead star. Returns the stored boolean value."""
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE previews SET special=%s WHERE slug=%s",
                    (1 if special else 0, slug),
                )
                return bool(special)
        finally:
            conn.close()

    # --- engagement analytics ---
    # Cap on how many seconds a single heartbeat/close can add. A backgrounded
    # tab, sleeping laptop, or delayed timer must not bank hours at once.
    _ANALYTICS_MAX_DELTA = 20

    def start_analytics_session(
        self,
        *,
        slug: str,
        ip_address: str = '',
        user_agent: str = '',
        referrer: str = '',
        device_type: str = '',
    ) -> Dict[str, Any]:
        session_id = str(uuid.uuid4())
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO preview_analytics_sessions (
                        id, slug, started_at, last_heartbeat_at, active_seconds,
                        page_count, status, ip_address, user_agent, referrer, device_type
                    )
                    VALUES (%s, %s, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 0, 0, 'active', %s, %s, %s, %s)
                    """,
                    (
                        session_id,
                        slug,
                        (ip_address or '')[:64] or None,
                        (user_agent or '')[:512] or None,
                        (referrer or '')[:512] or None,
                        (device_type or '')[:16] or None,
                    ),
                )
                return {'id': session_id, 'slug': slug}
        finally:
            conn.close()

    def record_analytics_pageview(
        self, *, session_id: str, slug: str, path: str, title: str = ''
    ) -> Optional[Dict[str, Any]]:
        """Open a new pageview, closing the previous one. Deduplicates repeat
        reports of the same path (React strict-mode double mounts, re-renders).
        """
        path = (path or '/')[:512]
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                # Session must exist and be active.
                cur.execute(
                    "SELECT status FROM preview_analytics_sessions WHERE id=%s",
                    (session_id,),
                )
                row = cur.fetchone()
                if not row or row.get('status') != 'active':
                    return None

                # If the latest open pageview is already this path, no-op.
                cur.execute(
                    """
                    SELECT id, path FROM preview_analytics_pageviews
                    WHERE session_id=%s AND ended_at IS NULL
                    ORDER BY entered_at DESC LIMIT 1
                    """,
                    (session_id,),
                )
                open_pv = cur.fetchone()
                if open_pv and open_pv.get('path') == path:
                    return {'ok': True, 'deduped': True}

                # Close the previous open pageview, crediting the final delta.
                cur.execute(
                    """
                    UPDATE preview_analytics_pageviews
                    SET seconds_on_page = seconds_on_page + LEAST(
                            GREATEST(TIMESTAMPDIFF(SECOND, last_heartbeat_at, UTC_TIMESTAMP()), 0),
                            %s
                        ),
                        ended_at = UTC_TIMESTAMP()
                    WHERE session_id=%s AND ended_at IS NULL
                    """,
                    (self._ANALYTICS_MAX_DELTA, session_id),
                )

                pv_id = str(uuid.uuid4())
                cur.execute(
                    """
                    INSERT INTO preview_analytics_pageviews (
                        id, session_id, slug, path, title, entered_at, last_heartbeat_at, seconds_on_page
                    )
                    VALUES (%s, %s, %s, %s, %s, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 0)
                    """,
                    (pv_id, session_id, slug, path, (title or '')[:255] or None),
                )
                cur.execute(
                    """
                    UPDATE preview_analytics_sessions
                    SET page_count = page_count + 1, last_heartbeat_at = UTC_TIMESTAMP()
                    WHERE id=%s AND status='active'
                    """,
                    (session_id,),
                )
                return {'ok': True, 'pageviewId': pv_id}
        finally:
            conn.close()

    def heartbeat_analytics_session(self, *, session_id: str) -> Optional[Dict[str, Any]]:
        """Advance session active_seconds and the current open pageview's time
        by the capped delta since each was last touched."""
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                # Detect the session with a SELECT, not the UPDATE's rowcount:
                # a same-second heartbeat changes nothing, and MySQL reports
                # changed (not matched) rows, which would look like a miss.
                cur.execute(
                    "SELECT status FROM preview_analytics_sessions WHERE id=%s",
                    (session_id,),
                )
                row = cur.fetchone()
                if not row or row.get('status') != 'active':
                    return None
                cur.execute(
                    """
                    UPDATE preview_analytics_sessions
                    SET active_seconds = active_seconds + LEAST(
                            GREATEST(TIMESTAMPDIFF(SECOND, last_heartbeat_at, UTC_TIMESTAMP()), 0),
                            %s
                        ),
                        last_heartbeat_at = UTC_TIMESTAMP()
                    WHERE id=%s AND status='active'
                    """,
                    (self._ANALYTICS_MAX_DELTA, session_id),
                )
                cur.execute(
                    """
                    UPDATE preview_analytics_pageviews
                    SET seconds_on_page = seconds_on_page + LEAST(
                            GREATEST(TIMESTAMPDIFF(SECOND, last_heartbeat_at, UTC_TIMESTAMP()), 0),
                            %s
                        ),
                        last_heartbeat_at = UTC_TIMESTAMP()
                    WHERE session_id=%s AND ended_at IS NULL
                    """,
                    (self._ANALYTICS_MAX_DELTA, session_id),
                )
                return {'ok': True}
        finally:
            conn.close()

    def end_analytics_session(self, *, session_id: str) -> None:
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE preview_analytics_pageviews
                    SET seconds_on_page = seconds_on_page + LEAST(
                            GREATEST(TIMESTAMPDIFF(SECOND, last_heartbeat_at, UTC_TIMESTAMP()), 0),
                            %s
                        ),
                        ended_at = COALESCE(ended_at, UTC_TIMESTAMP())
                    WHERE session_id=%s AND ended_at IS NULL
                    """,
                    (self._ANALYTICS_MAX_DELTA, session_id),
                )
                cur.execute(
                    """
                    UPDATE preview_analytics_sessions
                    SET active_seconds = active_seconds + LEAST(
                            GREATEST(TIMESTAMPDIFF(SECOND, last_heartbeat_at, UTC_TIMESTAMP()), 0),
                            %s
                        ),
                        status = 'ended',
                        ended_at = COALESCE(ended_at, UTC_TIMESTAMP())
                    WHERE id=%s AND status='active'
                    """,
                    (self._ANALYTICS_MAX_DELTA, session_id),
                )
        finally:
            conn.close()

    # --- analytics aggregation (dashboard reads) ---
    def list_special_previews_with_metrics(self, *, live_window_seconds: int = 30) -> List[Dict[str, Any]]:
        """Return every starred preview row joined to its lifetime metrics and
        current live-viewer count. config is left raw for the caller to parse."""
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        p.slug, p.name, p.config, p.status, p.special,
                        p.created_at, p.updated_at,
                        COALESCE(s.visits, 0)         AS visits,
                        COALESCE(s.total_seconds, 0)  AS total_seconds,
                        COALESCE(s.pageviews, 0)      AS pageviews,
                        s.last_seen,
                        COALESCE(live.live_now, 0)    AS live_now
                    FROM previews p
                    LEFT JOIN (
                        SELECT slug, COUNT(*) AS visits,
                               SUM(active_seconds) AS total_seconds,
                               SUM(page_count) AS pageviews,
                               MAX(last_heartbeat_at) AS last_seen
                        FROM preview_analytics_sessions GROUP BY slug
                    ) s ON s.slug = p.slug
                    LEFT JOIN (
                        SELECT slug, COUNT(*) AS live_now
                        FROM preview_analytics_sessions
                        WHERE status='active'
                          AND last_heartbeat_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL %s SECOND)
                        GROUP BY slug
                    ) live ON live.slug = p.slug
                    WHERE p.special = 1
                    ORDER BY live_now DESC, last_seen DESC, p.created_at DESC
                    """,
                    (live_window_seconds,),
                )
                return [self._coerce_metric_row(r) for r in cur.fetchall()]
        finally:
            conn.close()

    def get_preview_metrics(self, *, slug: str, live_window_seconds: int = 30) -> Dict[str, Any]:
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        COUNT(*) AS visits,
                        COALESCE(SUM(active_seconds), 0) AS total_seconds,
                        COALESCE(AVG(active_seconds), 0) AS avg_seconds,
                        COALESCE(SUM(page_count), 0) AS total_pageviews,
                        MAX(last_heartbeat_at) AS last_seen,
                        SUM(CASE WHEN status='active'
                                  AND last_heartbeat_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL %s SECOND)
                                 THEN 1 ELSE 0 END) AS live_now
                    FROM preview_analytics_sessions WHERE slug=%s
                    """,
                    (live_window_seconds, slug),
                )
                return self._coerce_metric_row(cur.fetchone() or {})
        finally:
            conn.close()

    def get_preview_pageview_breakdown(self, *, slug: str, limit: int = 25) -> List[Dict[str, Any]]:
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT path,
                           MAX(title) AS title,
                           COUNT(*) AS views,
                           COALESCE(SUM(seconds_on_page), 0) AS total_seconds
                    FROM preview_analytics_pageviews
                    WHERE slug=%s
                    GROUP BY path
                    ORDER BY views DESC, total_seconds DESC
                    LIMIT %s
                    """,
                    (slug, int(limit)),
                )
                return [self._coerce_metric_row(r) for r in cur.fetchall()]
        finally:
            conn.close()

    def get_live_sessions(self, *, slug: Optional[str] = None, live_window_seconds: int = 30) -> List[Dict[str, Any]]:
        """Sessions active within the live window, each with its current page."""
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                params: List[Any] = [live_window_seconds]
                slug_clause = ""
                if slug:
                    slug_clause = "AND s.slug=%s"
                    params.append(slug)
                cur.execute(
                    f"""
                    SELECT
                        s.id, s.slug, s.started_at, s.last_heartbeat_at,
                        s.active_seconds, s.page_count, s.device_type, s.ip_address,
                        pv.path AS current_path, pv.title AS current_title
                    FROM preview_analytics_sessions s
                    LEFT JOIN preview_analytics_pageviews pv ON pv.id = (
                        SELECT p2.id FROM preview_analytics_pageviews p2
                        WHERE p2.session_id = s.id
                        -- Prefer the still-open pageview (the page they're on now);
                        -- entered_at is only second-precise so it can tie.
                        ORDER BY (p2.ended_at IS NULL) DESC, p2.entered_at DESC
                        LIMIT 1
                    )
                    WHERE s.status='active'
                      AND s.last_heartbeat_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL %s SECOND)
                      {slug_clause}
                    ORDER BY s.last_heartbeat_at DESC
                    """,
                    params,
                )
                return [self._coerce_metric_row(r) for r in cur.fetchall()]
        finally:
            conn.close()

    def get_recent_analytics_sessions(self, *, slug: str, limit: int = 25) -> List[Dict[str, Any]]:
        conn = self._get_mysql_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, started_at, ended_at, last_heartbeat_at,
                           active_seconds, page_count, status, device_type,
                           ip_address, referrer
                    FROM preview_analytics_sessions
                    WHERE slug=%s
                    ORDER BY started_at DESC
                    LIMIT %s
                    """,
                    (slug, int(limit)),
                )
                return [self._coerce_metric_row(r) for r in cur.fetchall()]
        finally:
            conn.close()

    @staticmethod
    def _coerce_metric_row(row: Dict[str, Any]) -> Dict[str, Any]:
        """Make an aggregation row JSON-safe: Decimals -> int, datetimes -> ISO-8601 Z."""
        import datetime as _dt
        from decimal import Decimal as _Decimal

        out: Dict[str, Any] = {}
        for key, value in dict(row).items():
            if isinstance(value, _Decimal):
                out[key] = int(value)
            elif isinstance(value, _dt.datetime):
                out[key] = value.replace(microsecond=0).isoformat() + 'Z'
            else:
                out[key] = value
        return out

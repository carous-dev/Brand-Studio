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
            status ENUM('online', 'offline') NOT NULL DEFAULT 'offline'
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
                    "SELECT SQL_NO_CACHE slug, name, config, created_at, updated_at, status "
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
                    "SELECT SQL_NO_CACHE slug, name, config, created_at, updated_at, status "
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
                    "SELECT SQL_NO_CACHE slug, name, config, created_at, updated_at, status "
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

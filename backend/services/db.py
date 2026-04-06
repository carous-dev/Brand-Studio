"""Database helpers for user management APIs."""

import os

import pymysql


def get_db_connection():
    """Return a new pymysql connection using environment variables."""
    try:
        return pymysql.connect(
            host=os.environ.get('MYSQL_HOST', 'localhost'),
            user=os.environ.get('MYSQL_USER', 'root'),
            password=os.environ.get('MYSQL_PASSWORD', ''),
            database=os.environ.get('MYSQL_DATABASE', 'dealers_previews'),
            port=int(os.environ.get('MYSQL_PORT', 3306)),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
    except Exception:
        return None

from __future__ import annotations

import argparse
import os
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

try:
    import pymysql
    from pymysql.cursors import DictCursor
except Exception:
    pymysql = None
    DictCursor = None


def _env(name: str, default: Optional[str] = None) -> Optional[str]:
    value = os.environ.get(name)
    if value is None:
        return default
    value = value.strip()
    return value if value else default


def _maybe_load_dotenv() -> None:
    try:
        from dotenv import load_dotenv

        load_dotenv()
    except Exception:
        return


@dataclass(frozen=True)
class MysqlConfig:
    host: str
    user: str
    password: str
    database: str
    port: int


def load_mysql_config() -> MysqlConfig:
    if pymysql is None:
        raise RuntimeError("PyMySQL is required. Install it with: pip install PyMySQL")

    host = _env("MYSQL_HOST", "localhost") or "localhost"
    user = _env("MYSQL_USER", "root") or "root"
    password = _env("MYSQL_PASSWORD", "") or ""
    database = _env("MYSQL_DATABASE", "") or ""
    port = int(_env("MYSQL_PORT", "3306") or "3306")

    if not database:
        raise RuntimeError("MYSQL_DATABASE must be set.")

    return MysqlConfig(host=host, user=user, password=password, database=database, port=port)


def mysql_connect(cfg: MysqlConfig):
    return pymysql.connect(
        host=cfg.host,
        user=cfg.user,
        password=cfg.password,
        database=cfg.database,
        port=cfg.port,
        charset="utf8mb4",
        cursorclass=DictCursor,
        autocommit=False,
    )


def sqlite_tables(conn: sqlite3.Connection) -> List[Tuple[str, str]]:
    cur = conn.cursor()
    cur.execute("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    return [(row[0], row[1]) for row in cur.fetchall()]


def print_sqlite_schema(path: Path) -> None:
    print(f"== {path}")
    if not path.exists():
        print("MISSING")
        return
    conn = sqlite3.connect(str(path))
    try:
        tables = sqlite_tables(conn)
        print("tables:", [t[0] for t in tables])
        for name, sql in tables:
            print(f"\n-- {name}\n{sql}")
    finally:
        conn.close()


def ensure_mysql_previews_table(cur) -> None:
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS previews (
            slug VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            created_at VARCHAR(32) NOT NULL,
            updated_at VARCHAR(32) NOT NULL,
            config LONGTEXT NOT NULL,
            PRIMARY KEY (slug)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        """
    )


def migrate_previews(*, sqlite_path: Path, cfg: MysqlConfig, truncate: bool) -> int:
    if not sqlite_path.exists():
        raise FileNotFoundError(str(sqlite_path))

    src = sqlite3.connect(str(sqlite_path))
    src.row_factory = sqlite3.Row

    try:
        src.execute("SELECT 1 FROM previews LIMIT 1")
    except Exception as e:
        src.close()
        raise RuntimeError(f"{sqlite_path} does not contain a previews table") from e

    with mysql_connect(cfg) as dest:
        with dest.cursor() as cur:
            ensure_mysql_previews_table(cur)
            if truncate:
                cur.execute("TRUNCATE TABLE previews")

            rows = src.execute("SELECT slug, name, created_at, updated_at, config FROM previews").fetchall()
            if not rows:
                dest.commit()
                return 0

            payload = [
                (r["slug"], r["name"], r["created_at"], r["updated_at"], r["config"])
                for r in rows
            ]
            cur.executemany(
                """
                INSERT INTO previews (slug, name, created_at, updated_at, config)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                  name = VALUES(name),
                  created_at = VALUES(created_at),
                  updated_at = VALUES(updated_at),
                  config = VALUES(config)
                """,
                payload,
            )
        dest.commit()
        return len(payload)
    # pragma: no cover


def _mysql_type_from_sqlite(sqlite_type: str) -> str:
    t = (sqlite_type or "").strip().upper()
    if not t:
        return "LONGTEXT"
    if "TIMESTAMP" in t or "DATETIME" in t:
        return "DATETIME"
    if t == "DATE" or t.endswith(" DATE"):
        return "DATE"
    if "INT" in t:
        return "BIGINT"
    if "VARCHAR" in t:
        return t
    if "CHAR" in t and "(" in t and ")" in t:
        return t
    if "CHAR" in t or "CLOB" in t or "TEXT" in t:
        return "LONGTEXT"
    if "BLOB" in t:
        return "LONGBLOB"
    if "REAL" in t or "FLOA" in t or "DOUB" in t:
        return "DOUBLE"
    if "DEC" in t or "NUM" in t:
        return "DECIMAL(65,30)"
    if "BOOL" in t:
        return "TINYINT(1)"
    return "LONGTEXT"


def _quote_ident(name: str) -> str:
    return f"`{name.replace('`', '``')}`"


def _sqlite_table_info(conn: sqlite3.Connection, table: str) -> List[Dict[str, Any]]:
    cur = conn.cursor()
    cur.execute(f"PRAGMA table_info({_quote_ident(table)})")
    cols = []
    for cid, name, col_type, notnull, default_value, pk in cur.fetchall():
        cols.append(
            {
                "name": name,
                "type": col_type,
                "notnull": bool(notnull),
                "default": default_value,
                "pk": int(pk or 0),
            }
        )
    return cols


def _sqlite_unique_indexes(conn: sqlite3.Connection, table: str) -> List[Tuple[str, List[str]]]:
    cur = conn.cursor()
    cur.execute(f"PRAGMA index_list({_quote_ident(table)})")
    indexes = []
    for seq, name, unique, origin, partial in cur.fetchall():
        if not unique:
            continue
        cur.execute(f"PRAGMA index_info({_quote_ident(name)})")
        cols = [row[2] for row in cur.fetchall()]
        if cols:
            indexes.append((name, cols))
    return indexes


def ensure_mysql_table_from_sqlite(
    *, cur, sqlite_conn: sqlite3.Connection, sqlite_table: str, mysql_table: str
) -> None:
    cols = _sqlite_table_info(sqlite_conn, sqlite_table)
    if not cols:
        raise RuntimeError(f"Could not read schema for sqlite table {sqlite_table}")

    pk_cols = [c["name"] for c in cols if c["pk"]]
    unique_indexes = _sqlite_unique_indexes(sqlite_conn, sqlite_table)
    unique_cols = {c for _idx, cols_ in unique_indexes for c in cols_}

    create_sql = None
    try:
        cur2 = sqlite_conn.cursor()
        cur2.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name = ?", (sqlite_table,))
        row = cur2.fetchone()
        create_sql = row[0] if row else None
    except Exception:
        create_sql = None

    autoinc_pk = None
    if create_sql and "AUTOINCREMENT" in create_sql.upper() and len(pk_cols) == 1:
        autoinc_pk = pk_cols[0]

    col_defs: List[str] = []
    for c in cols:
        name = c["name"]
        mysql_type = _mysql_type_from_sqlite(c["type"])

        # MySQL does not allow DEFAULT on TEXT/BLOB columns (e.g. role TEXT DEFAULT 'user').
        # If SQLite has a default for a text/blob-ish column, promote it to a VARCHAR/VARBINARY.
        if c["default"] is not None and mysql_type in ("LONGTEXT", "LONGBLOB"):
            mysql_type = "VARCHAR(255)" if mysql_type == "LONGTEXT" else "VARBINARY(255)"

        if mysql_type == "LONGTEXT" and (name in pk_cols or name in unique_cols):
            mysql_type = "VARCHAR(255)"

        if autoinc_pk == name and mysql_type == "BIGINT":
            mysql_type = "BIGINT AUTO_INCREMENT"

        notnull = " NOT NULL" if c["notnull"] else ""
        default = ""
        if c["default"] is not None:
            default = f" DEFAULT {c['default']}"
        col_defs.append(f"{_quote_ident(name)} {mysql_type}{notnull}{default}")

    pk_def = f", PRIMARY KEY ({', '.join(_quote_ident(n) for n in pk_cols)})" if pk_cols else ""
    ddl = (
        f"CREATE TABLE IF NOT EXISTS {_quote_ident(mysql_table)} (\n  "
        + ",\n  ".join(col_defs)
        + pk_def
        + "\n) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    )
    cur.execute(ddl)

    # Create UNIQUE indexes where possible (prefix index names to avoid collisions).
    for idx_name, idx_cols in unique_indexes:
        safe_name = f"u_{mysql_table}_{idx_name}".replace("-", "_")
        cols_sql = ", ".join(_quote_ident(c) for c in idx_cols)

        cur.execute(f"SHOW INDEX FROM {_quote_ident(mysql_table)} WHERE Key_name = %s", (safe_name,))
        if cur.fetchone():
            continue

        cur.execute(f"CREATE UNIQUE INDEX {_quote_ident(safe_name)} ON {_quote_ident(mysql_table)} ({cols_sql})")


def _sqlite_select_all(conn: sqlite3.Connection, table: str) -> Tuple[List[str], List[Tuple[Any, ...]]]:
    cur = conn.cursor()
    cur.execute(f"SELECT * FROM {_quote_ident(table)}")
    rows = cur.fetchall()
    col_names = [d[0] for d in cur.description]
    return col_names, rows


def migrate_sqlite_db_generic(
    *,
    sqlite_path: Path,
    cfg: MysqlConfig,
    table_prefix: str,
    truncate: bool,
    batch_size: int,
) -> Dict[str, int]:
    if not sqlite_path.exists():
        raise FileNotFoundError(str(sqlite_path))

    src = sqlite3.connect(str(sqlite_path))
    try:
        tables = [t[0] for t in sqlite_tables(src)]
        migrated: Dict[str, int] = {}

        with mysql_connect(cfg) as dest:
            with dest.cursor() as cur:
                for sqlite_table in tables:
                    mysql_table = f"{table_prefix}{sqlite_table}"
                    ensure_mysql_table_from_sqlite(
                        cur=cur, sqlite_conn=src, sqlite_table=sqlite_table, mysql_table=mysql_table
                    )
                    if truncate:
                        cur.execute(f"TRUNCATE TABLE {_quote_ident(mysql_table)}")

                    cols_info = _sqlite_table_info(src, sqlite_table)
                    pk_cols = [c["name"] for c in cols_info if c["pk"]]
                    col_names, rows = _sqlite_select_all(src, sqlite_table)
                    if not rows:
                        migrated[sqlite_table] = 0
                        continue

                    cols_sql = ", ".join(_quote_ident(c) for c in col_names)
                    placeholders = ", ".join(["%s"] * len(col_names))
                    insert_sql = f"INSERT INTO {_quote_ident(mysql_table)} ({cols_sql}) VALUES ({placeholders})"
                    if pk_cols:
                        non_pk = [c for c in col_names if c not in pk_cols]
                        if non_pk:
                            updates = ", ".join(f"{_quote_ident(c)}=VALUES({_quote_ident(c)})" for c in non_pk)
                            insert_sql += f" ON DUPLICATE KEY UPDATE {updates}"
                        else:
                            insert_sql += f" ON DUPLICATE KEY UPDATE {', '.join(f'{_quote_ident(c)}={_quote_ident(c)}' for c in pk_cols)}"

                    total = 0
                    for i in range(0, len(rows), batch_size):
                        batch = rows[i : i + batch_size]
                        cur.executemany(insert_sql, batch)
                        total += len(batch)
                    migrated[sqlite_table] = total

            dest.commit()
        return migrated
    finally:
        src.close()


def main() -> int:
    _maybe_load_dotenv()

    parser = argparse.ArgumentParser(description="Migrate SQLite DB(s) into MySQL (one-off tool).")
    parser.add_argument("--previews-sqlite", default="app/data/previews.db")
    parser.add_argument("--auth-sqlite", default="app/data/auth.db")
    parser.add_argument("--auth-prefix", default=_env("MYSQL_AUTH_TABLE_PREFIX", "auth_") or "auth_")
    parser.add_argument("--truncate", action="store_true", help="TRUNCATE target tables before inserting.")
    parser.add_argument("--batch-size", type=int, default=500)
    parser.add_argument("--print-schema", action="store_true", help="Print SQLite schemas and exit.")
    parser.add_argument("--migrate-previews", action="store_true", help="Migrate previews.db -> MySQL `previews`.")
    parser.add_argument("--migrate-auth", action="store_true", help="Migrate auth.db -> MySQL (prefixed tables).")

    args = parser.parse_args()

    previews_path = Path(args.previews_sqlite)
    auth_path = Path(args.auth_sqlite)

    if args.print_schema:
        print_sqlite_schema(previews_path)
        print()
        print_sqlite_schema(auth_path)
        return 0

    if not args.migrate_previews and not args.migrate_auth:
        parser.error("Choose at least one: --migrate-previews, --migrate-auth, or --print-schema")

    cfg = load_mysql_config()

    if args.migrate_previews:
        count = migrate_previews(sqlite_path=previews_path, cfg=cfg, truncate=args.truncate)
        print(f"[previews] migrated rows: {count}")

    if args.migrate_auth:
        results = migrate_sqlite_db_generic(
            sqlite_path=auth_path,
            cfg=cfg,
            table_prefix=args.auth_prefix,
            truncate=args.truncate,
            batch_size=max(1, int(args.batch_size)),
        )
        total = sum(results.values())
        print(f"[auth] migrated rows: {total}")
        for table, count in results.items():
            print(f"  - {table} -> {args.auth_prefix}{table}: {count}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

export function getPool() {
  if (pool) return pool
  const host = process.env.MYSQL_HOST
  const user = process.env.MYSQL_USER
  const password = process.env.MYSQL_PASSWORD
  const database = process.env.MYSQL_DATABASE
  const port = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306
  if (!host || !user || !database) {
    throw new Error('MySQL connection not configured. Provide MYSQL_HOST, MYSQL_USER and MYSQL_DATABASE env vars.')
  }
  pool = mysql.createPool({ host, user, password, database, port, waitForConnections: true, connectionLimit: 10 })
  return pool
}

export async function withTransaction<T>(cb: (conn: mysql.PoolConnection) => Promise<T>) {
  const p = getPool()
  const conn = await p.getConnection()
  try {
    await conn.beginTransaction()
    const res = await cb(conn)
    await conn.commit()
    return res
  } catch (err) {
    try { await conn.rollback() } catch (e) { /* ignore */ }
    throw err
  } finally {
    conn.release()
  }
}

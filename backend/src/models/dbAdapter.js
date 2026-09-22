import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqliteDbPath = path.join(dataDir, 'national_land.db');
let sqliteDb = null;
let pgPool = null;
let isPostgres = false;

// Initialize Database connection
export async function initDatabase() {
  if (process.env.DATABASE_URL && process.env.USE_POSTGRES === 'true') {
    try {
      pgPool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      await pgPool.query('SELECT 1');
      isPostgres = true;
      console.log(' Connected successfully to PostgreSQL database');
    } catch (err) {
      console.warn('⚠️ PostgreSQL connection failed, falling back to embedded SQLite database:', err.message);
      isPostgres = false;
    }
  }

  if (!isPostgres) {
    sqliteDb = new DatabaseSync(sqliteDbPath);
    console.log(` Connected to embedded SQLite database: ${sqliteDbPath}`);
  }

  // Load and apply schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  if (isPostgres) {
    await pgPool.query(schemaSql);
  } else {
    // Execute DDL statements
    sqliteDb.exec(schemaSql);
  }
}

// Convert parameterized query if needed (e.g., $1 -> ? for sqlite or ? -> $1 for pg)
function formatQuery(sql, isPgTarget) {
  let paramIndex = 1;
  if (isPgTarget) {
    // replace '?' with '$1', '$2', ...
    return sql.replace(/\?/g, () => `$${paramIndex++}`);
  } else {
    // replace '$1', '$2' with '?'
    return sql.replace(/\$\d+/g, '?');
  }
}

export const db = {
  async query(sql, params = []) {
    if (isPostgres) {
      const formattedSql = formatQuery(sql, true);
      const res = await pgPool.query(formattedSql, params);
      return res.rows;
    } else {
      const formattedSql = formatQuery(sql, false);
      const stmt = sqliteDb.prepare(formattedSql);
      return stmt.all(...params);
    }
  },

  async getOne(sql, params = []) {
    if (isPostgres) {
      const formattedSql = formatQuery(sql, true);
      const res = await pgPool.query(formattedSql, params);
      return res.rows[0] || null;
    } else {
      const formattedSql = formatQuery(sql, false);
      const stmt = sqliteDb.prepare(formattedSql);
      const rows = stmt.all(...params);
      return rows[0] || null;
    }
  },

  async run(sql, params = []) {
    if (isPostgres) {
      const formattedSql = formatQuery(sql, true);
      const res = await pgPool.query(formattedSql, params);
      return { changes: res.rowCount };
    } else {
      const formattedSql = formatQuery(sql, false);
      const stmt = sqliteDb.prepare(formattedSql);
      return stmt.run(...params);
    }
  },

  async exec(sqlScript) {
    if (isPostgres) {
      await pgPool.query(sqlScript);
    } else {
      sqliteDb.exec(sqlScript);
    }
  },

  getIsPostgres() {
    return isPostgres;
  }
};

export default db;

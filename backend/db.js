import dotenv from 'dotenv';
import pkg from 'pg';
import initSqlJs from 'sql.js';

dotenv.config();

const { Pool } = pkg;

let isPg = false;
let pool = null;
let sqliteDb = null;
let SQL = null;

const pgCreateSql = `
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      company_name TEXT NOT NULL,
      contact_person TEXT,
      phone_number TEXT,
      email TEXT,
      address TEXT,
      gst_percentage NUMERIC DEFAULT 0,
      plate_rate NUMERIC DEFAULT 0,
      plate_type TEXT,
      plate_rates TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
      purchase_date DATE NOT NULL,
      plate_type TEXT,
      quantity_purchased INTEGER NOT NULL,
      waste_quantity INTEGER DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
      delivery_date DATE NOT NULL,
      plate_type TEXT,
      quantity_delivered INTEGER NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bills (
      id SERIAL PRIMARY KEY,
      invoice_number TEXT NOT NULL UNIQUE,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
      delivery_id INTEGER REFERENCES deliveries(id) ON DELETE SET NULL,
      billing_date DATE NOT NULL,
      customer_name TEXT,
      customer_gst TEXT,
      quantity_delivered INTEGER NOT NULL,
      plate_type TEXT,
      rate_per_plate NUMERIC DEFAULT 0,
      gst_percentage NUMERIC DEFAULT 0,
      gst_amount NUMERIC DEFAULT 0,
      subtotal NUMERIC NOT NULL,
      grand_total NUMERIC NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS office_settings (
      id SERIAL PRIMARY KEY,
      office_name TEXT,
      owner_name TEXT,
      phone_number TEXT,
      email TEXT,
      address TEXT,
      gst_percentage NUMERIC DEFAULT 0,
      company_logo_url TEXT,
      signature_image_url TEXT,
      upi_qr_url TEXT,
      bank_name TEXT,
      account_number TEXT,
      ifsc_code TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

const sqliteCreateSql = [
  `CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    phone_number TEXT,
    email TEXT,
    address TEXT,
    gst_percentage REAL DEFAULT 0,
    plate_rate REAL DEFAULT 0,
    plate_type TEXT,
    plate_rates TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    purchase_date DATE NOT NULL,
    plate_type TEXT,
    quantity_purchased INTEGER NOT NULL,
    waste_quantity INTEGER DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
  )`,
  
  `CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    delivery_date DATE NOT NULL,
    plate_type TEXT,
    quantity_delivered INTEGER NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
  )`,
  
  `CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL UNIQUE,
    company_id INTEGER,
    delivery_id INTEGER,
    billing_date DATE NOT NULL,
    customer_name TEXT,
    customer_gst TEXT,
    quantity_delivered INTEGER NOT NULL,
    plate_type TEXT,
    rate_per_plate REAL DEFAULT 0,
    gst_percentage REAL DEFAULT 0,
    gst_amount REAL DEFAULT 0,
    subtotal REAL NOT NULL,
    grand_total REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY(delivery_id) REFERENCES deliveries(id) ON DELETE SET NULL
  )`,
  
  `CREATE TABLE IF NOT EXISTS office_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    office_name TEXT,
    owner_name TEXT,
    phone_number TEXT,
    email TEXT,
    address TEXT,
    gst_percentage REAL DEFAULT 0,
    company_logo_url TEXT,
    signature_image_url TEXT,
    upi_qr_url TEXT,
    bank_name TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`
];

async function init() {
  // try Postgres first
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query('SELECT 1');
    isPg = true;
    await pool.query(pgCreateSql);
    await pool.query('ALTER TABLE companies ADD COLUMN IF NOT EXISTS gst_percentage NUMERIC DEFAULT 0');
    await pool.query('ALTER TABLE companies ADD COLUMN IF NOT EXISTS plate_type TEXT');
    await pool.query('ALTER TABLE companies ADD COLUMN IF NOT EXISTS plate_rates TEXT');
    await pool.query('ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS plate_type TEXT');
    await pool.query('ALTER TABLE bills ADD COLUMN IF NOT EXISTS plate_type TEXT');
    await pool.query('ALTER TABLE bills ADD COLUMN IF NOT EXISTS delivery_id INTEGER REFERENCES deliveries(id) ON DELETE SET NULL');
    await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS bills_delivery_id_unique ON bills(delivery_id)');
    await pool.query('ALTER TABLE bills ALTER COLUMN customer_name DROP NOT NULL');
    await pool.query('ALTER TABLE companies DROP COLUMN IF EXISTS gst_number');
    await pool.query('ALTER TABLE companies DROP COLUMN IF EXISTS gst_applicable');
    await pool.query('ALTER TABLE bills DROP COLUMN IF EXISTS gst_applicable');
    await pool.query('ALTER TABLE office_settings ADD COLUMN IF NOT EXISTS gst_percentage NUMERIC DEFAULT 0');
    await pool.query('ALTER TABLE office_settings DROP COLUMN IF EXISTS gst_number');
    await ensureOfficeSettingsPg();
    console.log('Connected to Postgres and initialized tables.');
    return;
  } catch (err) {
    console.warn('Postgres not available, falling back to SQLite:', err.message);
    isPg = false;
    if (pool) {
      await pool.end().catch(() => {});
      pool = null;
    }
  }

  // fallback to SQLite with sql.js
  try {
    SQL = await initSqlJs();
    sqliteDb = new SQL.Database();
    
    // Create all tables
    sqliteCreateSql.forEach((sql, idx) => {
      try {
        sqliteDb.run(sql);
        console.log(`Created table ${idx + 1}/5`);
      } catch (err) {
        // Suppress table already exists errors
        if (!err.message.includes('already exists')) {
          console.error('SQL error creating table:', err.message);
        }
      }
    });

    ensureSqliteColumn('companies', 'plate_rates', 'TEXT');
    ensureSqliteColumn('bills', 'delivery_id', 'INTEGER');
    sqliteDb.run('CREATE UNIQUE INDEX IF NOT EXISTS bills_delivery_id_unique ON bills(delivery_id)');
    
    ensureOfficeSettingsSqlite();
    console.log('Using SQLite (sql.js) in-memory database');
  } catch (err) {
    console.error('SQLite initialization failed:', err);
    process.exit(1);
  }
}

function ensureSqliteColumn(table, column, type) {
  const columns = sqliteDb.exec(`PRAGMA table_info(${table})`)[0]?.values || [];
  if (!columns.some((entry) => entry[1] === column)) {
    sqliteDb.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

async function ensureOfficeSettingsPg() {
  const { rows } = await pool.query('SELECT id FROM office_settings LIMIT 1');
  if (rows.length === 0) {
    await pool.query(
      `INSERT INTO office_settings (office_name, owner_name, phone_number, email, address, gst_percentage) VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Metal Plate Co.', 'Owner', '9999999999', 'office@example.com', 'Office Address', 0]
    );
  }
}

function ensureOfficeSettingsSqlite() {
  try {
    const stmt = sqliteDb.prepare('SELECT id FROM office_settings LIMIT 1');
    let hasRow = false;
    if (stmt.step()) {
      hasRow = true;
    }
    stmt.free();
    
    if (!hasRow) {
      sqliteDb.run(
        `INSERT INTO office_settings (office_name, owner_name, phone_number, email, address, gst_percentage) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Metal Plate Co.', 'Owner', '9999999999', 'office@example.com', 'Office Address', 0]
      );
    }
  } catch (err) {
    console.warn('Error ensuring office settings:', err.message);
  }
}

export const dbReady = init().catch((error) => {
  console.error('Database initialization failed:', error);
  throw error;
});

export async function query(text, params) {
  await dbReady;
  if (isPg) {
    return await pool.query(text, params);
  }
  
  // SQLite with sql.js - handle INSERT/UPDATE/DELETE
  try {
    if (/\bRETURNING\b/i.test(text)) {
      const stmt = sqliteDb.prepare(text);
      stmt.bind(params || []);
      const rows = [];
      while (stmt.step()) {
        const columns = stmt.getColumnNames();
        const values = stmt.get();
        rows.push(Object.fromEntries(columns.map((column, index) => [column, values[index]])));
      }
      stmt.free();
      return { rows, rowCount: rows.length };
    }

    sqliteDb.run(text, params || []);
    return { rows: [], rowCount: 1 };
  } catch (err) {
    console.error('Query error:', text, err);
    throw new Error(`Database error: ${err.message}`);
  }
}

export async function get(text, params) {
  await dbReady;
  if (isPg) {
    const result = await pool.query(text, params);
    return result.rows[0];
  }
  
  // SQLite with sql.js - handle SELECT with single result
  try {
    // sql.js exec returns array of result objects
    const stmt = sqliteDb.prepare(text);
    stmt.bind(params || []);
    
    if (stmt.step()) {
      const columns = stmt.getColumnNames();
      const values = stmt.get();
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = values[idx];
      });
      stmt.free();
      return obj;
    }
    stmt.free();
    return null;
  } catch (err) {
    console.error('Get error:', text, params, err);
    throw new Error(`Database error: ${err.message}`);
  }
}

export async function all(text, params) {
  await dbReady;
  if (isPg) {
    const result = await pool.query(text, params);
    return result.rows;
  }
  
  // SQLite with sql.js - handle SELECT with multiple results
  try {
    const stmt = sqliteDb.prepare(text);
    stmt.bind(params || []);
    
    const rows = [];
    while (stmt.step()) {
      const columns = stmt.getColumnNames();
      const values = stmt.get();
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = values[idx];
      });
      rows.push(obj);
    }
    stmt.free();
    return rows;
  } catch (err) {
    console.error('All error:', text, params, err);
    throw new Error(`Database error: ${err.message}`);
  }
}

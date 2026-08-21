import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

let isPg = false;
let pool = null;
let sqliteDb = null;

const pgCreateSql = `
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      company_name TEXT NOT NULL,
      contact_person TEXT,
      phone_number TEXT,
      email TEXT,
      address TEXT,
      gst_number TEXT,
      plate_rate NUMERIC DEFAULT 0,
      gst_applicable BOOLEAN DEFAULT FALSE,
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
      quantity_delivered INTEGER NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bills (
      id SERIAL PRIMARY KEY,
      invoice_number TEXT NOT NULL UNIQUE,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
      billing_date DATE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_gst TEXT,
      quantity_delivered INTEGER NOT NULL,
      rate_per_plate NUMERIC NOT NULL,
      gst_applicable BOOLEAN DEFAULT FALSE,
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
      gst_number TEXT,
      company_logo_url TEXT,
      signature_image_url TEXT,
      upi_qr_url TEXT,
      bank_name TEXT,
      account_number TEXT,
      ifsc_code TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

const sqliteCreateSql = `
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      contact_person TEXT,
      phone_number TEXT,
      email TEXT,
      address TEXT,
      gst_number TEXT,
      plate_rate REAL DEFAULT 0,
      gst_applicable INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      purchase_date DATE NOT NULL,
      plate_type TEXT,
      quantity_purchased INTEGER NOT NULL,
      waste_quantity INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      delivery_date DATE NOT NULL,
      quantity_delivered INTEGER NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL UNIQUE,
      company_id INTEGER,
      billing_date DATE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_gst TEXT,
      quantity_delivered INTEGER NOT NULL,
      rate_per_plate REAL NOT NULL,
      gst_applicable INTEGER DEFAULT 0,
      gst_percentage REAL DEFAULT 0,
      gst_amount REAL DEFAULT 0,
      subtotal REAL NOT NULL,
      grand_total REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS office_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      office_name TEXT,
      owner_name TEXT,
      phone_number TEXT,
      email TEXT,
      address TEXT,
      gst_number TEXT,
      company_logo_url TEXT,
      signature_image_url TEXT,
      upi_qr_url TEXT,
      bank_name TEXT,
      account_number TEXT,
      ifsc_code TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`;

async function init() {
  // try Postgres first
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query('SELECT 1');
    isPg = true;
    await pool.query(pgCreateSql);
    await ensureOfficeSettingsPg();
    console.log('Connected to Postgres and initialized tables.');
    return;
  } catch (err) {
    console.warn('Postgres not available, falling back to SQLite:', err.message);
  }

  // fallback to SQLite
  try {
    const Database = (await import('better-sqlite3')).default;
    sqliteDb = new Database('backend/dev.sqlite');
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');
    sqliteDb.exec(sqliteCreateSql);
    ensureOfficeSettingsSqlite();
    console.log('Using SQLite at backend/dev.sqlite');
  } catch (err) {
    console.error('SQLite initialization failed:', err);
    process.exit(1);
  }
}

async function ensureOfficeSettingsPg() {
  const { rows } = await pool.query('SELECT id FROM office_settings LIMIT 1');
  if (rows.length === 0) {
    await pool.query(
      `INSERT INTO office_settings (office_name, owner_name, phone_number, email, address, gst_number) VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Metal Plate Co.', 'Owner', '9999999999', 'office@example.com', 'Office Address', 'GST000000']
    );
  }
}

function ensureOfficeSettingsSqlite() {
  const row = sqliteDb.prepare('SELECT id FROM office_settings LIMIT 1').get();
  if (!row) {
    sqliteDb.prepare(
      `INSERT INTO office_settings (office_name, owner_name, phone_number, email, address, gst_number) VALUES (?, ?, ?, ?, ?, ?)`
    ).run('Metal Plate Co.', 'Owner', '9999999999', 'office@example.com', 'Office Address', 'GST000000');
  }
}

init().catch((error) => {
  console.error('Database initialization failed:', error);
  process.exit(1);
});

export async function query(text, params) {
  if (isPg) {
    return await pool.query(text, params);
  }
  // sqlite: return object similar to pg result
  const stmt = sqliteDb.prepare(text);
  const info = stmt.run(params || []);
  return { rows: [], rowCount: info.changes, info };
}

export async function get(text, params) {
  if (isPg) {
    const result = await pool.query(text, params);
    return result.rows[0];
  }
  const stmt = sqliteDb.prepare(text);
  return stmt.get(params || []);
}

export async function all(text, params) {
  if (isPg) {
    const result = await pool.query(text, params);
    return result.rows;
  }
  const stmt = sqliteDb.prepare(text);
  return stmt.all(params || []);
}

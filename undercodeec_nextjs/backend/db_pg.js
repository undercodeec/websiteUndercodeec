const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_NAME || 'DBUND',
  port: parseInt(process.env.PG_PORT) || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection and initialize tables
pool.query('SELECT 1')
  .then(async () => {
    console.log('✅ PostgreSQL (DBUND) connected successfully');
    await initDatabase();
  })
  .catch((err) => {
    console.error('❌ Error connecting to PostgreSQL:', err.message);
  });

async function initDatabase() {
  try {
    const createOrdersTable = `
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        plan_name VARCHAR(255),
        amount DECIMAL(10,2),
        client_info JSONB,
        payment_status VARCHAR(50),
        payment_method VARCHAR(50),
        voucher_url VARCHAR(555),
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    const createLeadsTable = `
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        form_type VARCHAR(100),
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(createOrdersTable);
    await pool.query(createLeadsTable);
    console.log('✅ PostgreSQL tables checked/created successfully');
  } catch (error) {
    console.error('❌ Error initializing PostgreSQL tables:', error.message);
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};

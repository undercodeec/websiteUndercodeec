const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'undercodeec',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection and initialize tables
pool.query('SELECT 1')
  .then(async () => {
    console.log('✅ MySQL/MariaDB connected successfully');
    await initDatabase();
  })
  .catch((err) => {
    console.error('❌ Error connecting to MySQL/MariaDB:', err.message);
  });

async function initDatabase() {
  try {
    const createOrdersTable = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plan_name VARCHAR(255),
        amount DECIMAL(10,2),
        client_info JSON,
        payment_status VARCHAR(50),
        payment_method VARCHAR(50),
        voucher_url VARCHAR(555),
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    const createLeadsTable = `
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        form_type VARCHAR(100),
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(createOrdersTable);
    await pool.query(createLeadsTable);
    console.log('✅ Database tables checked/created successfully');
  } catch (error) {
    console.error('❌ Error initializing database tables:', error.message);
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};

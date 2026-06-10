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
    const createAdminUsersTable = `
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    const createInvoicesTable = `
      CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NULL,
        ambiente TINYINT NOT NULL,
        estab VARCHAR(3) NOT NULL,
        pto_emi VARCHAR(3) NOT NULL,
        secuencial INT NOT NULL,
        clave_acceso VARCHAR(49) UNIQUE,
        estado VARCHAR(30) NOT NULL DEFAULT 'generada',
        tipo_identificacion VARCHAR(2) NOT NULL,
        identificacion VARCHAR(20) NOT NULL,
        razon_social VARCHAR(300) NOT NULL,
        direccion VARCHAR(300),
        email VARCHAR(255),
        telefono VARCHAR(50),
        items JSON NOT NULL,
        forma_pago VARCHAR(2) NOT NULL,
        subtotal DECIMAL(12,2) NOT NULL,
        iva DECIMAL(12,2) NOT NULL,
        total DECIMAL(12,2) NOT NULL,
        numero_autorizacion VARCHAR(49),
        fecha_autorizacion DATETIME NULL,
        mensajes_sri JSON,
        xml_firmado LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_serie_secuencial (ambiente, estab, pto_emi, secuencial)
      )
    `;
    await pool.query(createOrdersTable);
    await pool.query(createLeadsTable);
    await pool.query(createAdminUsersTable);
    await pool.query(createInvoicesTable);
    console.log('✅ Database tables checked/created successfully');
  } catch (error) {
    console.error('❌ Error initializing database tables:', error.message);
  }
}

module.exports = {
  query: async (text, params) => {
    let mysqlText = text;
    let mysqlParams = params;

    // Convert $1, $2, etc. placeholders to ?
    mysqlText = mysqlText.replace(/\$\d+/g, "?");

    // Remove RETURNING id if present in INSERT queries
    const hasReturning = /RETURNING\s+id/i.test(mysqlText);
    if (hasReturning) {
      mysqlText = mysqlText.replace(/RETURNING\s+id/i, "");
    }

    // Execute query in MySQL
    const [result] = await pool.query(mysqlText, mysqlParams);

    // Formulate response to match pg (PostgreSQL) return structure and array destructuring
    let rowsArray = [];
    if (hasReturning && result && result.insertId) {
      rowsArray = [{ id: result.insertId }];
    } else if (Array.isArray(result)) {
      rowsArray = result;
    }

    return {
      rows: rowsArray,
      [Symbol.iterator]: function* () {
        yield this.rows;
        yield undefined;
      }
    };
  },
  pool
};

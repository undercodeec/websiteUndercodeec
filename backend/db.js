const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '.env') });

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
    const createChatUsageTable = `
      CREATE TABLE IF NOT EXISTS chat_usage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(60) NOT NULL,
        ip_hash VARCHAR(64),
        message_length INT DEFAULT 0,
        response_length INT DEFAULT 0,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_chat_usage_created_at (created_at),
        INDEX idx_chat_usage_event_type (event_type),
        INDEX idx_chat_usage_ip_hash (ip_hash)
      )
    `;
    const createChatUsersTable = `
      CREATE TABLE IF NOT EXISTS chat_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(50),
        status VARCHAR(40) DEFAULT 'active',
        last_login_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_chat_users_status (status)
      )
    `;
    const createChatSessionsTable = `
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        external_session_id VARCHAR(100) NOT NULL UNIQUE,
        ip_hash VARCHAR(64),
        user_agent VARCHAR(255),
        lead_id INT NULL,
        user_id INT NULL,
        status VARCHAR(40) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_chat_sessions_ip_hash (ip_hash),
        INDEX idx_chat_sessions_status (status),
        INDEX idx_chat_sessions_user_id (user_id)
      )
    `;
    const createChatMessagesTable = `
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT,
        event_type VARCHAR(60),
        used_ai BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_chat_messages_session_id (session_id),
        INDEX idx_chat_messages_created_at (created_at),
        CONSTRAINT fk_chat_messages_session
          FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
          ON DELETE CASCADE
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
    await pool.query(createChatUsageTable);
    await pool.query(createChatUsersTable);
    await pool.query(createChatSessionsTable);
    await pool.query(createChatMessagesTable);
    await pool.query(createAdminUsersTable);
    await pool.query(createInvoicesTable);
    await ensureColumn('chat_sessions', 'user_id', 'INT NULL');
    await ensureIndex('chat_sessions', 'idx_chat_sessions_user_id', 'user_id');
    await ensureColumn('chat_users', 'is_client', 'TINYINT NOT NULL DEFAULT 0');
    await ensureColumn('chat_users', 'client_since', 'DATETIME NULL');
    await ensureColumn('chat_users', 'last_active_at', 'DATETIME NULL');
    await ensureIndex('chat_users', 'idx_chat_users_is_client', 'is_client');
    await ensureColumn('chat_users', 'reset_code_hash', 'VARCHAR(255) NULL');
    await ensureColumn('chat_users', 'reset_expires', 'DATETIME NULL');
    // Verificacion de correo para el modo Asistente IA.
    const addedEmailVerified = await ensureColumn('chat_users', 'email_verified', 'TINYINT NOT NULL DEFAULT 0');
    await ensureColumn('chat_users', 'verify_code_hash', 'VARCHAR(255) NULL');
    await ensureColumn('chat_users', 'verify_expires', 'DATETIME NULL');
    await ensureColumn('admin_users', 'reset_code_hash', 'VARCHAR(255) NULL');
    await ensureColumn('admin_users', 'reset_expires', 'DATETIME NULL');
    // Backfill: al agregar la columna por primera vez, los usuarios existentes
    // quedan verificados para no bloquearlos con el nuevo requisito de IA.
    if (addedEmailVerified) {
      await pool.query('UPDATE chat_users SET email_verified = 1');
    }
    // Separar IA vs Bot en el analisis de campanas.
    await ensureColumn('chat_sessions', 'mode', 'VARCHAR(20) NULL');
    console.log('✅ Database tables checked/created successfully');
  } catch (error) {
    console.error('❌ Error initializing database tables:', error.message);
  }
}

async function ensureColumn(tableName, columnName, definition) {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );
  if (rows.length === 0) {
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
    return true;
  }
  return false;
}

async function ensureIndex(tableName, indexName, columnName) {
  const [rows] = await pool.query(
    `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [tableName, indexName]
  );
  if (rows.length === 0) {
    await pool.query(`CREATE INDEX ${indexName} ON ${tableName} (${columnName})`);
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

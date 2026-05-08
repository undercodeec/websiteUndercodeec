const db = require('./db');

async function testConnection() {
  try {
    console.log('🔍 Testing MySQL/MariaDB connection...');
    const [result] = await db.query('SELECT 1 + 1 AS sum');
    console.log('✅ Connection test successful. Result:', result[0].sum);

    console.log('🔍 Checking if "orders" table exists...');
    const [tables] = await db.query("SHOW TABLES LIKE 'orders'");
    if (tables.length > 0) {
      console.log('✅ "orders" table found.');
      
      console.log('🔍 Checking "orders" table structure...');
      const [columns] = await db.query("DESCRIBE orders");
      console.log('Columns:', columns.map(c => c.Field).join(', '));
    } else {
      console.log('❌ "orders" table NOT found. Did you run the SQL script?');
    }

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    process.exit();
  }
}

testConnection();

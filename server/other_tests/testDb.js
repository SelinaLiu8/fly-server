const db = require('../src/db/db');

async function main() {
  try {
    const [rows] = await db.query('SELECT DATABASE() AS db, NOW() as now');
    console.log('Connected! Using DB:', rows[0].db, 'Time:', rows[0].now);
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    process.exit();
  }
}

main();
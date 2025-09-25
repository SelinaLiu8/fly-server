// Load environment variables
require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3000,
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'crisprbuildr',
    port: process.env.DB_PORT || '3306'
  }
};

module.exports = config;

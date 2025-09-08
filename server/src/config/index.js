// Load environment variables
require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3000,
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crisprbuildr',
  }
};

module.exports = config;

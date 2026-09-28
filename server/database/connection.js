const { Pool } = require('pg');
const path = require('path');

// Carrega .env da pasta server, da raiz do projeto ou do diretório atual
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('❌ [ERRO BANCO] Variável DATABASE_URL não encontrada! Verifique seu arquivo .env.');
}

const connectionString = process.env.DATABASE_URL;
const isNeon = connectionString && connectionString.includes('neon.tech');

const pool = new Pool({
  connectionString,
  ssl: isNeon ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 2000
});

module.exports = pool;
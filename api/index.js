// api/index.js
// Entrypoint Serverless para Vercel
// Conecta a aplicação Express como função serverless da Vercel
const app = require('../server/index');

module.exports = app;

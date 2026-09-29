// server/index.js
// Servidor principal — Node.js + Express
// API RESTful com JWT, bcrypt e CORS

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./database/connection');

const app = express();

// =====================================================
// MIDDLEWARES GLOBAIS
// =====================================================

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// =====================================================
// TESTE DO BANCO DE DADOS
// =====================================================
// Essa rota não precisa de login ou token.

app.get('/api/teste-banco', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT NOW()');

    res.json({
      sucesso: true,
      mensagem: 'Banco conectado!',
      horario: resultado.rows[0]
    });

  } catch (error) {
    console.error('[ERRO BANCO COMPLETO]', error);

    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao conectar ao banco.',
      erro: String(error),
      detalhes: JSON.stringify(error)
    });
  }
});


// =====================================================
// SERVIR FRONTEND
// =====================================================

app.use(express.static(path.join(__dirname, '..')));


// =====================================================
// ROTAS DA API
// =====================================================

// Rotas do PostgreSQL Neon (Consultas complexas, Estatísticas e CRUD direto)
app.use('/api', require('./routes/clientRoutes'));

app.use('/api/auth', require('./routes/auth'));

app.use('/api/clientes', require('./routes/clientes'));

app.use('/api/afiliados', require('./routes/afiliados'));

app.use('/api/cacambas', require('./routes/cacambas'));

app.use('/api/pedidos', require('./routes/pedidos'));

app.use('/api/admin', require('./routes/admin'));


// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/api/health', (req, res) => {
  res.json({
    sucesso: true,
    status: 'online',
    versao: '1.0.0',
    ambiente: process.env.NODE_ENV || 'development',
    horario: new Date().toISOString()
  });
});


// =====================================================
// DOCUMENTAÇÃO DA API
// =====================================================

app.get('/api', (req, res) => {
  res.json({
    nome: 'LocaFácil API',
    versao: '1.0.0',
    descricao: 'API RESTful para gerenciamento de aluguel de caçambas',
    autenticacao: 'JWT Bearer Token',

    endpoints: {
      consultas_complexas_postgresql: {
        'GET /api/pedidos/consulta?page=1&limit=10&status=concluido': 'Consulta complexa com 4 tabelas (pedidos, clientes, cacambas, afiliados) e paginação',
        'GET /api/pedidos/consulta/:id': 'Detalhe do pedido com 4 tabelas relacionadas',
        'GET /api/clientes/consulta': 'Listagem de clientes com total_pedidos (GROUP BY)',
        'GET /api/afiliados/consulta': 'Listagem de empresas com total_cacambas e total_pedidos (GROUP BY)',
        'GET /api/cacambas/consulta': 'Listagem de caçambas com dados da empresa afiliada',
        'GET /api/estatisticas/consulta': 'Relatório geral com subconsultas e somatório de faturamento',
        'GET /api/teste-banco': 'Status da conexão com PostgreSQL Neon'
      },

      auth: {
        'POST /api/auth/cadastro/cliente': 'Cadastrar novo cliente',
        'POST /api/auth/cadastro/afiliado': 'Cadastrar nova empresa',
        'POST /api/auth/login/cliente': 'Login do cliente',
        'POST /api/auth/login/afiliado': 'Login da empresa',
        'POST /api/auth/login/admin': 'Login do administrador',
        'GET /api/auth/me': 'Dados do usuário logado'
      },

      clientes: {
        'GET /api/clientes': 'Listar clientes',
        'GET /api/clientes/:id': 'Buscar cliente',
        'PUT /api/clientes/:id': 'Atualizar perfil',
        'DELETE /api/clientes/:id': 'Excluir conta',
        'GET /api/clientes/:id/pedidos': 'Pedidos do cliente'
      },

      afiliados: {
        'GET /api/afiliados/:id': 'Dados do afiliado',
        'PUT /api/afiliados/:id': 'Atualizar perfil',
        'DELETE /api/afiliados/:id': 'Excluir conta',
        'GET /api/afiliados/:id/cobertura': 'Listar áreas de entrega',
        'POST /api/afiliados/:id/cobertura': 'Adicionar área de entrega',
        'DELETE /api/afiliados/:id/cobertura/:i': 'Remover área de entrega',
        'GET /api/afiliados/:id/cacambas': 'Caçambas do afiliado'
      },

      cacambas: {
        'GET /api/cacambas': 'Listar caçambas',
        'GET /api/cacambas/:id': 'Buscar caçamba',
        'POST /api/cacambas': 'Criar caçamba',
        'PUT /api/cacambas/:id': 'Atualizar caçamba',
        'PATCH /api/cacambas/:id/disponibilidade': 'Alterar disponibilidade',
        'DELETE /api/cacambas/:id': 'Remover caçamba'
      },

      pedidos: {
        'GET /api/pedidos': 'Meus pedidos',
        'GET /api/pedidos/relatorio': 'Relatório de vendas',
        'GET /api/pedidos/:id': 'Buscar pedido',
        'POST /api/pedidos': 'Criar pedido',
        'PATCH /api/pedidos/:id/status': 'Atualizar status'
      }
    }
  });
});


// =====================================================
// ROTAS NÃO ENCONTRADAS
// =====================================================

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      sucesso: false,
      erro: `Rota ${req.method} ${req.path} não encontrada.`
    });
  }

  res.sendFile(path.join(__dirname, '..', 'index.html'));
});


// =====================================================
// TRATAMENTO GLOBAL DE ERROS
// =====================================================

app.use((err, req, res, next) => {
  console.error('[ERRO]', err);

  res.status(err.status || 500).json({
    sucesso: false,
    erro: process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor.'
      : err.message
  });
});


// =====================================================
// INICIAR SERVIDOR
// =====================================================

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('');
    console.log('==========================================');
    console.log('           LocaFácil API');
    console.log('==========================================');
    console.log(`Servidor:  http://localhost:${PORT}`);
    console.log(`API:       http://localhost:${PORT}/api`);
    console.log(`Health:    http://localhost:${PORT}/api/health`);
    console.log(`Banco:     http://localhost:${PORT}/api/teste-banco`);
    console.log('==========================================');
    console.log('');
  });
}

module.exports = app;
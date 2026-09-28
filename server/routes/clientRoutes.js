const express = require('express');
const ClientController = require('../controllers/ClientController');

const router = express.Router();

// 1. Pedidos (Geral e por ID)
router.get('/pedidos/consulta', ClientController.buscarPedidos);
router.get('/consulta-pedidos', ClientController.buscarPedidos);
router.get('/pedidos/consulta/:id', ClientController.buscarPedidoPorId);
router.get('/consulta-pedidos/:id', ClientController.buscarPedidoPorId);

// 2. Clientes (Geral e por ID)
router.get('/clientes/consulta', ClientController.buscarClientes);
router.get('/consulta-clientes', ClientController.buscarClientes);
router.get('/clientes/consulta/:id', ClientController.buscarClientePorId);
router.get('/consulta-clientes/:id', ClientController.buscarClientePorId);

// 3. Caçambas (Geral e por ID)
router.get('/cacambas/consulta', ClientController.buscarCacambas);
router.get('/consulta-cacambas', ClientController.buscarCacambas);
router.get('/cacambas/consulta/:id', ClientController.buscarCacambaPorId);
router.get('/consulta-cacambas/:id', ClientController.buscarCacambaPorId);

// 4. Afiliados/Empresas (Geral e por ID)
router.get('/afiliados/consulta', ClientController.buscarAfiliados);
router.get('/consulta-afiliados', ClientController.buscarAfiliados);
router.get('/afiliados/consulta/:id', ClientController.buscarAfiliadoPorId);
router.get('/consulta-afiliados/:id', ClientController.buscarAfiliadoPorId);

// 5. Estatísticas e Relatório Geral do Banco
router.get('/estatisticas/consulta', ClientController.buscarEstatisticas);
router.get('/consulta-estatisticas', ClientController.buscarEstatisticas);

// 6. Cadastro de Caçambas, Pedidos, Afiliados e Clientes no Banco Neon PostgreSQL
router.post('/cacambas', ClientController.criarCacamba);
router.post('/cacambas/cadastro', ClientController.criarCacamba);
router.post('/pedidos', ClientController.criarPedido);
router.post('/pedidos/cadastro', ClientController.criarPedido);
router.post('/afiliados', ClientController.criarAfiliado);
router.post('/afiliados/cadastro', ClientController.criarAfiliado);
router.post('/empresas', ClientController.criarAfiliado);
router.post('/empresas/cadastro', ClientController.criarAfiliado);
router.post('/clientes', ClientController.criarCliente);
router.post('/clientes/cadastro', ClientController.criarCliente);

module.exports = router;
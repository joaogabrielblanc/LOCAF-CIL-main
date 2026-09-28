// server/tests/integration/api.test.js
// Testes de integração end-to-end da API RESTful LocaFácil utilizando Poku

const { it, assert } = require('poku');
const app = require('../../index');

async function runIntegrationTests() {
  // Inicializa servidor em porta efêmera dinâmica para isolamento total
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const { port } = server.address();
  const BASE = `http://127.0.0.1:${port}/api`;

  let tokenCliente = '';
  let tokenAfiliado = '';
  let clienteId = '';
  let afiliadoId = '';
  let cacambaId = '';
  let pedidoId = '';

  // Função auxiliar de requisição HTTP
  async function req(method, path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  try {
    // ── 1. Health Check e Metadados da API ──
    await it('GET /api/health deve responder status 200 e indicar API online', async () => {
      const { status, data } = await req('GET', '/health');
      assert.strictEqual(status, 200, 'Código HTTP deve ser 200');
      assert.strictEqual(data.sucesso, true, 'Propriedade sucesso deve ser true');
      assert.strictEqual(data.status, 'online', 'Status deve ser online');
      assert(data.versao, 'Deve informar versão da API');
    });

    await it('GET /api deve listar catálogo de endpoints e documentação da API', async () => {
      const { status, data } = await req('GET', '');
      assert.strictEqual(status, 200, 'Código HTTP deve ser 200');
      assert.strictEqual(data.nome, 'LocaFácil API', 'Nome da API deve ser retornado');
      assert(data.endpoints, 'Objeto de endpoints documentados deve existir');
    });

    // ── 2. Fluxo de Autenticação e Clientes ──
    await it('POST /api/auth/cadastro/cliente deve cadastrar cliente e retornar token JWT', async () => {
      const payload = {
        nome: 'Mariana Ferreira',
        email: `mariana_${Date.now()}@teste.com`,
        senha: 'senhaSegura123',
        telefone: '(24) 99887-6655',
        cep: '27310-000',
        endereco: 'Rua das Acácias, 120, Volta Redonda - RJ'
      };

      const { status, data } = await req('POST', '/auth/cadastro/cliente', payload);
      assert.strictEqual(status, 201, 'Status de cadastro deve ser 201 Created');
      assert.strictEqual(data.sucesso, true, 'sucesso deve ser true');
      assert(typeof data.token === 'string' && data.token.length > 20, 'Token JWT retornado deve ser válido');
      assert(data.usuario?.id, 'Usuário cadastrado deve possuir ID');
      assert.strictEqual(data.usuario?.senha_hash, undefined, 'Hash de senha nunca deve ser exposto');

      tokenCliente = data.token;
      clienteId = data.usuario.id;
    });

    await it('POST /api/auth/cadastro/cliente deve rejeitar e-mail duplicado com status 409', async () => {
      const payload = {
        nome: 'Carlos Silva',
        email: 'cliente@demo.com', // Já existente no seed inicial
        senha: 'outrasenhaqualquer'
      };

      const { status, data } = await req('POST', '/auth/cadastro/cliente', payload);
      assert.strictEqual(status, 409, 'Status deve ser 409 Conflict');
      assert.strictEqual(data.sucesso, false, 'sucesso deve ser false');
    });

    await it('POST /api/auth/login/cliente deve autenticar usuário com credenciais corretas', async () => {
      const { status, data } = await req('POST', '/auth/login/cliente', {
        email: 'cliente@demo.com',
        senha: '123456'
      });

      assert.strictEqual(status, 200, 'Login deve retornar 200 OK');
      assert.strictEqual(data.sucesso, true, 'sucesso deve ser true');
      assert(data.token, 'Token JWT deve ser retornado');
      assert.strictEqual(data.usuario?.tipo, 'cliente', 'Tipo de usuário deve ser cliente');
    });

    await it('POST /api/auth/login/cliente deve rejeitar login com senha incorreta (401 Unauthorized)', async () => {
      const { status, data } = await req('POST', '/auth/login/cliente', {
        email: 'cliente@demo.com',
        senha: 'senha-errada-999'
      });

      assert.strictEqual(status, 401, 'Status deve ser 401 Unauthorized');
      assert.strictEqual(data.sucesso, false, 'sucesso deve ser false');
    });

    await it('GET /api/auth/me deve retornar perfil com JWT válido e 401 sem token', async () => {
      // Com token válido
      const comToken = await req('GET', '/auth/me', null, tokenCliente);
      assert.strictEqual(comToken.status, 200, 'Deve retornar 200 com token');
      assert.strictEqual(comToken.data.sucesso, true);
      assert.strictEqual(comToken.data.usuario.id, clienteId);

      // Sem token
      const semToken = await req('GET', '/auth/me');
      assert.strictEqual(semToken.status, 401, 'Deve retornar 401 sem token');
      assert.strictEqual(semToken.data.sucesso, false);
    });

    // ── 3. Cadastro e Gestão de Afiliados (Empresas) ──
    await it('POST /api/auth/cadastro/afiliado deve registrar nova empresa parceira', async () => {
      const payload = {
        empresa: 'TransLoc Caçambas e Entulhos',
        cnpj: '45.123.789/0001-10',
        email: `transloc_${Date.now()}@teste.com`,
        senha: 'afiliadoSenha123',
        telefone: '(24) 3344-5566',
        cidade: 'Volta Redonda',
        estado: 'RJ'
      };

      const { status, data } = await req('POST', '/auth/cadastro/afiliado', payload);
      assert.strictEqual(status, 201, 'Status deve ser 201 Created');
      assert.strictEqual(data.sucesso, true, 'sucesso deve ser true');
      assert(data.token, 'Deve retornar token para o afiliado');

      tokenAfiliado = data.token;
      afiliadoId = data.usuario.id;
    });

    // ── 4. Ciclo de Vida de Caçambas (CRUD e Segurança) ──
    await it('POST /api/cacambas deve criar caçamba vinculada ao afiliado autenticado', async () => {
      const payload = {
        nome: 'Caçamba Master Obra 5m³',
        tipo: 'obra',
        capacidade: '5m³',
        dimensoes: '2.5 x 1.6 x 1.2m',
        peso_max: '3 ton',
        preco: 350,
        descricao: 'Resistente a entulhos pesados e concreto.',
        disponivel: true
      };

      const { status, data } = await req('POST', '/cacambas', payload, tokenAfiliado);
      assert.strictEqual(status, 201, 'Status deve ser 201 Created');
      assert.strictEqual(data.sucesso, true, 'sucesso deve ser true');
      assert(data.cacamba?.id, 'Caçamba deve ter ID gerado');
      assert.strictEqual(data.cacamba.preco, 350, 'Preço deve ser gravado');

      cacambaId = data.cacamba.id;
    });

    await it('PUT /api/cacambas/:id deve atualizar dados da caçamba pelo proprietário', async () => {
      const { status, data } = await req('PUT', `/cacambas/${cacambaId}`, {
        nome: 'Caçamba Master Obra 5m³ Atualizada',
        tipo: 'obra',
        preco: 390
      }, tokenAfiliado);

      assert.strictEqual(status, 200, 'Status deve ser 200 OK');
      assert.strictEqual(data.sucesso, true);
      assert.strictEqual(data.cacamba.nome, 'Caçamba Master Obra 5m³ Atualizada');
      assert.strictEqual(data.cacamba.preco, 390);
    });

    await it('PUT /api/cacambas/:id deve bloquear alteração por outro afiliado (403 Forbidden)', async () => {
      // Login como o afiliado demo (diferente do criador desta caçamba)
      const loginDemo = await req('POST', '/auth/login/afiliado', {
        email: 'afiliado@demo.com',
        senha: '123456'
      });

      const { status, data } = await req('PUT', `/cacambas/${cacambaId}`, {
        nome: 'Tentativa de Invasão',
        tipo: 'obra',
        preco: 999
      }, loginDemo.data.token);

      assert.strictEqual(status, 403, 'Acesso cruzado de afiliados deve ser barrado com 403');
      assert.strictEqual(data.sucesso, false);
    });

    await it('GET /api/cacambas deve listar caçambas com filtros de busca', async () => {
      const { status, data } = await req('GET', '/cacambas?cidade=Volta%20Redonda&estado=RJ');
      assert.strictEqual(status, 200, 'Status deve ser 200 OK');
      assert.strictEqual(data.sucesso, true);
      assert(Array.isArray(data.cacambas), 'Deve retornar array de caçambas');
    });

    // ── 5. Ciclo de Vida de Pedidos (Locações) ──
    await it('POST /api/pedidos deve criar um novo pedido para o cliente autenticado', async () => {
      const payload = {
        cacambaId: 'cb1',
        endereco: 'Rua Santos Dumont, 88, Volta Redonda - RJ',
        data: '2026-11-01',
        dataFim: '2026-11-06',
        valor: 250
      };

      const { status, data } = await req('POST', '/pedidos', payload, tokenCliente);
      assert.strictEqual(status, 201, 'Status deve ser 201 Created');
      assert.strictEqual(data.sucesso, true);
      assert(data.pedido?.id, 'Pedido deve conter ID');
      assert.strictEqual(data.pedido.status, 'pendente', 'Status inicial deve ser pendente');

      pedidoId = data.pedido.id;
    });

    await it('PATCH /api/pedidos/:id/status deve atualizar status pelo afiliado fornecedor', async () => {
      const loginAf = await req('POST', '/auth/login/afiliado', {
        email: 'afiliado@demo.com',
        senha: '123456'
      });

      // Transição: pendente -> a-caminho
      const st1 = await req('PATCH', `/pedidos/${pedidoId}/status`, {
        status: 'a-caminho'
      }, loginAf.data.token);

      assert.strictEqual(st1.status, 200);
      assert.strictEqual(st1.data.pedido.status, 'a-caminho');

      // Transição: a-caminho -> recolhida (converte para 'concluido' no backend)
      const st2 = await req('PATCH', `/pedidos/${pedidoId}/status`, {
        status: 'recolhida'
      }, loginAf.data.token);

      assert.strictEqual(st2.status, 200);
      assert.strictEqual(st2.data.pedido.status, 'concluido');
    });

    await it('PATCH /api/pedidos/:id/status deve rejeitar alteração de status por cliente com 403', async () => {
      const { status, data } = await req('PATCH', `/pedidos/${pedidoId}/status`, {
        status: 'pendente'
      }, tokenCliente);

      assert.strictEqual(status, 403, 'Cliente não pode forçar alteração de status');
      assert.strictEqual(data.sucesso, false);
    });

    // ── 6. Limpeza e Exclusão (DELETE) ──
    await it('DELETE /api/cacambas/:id deve permitir remover caçamba pelo proprietário', async () => {
      const { status, data } = await req('DELETE', `/cacambas/${cacambaId}`, null, tokenAfiliado);
      assert.strictEqual(status, 200, 'Remoção de caçamba deve responder 200 OK');
      assert.strictEqual(data.sucesso, true);
    });

    await it('DELETE /api/clientes/:id deve permitir ao usuário excluir sua própria conta', async () => {
      const { status, data } = await req('DELETE', `/clientes/${clienteId}`, null, tokenCliente);
      assert.strictEqual(status, 200, 'Exclusão de conta deve responder 200 OK');
      assert.strictEqual(data.sucesso, true);
    });

    // ── 7. Casos de Borda e Erros 404/400 ──
    await it('POST /api/auth/cadastro/cliente deve responder 400 ao omitir campos obrigatórios', async () => {
      const { status, data } = await req('POST', '/auth/cadastro/cliente', {
        nome: 'Incompleto'
      });
      assert.strictEqual(status, 400, 'Status deve ser 400 Bad Request');
      assert.strictEqual(data.sucesso, false);
      assert(Array.isArray(data.detalhes), 'Deve listar detalhes dos erros de validação');
    });

    await it('GET /api/endpoint-inexistente deve responder HTTP 404 padronizado em JSON', async () => {
      const { status, data } = await req('GET', '/endpoint-inexistente');
      assert.strictEqual(status, 404, 'Status deve ser 404 Not Found');
      assert.strictEqual(data.sucesso, false);
      assert.match(data.erro, /não encontrada/i, 'Mensagem deve indicar rota não encontrada');
    });

  } finally {
    // Teardown gracioso do servidor
    await new Promise((resolve) => server.close(resolve));
  }
}

runIntegrationTests();

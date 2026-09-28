// server/tests/integration/admin_afiliados.test.js
// Testes de integração para rotas de Admin, Afiliados, Clientes e Pedidos estendidos usando Poku

const { it, assert } = require('poku');
const app = require('../../index');

async function runExtendedIntegrationTests() {
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const { port } = server.address();
  const BASE = `http://127.0.0.1:${port}/api`;

  let tokenAdmin = '';
  let tokenAfiliado = '';
  let tokenCliente = '';

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
    // ── Setup de Autenticação para Perfis Diversos ──
    await it('POST /api/auth/login/admin deve autenticar com sucesso e emitir token de administrador', async () => {
      const { status, data } = await req('POST', '/auth/login/admin', {
        email: 'admin@locafacil.com',
        senha: 'admin123'
      });

      assert.strictEqual(status, 200, 'Login admin deve retornar 200 OK');
      assert.strictEqual(data.sucesso, true);
      assert.strictEqual(data.usuario.tipo, 'admin');
      assert(data.token, 'Token JWT de admin deve ser emitido');
      tokenAdmin = data.token;
    });

    await it('POST /api/auth/login/afiliado deve autenticar afiliado de demonstração', async () => {
      const { status, data } = await req('POST', '/auth/login/afiliado', {
        email: 'afiliado@demo.com',
        senha: '123456'
      });

      assert.strictEqual(status, 200);
      assert.strictEqual(data.usuario.tipo, 'afiliado');
      tokenAfiliado = data.token;
    });

    await it('POST /api/auth/login/cliente deve autenticar cliente demo', async () => {
      const { status, data } = await req('POST', '/auth/login/cliente', {
        email: 'cliente@demo.com',
        senha: '123456'
      });

      assert.strictEqual(status, 200);
      assert.strictEqual(data.usuario.tipo, 'cliente');
      tokenCliente = data.token;
    });

    // ── 1. Rotas Administrativas (/api/admin) ──
    await it('GET /api/admin/stats deve retornar métricas agregadas da plataforma', async () => {
      const { status, data } = await req('GET', '/admin/stats', null, tokenAdmin);
      assert.strictEqual(status, 200);
      assert.strictEqual(data.sucesso, true);
      assert(data.stats, 'Objeto de estatísticas deve existir');
    });

    await it('GET /api/admin/clientes deve listar todos os clientes cadastrados com total de pedidos', async () => {
      const { status, data } = await req('GET', '/admin/clientes', null, tokenAdmin);
      assert.strictEqual(status, 200);
      assert.strictEqual(data.sucesso, true);
      assert(Array.isArray(data.clientes), 'Deve retornar lista de clientes');
    });

    await it('GET /api/admin/clientes/:id deve exibir detalhes do cliente e histórico', async () => {
      const { status, data } = await req('GET', '/admin/clientes/c1', null, tokenAdmin);
      assert.strictEqual(status, 200);
      assert.strictEqual(data.sucesso, true);
      assert.strictEqual(data.cliente.id, 'c1');
      assert(Array.isArray(data.cliente.pedidos), 'Deve listar pedidos associados');
    });

    await it('GET /api/admin/stats deve bloquear acesso de usuários não-admin com status 403', async () => {
      const { status } = await req('GET', '/admin/stats', null, tokenCliente);
      assert.strictEqual(status, 403, 'Cliente não pode acessar painel administrativo');
    });

    // ── 2. Rotas de Afiliados (/api/afiliados) ──
    await it('GET /api/afiliados/:id deve obter dados cadastrais da empresa afiliada', async () => {
      const { status, data } = await req('GET', '/afiliados/a1', null, tokenAfiliado);
      assert.strictEqual(status, 200);
      assert.strictEqual(data.sucesso, true);
      assert.strictEqual(data.afiliado.id, 'a1');
    });

    await it('PUT /api/afiliados/:id deve atualizar perfil comercial do afiliado', async () => {
      const payload = {
        empresa: 'Caçambas Norte VR - Atualizada',
        cidade: 'Volta Redonda',
        estado: 'RJ',
        telefone: '(24) 99999-0001'
      };

      const { status, data } = await req('PUT', '/afiliados/a1', payload, tokenAfiliado);
      assert.strictEqual(status, 200);
      assert.strictEqual(data.sucesso, true);
      assert.strictEqual(data.afiliado.empresa, 'Caçambas Norte VR - Atualizada');
    });

    await it('POST e GET /api/afiliados/:id/cobertura deve cadastrar e listar raio de atendimento', async () => {
      // Adicionar cobertura
      const novaRegiao = {
        cidade: 'Pinheiral',
        estado: 'RJ',
        cep_inicio: '27197-000',
        cep_fim: '27197-999'
      };
      const cadCob = await req('POST', '/afiliados/a1/cobertura', novaRegiao, tokenAfiliado);
      assert.strictEqual(cadCob.status, 201, 'Status deve ser 201 Created');
      assert.strictEqual(cadCob.data.sucesso, true);

      // Listar cobertura
      const listCob = await req('GET', '/afiliados/a1/cobertura', null, tokenAfiliado);
      assert.strictEqual(listCob.status, 200);
      assert.strictEqual(listCob.data.sucesso, true);
      assert(listCob.data.cobertura.length >= 1, 'Deve listar regiões cobertas');
    });

    await it('GET /api/afiliados/:id/cacambas deve listar estoque de caçambas da empresa', async () => {
      const { status, data } = await req('GET', '/afiliados/a1/cacambas', null, tokenAfiliado);
      assert.strictEqual(status, 200);
      assert.strictEqual(data.sucesso, true);
      assert(Array.isArray(data.cacambas), 'Deve retornar array de caçambas');
    });

    // ── 3. Rotas de Clientes (/api/clientes) ──
    await it('GET /api/clientes deve permitir listagem para afiliados autenticados', async () => {
      const { status, data } = await req('GET', '/clientes', null, tokenAfiliado);
      assert.strictEqual(status, 200);
      assert.strictEqual(data.sucesso, true);
      assert(Array.isArray(data.clientes));
    });

    await it('GET /api/clientes/:id deve permitir visualização do perfil do próprio cliente', async () => {
      const { status, data } = await req('GET', '/clientes/c1', null, tokenCliente);
      assert.strictEqual(status, 200);
      assert.strictEqual(data.cliente.id, 'c1');
    });

    await it('PUT /api/clientes/:id deve atualizar dados cadastrais do cliente', async () => {
      const { status, data } = await req('PUT', '/clientes/c1', {
        nome: 'Carlos Silva Perfil Editado',
        telefone: '(24) 97777-6666'
      }, tokenCliente);

      assert.strictEqual(status, 200);
      assert.strictEqual(data.cliente.nome, 'Carlos Silva Perfil Editado');
    });

    // ── 4. Recursos Estendidos de Caçambas e Pedidos ──
    await it('GET /api/cacambas/:id deve consultar caçamba individual publicamente', async () => {
      const { status, data } = await req('GET', '/cacambas/cb1');
      assert.strictEqual(status, 200);
      assert.strictEqual(data.sucesso, true);
      assert.strictEqual(data.cacamba.id, 'cb1');
    });

    await it('PATCH /api/cacambas/:id/disponibilidade deve alternar status de locação', async () => {
      const { status, data } = await req('PATCH', '/cacambas/cb1/disponibilidade', null, tokenAfiliado);
      assert.strictEqual(status, 200);
      assert.strictEqual(data.sucesso, true);
      assert(typeof data.cacamba.disponivel === 'boolean', 'Disponibilidade deve ser booleano');
    });

    await it('GET /api/pedidos deve listar pedidos do cliente autenticado', async () => {
      const { status, data } = await req('GET', '/pedidos', null, tokenCliente);
      assert.strictEqual(status, 200);
      assert.strictEqual(data.sucesso, true);
      assert(Array.isArray(data.pedidos));
    });

    await it('GET /api/pedidos/:id deve exibir detalhe do pedido para o cliente proprietário', async () => {
      const { status, data } = await req('GET', '/pedidos/p1', null, tokenCliente);
      assert.strictEqual(status, 200);
      assert.strictEqual(data.sucesso, true);
      assert.strictEqual(data.pedido.id, 'p1');
    });

    await it('GET /api/pedidos/relatorio deve gerar balanço financeiro e operacional para afiliado', async () => {
      const { status, data } = await req('GET', '/pedidos/relatorio', null, tokenAfiliado);
      assert.strictEqual(status, 200);
      assert.strictEqual(data.sucesso, true);
      assert(data.relatorio, 'Objeto do relatório deve ser retornado');
    });

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

runExtendedIntegrationTests();

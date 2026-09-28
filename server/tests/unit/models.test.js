// server/tests/unit/models.test.js
// Testes unitários dos modelos de dados em memória e regras de negócio usando Poku

const { describe, it, assert } = require('poku');
const { Admins, Clientes, Afiliados, Cacambas, Pedidos } = require('../../models/database');

describe('Modelos de Dados e Regras de Negócio em Memória', () => {

  // ── Testes de Admins ──
  it('Admins deve consultar admin e verificar hash de senha', () => {
    const admin = Admins.findByEmail('admin@locafacil.com');
    assert(admin, 'Admin padrão deve existir');
    assert.strictEqual(admin.email, 'admin@locafacil.com', 'E-mail deve ser compatível');

    const senhaCorreta = Admins.verificarSenha(admin, 'admin123');
    assert.strictEqual(senhaCorreta, true, 'Senha correta do admin deve ser validada pelo bcrypt');

    const senhaIncorreta = Admins.verificarSenha(admin, 'senha-errada');
    assert.strictEqual(senhaIncorreta, false, 'Senha incorreta deve retornar false');
  });

  // ── Testes de Clientes ──
  it('Clientes deve permitir criar, autenticar e buscar cliente', () => {
    const emailUnico = `unit_${Date.now()}@teste.com`;
    const novo = Clientes.create({
      nome: 'Cliente Unitário',
      email: emailUnico,
      senha: 'minhasenhaforte',
      telefone: '(24) 98888-7777',
      cep: '27250-000',
      endereco: 'Rua das Palmeiras, 100'
    });

    assert(novo, 'Cliente criado não deve ser nulo');
    assert(novo.id, 'Cliente deve possuir ID gerado');
    assert.strictEqual(novo.senha_hash, undefined, 'senha_hash não deve vir exposta no retorno do model');
    assert.strictEqual(novo.email, emailUnico, 'E-mail deve ser o cadastrado');

    // Verificar se duplicidade é impedida
    const duplicado = Clientes.create({
      nome: 'Outro',
      email: emailUnico,
      senha: '123'
    });
    assert.strictEqual(duplicado, null, 'Tentativa de criar cliente com mesmo e-mail deve retornar null');

    // Buscar com dados internos para verificar senha
    const usuarioBanco = Clientes.findByEmail(emailUnico);
    assert(usuarioBanco, 'Cliente deve ser localizado por e-mail');
    const senhaOk = Clientes.verificarSenha(usuarioBanco, 'minhasenhaforte');
    assert.strictEqual(senhaOk, true, 'Senha gravada deve validar contra hash');

    // Atualização de dados
    const atualizado = Clientes.update(novo.id, { nome: 'Cliente Nome Atualizado' });
    assert.strictEqual(atualizado.nome, 'Cliente Nome Atualizado', 'Nome deve ser atualizado com sucesso');
  });

  // ── Testes de Afiliados e Cobertura ──
  it('Afiliados deve gerenciar cadastro e áreas de cobertura', () => {
    const emailAf = `af_${Date.now()}@teste.com`;
    const afiliado = Afiliados.create({
      empresa: 'Caçambas Sul Fluminense',
      cnpj: '99.888.777/0001-66',
      email: emailAf,
      senha: 'afiliadosenha',
      telefone: '(24) 3333-2222',
      cidade: 'Resende',
      estado: 'RJ'
    });

    assert(afiliado, 'Afiliado deve ser criado com sucesso');
    assert(afiliado.id, 'Afiliado deve possuir ID');

    // Adição de área de cobertura
    const novaRegiao = {
      cep_inicio: '27500-000',
      cep_fim: '27599-999',
      cidade: 'Resende',
      estado: 'RJ'
    };
    const cob = Afiliados.addCobertura(afiliado.id, novaRegiao);
    assert(Array.isArray(cob), 'Cobertura deve ser um array');
    assert.strictEqual(cob.length, 1, 'Deve possuir 1 região adicionada');
    assert.strictEqual(cob[0].cidade, 'Resende', 'Cidade da cobertura deve ser Resende');

    // Remover cobertura
    const removido = Afiliados.removeCobertura(afiliado.id, 0);
    assert.strictEqual(removido, true, 'Remover cobertura com índice existente deve retornar true');
    const coberturaAtual = Afiliados.getCobertura(afiliado.id);
    assert.strictEqual(coberturaAtual.length, 0, 'Cobertura deve ficar vazia após exclusão');
  });

  // ── Testes de Caçambas ──
  it('Cacambas deve criar, filtrar e buscar caçamba por localidade', () => {
    const novaCacamba = Cacambas.create({
      afiliadoId: 'a1',
      nome: 'Caçamba Unitária 6m³',
      tipo: 'obra',
      capacidade: '6m³',
      preco: 340,
      disponivel: true,
      descricao: 'Teste unitário para caçamba'
    });

    assert(novaCacamba.id, 'Caçamba criada deve conter ID');
    assert.strictEqual(novaCacamba.preco, 340, 'Preço deve ser 340');

    // Filtros
    const encontradas = Cacambas.findAll({ afiliadoId: 'a1', tipo: 'obra' });
    assert(encontradas.length > 0, 'Deve listar caçambas com filtro de afiliado e tipo');

    // Busca por localidade (afiliado 'a1' tem cidade 'Volta Redonda')
    const porCidade = Cacambas.buscarPorLocalidade('Volta Redonda', 'RJ', 27250000);
    assert(Array.isArray(porCidade), 'Retorno de busca por localidade deve ser array');
    assert(porCidade.length > 0, 'Deve encontrar ao menos uma caçamba disponível na cidade');
  });

  // ── Testes de Pedidos ──
  it('Pedidos deve registrar novo pedido e permitir atualização de status', () => {
    const pedido = Pedidos.create({
      clienteId: 'c1',
      cacambaId: 'cb1',
      afiliadoId: 'a1',
      status: 'pendente',
      data: '2026-10-01',
      valor: 250,
      endereco: 'Av. Amaral Peixoto, 50, VR'
    });

    assert(pedido.id, 'Pedido deve possuir ID gerado');
    assert.strictEqual(pedido.status, 'pendente', 'Status inicial deve ser pendente');

    // Atualização de status
    const atualizado = Pedidos.update(pedido.id, { status: 'a-caminho' });
    assert.strictEqual(atualizado.status, 'a-caminho', 'Status do pedido deve atualizar para a-caminho');

    // Listagem por filtro de cliente
    const pedidosCliente = Pedidos.findAll({ clienteId: 'c1' });
    assert(pedidosCliente.length > 0, 'Deve listar pedidos do cliente especificado');
  });

});

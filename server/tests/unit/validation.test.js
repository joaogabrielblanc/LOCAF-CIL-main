// server/tests/unit/validation.test.js
// Testes unitários das regras de validação (express-validator) usando Poku

const { describe, it, assert } = require('poku');
const { validationResult } = require('express-validator');
const { regras, checarErros } = require('../../middleware/validacao');

// Função auxiliar para executar array de middlewares do express-validator
async function validar(regrasValidacao, body) {
  const req = { body, params: {}, query: {} };
  for (const mid of regrasValidacao) {
    await mid(req, {}, () => {});
  }
  return validationResult(req);
}

describe('Middleware de Validação de Dados (regras e checarErros)', () => {

  it('cadastroCliente deve aprovar dados válidos', async () => {
    const res = await validar(regras.cadastroCliente, {
      nome: 'João Testador',
      email: 'joao@teste.com',
      senha: 'senha-segura-123',
      telefone: '(24) 99999-8888',
      cep: '27310-000'
    });
    assert.strictEqual(res.isEmpty(), true, 'Não deve haver erros para dados válidos de cliente');
  });

  it('cadastroCliente deve reprovar nome curto, e-mail inválido e senha curta', async () => {
    const res = await validar(regras.cadastroCliente, {
      nome: 'Jo',
      email: 'email-invalido',
      senha: '123'
    });
    assert.strictEqual(res.isEmpty(), false, 'Deve conter erros de validação');
    const erros = res.array();
    assert(erros.some(e => e.path === 'nome'), 'Deve acusar erro no campo nome');
    assert(erros.some(e => e.path === 'email'), 'Deve acusar erro no campo email');
    assert(erros.some(e => e.path === 'senha'), 'Deve acusar erro no campo senha');
  });

  it('cacamba deve reprovar tipo de caçamba desconhecido e preço negativo', async () => {
    const res = await validar(regras.cacamba, {
      nome: 'Caçamba Especial',
      tipo: 'tipo-inexistente-xyz',
      preco: -50
    });
    assert.strictEqual(res.isEmpty(), false, 'Deve rejeitar caçamba inválida');
    const erros = res.array();
    assert(erros.some(e => e.path === 'tipo'), 'Deve validar tipo permitido');
    assert(erros.some(e => e.path === 'preco'), 'Deve exigir preço maior que zero');
  });

  it('atualizarStatus deve aceitar apenas estados do ciclo de vida definidos', async () => {
    const resValido = await validar(regras.atualizarStatus, { status: 'a-caminho' });
    assert.strictEqual(resValido.isEmpty(), true, 'Status "a-caminho" deve ser aceito');

    const resInvalido = await validar(regras.atualizarStatus, { status: 'status-inventado' });
    assert.strictEqual(resInvalido.isEmpty(), false, 'Status desconhecido deve ser reprovado');
  });

  it('checarErros deve responder HTTP 400 com lista de detalhes se houver erros', async () => {
    let statusCode = null;
    let respostaJson = null;

    const req = { body: { email: 'erro' }, params: {}, query: {} };
    // Gera erro de validação propositalmente
    await regras.login[0](req, {}, () => {}); // valida email

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        respostaJson = data;
        return this;
      }
    };
    let nextChamado = false;
    const next = () => { nextChamado = true; };

    checarErros(req, res, next);

    assert.strictEqual(nextChamado, false, 'next() não deve ser chamado quando houver erro');
    assert.strictEqual(statusCode, 400, 'Status HTTP deve ser 400');
    assert.strictEqual(respostaJson.sucesso, false, 'sucesso deve ser false');
    assert(Array.isArray(respostaJson.detalhes), 'detalhes deve ser um array explicativo');
  });

});

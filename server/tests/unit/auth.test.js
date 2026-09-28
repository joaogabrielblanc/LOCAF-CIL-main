// server/tests/unit/auth.test.js
// Testes unitários do módulo de autenticação e middlewares JWT utilizando Poku

const { describe, it, assert } = require('poku');
const jwt = require('jsonwebtoken');
const { gerarToken, autenticar, exigirTipo, exigirProprietario } = require('../../middleware/auth');

const SECRET = process.env.JWT_SECRET || 'locafacil_jwt_secret_2025';

describe('Middleware e Utilitários de Autenticação (JWT)', () => {

  it('gerarToken deve gerar um JWT válido contendo os dados do payload', () => {
    const payload = { id: 'usr-123', tipo: 'cliente', email: 'test@locafacil.com' };
    const token = gerarToken(payload);

    assert(typeof token === 'string', 'O token gerado deve ser uma string');
    assert(token.length > 20, 'O token deve ter tamanho característico de JWT');

    const decoded = jwt.verify(token, SECRET);
    assert.strictEqual(decoded.id, 'usr-123', 'ID no payload decodificado deve ser idêntico');
    assert.strictEqual(decoded.tipo, 'cliente', 'Tipo no payload decodificado deve ser idêntico');
    assert.strictEqual(decoded.email, 'test@locafacil.com', 'E-mail no payload decodificado deve ser idêntico');
  });

  it('autenticar deve permitir requisição com token válido no header Authorization', () => {
    const token = gerarToken({ id: 'cli-001', tipo: 'cliente', email: 'c@demo.com' });
    let nextChamado = false;

    const req = {
      headers: { authorization: `Bearer ${token}` }
    };
    const res = {};
    const next = () => { nextChamado = true; };

    autenticar(req, res, next);

    assert(nextChamado, 'next() deve ser chamado com token válido');
    assert(req.usuario, 'req.usuario deve ser preenchido');
    assert.strictEqual(req.usuario.id, 'cli-001', 'ID do usuário injetado na requisição deve ser correto');
  });

  it('autenticar deve retornar status 401 quando o token não for enviado', () => {
    let statusCode = null;
    let respostaJson = null;

    const req = { headers: {} };
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
    const next = () => { assert.fail('next() não deveria ser chamado sem token'); };

    autenticar(req, res, next);

    assert.strictEqual(statusCode, 401, 'Status code deve ser 401');
    assert.strictEqual(respostaJson.sucesso, false, 'sucesso deve ser false');
    assert.match(respostaJson.erro, /não fornecido/i, 'Mensagem deve indicar ausência de token');
  });

  it('autenticar deve retornar status 401 com token inválido ou corrompido', () => {
    let statusCode = null;
    let respostaJson = null;

    const req = {
      headers: { authorization: 'Bearer token-invalido-12345' }
    };
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
    const next = () => { assert.fail('next() não deveria ser chamado com token inválido'); };

    autenticar(req, res, next);

    assert.strictEqual(statusCode, 401, 'Status code deve ser 401');
    assert.strictEqual(respostaJson.sucesso, false, 'sucesso deve ser false');
    assert.match(respostaJson.erro, /Token inválido/i, 'Mensagem deve indicar token inválido');
  });

  it('exigirTipo deve permitir usuário com tipo autorizado', () => {
    const middleware = exigirTipo('cliente', 'admin');
    let nextChamado = false;

    const req = { usuario: { id: '1', tipo: 'cliente' } };
    const res = {};
    const next = () => { nextChamado = true; };

    middleware(req, res, next);
    assert(nextChamado, 'next() deve ser chamado quando tipo for permitido');
  });

  it('exigirTipo deve bloquear usuário com perfil não autorizado com 403 Forbidden', () => {
    const middleware = exigirTipo('admin');
    let statusCode = null;
    let respostaJson = null;

    const req = { usuario: { id: '1', tipo: 'cliente' } };
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
    const next = () => { assert.fail('next() não deveria ser chamado para perfil não autorizado'); };

    middleware(req, res, next);
    assert.strictEqual(statusCode, 403, 'Status deve ser 403');
    assert.strictEqual(respostaJson.sucesso, false, 'sucesso deve ser false');
  });

  it('exigirProprietario deve permitir acesso quando ID do usuário corresponde ao parâmetro', () => {
    const middleware = exigirProprietario('id');
    let nextChamado = false;

    const req = {
      usuario: { id: 'usr-999' },
      params: { id: 'usr-999' }
    };
    const res = {};
    const next = () => { nextChamado = true; };

    middleware(req, res, next);
    assert(nextChamado, 'next() deve ser chamado quando o recurso pertencer ao usuário');
  });

  it('exigirProprietario deve bloquear acesso quando ID do usuário for diferente do parâmetro com 403', () => {
    const middleware = exigirProprietario('id');
    let statusCode = null;

    const req = {
      usuario: { id: 'usr-invasor' },
      params: { id: 'usr-legitimo' }
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        return this;
      }
    };
    const next = () => { assert.fail('next() não deveria ser chamado para usuário não proprietário'); };

    middleware(req, res, next);
    assert.strictEqual(statusCode, 403, 'Status deve ser 403');
  });

});

// assets/js/api.js
// ─────────────────────────────────────────────────────────────
// Camada de integração com o Backend Node.js / Express / PostgreSQL
// Detecta automaticamente se o front está sendo servido pelo próprio
// backend (porta 3001) ou por servidor externo/Live Server (ex: 5500).
// ─────────────────────────────────────────────────────────────

// Detecta dinamicamente a URL base da API:
// - Se window.API_BASE_URL estiver definido manualmente, usa-o.
// - Se estiver no Live Server local (ex: porta 5500) ou abrindo direto por arquivo (file:), aponta para o backend local (porta 3001).
// - Se estiver na Vercel (produção/preview) ou rodando direto pelo backend Express (porta 3001), usa '/api'.
const isFileProtocol = window.location.protocol === 'file:';
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isLiveServer = isLocalDev && window.location.port !== '3001' && window.location.port !== '';

const API_BASE_URL = window.API_BASE_URL || (
  (isLiveServer || isFileProtocol)
    ? 'http://localhost:3001/api'
    : '/api'
);

const ApiService = {
  baseUrl: API_BASE_URL,
  apiOnline: false,

  // Helper para requisições fetch com timeout e tratamento de erro
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const token = localStorage.getItem('lf_token') || sessionStorage.getItem('lf_token');

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      this.apiOnline = true;
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      console.warn(`[API] Falha de comunicação com ${url}:`, err.message);
      this.apiOnline = false;
      return { ok: false, status: 0, erro: err.message, data: null };
    }
  },

  // ── Checagem de Conexão e Banco ──────────────────────────
  async checkHealth() {
    const res = await this.request('/health');
    if (!res.ok) return { online: false };
    const banco = await this.request('/teste-banco');
    return {
      online: true,
      bancoConectado: banco.ok && banco.data?.sucesso === true,
      info: res.data
    };
  },

  // ── CONSULTAS COMPLEXAS DO TRABALHO (Neon PostgreSQL) ────

  /**
   * 1. Consulta Complexa de Pedidos (com 4 JOINs e Paginação)
   * @param {number} page - número da página (inicia em 1)
   * @param {number} limit - itens por página (default: 10)
   * @param {string} [status] - filtro opcional por status
   */
  async getPedidos(page = 1, limit = 10, status = null, ordem = 'asc') {
    let endpoint = `/pedidos/consulta?page=${page}&limit=${limit}&ordem=${ordem}`;
    if (status && status !== 'todos') {
      endpoint += `&status=${encodeURIComponent(status)}`;
    }
    const res = await this.request(endpoint);
    return res.data;
  },

  /**
   * 2. Consulta de Clientes (com agregação COUNT(pedidos))
   */
  async getClientes() {
    const res = await this.request('/clientes/consulta');
    return res.data;
  },

  /**
   * 3. Consulta de Afiliados/Empresas (com agregação COUNT caçambas e pedidos)
   */
  async getAfiliados() {
    const res = await this.request('/afiliados/consulta');
    return res.data;
  },

  /**
   * 4. Consulta de Caçambas (com JOIN em afiliados)
   */
  async getCacambas() {
    const res = await this.request('/cacambas/consulta');
    return res.data;
  },

  /**
   * 5. Estatísticas Gerais (Subconsultas escalares e somas)
   */
  async getEstatisticas() {
    const res = await this.request('/estatisticas/consulta');
    return res.data;
  },

  /**
   * Detalhes por ID
   */
  async getPedidoPorId(id) {
    const res = await this.request(`/pedidos/consulta/${id}`);
    return res.data;
  },

  async getClientePorId(id) {
    const res = await this.request(`/clientes/consulta/${id}`);
    return res.data;
  },

  async getAfiliadoPorId(id) {
    const res = await this.request(`/afiliados/consulta/${id}`);
    return res.data;
  },

  // ── AUTENTICAÇÃO E CONTROLE ──────────────────────────────
  async loginAdmin(email, senha) {
    const res = await this.request('/auth/login/admin', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });
    return res.data;
  },

  async loginCliente(email, senha) {
    const res = await this.request('/auth/login/cliente', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });
    return res.data;
  },

  async loginAfiliado(email, senha) {
    const res = await this.request('/auth/login/afiliado', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });
    return res.data;
  },

  async cadastroCliente(dados) {
    const res = await this.request('/auth/cadastro/cliente', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
    return res.data;
  },

  async cadastroAfiliado(dados) {
    const res = await this.request('/auth/cadastro/afiliado', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
    return res.data;
  },

  // ── INSERÇÃO NO BANCO DE DADOS NEON (POSTGRESQL) ─────────
  async criarCacamba(dados) {
    const res = await this.request('/cacambas', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
    return res.data;
  },

  async criarPedido(dados) {
    const res = await this.request('/pedidos', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
    return res.data;
  },

  async criarAfiliado(dados) {
    const res = await this.request('/afiliados', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
    return res.data;
  },

  async criarCliente(dados) {
    const res = await this.request('/clientes', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
    return res.data;
  }
};

// Exporta globalmente no navegador
window.ApiService = ApiService;

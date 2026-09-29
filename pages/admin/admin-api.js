// admin-api.js — Camada de dados do admin integrada à API Backend + PostgreSQL
// Mantém fallback transparente para localStorage (DB) caso a API esteja offline.

const AdminAPI = {
  isApiMode: false,
  _cacheRaw: {},

  getSession() {
    try {
      const s = DB.getSession();
      if (s && typeof s === 'object' && s.tipo === 'admin') return s;
      
      const raw = localStorage.getItem('lf_session');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && parsed.tipo === 'admin') return parsed;
          if (typeof parsed === 'string' && DB.lerToken) {
            const dec = DB.lerToken(parsed);
            if (dec && dec.tipo === 'admin') {
              const recuperada = { tipo: 'admin', id: dec.id || 'adm1', nome: dec.nome || 'Administrador', email: dec.email || 'admin@locafacil.com' };
              DB._criarSessao('admin', recuperada.id, recuperada.nome, recuperada.email);
              return recuperada;
            }
          }
        } catch {
          if (DB.lerToken) {
            const dec = DB.lerToken(raw);
            if (dec && dec.tipo === 'admin') {
              const recuperada = { tipo: 'admin', id: dec.id || 'adm1', nome: dec.nome || 'Administrador', email: dec.email || 'admin@locafacil.com' };
              DB._criarSessao('admin', recuperada.id, recuperada.nome, recuperada.email);
              return recuperada;
            }
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao obter sessão admin:', e);
    }
    return null;
  },

  logout() {
    localStorage.removeItem('lf_token');
    sessionStorage.removeItem('lf_token');
    DB.logout();
    location.href = 'login.html';
  },

  async login(email, senha) {
    // 1. Tentar login via API Backend REST
    if (window.ApiService) {
      try {
        const apiRes = await ApiService.loginAdmin(email, senha);
        if (apiRes && apiRes.sucesso && apiRes.token) {
          localStorage.setItem('lf_token', apiRes.token);
          this.isApiMode = true;
          // Cria sessão compatível com o formato do DB { tipo, id, nome, email, token }
          const u = apiRes.usuario;
          DB._criarSessao('admin', u.id, u.nome, u.email);
          return { sucesso: true, token: apiRes.token, usuario: u, fonte: 'API' };
        }
      } catch (errApi) {
        console.warn('Erro API login admin:', errApi);
      }
    }

    // 2. Fallback para localStorage
    await DBReady;
    const r = await DB.loginAdmin(email, senha);
    return r.success
      ? { sucesso: true, fonte: 'localStorage' }
      : { sucesso: false, erro: r.error };
  },

  // ── Checar status da API ────────────────────────────
  async checkStatus() {
    if (!window.ApiService) return { online: false, banco: false };
    const h = await ApiService.checkHealth();
    this.isApiMode = h.online && h.bancoConectado;
    return h;
  },

  // ── Stats (Estatísticas com agregação) ───────────────
  async stats() {
    if (window.ApiService) {
      const res = await ApiService.getEstatisticas();
      if (res && res.sucesso && res.dados) {
        this.isApiMode = true;
        const d = res.dados;
        return {
          sucesso: true,
          fonte: 'API PostgreSQL (Neon)',
          stats: {
            clientes: d.total_clientes,
            afiliados: d.total_afiliados,
            cacambas: d.total_cacambas,
            pedidos: d.total_pedidos,
            receita: parseFloat(d.faturamento_total || 0),
            pedidos_concluidos: d.pedidos_concluidos,
            pedidos_pendentes: d.pedidos_pendentes,
            pedidos_entregues: d.pedidos_entregues
          }
        };
      }
    }

    // Fallback localStorage
    return { sucesso: true, fonte: 'localStorage', stats: DB.statsGlobais() };
  },

  // ── Clientes (Consulta agrupada com total de pedidos) ─
  async getClientes() {
    if (window.ApiService) {
      const res = await ApiService.getClientes();
      if (res && res.sucesso && Array.isArray(res.dados)) {
        this.isApiMode = true;
        const clientes = res.dados.map(c => ({
          id: c.id_cliente,
          nome: c.nome,
          email: c.email,
          telefone: c.telefone || '—',
          cep: c.cep || '—',
          endereco: c.endereco || '—',
          pedidos: parseInt(c.total_pedidos || 0, 10),
          ativo: c.ativo !== false,
          criado_em: c.criado_em || new Date().toISOString()
        }));
        return { sucesso: true, total: res.total || clientes.length, clientes, fonte: 'API PostgreSQL' };
      }
    }

    // Fallback localStorage
    const clientes = DB.getClientes().map(c => ({
      ...c,
      pedidos: DB.getPedidos({ clienteId: c.id }).length
    }));
    return { sucesso: true, total: clientes.length, clientes, fonte: 'localStorage' };
  },

  async getCliente(id) {
    if (window.ApiService) {
      const res = await ApiService.getClientePorId(id);
      if (res && res.sucesso && res.dado) {
        const c = res.dado;
        return {
          sucesso: true,
          cliente: {
            id: c.id_cliente,
            nome: c.nome,
            email: c.email,
            telefone: c.telefone,
            cep: c.cep,
            endereco: c.endereco,
            pedidos: parseInt(c.total_pedidos || 0, 10),
            ativo: c.ativo !== false
          }
        };
      }
    }
    const c = DB.getClienteById(id);
    if (!c) return { sucesso: false, erro: 'Cliente não encontrado.' };
    return { sucesso: true, cliente: c };
  },

  async updateCliente(id, dados) {
    const r = await DB.atualizarCliente(id, dados);
    return r.success ? { sucesso: true } : { sucesso: false, erro: r.error };
  },

  deleteCliente(id) {
    DB.deletarCliente(id);
    return { sucesso: true };
  },

  // ── Afiliados (Consulta agrupada com caçambas e pedidos)
  async getAfiliados() {
    if (window.ApiService) {
      const res = await ApiService.getAfiliados();
      if (res && res.sucesso && Array.isArray(res.dados)) {
        this.isApiMode = true;
        const afiliados = res.dados.map(a => ({
          id: a.id_afiliado,
          empresa: a.empresa,
          cnpj: a.cnpj || '—',
          email: a.email || `${a.empresa.toLowerCase().replace(/[^a-z0-9]/g, '')}@afiliado.com`,
          telefone: a.telefone || '—',
          cidade: a.cidade || '',
          estado: a.estado || '',
          cacambas: parseInt(a.total_cacambas || 0, 10),
          pedidos: parseInt(a.total_pedidos || 0, 10),
          ativo: a.ativo !== false,
          criado_em: a.criado_em || new Date().toISOString()
        }));
        return { sucesso: true, total: res.total || afiliados.length, afiliados, fonte: 'API PostgreSQL' };
      }
    }

    // Fallback localStorage
    const afiliados = DB.getAfiliadosCompleto().map(a => ({
      ...a,
      cacambas: DB.getCacambas({ afiliadoId: a.id }).length,
      pedidos:  DB.getPedidos({ afiliadoId: a.id }).length
    }));
    return { sucesso: true, total: afiliados.length, afiliados, fonte: 'localStorage' };
  },

  async getAfiliado(id) {
    if (window.ApiService) {
      const res = await ApiService.getAfiliadoPorId(id);
      if (res && res.sucesso && res.dado) {
        const a = res.dado;
        return {
          sucesso: true,
          afiliado: {
            id: a.id_afiliado,
            empresa: a.empresa,
            cnpj: a.cnpj,
            email: a.email,
            telefone: a.telefone,
            cidade: a.cidade,
            estado: a.estado,
            ativo: a.ativo !== false
          }
        };
      }
    }
    const a = DB.getAfiliadoById(id);
    if (!a) return { sucesso: false, erro: 'Empresa não encontrada.' };
    return { sucesso: true, afiliado: a };
  },

  async updateAfiliado(id, dados) {
    const r = await DB.atualizarAfiliado(id, dados);
    return r.success ? { sucesso: true } : { sucesso: false, erro: r.error };
  },

  deleteAfiliado(id) {
    DB.deletarAfiliado(id);
    return { sucesso: true };
  },

  // ── Caçambas (Consulta no Neon PostgreSQL) ──────────
  async getCacambas() {
    if (window.ApiService) {
      const res = await ApiService.getCacambas();
      if (res && res.sucesso && Array.isArray(res.dados)) {
        this.isApiMode = true;
        const cacambas = res.dados.map(c => ({
          id: c.id_cacamba,
          nome: c.nome || 'Caçamba',
          tipo: c.tipo || 'obra',
          capacidade: c.capacidade || '—',
          dimensoes: c.dimensoes || '—',
          peso_max: c.peso_max || '—',
          preco: parseFloat(c.preco || 0),
          empresa: c.empresa_afiliado || 'Empresa Parceira',
          cidade: c.cidade_afiliado || '—',
          disponivel: c.disponivel !== false
        }));
        return { sucesso: true, total: res.total || cacambas.length, cacambas, fonte: 'API PostgreSQL' };
      }
    }

    // Fallback localStorage
    const cacambas = (typeof DB !== 'undefined') ? DB.getCacambas() : [];
    return { sucesso: true, total: cacambas.length, cacambas, fonte: 'localStorage' };
  },

  // ── Pedidos (Consulta complexa com 4 tabelas + Paginação)
  async getPedidos(page = 1, limit = 10, status = null, ordem = 'asc') {
    if (window.ApiService) {
      const res = await ApiService.getPedidos(page, limit, status, ordem);
      if (res && res.sucesso && Array.isArray(res.dados)) {
        this.isApiMode = true;
        const pedidos = res.dados.map(p => ({
          id: p.pedido_id,
          nomeCliente: p.cliente,
          telefoneCliente: p.cliente_telefone,
          nomeAfiliado: p.empresa,
          nomeCacamba: p.cacamba_nome,
          tipoCacamba: p.cacamba_tipo,
          data: p.data_pedido ? new Date(p.data_pedido).toLocaleDateString('pt-BR') : '—',
          valor: parseFloat(p.valor || 0),
          status: p.status
        }));
        return {
          sucesso: true,
          fonte: 'API PostgreSQL (Neon)',
          pedidos,
          pagina: res.pagina,
          limite: res.limite,
          total: res.total,
          totalPaginas: res.totalPaginas,
          filtroStatus: res.filtroStatus,
          ordem: res.ordem || ordem
        };
      }
    }

    // Fallback localStorage
    const cliMap = {}; DB.getClientes().forEach(c => cliMap[c.id] = c.nome);
    const afMap  = {}; DB.getAfiliadosCompleto().forEach(a => afMap[a.id] = a.empresa);
    const cMap   = {}; DB.getCacambas().forEach(c => cMap[c.id] = c.nome);
    let todos = DB.getPedidos().map(p => ({
      ...p,
      nomeCliente:  cliMap[p.clienteId]  || p.clienteId,
      nomeAfiliado: afMap[p.afiliadoId]  || p.afiliadoId,
      nomeCacamba:  cMap[p.cacambaId]    || p.cacambaId
    }));

    if (status && status !== 'todos') {
      todos = todos.filter(p => p.status === status);
    }

    const total = todos.length;
    const totalPaginas = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const pedidos = todos.slice(offset, offset + limit);

    return {
      sucesso: true,
      fonte: 'localStorage',
      pedidos,
      pagina: page,
      limite: limit,
      total,
      totalPaginas,
      filtroStatus: status || 'todos'
    };
  },

  // ── Visualizador de banco (raw) ────────────────────
  async raw(aba) {
    if (window.ApiService) {
      try {
        if (aba === 'pedidos') {
          const r = await ApiService.getPedidos(1, 100);
          if (r && Array.isArray(r.dados) && r.dados.length > 0) return r.dados;
        }
        if (aba === 'clientes') {
          const r = await ApiService.getClientes();
          if (r && Array.isArray(r.dados) && r.dados.length > 0) return r.dados;
        }
        if (aba === 'afiliados') {
          const r = await ApiService.getAfiliados();
          if (r && Array.isArray(r.dados) && r.dados.length > 0) return r.dados;
        }
        if (aba === 'cacambas') {
          const r = await ApiService.getCacambas();
          if (r && Array.isArray(r.dados) && r.dados.length > 0) return r.dados;
        }
        if (aba === 'estatisticas') {
          const r = await ApiService.getEstatisticas();
          if (r && r.dados) return r.dados;
        }
      } catch (e) {
        console.warn('Erro ao consultar raw da API:', e);
      }
    }

    const mapa = {
      clientes:  (typeof DB !== 'undefined') ? DB.getClientes() : [],
      afiliados: (typeof DB !== 'undefined') ? DB.getAfiliadosCompleto() : [],
      pedidos:   (typeof DB !== 'undefined') ? DB.getPedidos() : [],
      cacambas:  (typeof DB !== 'undefined') ? DB.getCacambas() : []
    };
    return mapa[aba] || [];
  },

  // Exportar todo o banco como JSON (download)
  async exportar() {
    let dump = null;
    if (window.ApiService) {
      try {
        const [c, a, ca, p, s] = await Promise.all([
          ApiService.getClientes(),
          ApiService.getAfiliados(),
          ApiService.getCacambas(),
          ApiService.getPedidos(1, 100),
          ApiService.getEstatisticas()
        ]);
        if (c?.dados?.length || a?.dados?.length || p?.dados?.length) {
          dump = {
            origem: 'API PostgreSQL (Neon)',
            exportado_em: new Date().toISOString(),
            estatisticas: s?.dados || null,
            clientes: c?.dados || [],
            afiliados: a?.dados || [],
            cacambas: ca?.dados || [],
            pedidos: p?.dados || []
          };
        }
      } catch (e) {
        console.warn('Erro exportar API:', e);
      }
    }

    if (!dump) {
      dump = {
        origem: 'localStorage',
        exportado_em: new Date().toISOString(),
        clientes:  (typeof DB !== 'undefined') ? DB.getClientes() : [],
        afiliados: (typeof DB !== 'undefined') ? DB.getAfiliadosCompleto() : [],
        cacambas:  (typeof DB !== 'undefined') ? DB.getCacambas() : [],
        pedidos:   (typeof DB !== 'undefined') ? DB.getPedidos() : []
      };
    }

    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'locafacil-database.json';
    a.click();
    URL.revokeObjectURL(url);
  }
};

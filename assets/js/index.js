// assets/js/index.js
// Lógica da página principal: modal de CEP, busca por localidade, header dinâmico

const ICONS = {
  obra:'fa-hard-hat', organico:'fa-seedling', moveis:'fa-couch',
  gesso:'fa-palette', vidro:'fa-wine-glass', plastico:'fa-recycle'
};

// ── Modal CEP ─────────────────────────────────────────
function fecharCep() {
  document.getElementById('modalCep').classList.remove('open');
  document.getElementById('divRes').style.display = 'none';
  document.getElementById('inputCep').value = '';
  document.getElementById('cepStatus').style.display = 'none';
}
document.getElementById('modalCep').addEventListener('click', function (e) {
  if (e.target === this) fecharCep();
});
document.getElementById('inputCep').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '');
  if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8);
  this.value = v;
});
document.getElementById('inputCep').addEventListener('keydown', e => {
  if (e.key === 'Enter') buscarCep();
});

// ── Busca real por CEP via ViaCEP + API backend ───────
async function buscarCep() {
  const cep = document.getElementById('inputCep').value.replace(/\D/g, '');
  if (cep.length < 8) { alert('Digite um CEP válido (8 dígitos).'); return; }

  const btnBuscar = document.getElementById('btnBuscarCep');
  const status    = document.getElementById('cepStatus');
  const divRes    = document.getElementById('divRes');

  btnBuscar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
  btnBuscar.disabled  = true;
  status.style.display = 'block';
  status.className     = 'cep-status loading';
  status.innerHTML     = '<i class="fas fa-spinner fa-spin"></i> Consultando localização...';
  divRes.style.display = 'none';

  let cidadeApi = '', estadoApi = '';

  try {
    // 1. Consultar ViaCEP para obter cidade/estado
    const viacepRes = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const viacep    = await viacepRes.json();

    if (viacep.erro) {
      status.className = 'cep-status error';
      status.innerHTML = '<i class="fas fa-exclamation-circle"></i> CEP não encontrado. Verifique e tente novamente.';
      btnBuscar.innerHTML = '<i class="fas fa-search"></i> Buscar';
      btnBuscar.disabled  = false;
      return;
    }

    cidadeApi = viacep.localidade || '';
    estadoApi = viacep.uf        || '';
    status.className = 'cep-status success';
    status.innerHTML = `<i class="fas fa-map-marker-alt"></i> <strong>${cidadeApi} — ${estadoApi}</strong>${viacep.bairro ? ' · ' + viacep.bairro : ''}`;

    // 2. Buscar caçambas via API PostgreSQL com fallback para localStorage
    let cacambas = [];
    if (window.ApiService) {
      try {
        const resApi = await ApiService.getCacambas();
        if (resApi && resApi.sucesso && Array.isArray(resApi.dados)) {
          const cidNorm = (cidadeApi || '').toLowerCase().trim();
          const filtradas = resApi.dados.filter(c => 
            !cidNorm || (c.cidade_afiliado && c.cidade_afiliado.toLowerCase().includes(cidNorm))
          );
          cacambas = (filtradas.length > 0 ? filtradas : resApi.dados.slice(0, 4)).map(c => ({
            id: c.id_cacamba,
            nome: c.nome,
            tipo: c.tipo || 'obra',
            capacidade: c.capacidade,
            dimensoes: c.dimensoes,
            preco: parseFloat(c.preco || 0),
            empresa: c.empresa_afiliado || 'Empresa Afiliada'
          }));
        }
      } catch (errApi) {
        console.warn('Erro ao consultar caçambas na API:', errApi);
      }
    }

    if (!cacambas.length) {
      await DBReady;
      cacambas = DB.buscarCacambasPorLocalidade(cidadeApi, estadoApi, parseInt(cep, 10));
    }

    // 3. Renderizar resultados
    const titulo = document.getElementById('resTitulo');
    const lista  = document.getElementById('resLista');
    const msgCta = document.getElementById('msgCta');
    const sess   = DB.getSession();

    if (!cacambas.length) {
      titulo.textContent = 'Nenhuma caçamba disponível nessa região no momento.';
      lista.innerHTML    = '';
    } else {
      titulo.textContent = `${cacambas.length} caçamba${cacambas.length > 1 ? 's' : ''} disponível${cacambas.length > 1 ? 'is' : ''} perto de você:`;
      lista.innerHTML = cacambas.map(c => `
        <div class="card-res">
          <div class="ico"><i class="fas ${ICONS[c.tipo] || 'fa-dumpster'}"></i></div>
          <div class="info">
            <h5>${c.nome}</h5>
            <span>${c.capacidade || ''}${c.dimensoes ? ' · ' + c.dimensoes : ''}${c.empresa ? ' · ' + c.empresa : ''}</span>
          </div>
          <div class="preco">R$ ${c.preco}/sem</div>
        </div>`).join('');
    }

    // CTA: se logado, ir ao dashboard; se não, fazer login
    if (sess && sess.tipo === 'cliente') {
      msgCta.innerHTML = `Olá, <strong>${sess.nome.split(' ')[0]}</strong>! <a href="pages/cliente/dashboard.html">Acesse seu painel</a> para alugar.`;
    } else {
      msgCta.innerHTML = `Quer alugar? <a href="pages/cliente/login.html" class="cta-login-link">Entre ou cadastre-se</a> para finalizar seu pedido.`;
    }

    divRes.style.display = 'block';

  } catch (e) {
    status.className = 'cep-status error';
    status.innerHTML = '<i class="fas fa-wifi"></i> Erro de conexão. Verifique sua internet.';
    console.error(e);
  }

  btnBuscar.innerHTML = '<i class="fas fa-search"></i> Buscar';
  btnBuscar.disabled  = false;
}

// ── Header dinâmico (mostra nome do usuário logado) ───
(function () {
  try {
    let s = null;
    if (typeof DB !== 'undefined' && DB.getSession) {
      s = DB.getSession();
    } else {
      const raw = localStorage.getItem('lf_session');
      if (raw) {
        try {
          s = JSON.parse(raw);
        } catch {
          s = JSON.parse(decodeURIComponent(escape(atob(raw))));
        }
      }
    }
    if (s && s.tipo === 'cliente' && s.nome) {
      const btn = document.getElementById('btnHeaderLogin');
      if (btn) {
        btn.href = 'pages/cliente/dashboard.html';
        const elTxt = document.getElementById('headerLoginTxt');
        if (elTxt) elTxt.textContent = s.nome.split(' ')[0];
      }
    }
  } catch (err) {
    console.warn('Erro ao ler sessão do header:', err);
  }
})();

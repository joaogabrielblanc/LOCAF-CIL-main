// ===== FAQ ACCORDION =====
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const pergunta = item.querySelector('.faq-pergunta');
  
  pergunta.addEventListener('click', () => {
    // Fechar outros itens
    faqItems.forEach(otherItem => {
      if (otherItem !== item && otherItem.classList.contains('ativo')) {
        otherItem.classList.remove('ativo');
      }
    });
    
    // Toggle do item clicado
    item.classList.toggle('ativo');
  });
});

// ===== FORMULÁRIO DE CONTATO =====
const formContato = document.getElementById('form-contato');
const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoTelefone = document.getElementById('telefone');
const campoAssunto = document.getElementById('assunto');
const campoProtocolo = document.getElementById('protocolo');
const campoMensagem = document.getElementById('mensagem');

// Máscara para telefone
campoTelefone.addEventListener('input', function(e) {
  let valor = e.target.value.replace(/\D/g, '');
  
  if (valor.length <= 11) {
    valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
    valor = valor.replace(/(\d)(\d{4})$/, '$1-$2');
  }
  
  e.target.value = valor;
});

// Validação e envio do formulário
formContato.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Validações
  if (!validarEmail(campoEmail.value)) {
    mostrarAlerta('Por favor, insira um e-mail válido!', 'erro');
    campoEmail.focus();
    return;
  }
  
  if (campoTelefone.value.replace(/\D/g, '').length < 10) {
    mostrarAlerta('Por favor, insira um telefone válido!', 'erro');
    campoTelefone.focus();
    return;
  }
  
  if (campoMensagem.value.trim().length < 20) {
    mostrarAlerta('A mensagem deve ter pelo menos 20 caracteres!', 'erro');
    campoMensagem.focus();
    return;
  }
  
  // Gerar número de protocolo
  const protocolo = gerarProtocolo();
  
  // Salvar no localStorage
  salvarSolicitacao({
    protocolo: protocolo,
    nome: campoNome.value,
    email: campoEmail.value,
    telefone: campoTelefone.value,
    assunto: campoAssunto.value,
    protocoloAnterior: campoProtocolo.value,
    mensagem: campoMensagem.value,
    data: new Date().toLocaleString('pt-BR')
  });
  
  // Limpar formulário
  formContato.reset();
  
  // Mostrar mensagem de sucesso com protocolo
  mostrarAlerta(
    `Mensagem enviada com sucesso! 
    Seu número de protocolo é: <strong>${protocolo}</strong>
    <br>Retornaremos em até 24 horas úteis.`,
    'sucesso'
  );
  
  // Scroll para o topo
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== FUNÇÕES AUXILIARES =====

// Validar e-mail
function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Gerar número de protocolo
function gerarProtocolo() {
  const prefixo = 'LOCA';
  const numero = Math.floor(100000 + Math.random() * 900000);
  return `${prefixo}${numero}`;
}

// Salvar solicitação
function salvarSolicitacao(dados) {
  let solicitacoes = JSON.parse(localStorage.getItem('solicitacoes_suporte')) || [];
  solicitacoes.push(dados);
  localStorage.setItem('solicitacoes_suporte', JSON.stringify(solicitacoes));
}

// Mostrar alerta personalizado
function mostrarAlerta(mensagem, tipo) {
  const alerta = document.createElement('div');
  alerta.className = `alerta alerta-${tipo}`;
  alerta.innerHTML = `
    <div class="alerta-content">
      <span class="alerta-icon">${tipo === 'sucesso' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-triangle"></i>'}</span>
      <div class="alerta-texto">${mensagem}</div>
      <button class="alerta-fechar" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  document.body.appendChild(alerta);
  
  // Remover automaticamente após 8 segundos
  setTimeout(() => {
    if (alerta.parentElement) {
      alerta.style.opacity = '0';
      alerta.style.transform = 'translateY(-20px)';
      setTimeout(() => alerta.remove(), 300);
    }
  }, 8000);
}

// Adicionar estilos para alertas
const estiloAlertas = document.createElement('style');
estiloAlertas.textContent = `
  .alerta {
    position: fixed;
    top: 100px;
    right: 20px;
    max-width: 450px;
    z-index: 10000;
    animation: slideInRight 0.5s ease;
    opacity: 1;
    transform: translateY(0);
    transition: all 0.3s ease;
  }
  
  .alerta-content {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    padding: 20px 25px;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }
  
  .alerta-sucesso .alerta-content {
    background: linear-gradient(135deg, #4CAF50 0%, #2d6a4f 100%);
    color: white;
  }
  
  .alerta-erro .alerta-content {
    background: linear-gradient(135deg, #f44336 0%, #c62828 100%);
    color: white;
  }
  
  .alerta-icon {
    font-size: 28px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .alerta-texto {
    flex: 1;
    line-height: 1.6;
    font-size: 15px;
  }
  
  .alerta-fechar {
    background: none;
    border: none;
    color: white;
    font-size: 28px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    opacity: 0.8;
    transition: opacity 0.3s ease;
  }
  
  .alerta-fechar:hover {
    opacity: 1;
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @media (max-width: 768px) {
    .alerta {
      right: 10px;
      left: 10px;
      max-width: none;
    }
  }
`;
document.head.appendChild(estiloAlertas);

// ===== CONTADOR DE CARACTERES NA MENSAGEM =====
campoMensagem.addEventListener('input', function() {
  const minLength = 20;
  const maxLength = 1000;
  const currentLength = this.value.length;
  
  let contador = document.getElementById('contador-mensagem');
  
  if (!contador) {
    contador = document.createElement('div');
    contador.id = 'contador-mensagem';
    contador.style.cssText = `
      text-align: right;
      font-size: 13px;
      color: #666;
      margin-top: 8px;
      font-weight: 500;
    `;
    this.parentElement.appendChild(contador);
  }
  
  if (currentLength < minLength) {
    contador.textContent = `Mínimo de ${minLength} caracteres (faltam ${minLength - currentLength})`;
    contador.style.color = '#f44336';
  } else if (currentLength > maxLength) {
    contador.textContent = `Máximo de ${maxLength} caracteres excedido!`;
    contador.style.color = '#f44336';
    this.value = this.value.substring(0, maxLength);
  } else {
    contador.textContent = `${currentLength}/${maxLength} caracteres`;
    contador.style.color = '#4CAF50';
  }
});

// ===== SCROLL SUAVE PARA LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    
    if (target) {
      const offsetTop = target.offsetTop - 20;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// ===== ANIMAÇÃO AO SCROLL =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observar elementos que devem animar
document.querySelectorAll('.canal-card, .timeline-item, .reclamacao-card, .faq-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'all 0.6s ease';
  observer.observe(el);
});

// ===== HIGHLIGHT NO NÚMERO 0800 AO CLICAR =====
const numero0800 = document.querySelector('.numero-0800');

numero0800.addEventListener('click', function(e) {
  e.preventDefault();
  
  // Copiar para clipboard
  const numeroLimpo = this.textContent.replace(/\s/g, '');
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(numeroLimpo).then(() => {
      mostrarAlerta('Número copiado para a área de transferência!', 'sucesso');
    });
  }
  
  // Animação de pulso
  this.style.animation = 'none';
  setTimeout(() => {
    this.style.animation = 'pulse 0.5s ease';
  }, 10);
});

// ===== VALIDAÇÃO EM TEMPO REAL =====
campoEmail.addEventListener('blur', function() {
  if (this.value && !validarEmail(this.value)) {
    this.style.borderColor = '#f44336';
  } else {
    this.style.borderColor = '#4CAF50';
  }
});

campoEmail.addEventListener('focus', function() {
  this.style.borderColor = '#4CAF50';
});

// ===== CONSOLE LOG INICIAL =====
console.log('✓ Sistema de Suporte LocaFácil carregado com sucesso!');
console.log('📞 Central: 0800 600 6000');

// Verificar solicitações salvas
const solicitacoesSalvas = JSON.parse(localStorage.getItem('solicitacoes_suporte')) || [];
console.log(`📋 Total de solicitações registradas: ${solicitacoesSalvas.length}`);

console.log('%c🚀 LocaFácil - Sistema de Suporte Ativo', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
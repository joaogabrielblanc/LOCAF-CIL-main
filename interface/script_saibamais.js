// ===== EFEITO DE SCROLL NO HEADER =====
window.addEventListener('scroll', function() {
  const header = document.getElementById('header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ===== SISTEMA DE COMENTÁRIOS =====
const formulario = document.getElementById('formulario-comentario');
const campoNome = document.getElementById('campo-nome');
const campoComentario = document.getElementById('campo-comentario');
const comentariosContainer = document.getElementById('comentarios-existentes');

// Carregar comentários salvos do localStorage
let comentarios = JSON.parse(localStorage.getItem('comentarios')) || [];

// Função para renderizar comentários
function renderizarComentarios() {
  if (comentarios.length === 0) {
    comentariosContainer.innerHTML = '<p class="sem-comentarios">Seja o primeiro a comentar!</p>';
    return;
  }

  comentariosContainer.innerHTML = '';
  
  comentarios.forEach((comentario, index) => {
    const comentarioDiv = document.createElement('div');
    comentarioDiv.className = 'comentario-item';
    comentarioDiv.style.animationDelay = `${index * 0.1}s`;
    
    comentarioDiv.innerHTML = `
      <div class="comentario-nome">${comentario.nome}</div>
      <div class="comentario-texto">${comentario.texto}</div>
      <div class="comentario-data">${comentario.data}</div>
    `;
    
    comentariosContainer.appendChild(comentarioDiv);
  });
}

// Adicionar estilo para data do comentário
const style = document.createElement('style');
style.textContent = `
  .comentario-data {
    font-size: 12px;
    color: #999;
    margin-top: 8px;
    font-style: italic;
  }
  
  .comentario-item {
    animation: slideInComment 0.5s ease forwards;
    opacity: 0;
  }
  
  @keyframes slideInComment {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(style);

// Evento de envio do formulário
formulario.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const nome = campoNome.value.trim();
  const texto = campoComentario.value.trim();
  
  if (nome === '' || texto === '') {
    alert('Por favor, preencha todos os campos!');
    return;
  }
  
  // Criar objeto do comentário
  const novoComentario = {
    nome: nome,
    texto: texto,
    data: new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  
  // Adicionar ao array
  comentarios.unshift(novoComentario); // Adiciona no início
  
  // Salvar no localStorage
  localStorage.setItem('comentarios', JSON.stringify(comentarios));
  
  // Renderizar novamente
  renderizarComentarios();
  
  // Limpar campos
  campoNome.value = '';
  campoComentario.value = '';
  
  // Mostrar mensagem de sucesso
  mostrarMensagem('Comentário enviado com sucesso! ✓');
  
  // Scroll suave até os comentários
  comentariosContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Função para mostrar mensagem de feedback
function mostrarMensagem(mensagem) {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = mensagem;
  msgDiv.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideInRight 0.5s ease, fadeOut 0.5s ease 2.5s forwards;
    font-weight: 600;
  `;
  
  document.body.appendChild(msgDiv);
  
  setTimeout(() => {
    msgDiv.remove();
  }, 3000);
}

// Adicionar animação de fadeOut
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
  @keyframes fadeOut {
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(fadeOutStyle);

// ===== ANIMAÇÃO DE SCROLL SUAVE PARA LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    
    if (target) {
      const offsetTop = target.offsetTop - 20; // Ajuste reduzido
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// ===== OBSERVER PARA ANIMAÇÕES AO SCROLL =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observar cards
document.querySelectorAll('.card-linha').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(50px)';
  card.style.transition = 'all 0.6s ease';
  observer.observe(card);
});

// ===== INICIALIZAÇÃO =====
// Renderizar comentários ao carregar a página
renderizarComentarios();

// ===== EFEITO DE PARALLAX NO HERO (REMOVIDO) =====
// Removido para melhor performance

// ===== CONTADOR DE CARACTERES NO TEXTAREA =====
campoComentario.addEventListener('input', function() {
  const maxLength = 500;
  const currentLength = this.value.length;
  
  let contador = document.getElementById('contador-caracteres');
  
  if (!contador) {
    contador = document.createElement('div');
    contador.id = 'contador-caracteres';
    contador.style.cssText = `
      text-align: right;
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    `;
    this.parentElement.appendChild(contador);
  }
  
  contador.textContent = `${currentLength}/${maxLength} caracteres`;
  
  if (currentLength > maxLength) {
    contador.style.color = '#f44336';
    this.value = this.value.substring(0, maxLength);
  } else if (currentLength > maxLength * 0.9) {
    contador.style.color = '#ff9800';
  } else {
    contador.style.color = '#666';
  }
});

// ===== LOG DE INICIALIZAÇÃO =====
console.log('✓ Sistema de descarte consciente carregado com sucesso!');
console.log(`✓ Total de comentários: ${comentarios.length}`);
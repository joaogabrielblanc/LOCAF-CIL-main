// Aguarda o carregamento completo da página
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== ELEMENTOS DO DOM =====
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const searchBtn = document.getElementById('searchBtn');
    const searchBtnMobile = document.getElementById('searchBtnMobile');
    const searchInput = document.getElementById('searchInput');
    const searchInputMobile = document.getElementById('searchInputMobile');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    // ===== HEADER SCROLL EFFECT =====
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.08)';
        }
    });

    // ===== MOBILE MENU TOGGLE =====
    mobileMenuToggle.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        const icon = this.querySelector('i');
        
        if (mobileMenu.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });

    // Fechar menu ao clicar em um link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            mobileMenuToggle.querySelector('i').className = 'fas fa-bars';
        });
    });

    // ===== SEARCH FUNCTIONALITY =====
    function performSearch(inputElement) {
        const searchTerm = inputElement.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            showNotification('Digite algo para pesquisar!', 'warning');
            return;
        }
        
        // Simula busca por tipos de caçamba
        const searchResults = searchCaçambas(searchTerm);
        displaySearchResults(searchResults);
        
        // Limpa o campo de pesquisa
        inputElement.value = '';
        inputElement.blur();
    }
    
    // Função de busca simulada
    function searchCaçambas(term) {
        const caçambas = [
            { type: 'obra', name: 'Resíduos de Obra', keywords: ['obra', 'construção', 'entulho', 'reforma', 'tijolo', 'cimento'] },
            { type: 'orgânico', name: 'Resíduos Orgânicos', keywords: ['orgânico', 'vegetação', 'folhas', 'galhos', 'jardim', 'poda'] },
            { type: 'móveis', name: 'Móveis e Objetos', keywords: ['móveis', 'sofá', 'mesa', 'objetos', 'cadeira', 'armário'] },
            { type: 'gesso', name: 'Resíduos de Gesso', keywords: ['gesso', 'parede', 'drywall', 'reboco'] },
            { type: 'vidro', name: 'Resíduos de Vidro', keywords: ['vidro', 'janela', 'espelho', 'vidraça'] },
            { type: 'plástico', name: 'Resíduos Plásticos', keywords: ['plástico', 'garrafa', 'embalagem', 'pet', 'reciclagem'] }
        ];
        
        return caçambas.filter(caçamba => 
            caçamba.keywords.some(keyword => keyword.includes(term)) ||
            caçamba.name.toLowerCase().includes(term)
        );
    }
    
    // Exibe resultados da pesquisa
    function displaySearchResults(results) {
        if (results.length === 0) {
            showNotification('Nenhuma caçamba encontrada para este tipo de resíduo.', 'info');
            return;
        }
        
        // Rola para a seção de serviços
        document.getElementById('services').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Destaca os cards encontrados
        highlightServiceCards(results);
        
        showNotification(`${results.length} tipo(s) de caçamba encontrado(s)!`, 'success');
    }
    
    // Destaca cards de serviço
    function highlightServiceCards(results) {
        const serviceCards = document.querySelectorAll('.service-card');
        
        // Remove destaque anterior
        serviceCards.forEach(card => {
            card.style.border = '';
            card.style.animation = '';
        });
        
        // Adiciona destaque aos resultados
        results.forEach(result => {
            serviceCards.forEach(card => {
                const cardTitle = card.querySelector('h3').textContent.toLowerCase();
                if (cardTitle.includes(result.type) || cardTitle.includes(result.name.toLowerCase())) {
                    card.style.border = '2px solid #4a7c59';
                    card.style.animation = 'pulse 2s ease-in-out';
                    setTimeout(() => {
                        card.style.animation = '';
                    }, 2000);
                }
            });
        });
    }
    
    // Event listeners para pesquisa - Desktop
    searchBtn.addEventListener('click', () => performSearch(searchInput));
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch(searchInput);
        }
    });
    
    // Event listeners para pesquisa - Mobile
    searchBtnMobile.addEventListener('click', () => performSearch(searchInputMobile));
    searchInputMobile.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch(searchInputMobile);
        }
    });

    // ===== SMOOTH SCROLLING =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ===== WHATSAPP BUTTON =====
    whatsappBtn.addEventListener('click', function() {
        const message = encodeURIComponent('Olá! Gostaria de solicitar uma caçamba. Podem me ajudar?');
        window.open(`https://wa.me/5524999999999?text=${message}`, '_blank');
    });

    // ===== ANIMATIONS ON SCROLL =====
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
    
    // Observa elementos para animação
    const animatedElements = document.querySelectorAll('.feature-card, .service-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // ===== NOTIFICATION SYSTEM =====
    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        
        // Define a classe de tipo
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Remove a classe hidden para mostrar
        notification.classList.remove('hidden');
        
        // Esconde após 4 segundos
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 4000);
    }

    // ===== BUTTON INTERACTIONS =====
    
    // Botão de calcular orçamento
    const btnPrimary = document.querySelector('.btn-primary');
    if (btnPrimary) {
        btnPrimary.addEventListener('click', function() {
            showQuoteModal('Orçamento Geral');
        });
    }
    
    // Botão "Ver Como Funciona"
    const btnSecondary = document.querySelector('.btn-secondary');
    if (btnSecondary) {
        btnSecondary.addEventListener('click', function() {
            showHowItWorksModal();
        });
    }
    
    // Botões "Saiba Mais" dos serviços - mantém o comportamento original
    // Eles já têm onclick="location.href='...'" no HTML

    // ===== ANIMAÇÃO DE PULSO =====
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
    `;
    document.head.appendChild(style);

    // ===== MODAL FUNCTIONS =====
    
    function showQuoteModal(serviceType) {
        const modal = createModal(`
            <div class="modal-content-inner">
                <h3>Solicitar Orçamento - ${serviceType}</h3>
                <form class="quote-form" id="quoteForm">
                    <div class="form-group">
                        <label>Nome Completo:</label>
                        <input type="text" name="nome" required>
                    </div>
                    <div class="form-group">
                        <label>Telefone:</label>
                        <input type="tel" name="telefone" required>
                    </div>
                    <div class="form-group">
                        <label>E-mail:</label>
                        <input type="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label>Endereço de Entrega:</label>
                        <textarea rows="3" name="endereco" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Tipo de Material:</label>
                        <select name="material" required>
                            <option value="">Selecione...</option>
                            <option value="obra">Resíduos de Obra</option>
                            <option value="organico">Resíduos Orgânicos</option>
                            <option value="moveis">Móveis e Objetos</option>
                            <option value="gesso">Resíduos de Gesso</option>
                            <option value="vidro">Resíduos de Vidro</option>
                            <option value="plastico">Resíduos Plásticos</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel">Cancelar</button>
                        <button type="submit" class="btn-submit">Solicitar Orçamento</button>
                    </div>
                </form>
            </div>
        `);
        
        // Event listeners do modal
        modal.querySelector('.btn-cancel').addEventListener('click', () => closeModal(modal));
        modal.querySelector('#quoteForm').addEventListener('submit', function(e) {
            e.preventDefault();
            handleQuoteSubmission(e, modal);
        });
    }
    
    function showHowItWorksModal() {
        const modal = createModal(`
            <div class="modal-content-inner">
                <h3>Como Funciona</h3>
                <div class="steps-container">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h4>Solicite</h4>
                            <p>Faça sua solicitação através do site ou WhatsApp informando o tipo de resíduo.</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h4>Entregamos</h4>
                            <p>Entregamos a caçamba no local e horário que você preferir.</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h4>Coletamos</h4>
                            <p>Após o período combinado, coletamos a caçamba cheia.</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <h4>Destinamos</h4>
                            <p>Fazemos o descarte correto e sustentável dos materiais.</p>
                        </div>
                    </div>
                </div>
                <button class="btn-close">Entendi!</button>
            </div>
        `);
        
        modal.querySelector('.btn-close').addEventListener('click', () => closeModal(modal));
    }
    
    function createModal(content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = content;
        
        document.body.appendChild(modal);
        
        // Fecha modal ao clicar fora
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
        
        return modal;
    }
    
    function closeModal(modal) {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    function handleQuoteSubmission(e, modal) {
        e.preventDefault();
        
        // Simula envio do formulário
        showNotification('Orçamento solicitado com sucesso! Entraremos em contato em breve.', 'success');
        
        // Fecha modal
        closeModal(modal);
    }

});
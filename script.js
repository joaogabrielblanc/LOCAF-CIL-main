// Aguarda o carregamento completo da página
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== HEADER INTERACTIONS =====
    
    // Scroll effect no header
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

    // ===== SEARCH FUNCTIONALITY =====
    
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    // Funcionalidade da barra de pesquisa
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            showNotification('Digite algo para pesquisar!', 'warning');
            return;
        }
        
        // Simula busca por tipos de caçamba
        const searchResults = searchCaçambas(searchTerm);
        displaySearchResults(searchResults);
        
        // Limpa o campo de pesquisa
        searchInput.value = '';
        searchInput.blur();
    }
    
    // Função de busca simulada
    function searchCaçambas(term) {
        const caçambas = [
            { type: 'obra', name: 'Resíduos de Obra', keywords: ['obra', 'construção', 'entulho', 'reforma'] },
            { type: 'orgânico', name: 'Resíduos Orgânicos', keywords: ['orgânico', 'vegetação', 'folhas', 'galhos'] },
            { type: 'móveis', name: 'Móveis e Objetos', keywords: ['móveis', 'sofá', 'mesa', 'objetos'] },
            { type: 'gesso', name: 'Resíduos de Gesso', keywords: ['gesso', 'parede', 'drywall'] },
            { type: 'vidro', name: 'Resíduos de Vidro', keywords: ['vidro', 'janela', 'espelho'] },
            { type: 'plástico', name: 'Resíduos Plásticos', keywords: ['plástico', 'garrafa', 'embalagem'] }
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
            card.classList.remove('highlighted');
        });
        
        // Adiciona destaque aos resultados
        results.forEach(result => {
            serviceCards.forEach(card => {
                const cardTitle = card.querySelector('h3').textContent.toLowerCase();
                if (cardTitle.includes(result.type) || cardTitle.includes(result.name.toLowerCase())) {
                    card.classList.add('highlighted');
                    // Adiciona animação de destaque
                    card.style.animation = 'pulse 2s ease-in-out';
                    setTimeout(() => {
                        card.style.animation = '';
                    }, 2000);
                }
            });
        });
    }
    
    // Event listeners para pesquisa
    searchBtn.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Foco automático na pesquisa com Ctrl+F
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
    });

    // ===== MOBILE MENU =====
    
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    mobileToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        const icon = this.querySelector('i');
        
        if (navMenu.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });

    // ===== SMOOTH SCROLLING =====
    
    // Navegação suave para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Fecha menu mobile se estiver aberto
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    mobileToggle.querySelector('i').className = 'fas fa-bars';
                }
            }
        });
    });

    // ===== ANIMATIONS ON SCROLL =====
    
    // Cria observer para animações no scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observa elementos para animação
    const animatedElements = document.querySelectorAll(
        '.feature-card, .service-card, .contact-section'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // ===== BUTTON INTERACTIONS =====
    
    // Botões de orçamento
    document.querySelectorAll('.service-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const serviceType = this.closest('.service-card').querySelector('h3').textContent;
            showQuoteModal(serviceType);
        });
    });
    
    // Botão WhatsApp do footer
    document.querySelector('.whatsapp-btn').addEventListener('click', function() {
        const message = encodeURIComponent('Olá! Gostaria de solicitar uma caçamba. Podem me ajudar?');
        window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
    });
    
    // Botão de calcular orçamento
    document.querySelector('.btn-primary').addEventListener('click', function() {
        showQuoteModal('Orçamento Geral');
    });
    
    // Botão "Ver Como Funciona"
    document.querySelector('.btn-secondary').addEventListener('click', function() {
        showHowItWorksModal();
    });
    
    // Botão CTA do header
    document.querySelector('.cta-btn').addEventListener('click', function() {
        showQuoteModal('Solicitação Rápida');
    });
    
    // Botão WhatsApp
    document.querySelector('.contact-btn').addEventListener('click', function() {
        const message = encodeURIComponent('Olá! Gostaria de solicitar uma caçamba. Podem me ajudar?');
        window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
    });

    // ===== MODAL FUNCTIONS =====
    
    function showQuoteModal(serviceType) {
        const modal = createModal(`
            <div class="modal-content">
                <h3>Solicitar Orçamento - ${serviceType}</h3>
                <form class="quote-form">
                    <div class="form-group">
                        <label>Nome Completo:</label>
                        <input type="text" required>
                    </div>
                    <div class="form-group">
                        <label>Telefone:</label>
                        <input type="tel" required>
                    </div>
                    <div class="form-group">
                        <label>E-mail:</label>
                        <input type="email" required>
                    </div>
                    <div class="form-group">
                        <label>Endereço de Entrega:</label>
                        <textarea rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Tipo de Material:</label>
                        <select required>
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
        modal.querySelector('.quote-form').addEventListener('submit', handleQuoteSubmission);
    }
    
    function showHowItWorksModal() {
        const modal = createModal(`
            <div class="modal-content">
                <h3>Como Funciona</h3>
                <div class="steps-container">
                    <div class="step">
                        <div class="step-number">1</div>
                        <h4>Solicite</h4>
                        <p>Faça sua solicitação através do site ou WhatsApp informando o tipo de resíduo.</p>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <h4>Entregamos</h4>
                        <p>Entregamos a caçamba no local e horário que você preferir.</p>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <h4>Coletamos</h4>
                        <p>Após o período combinado, coletamos a caçamba cheia.</p>
                    </div>
                    <div class="step">
                        <div class="step-number">4</div>
                        <h4>Destinamos</h4>
                        <p>Fazemos o descarte correto e sustentável dos materiais.</p>
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
        
        // Adiciona estilos do modal
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease-out;
            }
            
            .modal-content {
                background: white;
                border-radius: 15px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                animation: slideIn 0.3s ease-out;
            }
            
            .modal-content h3 {
                color: #2d5a3d;
                margin-bottom: 25px;
                text-align: center;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 600;
                color: #333;
            }
            
            .form-group input,
            .form-group textarea,
            .form-group select {
                width: 100%;
                padding: 10px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }
            
            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: #4a7c59;
            }
            
            .form-actions {
                display: flex;
                gap: 15px;
                justify-content: flex-end;
                margin-top: 30px;
            }
            
            .btn-cancel, .btn-submit, .btn-close {
                padding: 10px 20px;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
            }
            
            .btn-cancel {
                background: #e0e0e0;
                color: #666;
            }
            
            .btn-submit, .btn-close {
                background: linear-gradient(135deg, #4a7c59, #7fb069);
                color: white;
            }
            
            .btn-cancel:hover {
                background: #d0d0d0;
            }
            
            .btn-submit:hover, .btn-close:hover {
                background: linear-gradient(135deg, #2d5a3d, #4a7c59);
                transform: translateY(-2px);
            }
            
            .steps-container {
                display: grid;
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .step {
                display: flex;
                align-items: flex-start;
                gap: 15px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 10px;
            }
            
            .step-number {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #4a7c59, #7fb069);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                flex-shrink: 0;
            }
            
            .step h4 {
                margin-bottom: 5px;
                color: #2d5a3d;
            }
            
            .step p {
                color: #666;
                line-height: 1.5;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { 
                    opacity: 0; 
                    transform: translateY(-20px) scale(0.95); 
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0) scale(1); 
                }
            }
        `;
        
        document.head.appendChild(style);
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
    
    function handleQuoteSubmission(e) {
        e.preventDefault();
        
        // Simula envio do formulário
        showNotification('Orçamento solicitado com sucesso! Entraremos em contato em breve.', 'success');
        
        // Fecha modal
        const modal = e.target.closest('.modal-overlay');
        closeModal(modal);
    }

    // ===== NOTIFICATION SYSTEM =====
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
            error: 'fas fa-times-circle'
        };
        
        notification.innerHTML = `
            <i class="${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        // Adiciona estilos da notificação
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                border-radius: 10px;
                padding: 15px 20px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                animation: slideInRight 0.3s ease-out;
                max-width: 400px;
            }
            
            .notification-success { border-left: 4px solid #4CAF50; }
            .notification-warning { border-left: 4px solid #FF9800; }
            .notification-info { border-left: 4px solid #2196F3; }
            .notification-error { border-left: 4px solid #F44336; }
            
            .notification i {
                font-size: 1.2rem;
            }
            
            .notification-success i { color: #4CAF50; }
            .notification-warning i { color: #FF9800; }
            .notification-info i { color: #2196F3; }
            .notification-error i { color: #F44336; }
            
            @keyframes slideInRight {
                from { 
                    opacity: 0; 
                    transform: translateX(100%); 
                }
                to { 
                    opacity: 1; 
                    transform: translateX(0); 
                }
            }
            
            @keyframes slideOutRight {
                from { 
                    opacity: 1; 
                    transform: translateX(0); 
                }
                to { 
                    opacity: 0; 
                    transform: translateX(100%); 
                }
            }
        `;
        
        if (!document.querySelector('#notification-styles')) {
            style.id = 'notification-styles';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove notificação após 4 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    // ===== ADDITIONAL CSS FOR HIGHLIGHTS =====
    
    const additionalStyle = document.createElement('style');
    additionalStyle.textContent = `
        .service-card.highlighted {
            border: 2px solid #4a7c59;
            background: linear-gradient(135deg, rgba(74, 124, 89, 0.1), rgba(127, 176, 105, 0.1));
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        
        .animate-in {
            animation: fadeInUp 0.6s ease-out;
        }
        
        @media (max-width: 768px) {
            .nav-menu.active {
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(15px);
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
                display: block !important;
                padding: 20px;
                border-radius: 0 0 15px 15px;
            }
            
            .nav-links {
                flex-direction: column;
                gap: 15px;
            }
        }
        
        .modal-overlay .fadeOut {
            animation: fadeOut 0.3s ease-out;
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    
    document.head.appendChild(additionalStyle);
    
    // ===== INICIALIZAÇÃO =====
    
    // Mostra notificação de boas-vindas
    setTimeout(() => {
        showNotification('Bem-vindo ao LocaFácil! Use a barra de pesquisa para encontrar o tipo de caçamba ideal.', 'info');
    }, 1000);
    
    console.log('LocaFácil carregado com sucesso! 🌱');
});
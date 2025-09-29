// Aguarda o carregamento completo da página
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== ANIMAÇÃO DOS NÚMEROS DAS ESTATÍSTICAS =====
    
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString('pt-BR');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString('pt-BR');
            }
        }, 16);
    }
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    animateCounter(stat);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const statsSection = document.querySelector('.team-stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
    
    // ===== LINKS DE CONTATO =====
    
    const contactLinks = document.querySelectorAll('.contact-item');
    
    contactLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const icon = this.querySelector('i');
            
            // Se for link do LinkedIn, previne e mostra notificação
            if (icon.classList.contains('fa-linkedin')) {
                e.preventDefault();
                showNotification('Redirecionando para LinkedIn...', 'info');
            }
            
            // Para email e telefone, o comportamento padrão funciona (mailto: e tel:)
        });
    });
    
    // ===== BOTÃO DE VAGAS =====
    
    const ctaButton = document.querySelector('.cta-button');
    
    ctaButton.addEventListener('click', function() {
        showJobsModal();
    });
    
    // ===== MODAL DE VAGAS =====
    
    function showJobsModal() {
        const modal = createModal(`
            <div class="modal-content">
                <h3>Vagas Disponíveis</h3>
                <div class="jobs-list">
                    <div class="job-item">
                        <h4>Analista de Logística</h4>
                        <p>Experiência em roteirização e gestão de frota</p>
                        <span class="job-location"><i class="fas fa-map-marker-alt"></i> São Paulo, SP</span>
                    </div>
                    <div class="job-item">
                        <h4>Desenvolvedor Full Stack</h4>
                        <p>React, Node.js e experiência com IoT</p>
                        <span class="job-location"><i class="fas fa-map-marker-alt"></i> Remoto</span>
                    </div>
                    <div class="job-item">
                        <h4>Coordenador Ambiental</h4>
                        <p>Conhecimento em licenciamento e gestão de resíduos</p>
                        <span class="job-location"><i class="fas fa-map-marker-alt"></i> São Paulo, SP</span>
                    </div>
                    <div class="job-item">
                        <h4>Designer UX/UI</h4>
                        <p>Experiência em design de produtos digitais</p>
                        <span class="job-location"><i class="fas fa-map-marker-alt"></i> Híbrido</span>
                    </div>
                </div>
                <button class="btn-close">Fechar</button>
            </div>
        `);
        
        modal.querySelector('.btn-close').addEventListener('click', () => closeModal(modal));
    }
    
    // ===== SISTEMA DE MODAL =====
    
    function createModal(content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = content;
        
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
                padding: 40px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                animation: slideIn 0.3s ease-out;
            }
            
            .modal-content h3 {
                color: #2d5a3d;
                margin-bottom: 30px;
                text-align: center;
                font-size: 2rem;
            }
            
            .jobs-list {
                display: flex;
                flex-direction: column;
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .job-item {
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
                border-left: 4px solid #4a7c59;
                transition: all 0.3s ease;
            }
            
            .job-item:hover {
                background: #e8f5e9;
                transform: translateX(5px);
                box-shadow: 0 5px 15px rgba(74, 124, 89, 0.2);
            }
            
            .job-item h4 {
                color: #2d5a3d;
                margin-bottom: 10px;
                font-size: 1.3rem;
            }
            
            .job-item p {
                color: #666;
                margin-bottom: 10px;
                line-height: 1.5;
            }
            
            .job-location {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                color: #4a7c59;
                font-size: 0.9rem;
                font-weight: 500;
            }
            
            .btn-close {
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #4a7c59, #7fb069);
                color: white;
                border: none;
                border-radius: 25px;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-close:hover {
                background: linear-gradient(135deg, #2d5a3d, #4a7c59);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(74, 124, 89, 0.3);
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
        
        if (!document.querySelector('#team-modal-styles')) {
            style.id = 'team-modal-styles';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(modal);
        
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
    
    // ===== SISTEMA DE NOTIFICAÇÕES =====
    
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
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }
    
    // ===== ANIMAÇÃO DE ENTRADA DOS ELEMENTOS =====
    
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
    
    const sections = document.querySelectorAll('.team-stats, .team-cta');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(section);
    });
    
    // ===== ATALHOS DE TECLADO =====
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                closeModal(modal);
            }
        }
    });
    
    console.log('Página da equipe carregada com sucesso!');
});// Aguarda o carregamento completo da página
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== ANIMAÇÃO DOS NÚMEROS DAS ESTATÍSTICAS =====
    
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000; // 2 segundos
        const increment = target / (duration / 16); // 60 FPS
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString('pt-BR');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString('pt-BR');
            }
        }, 16);
    }
    
    // Observer para animar quando as estatísticas ficarem visíveis
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    animateCounter(stat);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const statsSection = document.querySelector('.team-stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
    
    // ===== INTERAÇÕES DOS CARDS DA EQUIPE =====
    
    const teamCards = document.querySelectorAll('.team-card');
    
    // Adiciona efeito sonoro visual ao clicar (opcional)
    teamCards.forEach(card => {
        card.addEventListener('click', function() {
            // Toggle do flip ao clicar no mobile
            this.classList.toggle('flipped');
        });
        
        // Efeito de inclinação ao mover o mouse
        card.addEventListener('mousemove', function(e) {
            if (window.innerWidth > 768) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // ===== LINKS DE REDES SOCIAIS =====
    
    const socialLinks = document.querySelectorAll('.social-icon');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Evita que o card vire ao clicar no ícone
            
            const platform = this.querySelector('i').classList[1].split('-')[1];
            showNotification(`Abrindo perfil no ${platform}...`, 'info');
            
            // Aqui você adicionaria os links reais das redes sociais
            // window.open('URL_REAL', '_blank');
        });
    });
    
    // ===== BOTÃO DE VAGAS =====
    
    const ctaButton = document.querySelector('.cta-button');
    
    ctaButton.addEventListener('click', function() {
        showJobsModal();
    });
    
    // ===== MODAL DE VAGAS =====
    
    function showJobsModal() {
        const modal = createModal(`
            <div class="modal-content">
                <h3>Vagas Disponíveis</h3>
                <div class="jobs-list">
                    <div class="job-item">
                        <h4>Analista de Logística</h4>
                        <p>Experiência em roteirização e gestão de frota</p>
                        <span class="job-location"><i class="fas fa-map-marker-alt"></i> São Paulo, SP</span>
                    </div>
                    <div class="job-item">
                        <h4>Desenvolvedor Full Stack</h4>
                        <p>React, Node.js e experiência com IoT</p>
                        <span class="job-location"><i class="fas fa-map-marker-alt"></i> Remoto</span>
                    </div>
                    <div class="job-item">
                        <h4>Coordenador Ambiental</h4>
                        <p>Conhecimento em licenciamento e gestão de resíduos</p>
                        <span class="job-location"><i class="fas fa-map-marker-alt"></i> São Paulo, SP</span>
                    </div>
                    <div class="job-item">
                        <h4>Designer UX/UI</h4>
                        <p>Experiência em design de produtos digitais</p>
                        <span class="job-location"><i class="fas fa-map-marker-alt"></i> Híbrido</span>
                    </div>
                </div>
                <button class="btn-close">Fechar</button>
            </div>
        `);
        
        modal.querySelector('.btn-close').addEventListener('click', () => closeModal(modal));
    }
    
    // ===== SISTEMA DE MODAL =====
    
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
                padding: 40px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                animation: slideIn 0.3s ease-out;
            }
            
            .modal-content h3 {
                color: #2d5a3d;
                margin-bottom: 30px;
                text-align: center;
                font-size: 2rem;
            }
            
            .jobs-list {
                display: flex;
                flex-direction: column;
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .job-item {
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
                border-left: 4px solid #4a7c59;
                transition: all 0.3s ease;
            }
            
            .job-item:hover {
                background: #e8f5e9;
                transform: translateX(5px);
                box-shadow: 0 5px 15px rgba(74, 124, 89, 0.2);
            }
            
            .job-item h4 {
                color: #2d5a3d;
                margin-bottom: 10px;
                font-size: 1.3rem;
            }
            
            .job-item p {
                color: #666;
                margin-bottom: 10px;
                line-height: 1.5;
            }
            
            .job-location {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                color: #4a7c59;
                font-size: 0.9rem;
                font-weight: 500;
            }
            
            .btn-close {
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #4a7c59, #7fb069);
                color: white;
                border: none;
                border-radius: 25px;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-close:hover {
                background: linear-gradient(135deg, #2d5a3d, #4a7c59);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(74, 124, 89, 0.3);
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
        
        if (!document.querySelector('#team-modal-styles')) {
            style.id = 'team-modal-styles';
            document.head.appendChild(style);
        }
        
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
    
    // ===== SISTEMA DE NOTIFICAÇÕES =====
    
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
    
    // ===== ANIMAÇÃO DE ENTRADA DOS ELEMENTOS =====
    
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
    
    // Observa seções para animação
    const sections = document.querySelectorAll('.team-stats, .team-cta');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(section);
    });
    
    // ===== ATALHOS DE TECLADO =====
    
    document.addEventListener('keydown', function(e) {
        // ESC fecha modais
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                closeModal(modal);
            }
        }
    });
    
    // ===== LOG DE INICIALIZAÇÃO =====
    
    console.log('Página da equipe carregada com sucesso!');
});
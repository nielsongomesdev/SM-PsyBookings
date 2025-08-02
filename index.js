window.addEventListener('scroll', () => {
    const barraNavegacao = document.querySelector('.barra-navegacao');
    barraNavegacao?.classList.toggle('scrolled', window.scrollY > 50);
});

// Configuração agressiva de autoplay para todos os dispositivos
document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.secao-abertura-video');
    
    if (!video) return;
    
    console.log('Configurando vídeo para autoplay agressivo...');
    
    // Configuração base do vídeo
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = false;
    video.volume = 0;
    
    // Atributos específicos para mobile
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    
    // Função de tentativa agressiva de play
    const forcePlay = async () => {
        try {
            // Garante que está mutado
            video.muted = true;
            video.volume = 0;
            
            await video.play();
            console.log('✅ Vídeo reproduzindo automaticamente');
            return true;
        } catch (error) {
            console.log('❌ Autoplay falhou:', error.message);
            return false;
        }
    };
    
    // Múltiplas tentativas escalonadas
    const attemptAutoplay = async () => {
        // Tentativa imediata
        let success = await forcePlay();
        if (success) return;
        
        // Tentativa após 100ms
        setTimeout(async () => {
            success = await forcePlay();
            if (success) return;
            
            // Tentativa após 500ms
            setTimeout(async () => {
                success = await forcePlay();
                if (success) return;
                
                // Tentativa após 1s
                setTimeout(forcePlay, 1000);
            }, 500);
        }, 100);
    };
    
    // Inicia tentativas
    attemptAutoplay();
    
    // Força play em qualquer interação do usuário
    const playOnAnyInteraction = async () => {
        await forcePlay();
    };
    
    // Múltiplos event listeners para capturar interação
    ['click', 'touchstart', 'touchend', 'keydown', 'scroll', 'mousemove'].forEach(eventType => {
        document.addEventListener(eventType, playOnAnyInteraction, { once: true, passive: true });
    });
    
    // Observer para quando entra na viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && video.paused) {
                forcePlay();
            }
        });
    }, { threshold: 0.1 });
    observer.observe(video);
    
    // Força play quando a página fica visível
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && video.paused) {
            forcePlay();
        }
    });
    
    // Tenta novamente quando a página carrega completamente
    window.addEventListener('load', forcePlay);
    
    // Listener para quando o vídeo pode começar a tocar
    video.addEventListener('canplay', forcePlay);
    video.addEventListener('canplaythrough', forcePlay);
    
    // Previne pausa
    video.addEventListener('pause', () => {
        setTimeout(forcePlay, 100);
    });
    
    console.log('Configuração de autoplay agressivo concluída');
});

const menuHamburguer = document.querySelector('.menu-hamburguer');
const menuLinks = document.querySelector('.barra-navegacao-menu');

menuHamburguer?.addEventListener('click', () => {
    menuHamburguer.classList.toggle('active');
    menuLinks?.classList.toggle('active');
});

document.querySelectorAll('.barra-navegacao-menu a').forEach(link => {
    link.addEventListener('click', () => {
        menuHamburguer?.classList.remove('active');
        menuLinks?.classList.remove('active');
    });
});

document.addEventListener('click', e => {
    if (!menuHamburguer?.contains(e.target) && !menuLinks?.contains(e.target)) {
        menuHamburguer?.classList.remove('active');
        menuLinks?.classList.remove('active');
    }
});

const observador = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        entry.target.classList.toggle('visible', entry.isIntersecting);
    });
});
document.querySelectorAll('.cartao-artista').forEach(card => observador.observe(card));

function criarParticulas() {
    const container = document.querySelector('.fundo-particulas');
    if (!container) return;
    container.innerHTML = '';
    Array.from({ length: 50 }).forEach(() => {
        const particula = document.createElement('div');
        particula.className = 'particula';
        particula.style.left = `${Math.random() * 100}%`;
        particula.style.animationDelay = `${Math.random() * 6}s`;
        particula.style.animationDuration = `${6 + Math.random() * 4}s`;
        const tamanho = 1 + Math.random() * 3;
        particula.style.width = `${tamanho}px`;
        particula.style.height = `${tamanho}px`;
        container.appendChild(particula);
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

function abrirEmail() {
    if (window.innerWidth > 768) {
        window.open(
            'https://mail.google.com/mail/?view=cm&fs=1&to=smpsybookings@gmail.com&su=Contato%20via%20Site%20S%26M%20PsyBookings',
            '_blank'
        );
        return false;
    }
    return true;
}

class CarrosselDepoimentos {
    constructor() {
        this.slideAtual = 0;
        this.slides = document.querySelectorAll('.depoimento-slide');
        this.totalSlides = this.slides.length;
        this.track = document.querySelector('.carrossel-track');
        this.container = document.querySelector('.carrossel-container');
        this.indicadores = document.querySelectorAll('.indicador');
        this.btnPrev = document.querySelector('.carrossel-btn-prev');
        this.btnNext = document.querySelector('.carrossel-btn-next');
        this.startX = 0;
        this.endX = 0;
        this.threshold = 50;
        this.isInteracting = false;
        this.autoPlayInterval = null;
        this.init();
    }

    init() {
        if (!this.totalSlides) return;
        this.btnPrev?.addEventListener('click', () => this.slidePrev());
        this.btnNext?.addEventListener('click', () => this.slideNext());
        this.indicadores.forEach((indicador, i) =>
            indicador.addEventListener('click', () => this.irPara(i))
        );
        this.container?.addEventListener('touchstart', e => this.handleTouchStart(e), { passive: false });
        this.container?.addEventListener('touchmove', e => this.handleTouchMove(e), { passive: false });
        this.container?.addEventListener('touchend', e => this.handleTouchEnd(e), { passive: true });
        this.container?.addEventListener('mousedown', e => this.handleMouseDown(e));
        this.container?.addEventListener('mousemove', e => this.handleMouseMove(e));
        this.container?.addEventListener('mouseup', e => this.handleMouseUp(e));
        this.container?.addEventListener('mouseleave', e => this.handleMouseUp(e));
        this.container?.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container?.addEventListener('mouseleave', () => !this.isInteracting && this.startAutoPlay());
        this.container?.addEventListener('selectstart', e => e.preventDefault());
        this.startAutoPlay();
        this.atualizarSlide();
    }

    irPara(i) {
        if (i >= 0 && i < this.totalSlides) {
            this.slideAtual = i;
            this.atualizarSlide();
            this.resetAutoPlay();
        }
    }

    slideNext() {
        this.slideAtual = (this.slideAtual + 1) % this.totalSlides;
        this.atualizarSlide();
        this.resetAutoPlay();
    }

    slidePrev() {
        this.slideAtual = this.slideAtual === 0 ? this.totalSlides - 1 : this.slideAtual - 1;
        this.atualizarSlide();
        this.resetAutoPlay();
    }

    atualizarSlide() {
        this.track.style.transform = `translateX(${-this.slideAtual * 100}%)`;
        this.slides.forEach((slide, i) => slide.classList.toggle('active', i === this.slideAtual));
        this.indicadores.forEach((indicador, i) => indicador.classList.toggle('active', i === this.slideAtual));
    }

    handleTouchStart(e) {
        this.startX = e.touches[0].clientX;
        this.isInteracting = true;
        this.stopAutoPlay();
    }
    handleTouchMove(e) {
        if (!this.isInteracting) return;
        e.preventDefault();
    }
    handleTouchEnd(e) {
        if (!this.isInteracting) return;
        this.endX = e.changedTouches[0].clientX;
        this.handleSwipe();
        this.isInteracting = false;
        setTimeout(() => this.startAutoPlay(), 3000);
    }
    handleMouseDown(e) {
        this.startX = e.clientX;
        this.isInteracting = true;
        this.container.style.cursor = 'grabbing';
        this.stopAutoPlay();
    }
    handleMouseMove(e) {
        if (!this.isInteracting) return;
        e.preventDefault();
    }
    handleMouseUp(e) {
        if (!this.isInteracting) return;
        this.endX = e.clientX;
        this.container.style.cursor = 'grab';
        this.handleSwipe();
        this.isInteracting = false;
        setTimeout(() => this.startAutoPlay(), 3000);
    }
    handleSwipe() {
        const diff = this.startX - this.endX;
        if (Math.abs(diff) > this.threshold) {
            diff > 0 ? this.slideNext() : this.slidePrev();
        }
    }
    startAutoPlay() {
        if (this.autoPlayInterval) return;
        this.autoPlayInterval = setInterval(() => {
            if (!this.isInteracting) this.slideNext();
        }, 6000);
    }
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    resetAutoPlay() {
        this.stopAutoPlay();
        setTimeout(() => this.startAutoPlay(), 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    criarParticulas();
    setInterval(criarParticulas, 12000);
    new CarrosselDepoimentos();
});

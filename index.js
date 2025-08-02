window.addEventListener('scroll', () => {
    const barraNavegacao = document.querySelector('.barra-navegacao');
    barraNavegacao?.classList.toggle('scrolled', window.scrollY > 50);
});

// SOLUÇÃO RADICAL: Auto-clique no primeiro toque para forçar autoplay
document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.secao-abertura-video');
    
    if (!video) return;
    
    console.log('🎬 Iniciando SOLUÇÃO RADICAL para autoplay mobile...');
    
    // Configuração base
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = false;
    video.volume = 0;
    video.defaultMuted = true;
    
    // Atributos obrigatórios
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.setAttribute('preload', 'auto');
    
    let hasUserInteracted = false;
    let autoPlayAttempted = false;
    
    // Função principal de play
    const forcePlay = async () => {
        try {
            video.muted = true;
            video.volume = 0;
            const playPromise = video.play();
            await playPromise;
            console.log('✅ Vídeo tocando!');
            return true;
        } catch (error) {
            console.log('❌ Erro no play:', error.message);
            return false;
        }
    };
    
    // ESTRATÉGIA 1: Intercepta o primeiro toque e força play imediatamente
    const handleFirstInteraction = async (event) => {
        if (hasUserInteracted) return;
        
        hasUserInteracted = true;
        console.log('🚀 PRIMEIRA INTERAÇÃO DETECTADA - Forçando autoplay!');
        
        // Para o evento para não interferir
        event.preventDefault();
        event.stopPropagation();
        
        // Força play imediatamente
        const success = await forcePlay();
        
        if (success) {
            console.log('✅ SUCESSO: Autoplay ativado no primeiro toque!');
            // Remove todos os listeners após sucesso
            document.removeEventListener('touchstart', handleFirstInteraction, true);
            document.removeEventListener('click', handleFirstInteraction, true);
        }
    };
    
    // ESTRATÉGIA 2: Auto-clique simulado
    const simulateAutoClick = () => {
        setTimeout(() => {
            if (!hasUserInteracted && video.paused) {
                console.log('🤖 Simulando clique automático...');
                
                // Cria e dispara evento de touch
                const touchEvent = new TouchEvent('touchstart', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    touches: [{
                        clientX: window.innerWidth / 2,
                        clientY: window.innerHeight / 2,
                        target: video
                    }]
                });
                
                video.dispatchEvent(touchEvent);
                forcePlay();
            }
        }, 1000);
    };
    
    // ESTRATÉGIA 3: Captura QUALQUER interação na página
    const captureAnyInteraction = (event) => {
        if (!autoPlayAttempted) {
            autoPlayAttempted = true;
            console.log('🎯 Interação capturada em:', event.type);
            forcePlay();
        }
    };
    
    // Adiciona listeners para primeira interação (capture phase)
    document.addEventListener('touchstart', handleFirstInteraction, { capture: true, passive: false });
    document.addEventListener('click', handleFirstInteraction, { capture: true, passive: false });
    
    // Adiciona listeners para qualquer interação
    ['touchstart', 'touchend', 'touchmove', 'click', 'scroll', 'keydown'].forEach(event => {
        document.addEventListener(event, captureAnyInteraction, { once: true, passive: true });
    });
    
    // Tentativas de autoplay tradicional
    const attemptAutoplay = async () => {
        for (let i = 0; i < 5; i++) {
            setTimeout(async () => {
                if (!hasUserInteracted && video.paused) {
                    await forcePlay();
                }
            }, i * 200);
        }
    };
    
    // Eventos do vídeo
    video.addEventListener('loadeddata', forcePlay);
    video.addEventListener('canplay', forcePlay);
    video.addEventListener('canplaythrough', forcePlay);
    
    // Anti-pausa
    video.addEventListener('pause', () => {
        if (hasUserInteracted) {
            console.log('⚠️ Vídeo pausou - reativando...');
            setTimeout(forcePlay, 100);
        }
    });
    
    // Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && video.paused) {
                forcePlay();
            }
        });
    }, { threshold: 0.5 });
    observer.observe(video);
    
    // Eventos de página
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && video.paused && hasUserInteracted) {
            forcePlay();
        }
    });
    
    // Inicia todas as estratégias
    attemptAutoplay();
    simulateAutoClick();
    
    // HACK ESPECIAL: Força play depois de um tempo se nada funcionou
    setTimeout(() => {
        if (video.paused && !hasUserInteracted) {
            console.log('� HACK FINAL: Forçando play após 3 segundos...');
            hasUserInteracted = true; // Simula que o usuário interagiu
            forcePlay();
        }
    }, 3000);
    
    console.log('⚡ SOLUÇÃO RADICAL configurada - aguardando primeira interação...');
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

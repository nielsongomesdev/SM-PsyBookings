window.addEventListener('scroll', () => {
    const barraNavegacao = document.querySelector('.barra-navegacao');
    barraNavegacao?.classList.toggle('scrolled', window.scrollY > 50);
});

// Solução DEFINITIVA para autoplay mobile - Intercepta e força autoplay
document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.secao-abertura-video');
    
    if (!video) return;
    
    console.log('🎬 Iniciando solução DEFINITIVA de autoplay mobile...');
    
    // Configuração base ultra-agressiva
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = false;
    video.volume = 0;
    video.defaultMuted = true;
    
    // Remove todos os atributos de controle
    video.removeAttribute('controls');
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('muted', 'true');
    video.setAttribute('autoplay', 'true');
    video.setAttribute('loop', 'true');
    video.setAttribute('preload', 'auto');
    
    // Função ultra-forçada de play
    const forcePlay = async () => {
        try {
            video.muted = true;
            video.volume = 0;
            video.defaultMuted = true;
            
            const playPromise = video.play();
            await playPromise;
            
            console.log('✅ SUCESSO: Vídeo tocando!');
            return true;
        } catch (error) {
            console.log('❌ Falha no autoplay:', error.message);
            return false;
        }
    };
    
    // SOLUÇÃO INOVADORA: Criar overlay invisível que intercepta cliques
    const createInvisibleOverlay = () => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999;
            background: transparent;
            cursor: pointer;
            pointer-events: auto;
        `;
        
        // Intercepta QUALQUER clique no vídeo
        overlay.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🚀 Clique interceptado - forçando autoplay!');
            
            const success = await forcePlay();
            if (success) {
                // Remove o overlay após sucesso
                overlay.remove();
                console.log('✅ Overlay removido - autoplay funcionando!');
            }
        }, { capture: true });
        
        // Adiciona o overlay sobre o vídeo
        const videoContainer = video.parentElement;
        videoContainer.style.position = 'relative';
        videoContainer.appendChild(overlay);
        
        console.log('🎯 Overlay invisível criado para interceptar cliques');
        
        // Remove overlay automaticamente após 5 segundos se o vídeo estiver tocando
        setTimeout(() => {
            if (!video.paused && overlay.parentElement) {
                overlay.remove();
                console.log('⏰ Overlay removido automaticamente');
            }
        }, 5000);
    };
    
    // Tentativas imediatas de autoplay
    const attemptImmediatePlay = async () => {
        // Múltiplas tentativas em cascata
        for (let i = 0; i < 10; i++) {
            setTimeout(async () => {
                const success = await forcePlay();
                if (success) {
                    console.log(`✅ Autoplay funcionou na tentativa ${i + 1}`);
                    return;
                }
            }, i * 100);
        }
    };
    
    // Inicia tentativas
    attemptImmediatePlay();
    
    // Cria overlay para interceptar cliques
    createInvisibleOverlay();
    
    // Força play em QUALQUER interação
    const instantPlay = async () => {
        await forcePlay();
        console.log('🚀 Play forçado por interação');
    };
    
    // Captura todos os tipos de eventos
    const events = [
        'click', 'touchstart', 'touchend', 'touchmove', 
        'keydown', 'scroll', 'mousemove', 'mousedown',
        'focus', 'blur', 'resize', 'orientationchange'
    ];
    
    events.forEach(eventType => {
        document.addEventListener(eventType, instantPlay, { 
            once: true, 
            passive: true,
            capture: true 
        });
    });
    
    // Observer ultra-sensível
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                forcePlay();
            }
        });
    }, { 
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
        rootMargin: '100px'
    });
    observer.observe(video);
    
    // Eventos específicos do vídeo
    video.addEventListener('loadstart', forcePlay);
    video.addEventListener('loadeddata', forcePlay);
    video.addEventListener('loadedmetadata', forcePlay);
    video.addEventListener('canplay', forcePlay);
    video.addEventListener('canplaythrough', forcePlay);
    
    // Anti-pausa ultra-agressivo
    video.addEventListener('pause', () => {
        console.log('⚠️ Vídeo pausou - forçando play imediatamente');
        setTimeout(forcePlay, 10);
        setTimeout(forcePlay, 50);
        setTimeout(forcePlay, 100);
    });
    
    // Monitora mudanças de visibilidade
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && video.paused) {
            forcePlay();
        }
    });
    
    // Força play quando janela ganha foco
    window.addEventListener('focus', forcePlay);
    window.addEventListener('load', forcePlay);
    
    // Tentativa final após carregamento completo
    setTimeout(() => {
        if (video.paused) {
            console.log('🔄 Tentativa final após 3 segundos...');
            forcePlay();
        }
    }, 3000);
    
    // HACK ESPECÍFICO PARA iOS: Simula user gesture
    const simulateUserGesture = () => {
        const event = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        video.dispatchEvent(event);
        forcePlay();
    };
    
    // Tenta simular gesture após 1 segundo
    setTimeout(simulateUserGesture, 1000);
    
    console.log('⚡ Solução DEFINITIVA configurada - interceptando todos os cliques!');
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

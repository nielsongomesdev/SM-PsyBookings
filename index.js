window.addEventListener('load', function() {
  setTimeout(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, 100);
});

window.addEventListener('beforeunload', function() {
  window.scrollTo(0, 0);
});

window.addEventListener('scroll', () => {
    const barraNavegacao = document.querySelector('.barra-navegacao');
    if (barraNavegacao) {
        barraNavegacao.classList.toggle('scrolled', window.scrollY > 50);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.secao-abertura-video');
    if (!video) return;
    
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = false;
    video.volume = 0;
    video.defaultMuted = true;
    
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.setAttribute('preload', 'auto');
    
    let hasUserInteracted = false;
    let autoPlayAttempted = false;
    
    const forcePlay = async () => {
        try {
            video.muted = true;
            video.volume = 0;
            const playPromise = video.play();
            await playPromise;
            return true;
        } catch (error) {
            return false;
        }
    };
    
    const handleFirstInteraction = async (event) => {
        if (hasUserInteracted) return;
        hasUserInteracted = true;
        event.preventDefault();
        event.stopPropagation();
        
        const success = await forcePlay();
        if (success) {
            document.removeEventListener('touchstart', handleFirstInteraction, true);
            document.removeEventListener('click', handleFirstInteraction, true);
        }
    };
    
    const captureAnyInteraction = (event) => {
        if (!autoPlayAttempted) {
            autoPlayAttempted = true;
            forcePlay();
        }
    };
    
    document.addEventListener('touchstart', handleFirstInteraction, { capture: true, passive: false });
    document.addEventListener('click', handleFirstInteraction, { capture: true, passive: false });
    
    ['touchstart', 'touchend', 'touchmove', 'click', 'scroll', 'keydown'].forEach(event => {
        document.addEventListener(event, captureAnyInteraction, { once: true, passive: true });
    });
    
    const attemptAutoplay = async () => {
        for (let i = 0; i < 5; i++) {
            setTimeout(async () => {
                if (!hasUserInteracted && video.paused) {
                    await forcePlay();
                }
            }, i * 200);
        }
    };
    
    video.addEventListener('loadeddata', forcePlay);
    video.addEventListener('canplay', forcePlay);
    video.addEventListener('canplaythrough', forcePlay);
    
    video.addEventListener('pause', () => {
        if (hasUserInteracted) {
            setTimeout(forcePlay, 100);
        }
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && video.paused) {
                forcePlay();
            }
        });
    }, { threshold: 0.5 });
    observer.observe(video);
    
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && video.paused && hasUserInteracted) {
            forcePlay();
        }
    });
    
    attemptAutoplay();
    
    setTimeout(() => {
        if (video.paused && !hasUserInteracted) {
            hasUserInteracted = true;
            forcePlay();
        }
    }, 3000);
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
        if (window.innerWidth >= 768) {
            entry.target.classList.toggle('visible', entry.isIntersecting);
        } else {
            entry.target.classList.add('visible');
        }
    });
});
document.querySelectorAll('.cartao-artista').forEach(card => observador.observe(card));

function criarParticulas() {
    const container = document.querySelector('.fundo-particulas');
    if (!container) return;
    
    container.innerHTML = '';
    
    const isMobile = window.innerWidth <= 768;
    const quantidadeParticulas = isMobile ? 8 : 12;
    
    Array.from({ length: quantidadeParticulas }).forEach(() => {
        const particula = document.createElement('div');
        particula.className = 'particula';
        particula.style.left = `${Math.random() * 100}%`;
        particula.style.top = `100vh`;
        particula.style.animationDelay = `${Math.random() * 8}s`;
        
        const duracao = isMobile ? 10 + Math.random() * 4 : 8 + Math.random() * 4;
        particula.style.animationDuration = `${duracao}s`;
        
        const tamanho = 1 + Math.random() * 2;
        particula.style.width = `${tamanho}px`;
        particula.style.height = `${tamanho}px`;
        container.appendChild(particula);
    });
    
    container.style.display = 'none';
    container.offsetHeight;
    container.style.display = 'block';
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
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.threshold = 50;
        this.isInteracting = false;
        this.autoPlayInterval = null;
        this.isHorizontalSwipe = false;
        this.init();
    }

    init() {
        if (!this.totalSlides) return;
        this.btnPrev?.addEventListener('click', () => this.slidePrev());
        this.btnNext?.addEventListener('click', () => this.slideNext());
        this.indicadores.forEach((indicador, i) =>
            indicador.addEventListener('click', () => this.irPara(i))
        );
        this.container?.addEventListener('touchstart', e => this.handleTouchStart(e), { passive: true });
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
        this.startY = e.touches[0].clientY;
        this.isInteracting = false;
        this.isHorizontalSwipe = false;
        this.stopAutoPlay();
    }
    
    handleTouchMove(e) {
        if (!this.startX || !this.startY) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = Math.abs(currentX - this.startX);
        const diffY = Math.abs(currentY - this.startY);
        
        if (diffX > 10 || diffY > 10) {
            if (diffX > diffY) {
                this.isHorizontalSwipe = true;
                this.isInteracting = true;
                e.preventDefault();
            } else {
                this.isHorizontalSwipe = false;
                this.isInteracting = false;
            }
        }
    }
    
    handleTouchEnd(e) {
        if (!this.isInteracting || !this.isHorizontalSwipe) {
            this.isInteracting = false;
            this.isHorizontalSwipe = false;
            setTimeout(() => this.startAutoPlay(), 3000);
            return;
        }
        
        this.endX = e.changedTouches[0].clientX;
        this.endY = e.changedTouches[0].clientY;
        this.handleSwipe();
        this.isInteracting = false;
        this.isHorizontalSwipe = false;
        setTimeout(() => this.startAutoPlay(), 3000);
    }
    
    handleMouseDown(e) {
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.isInteracting = true;
        this.isHorizontalSwipe = true;
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
        this.endY = e.clientY;
        this.container.style.cursor = 'grab';
        this.handleSwipe();
        this.isInteracting = false;
        this.isHorizontalSwipe = false;
        setTimeout(() => this.startAutoPlay(), 3000);
    }
    
    handleSwipe() {
        const diffX = this.startX - this.endX;
        const diffY = Math.abs(this.startY - this.endY);
        
        if (Math.abs(diffX) > this.threshold && Math.abs(diffX) > diffY) {
            diffX > 0 ? this.slideNext() : this.slidePrev();
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
    setInterval(() => {
        criarParticulas();
    }, 30000);
    new CarrosselDepoimentos();
});

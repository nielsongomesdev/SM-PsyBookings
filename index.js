const DeviceDetector = {
    isMobile: /Mobi|Android/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    isLowPowerMode: navigator.connection && navigator.connection.saveData
};

const CONFIG = {
    scroll: { navbarThreshold: 50, smoothScrollThreshold: 5 },
    video: { maxPlayAttempts: 10, retryDelay: 500, interactionTimeout: 3000, fallbackTimeout: 5000 },
    particles: { mobile: 8, desktop: 12, recreateInterval: 30000 },
    carousel: { swipeThreshold: 50, autoPlayDelay: 6000, resetDelay: 1000, interactionDelay: 3000 }
};


class ScrollManager {
    static async initializeScrollBehavior() {
        try {
            await this.waitForPageLoad();
            const nav = this.getNavigationData();
            await this.handleScrollRestoration(nav);
            sessionStorage.setItem('hasVisited', 'true');
        } catch (e) {}
    }
    static async waitForPageLoad() {
        return new Promise(r => {
            if (document.readyState === 'complete') r();
            else window.addEventListener('load', r, { once: true });
        });
    }
    static getNavigationData() {
        const nav = performance.getEntriesByType('navigation')[0];
        return {
            isBack: nav && nav.type === 'back_forward',
            isReload: nav && nav.type === 'reload',
            firstVisit: !sessionStorage.getItem('hasVisited'),
            fromExternal: !document.referrer || !document.referrer.includes(location.hostname),
            savedPosition: sessionStorage.getItem('scrollPosition'),
            clickedExternal: sessionStorage.getItem('clickedExternalLink')
        };
    }
    static async handleScrollRestoration({ clickedExternal, savedPosition, firstVisit, fromExternal, isBack, isReload }) {
        if (clickedExternal && savedPosition) {
            sessionStorage.removeItem('clickedExternalLink');
            await new Promise(r => requestAnimationFrame(() => {
                window.scrollTo(0, parseInt(savedPosition));
                r();
            }));
        } else if ((firstVisit || fromExternal) && !isBack && !isReload && !clickedExternal) {
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
            scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    static handleScrollEvents() {
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.barra-navegacao');
            navbar?.classList.toggle('scrolled', scrollY > CONFIG.scroll.navbarThreshold);
            sessionStorage.setItem('scrollPosition', scrollY.toString());
        });
    }
    static handleExternalLinks() {
        document.querySelectorAll('a[target="_blank"], a[href^="http"], a[href^="mailto"]').forEach(link =>
            link.addEventListener('click', async () => {
                const position = scrollY.toString();
                sessionStorage.setItem('scrollPosition', position);
                sessionStorage.setItem('clickedExternalLink', 'true');
                await new Promise(r => setTimeout(r, 10));
            })
        );
    }
    static handleBeforeUnload() {
        window.addEventListener('beforeunload', () => {
            sessionStorage.setItem('scrollPosition', scrollY.toString());
        });
    }
    static setupSmoothAnchorScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }
    static async setupLogoScrollToTop() {
        const logo = document.querySelector('.barra-navegacao-logo');
        if (!logo) return;
        logo.addEventListener('click', async e => {
            e.preventDefault();
            await new Promise(resolve => {
                scrollTo({ top: 0, behavior: 'smooth' });
                (function check() {
                    if (scrollY <= CONFIG.scroll.smoothScrollThreshold) resolve();
                    else requestAnimationFrame(check);
                })();
            });
        });
        logo.style.cursor = 'pointer';
    }
}

class VideoAutoplayManager {
    constructor() {
        this.video = null;
        this.hasUserInteracted = false;
        this.autoPlayAttempted = false;
        this.playAttempts = 0;
        this.maxPlayAttempts = CONFIG.video.maxPlayAttempts;
    }
    async initialize() {
        this.video = document.querySelector('.secao-abertura-video');
        if (!this.video) return;
        this.setupVideoAttributes();
        this.setupEventListeners();
        this.attemptAutoplay();
        this.setupFallbackButton();
        this.startLoopMonitoring();
    }
    startLoopMonitoring() {
        setInterval(() => {
            if (this.video && !this.video.paused && this.video.duration > 0) {
                if (this.video.currentTime >= this.video.duration - 0.2) {
                    this.video.currentTime = 0;
                }
                if (!this.video.loop) {
                    this.video.loop = true;
                }
            }
        }, 1000);
    }
    setupVideoAttributes() {
        Object.assign(this.video, {
            muted: true, autoplay: true, loop: true, playsInline: true, controls: false, volume: 0, defaultMuted: true
        });
        ['playsinline', 'webkit-playsinline', 'muted', 'autoplay', 'loop', 'preload', 'x-webkit-airplay', 'disablepictureinpicture']
            .forEach(attr => this.video.setAttribute(attr, attr === 'preload' ? 'auto' : ''));
        this.video.setAttribute('controlslist', 'nodownload nofullscreen noremoteplaybook');
    }
    async forcePlay() {
        try {
            if (++this.playAttempts > this.maxPlayAttempts) return false;
            this.video.muted = true;
            this.video.volume = 0;
            this.video.loop = true;
            if (DeviceDetector.isIOS || DeviceDetector.isSafari) await new Promise(r => setTimeout(r, 100));
            await this.video.play();
            return !this.video.paused;
        } catch (e) {
            if (DeviceDetector.isLowPowerMode || (DeviceDetector.isMobile && !this.hasUserInteracted)) return false;
            if (this.playAttempts < this.maxPlayAttempts) setTimeout(() => this.forcePlay(), CONFIG.video.retryDelay);
            return false;
        }
    }
    async handleFirstInteraction(e) {
        if (this.hasUserInteracted) return;
        this.hasUserInteracted = true;
        e.preventDefault();
        e.stopPropagation();
        if (await this.forcePlay()) {
            document.removeEventListener('touchstart', this.handleFirstInteraction, true);
            document.removeEventListener('click', this.handleFirstInteraction, true);
        }
    }
    captureAnyInteraction() {
        if (!this.autoPlayAttempted) {
            this.autoPlayAttempted = true;
            this.forcePlay();
        }
    }
    setupEventListeners() {
        document.addEventListener('touchstart', e => this.handleFirstInteraction(e), { capture: true, passive: false });
        document.addEventListener('click', e => this.handleFirstInteraction(e), { capture: true, passive: false });
        ['touchstart', 'touchend', 'touchmove', 'click', 'scroll', 'keydown', 'mousedown', 'wheel', 'focus']
            .forEach(ev => document.addEventListener(ev, () => this.captureAnyInteraction(), { once: true, passive: true }));
        ['loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough']
            .forEach(ev => this.video.addEventListener(ev, () => this.forcePlay()));
        this.video.addEventListener('pause', () => {
            if (this.hasUserInteracted && !DeviceDetector.isLowPowerMode) setTimeout(() => this.forcePlay(), 100);
        });
        this.video.addEventListener('ended', () => {
            this.video.currentTime = 0;
            this.forcePlay();
        });
        this.video.addEventListener('timeupdate', () => {
            if (this.video.duration > 0 && this.video.currentTime >= this.video.duration - 0.1) {
                this.video.currentTime = 0;
            }
        });
        new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && this.video.paused) this.forcePlay();
            });
        }, { threshold: 0.5 }).observe(this.video);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.video.paused && this.hasUserInteracted) this.forcePlay();
        });
    }
    attemptAutoplay() {
        [0, 100, 300, 500, 1000, 2000].forEach(delay =>
            setTimeout(async () => {
                if (!this.hasUserInteracted && this.video.paused && this.playAttempts < this.maxPlayAttempts) await this.forcePlay();
            }, delay)
        );
        if (this.video.readyState >= 2) {
            setTimeout(() => {
                if (this.video.paused && !this.hasUserInteracted) this.forcePlay();
            }, CONFIG.video.interactionTimeout);
        }
    }
    setupFallbackButton() {
        setTimeout(() => {
            if (this.video.paused && !this.hasUserInteracted) {
                this.hasUserInteracted = true;
                this.forcePlay();
            }
        }, CONFIG.video.interactionTimeout);
        setTimeout(() => {
            if (this.video.paused && this.video.readyState >= 2) {
                this.video.muted = true;
                this.video.play().catch(() => {
                    if (!DeviceDetector.isMobile) this.createPlayButton();
                });
            }
        }, CONFIG.video.fallbackTimeout);
    }
    createPlayButton() {
        const btn = document.createElement('button');
        btn.innerHTML = 'Clique para reproduzir o vídeo';
        btn.style.cssText = `
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            z-index: 10; background: rgba(0,0,0,0.8); color: white; border: none;
            padding: 15px 25px; border-radius: 25px; font-size: 16px; cursor: pointer;
            transition: all 0.3s ease;
        `;
        btn.onmouseenter = () => btn.style.background = 'rgba(0,0,0,0.9)';
        btn.onmouseleave = () => btn.style.background = 'rgba(0,0,0,0.8)';
        btn.onclick = () => {
            this.video.loop = true;
            this.video.muted = true;
            this.video.play();
            btn.remove();
        };
        this.video.parentElement.style.position = 'relative';
        this.video.parentElement.appendChild(btn);
    }
}

class MobileMenuManager {
    static initialize() {
        const menuHamburguer = document.querySelector('.menu-hamburguer');
        const menuLinks = document.querySelector('.barra-navegacao-menu');
        if (!menuHamburguer || !menuLinks) return;
        menuHamburguer.addEventListener('click', () => {
            menuHamburguer.classList.toggle('active');
            menuLinks.classList.toggle('active');
        });
        document.querySelectorAll('.barra-navegacao-menu a').forEach(link =>
            link.addEventListener('click', () => {
                menuHamburguer.classList.remove('active');
                menuLinks.classList.remove('active');
            })
        );
        document.addEventListener('click', e => {
            if (!menuHamburguer.contains(e.target) && !menuLinks.contains(e.target)) {
                menuHamburguer.classList.remove('active');
                menuLinks.classList.remove('active');
            }
        });
    }
}

class ArtistCardsAnimationManager {
    static initialize() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (window.innerWidth >= 768) entry.target.classList.toggle('visible', entry.isIntersecting);
                else entry.target.classList.add('visible');
            });
        });
        document.querySelectorAll('.cartao-artista').forEach(card => observer.observe(card));
    }
}


class ParticleSystem {
    static async createParticles() {
        const container = document.querySelector('.fundo-particulas');
        if (!container) return;
        await new Promise(r => requestAnimationFrame(() => { container.innerHTML = ''; r(); }));
        const quantity = window.innerWidth <= 768 ? CONFIG.particles.mobile : CONFIG.particles.desktop;
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < quantity; i++) fragment.appendChild(this.createParticle());
        await new Promise(r => requestAnimationFrame(() => {
            container.appendChild(fragment);
            container.style.display = 'none';
            container.offsetHeight;
            container.style.display = 'block';
            r();
        }));
    }
    static createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particula';
        const size = 1 + Math.random() * 2;
        const duration = (window.innerWidth <= 768 ? 10 : 8) + Math.random() * 4;
        Object.assign(particle.style, {
            left: `${Math.random() * 100}%`,
            top: '100vh',
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${duration}s`,
            width: `${size}px`,
            height: `${size}px`
        });
        return particle;
    }
    static startParticleSystem() {
        this.createParticles();
        setInterval(() => this.createParticles(), CONFIG.particles.recreateInterval);
    }
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
        this.threshold = CONFIG.carousel.swipeThreshold;
        this.isInteracting = false;
        this.autoPlayInterval = null;
        this.init();
    }
    init() {
        if (!this.totalSlides) return;
        this.setupEventListeners();
        this.startAutoPlay();
        this.atualizarSlide();
    }
    setupEventListeners() {
        this.btnPrev?.addEventListener('click', () => this.slidePrev());
        this.btnNext?.addEventListener('click', () => this.slideNext());
        this.indicadores.forEach((ind, i) => ind.addEventListener('click', () => this.irPara(i)));
        if (!this.container) return;
        this.container.addEventListener('touchstart', e => this.handleTouchStart(e), { passive: true });
        this.container.addEventListener('touchmove', e => this.handleTouchMove(e), { passive: false });
        this.container.addEventListener('touchend', e => this.handleTouchEnd(e), { passive: true });
        this.container.addEventListener('mousedown', e => this.handleMouseDown(e));
        this.container.addEventListener('mousemove', e => this.handleMouseMove(e));
        this.container.addEventListener('mouseup', e => this.handleMouseUp(e));
        this.container.addEventListener('mouseleave', e => this.handleMouseUp(e));
        this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container.addEventListener('mouseleave', () => !this.isInteracting && this.startAutoPlay());
        this.container.addEventListener('selectstart', e => e.preventDefault());
    }
    irPara(index) {
        if (index >= 0 && index < this.totalSlides) {
            this.slideAtual = index;
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
        this.slides.forEach((s, i) => s.classList.toggle('active', i === this.slideAtual));
        this.indicadores.forEach((ind, i) => ind.classList.toggle('active', i === this.slideAtual));
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
            this.resetInteractionState();
            return;
        }
        this.endX = e.changedTouches[0].clientX;
        this.endY = e.changedTouches[0].clientY;
        this.handleSwipe();
        this.resetInteractionState();
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
        this.resetInteractionState();
    }
    handleSwipe() {
        const diffX = this.startX - this.endX;
        const diffY = Math.abs(this.startY - this.endY);
        if (Math.abs(diffX) > this.threshold && Math.abs(diffX) > diffY) {
            diffX > 0 ? this.slideNext() : this.slidePrev();
        }
    }
    resetInteractionState() {
        this.isInteracting = false;
        this.isHorizontalSwipe = false;
        setTimeout(() => this.startAutoPlay(), CONFIG.carousel.interactionDelay);
    }
    startAutoPlay() {
        if (this.autoPlayInterval) return;
        this.autoPlayInterval = setInterval(() => {
            if (!this.isInteracting) this.slideNext();
        }, CONFIG.carousel.autoPlayDelay);
    }
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    resetAutoPlay() {
        this.stopAutoPlay();
        setTimeout(() => this.startAutoPlay(), CONFIG.carousel.resetDelay);
    }
}


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

class AppInitializer {
    static async initialize() {
        try {
            window.addEventListener('load', () => ScrollManager.initializeScrollBehavior());
            ScrollManager.handleScrollEvents();
            ScrollManager.handleBeforeUnload();
            ScrollManager.setupSmoothAnchorScrolling();
            document.addEventListener('DOMContentLoaded', async () => {
                await Promise.allSettled([
                    ScrollManager.setupLogoScrollToTop(),
                    new VideoAutoplayManager().initialize(),
                    ParticleSystem.startParticleSystem(),
                    Promise.resolve(MobileMenuManager.initialize()),
                    Promise.resolve(ArtistCardsAnimationManager.initialize()),
                    Promise.resolve(new CarrosselDepoimentos())
                ]);
                await new Promise(r => requestAnimationFrame(() => {
                    ScrollManager.handleExternalLinks();
                    r();
                }));
            });
        } catch (e) {}
    }
}


AppInitializer.initialize();

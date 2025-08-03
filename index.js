const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isLowPowerMode = navigator.connection && navigator.connection.saveData;

window.addEventListener('load', async () => {
    try {
        await new Promise(resolve => {
            if (document.readyState === 'complete') resolve();
            else window.addEventListener('load', resolve, { once: true });
        });
        const nav = performance.getEntriesByType('navigation')[0];
        const isBack = nav && nav.type === 'back_forward';
        const isReload = nav && nav.type === 'reload';
        const firstVisit = !sessionStorage.getItem('hasVisited');
        const fromExternal = !document.referrer || !document.referrer.includes(location.hostname);
        if ((firstVisit || fromExternal) && !isBack && !isReload) {
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
            scrollTo({ top: 0, behavior: 'smooth' });
        }
        sessionStorage.setItem('hasVisited', 'true');
    } catch {}
});

window.addEventListener('scroll', () => {
    document.querySelector('.barra-navegacao')?.classList.toggle('scrolled', scrollY > 50);
});

document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.secao-abertura-video');
    if (!video) return;
    Object.assign(video, {
        muted: true, autoplay: true, loop: true, playsInline: true, controls: false, volume: 0, defaultMuted: true
    });
    ['playsinline', 'webkit-playsinline', 'muted', 'autoplay', 'loop', 'preload', 'x-webkit-airplay', 'disablepictureinpicture'].forEach(attr =>
        video.setAttribute(attr, attr === 'preload' ? 'metadata' : '')
    );
    video.setAttribute('controlslist', 'nodownload nofullscreen noremoteplaybook');
    let hasUserInteracted = false, autoPlayAttempted = false, playAttempts = 0, maxPlayAttempts = 10;
    const forcePlay = async () => {
        try {
            if (++playAttempts > maxPlayAttempts) return false;
            video.muted = true; video.volume = 0;
            if (isIOS || isSafari) await new Promise(r => setTimeout(r, 100));
            await video.play();
            return !video.paused;
        } catch {
            if (isLowPowerMode || (isMobile && !hasUserInteracted)) return false;
            if (playAttempts < maxPlayAttempts) setTimeout(forcePlay, 500);
            return false;
        }
    };
    const handleFirstInteraction = async e => {
        if (hasUserInteracted) return;
        hasUserInteracted = true;
        e.preventDefault(); e.stopPropagation();
        if (await forcePlay()) {
            document.removeEventListener('touchstart', handleFirstInteraction, true);
            document.removeEventListener('click', handleFirstInteraction, true);
        }
    };
    const captureAnyInteraction = () => {
        if (!autoPlayAttempted) {
            autoPlayAttempted = true;
            forcePlay();
        }
    };
    document.addEventListener('touchstart', handleFirstInteraction, { capture: true, passive: false });
    document.addEventListener('click', handleFirstInteraction, { capture: true, passive: false });
    ['touchstart', 'touchend', 'touchmove', 'click', 'scroll', 'keydown', 'mousedown', 'wheel', 'focus']
        .forEach(ev => document.addEventListener(ev, captureAnyInteraction, { once: true, passive: true }));
    const attemptAutoplay = () => {
        [0, 100, 300, 500, 1000, 2000].forEach(delay =>
            setTimeout(async () => {
                if (!hasUserInteracted && video.paused && playAttempts < maxPlayAttempts) await forcePlay();
            }, delay)
        );
        if (video.readyState >= 2) setTimeout(() => { if (video.paused && !hasUserInteracted) forcePlay(); }, 3000);
    };
    ['loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough'].forEach(ev =>
        video.addEventListener(ev, forcePlay)
    );
    video.addEventListener('pause', () => { if (hasUserInteracted && !isLowPowerMode) setTimeout(forcePlay, 100); });
    video.addEventListener('ended', () => { if (video.loop) forcePlay(); });
    new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting && video.paused) forcePlay(); });
    }, { threshold: 0.5 }).observe(video);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && video.paused && hasUserInteracted) forcePlay();
    });
    attemptAutoplay();
    setTimeout(() => { if (video.paused && !hasUserInteracted) { hasUserInteracted = true; forcePlay(); } }, 3000);
    setTimeout(() => {
        if (video.paused && video.readyState >= 2) {
            video.muted = true;
            video.play().catch(() => {
                if (!isMobile) {
                    const btn = document.createElement('button');
                    btn.innerHTML = 'Clique para reproduzir o vídeo';
                    btn.style.cssText = `
                        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                        z-index: 10; background: rgba(0,0,0,0.8); color: white; border: none;
                        padding: 15px 25px; border-radius: 25px; font-size: 16px; cursor: pointer;
                    `;
                    btn.onclick = () => { video.play(); btn.remove(); };
                    video.parentElement.style.position = 'relative';
                    video.parentElement.appendChild(btn);
                }
            });
        }
    }, 5000);
});

const menuHamburguer = document.querySelector('.menu-hamburguer');
const menuLinks = document.querySelector('.barra-navegacao-menu');
menuHamburguer?.addEventListener('click', () => {
    menuHamburguer.classList.toggle('active');
    menuLinks?.classList.toggle('active');
});
document.querySelectorAll('.barra-navegacao-menu a').forEach(link =>
    link.addEventListener('click', () => {
        menuHamburguer?.classList.remove('active');
        menuLinks?.classList.remove('active');
    })
);
document.addEventListener('click', e => {
    if (!menuHamburguer?.contains(e.target) && !menuLinks?.contains(e.target)) {
        menuHamburguer?.classList.remove('active');
        menuLinks?.classList.remove('active');
    }
});

const observador = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (innerWidth >= 768)
            entry.target.classList.toggle('visible', entry.isIntersecting);
        else
            entry.target.classList.add('visible');
    });
});
document.querySelectorAll('.cartao-artista').forEach(card => observador.observe(card));

async function criarParticulas() {
    const container = document.querySelector('.fundo-particulas');
    if (!container) return;
    try {
        await new Promise(r => requestAnimationFrame(() => { container.innerHTML = ''; r(); }));
        const qtd = innerWidth <= 768 ? 8 : 12;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < qtd; i++) {
            const p = document.createElement('div');
            p.className = 'particula';
            p.style.left = `${Math.random() * 100}%`;
            p.style.top = `100vh`;
            p.style.animationDelay = `${Math.random() * 8}s`;
            p.style.animationDuration = `${(innerWidth <= 768 ? 10 : 8) + Math.random() * 4}s`;
            const t = 1 + Math.random() * 2;
            p.style.width = `${t}px`; p.style.height = `${t}px`;
            frag.appendChild(p);
        }
        await new Promise(r => requestAnimationFrame(() => {
            container.appendChild(frag);
            container.style.display = 'none'; container.offsetHeight; container.style.display = 'block';
            r();
        }));
    } catch {}
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const logo = document.querySelector('.barra-navegacao-logo');
        if (logo) {
            logo.addEventListener('click', async e => {
                e.preventDefault();
                await new Promise(resolve => {
                    scrollTo({ top: 0, behavior: 'smooth' });
                    (function check() {
                        if (scrollY <= 5) resolve();
                        else requestAnimationFrame(check);
                    })();
                });
            });
            logo.style.cursor = 'pointer';
        }
        await new Promise(r => requestAnimationFrame(() => {
            document.querySelectorAll('a[target="_blank"], a[href^="http"], a[href^="mailto"]').forEach(link =>
                link.addEventListener('click', async () => {
                    try {
                        sessionStorage.setItem('scrollPosition', scrollY.toString());
                        sessionStorage.setItem('clickedExternalLink', 'true');
                        await new Promise(r2 => setTimeout(r2, 10));
                    } catch {}
                })
            );
            r();
        }));
    } catch {}
});

window.addEventListener('focus', async () => {
    try {
        if (sessionStorage.getItem('clickedExternalLink')) {
            sessionStorage.removeItem('clickedExternalLink');
            await new Promise(r => requestAnimationFrame(r));
            scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch {}
});

function abrirEmail() {
    if (innerWidth > 768) {
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
        this.threshold = 50;
        this.isInteracting = false;
        this.autoPlayInterval = null;
        this.init();
    }
    init() {
        if (!this.totalSlides) return;
        this.btnPrev?.addEventListener('click', () => this.slidePrev());
        this.btnNext?.addEventListener('click', () => this.slideNext());
        this.indicadores.forEach((ind, i) => ind.addEventListener('click', () => this.irPara(i)));
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
        const [currentX, currentY] = [e.touches[0].clientX, e.touches[0].clientY];
        const [diffX, diffY] = [Math.abs(currentX - this.startX), Math.abs(currentY - this.startY)];
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
        if (Math.abs(diffX) > this.threshold && Math.abs(diffX) > diffY)
            diffX > 0 ? this.slideNext() : this.slidePrev();
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

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await criarParticulas();
        setInterval(criarParticulas, 30000);
        new CarrosselDepoimentos();
    } catch {
        try { new CarrosselDepoimentos(); } catch {}
    }
});

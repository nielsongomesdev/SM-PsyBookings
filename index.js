window.addEventListener('load', async function() {
    try {
        await new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve, { once: true });
            }
        });

        const navigation = performance.getEntriesByType('navigation')[0];
        const isBackNavigation = navigation && navigation.type === 'back_forward';
        const isReload = navigation && navigation.type === 'reload';
        const isFirstVisit = !sessionStorage.getItem('hasVisited');
        const comesFromExternal = !document.referrer || !document.referrer.includes(window.location.hostname);
        const shouldScrollToTop = (isFirstVisit || comesFromExternal) && !isBackNavigation && !isReload;

        if (shouldScrollToTop) {
            await new Promise(resolve => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(resolve);
                });
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        sessionStorage.setItem('hasVisited', 'true');
    } catch (error) {
        sessionStorage.setItem('hasVisited', 'true');
    }
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

    // Configurações críticas para autoplay cross-platform
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = false;
    video.volume = 0;
    video.defaultMuted = true;

    // Atributos HTML5 para máxima compatibilidade
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.setAttribute('preload', 'metadata');
    
    // Configurações adicionais para iOS/Safari
    video.setAttribute('x-webkit-airplay', 'deny');
    video.setAttribute('disablepictureinpicture', '');
    video.setAttribute('controlslist', 'nodownload nofullscreen noremoteplaybook');

    let hasUserInteracted = false;
    let autoPlayAttempted = false;
    let playAttempts = 0;
    const maxPlayAttempts = 10;

    // Detecção de dispositivo e navegador
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isLowPowerMode = navigator.connection && navigator.connection.saveData;

    const forcePlay = async () => {
        try {
            playAttempts++;
            if (playAttempts > maxPlayAttempts) return false;

            // Garante que está mudo
            video.muted = true;
            video.volume = 0;
            
            // Para iOS/Safari, aguarda um pouco antes de tentar
            if (isIOS || isSafari) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            const playPromise = video.play();
            if (playPromise !== undefined) {
                await playPromise;
            }
            
            return !video.paused;
        } catch (error) {
            // Em dispositivos móveis, especialmente iOS, autoplay pode falhar
            if (isLowPowerMode || (isMobile && !hasUserInteracted)) {
                return false;
            }
            
            // Tenta novamente após um delay
            if (playAttempts < maxPlayAttempts) {
                setTimeout(() => forcePlay(), 500);
            }
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

    ['touchstart', 'touchend', 'touchmove', 'click', 'scroll', 'keydown', 'mousedown', 'wheel', 'focus'].forEach(event => {
        document.addEventListener(event, captureAnyInteraction, { once: true, passive: true });
    });

    const attemptAutoplay = async () => {
        // Estratégia escalonada de tentativas
        const delays = [0, 100, 300, 500, 1000, 2000];
        
        for (let i = 0; i < delays.length; i++) {
            setTimeout(async () => {
                if (!hasUserInteracted && video.paused && playAttempts < maxPlayAttempts) {
                    const success = await forcePlay();
                    if (success) return;
                }
            }, delays[i]);
        }
        
        // Tentativa final após carregamento completo
        if (video.readyState >= 2) {
            setTimeout(async () => {
                if (video.paused && !hasUserInteracted) {
                    await forcePlay();
                }
            }, 3000);
        }
    };

    // Listeners de carregamento otimizados por dispositivo
    video.addEventListener('loadstart', () => {
        if (!isMobile || hasUserInteracted) forcePlay();
    });
    
    video.addEventListener('loadedmetadata', () => {
        if (!isLowPowerMode) forcePlay();
    });
    
    video.addEventListener('loadeddata', forcePlay);
    video.addEventListener('canplay', forcePlay);
    video.addEventListener('canplaythrough', forcePlay);

    video.addEventListener('pause', () => {
        if (hasUserInteracted && !isLowPowerMode) {
            setTimeout(forcePlay, 100);
        }
    });

    video.addEventListener('ended', () => {
        if (video.loop) forcePlay();
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

    // Verificação final para dispositivos problemáticos
    setTimeout(() => {
        if (video.paused && video.readyState >= 2) {
            // Última tentativa sem aguardar interação
            video.muted = true;
            video.play().catch(() => {
                // Se ainda assim falhar, mostra um indicador visual
                const playButton = document.createElement('button');
                playButton.innerHTML = '▶️ Clique para reproduzir o vídeo';
                playButton.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 10;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 25px;
                    font-size: 16px;
                    cursor: pointer;
                `;
                playButton.onclick = () => {
                    video.play();
                    playButton.remove();
                };
                video.parentElement.style.position = 'relative';
                video.parentElement.appendChild(playButton);
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

async function criarParticulas() {
    const container = document.querySelector('.fundo-particulas');
    if (!container) return;

    try {
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                container.innerHTML = '';
                resolve();
            });
        });

        const isMobile = window.innerWidth <= 768;
        const quantidadeParticulas = isMobile ? 8 : 12;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < quantidadeParticulas; i++) {
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
            fragment.appendChild(particula);
        }

        await new Promise(resolve => {
            requestAnimationFrame(() => {
                container.appendChild(fragment);
                container.style.display = 'none';
                container.offsetHeight;
                container.style.display = 'block';
                resolve();
            });
        });

    } catch (error) {}
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const logo = document.querySelector('.barra-navegacao-logo');
        if (logo) {
            logo.addEventListener('click', async (e) => {
                e.preventDefault();
                await new Promise(resolve => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    const checkScroll = () => {
                        if (window.scrollY <= 5) {
                            resolve();
                        } else {
                            requestAnimationFrame(checkScroll);
                        }
                    };
                    checkScroll();
                });
            });
            logo.style.cursor = 'pointer';
        }

        await new Promise(resolve => {
            requestAnimationFrame(() => {
                const externalLinks = document.querySelectorAll('a[target="_blank"], a[href^="http"], a[href^="mailto"]');
                externalLinks.forEach(link => {
                    link.addEventListener('click', async () => {
                        try {
                            sessionStorage.setItem('scrollPosition', window.scrollY.toString());
                            sessionStorage.setItem('clickedExternalLink', 'true');
                            await new Promise(resolve => setTimeout(resolve, 10));
                        } catch (error) {}
                    });
                });
                resolve();
            });
        });

    } catch (error) {}
});

window.addEventListener('focus', async () => {
    try {
        const clickedExternal = sessionStorage.getItem('clickedExternalLink');
        if (clickedExternal) {
            sessionStorage.removeItem('clickedExternalLink');
            await new Promise(resolve => requestAnimationFrame(resolve));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {}
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

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await criarParticulas();
        setInterval(async () => {
            try {
                await criarParticulas();
            } catch (error) {}
        }, 30000);
        new CarrosselDepoimentos();
    } catch (error) {
        try {
            new CarrosselDepoimentos();
        } catch (fallbackError) {}
    }
});

// ESTRATÉGIA FINAL: Aceita o botão do iOS e simula clique automático
document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.secao-abertura-video');
    
    if (!video) return;
    
    console.log('🎬 ESTRATÉGIA FINAL: Simulação de clique automático no botão do iOS...');
    
    // Configuração básica obrigatória
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.volume = 0;
    video.defaultMuted = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.setAttribute('preload', 'metadata');
    
    let tentativasAutoClique = 0;
    const maxTentativas = 15;
    let videoJaTocando = false;
    
    // Função para detectar e clicar no botão de play do iOS
    const simularCliqueNoBotaoPlay = () => {
        if (videoJaTocando || tentativasAutoClique >= maxTentativas) return;
        
        tentativasAutoClique++;
        console.log(`🤖 Tentativa ${tentativasAutoClique} de auto-clique...`);
        
        // Simula clique no centro do vídeo (onde fica o botão)
        const rect = video.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Sequência completa de eventos touch
        const eventos = [
            new TouchEvent('touchstart', {
                bubbles: true,
                cancelable: true,
                view: window,
                touches: [{
                    clientX: centerX,
                    clientY: centerY,
                    target: video,
                    identifier: 0
                }]
            }),
            new TouchEvent('touchend', {
                bubbles: true,
                cancelable: true,
                view: window,
                changedTouches: [{
                    clientX: centerX,
                    clientY: centerY,
                    target: video,
                    identifier: 0
                }]
            }),
            new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                clientX: centerX,
                clientY: centerY,
                button: 0
            }),
            new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                clientX: centerX,
                clientY: centerY,
                button: 0
            }),
            new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                clientX: centerX,
                clientY: centerY,
                button: 0
            })
        ];
        
        // Dispara os eventos em sequência
        eventos.forEach((evento, index) => {
            setTimeout(() => {
                video.dispatchEvent(evento);
                console.log(`📱 Evento ${evento.type} disparado`);
            }, index * 30);
        });
        
        // Tenta forçar play também
        setTimeout(async () => {
            try {
                video.muted = true;
                video.volume = 0;
                await video.play();
                console.log('✅ Play forçado com sucesso!');
                videoJaTocando = true;
            } catch (error) {
                console.log('❌ Play forçado falhou:', error.message);
            }
        }, 300);
    };
    
    // Função mais agressiva - dispara múltiplos cliques
    const bombardeioCliques = () => {
        if (videoJaTocando) return;
        
        console.log('💥 Bombardeio de cliques ativado...');
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                simularCliqueNoBotaoPlay();
            }, i * 200);
        }
    };
    
    // Monitora quando o vídeo está pronto
    const iniciarAutoClique = () => {
        if (video.readyState >= 2 && video.paused && !videoJaTocando) {
            console.log('🎯 Vídeo pronto - iniciando auto-clique...');
            simularCliqueNoBotaoPlay();
        }
    };
    
    // Observer para detectar quando vídeo entra na tela
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && video.paused && !videoJaTocando) {
                console.log('👁️ Vídeo visível - tentando auto-clique...');
                setTimeout(iniciarAutoClique, 100);
                setTimeout(bombardeioCliques, 1000);
            }
        });
    }, { threshold: 0.2 });
    observer.observe(video);
    
    // Eventos do vídeo
    video.addEventListener('loadeddata', () => {
        console.log('📊 Vídeo carregado - tentando auto-clique...');
        setTimeout(iniciarAutoClique, 100);
    });
    
    video.addEventListener('canplay', () => {
        console.log('▶️ Vídeo pode tocar - tentando auto-clique...');
        setTimeout(iniciarAutoClique, 50);
    });
    
    video.addEventListener('play', () => {
        console.log('🎉 SUCESSO: Vídeo começou a tocar!');
        videoJaTocando = true;
        tentativasAutoClique = maxTentativas;
    });
    
    video.addEventListener('pause', () => {
        if (videoJaTocando) {
            console.log('⏸️ Vídeo pausou - tentando reativar...');
            setTimeout(async () => {
                try {
                    await video.play();
                } catch (error) {
                    console.log('❌ Erro ao reativar:', error.message);
                    videoJaTocando = false; // Permite novas tentativas
                    setTimeout(bombardeioCliques, 100);
                }
            }, 50);
        }
    });
    
    // Captura interação real do usuário
    const handleUserInteraction = async (event) => {
        if (!videoJaTocando) {
            console.log('👆 Interação real detectada - forçando play...');
            try {
                await video.play();
                videoJaTocando = true;
            } catch (error) {
                console.log('❌ Erro no play por interação:', error.message);
            }
        }
    };
    
    // Listeners para qualquer interação
    ['touchstart', 'click', 'scroll', 'keydown', 'mousemove'].forEach(event => {
        document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });
    
    // Tentativas escalonadas mais agressivas
    const intervalos = [200, 500, 800, 1200, 1800, 2500, 3500, 5000, 7000, 10000];
    intervalos.forEach(tempo => {
        setTimeout(() => {
            if (!videoJaTocando && video.paused) {
                console.log(`⏰ Auto-clique programado após ${tempo}ms`);
                simularCliqueNoBotaoPlay();
            }
        }, tempo);
    });
    
    // Bombardeio final após load
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (!videoJaTocando && video.paused) {
                console.log('🔥 BOMBARDEIO FINAL após load completo...');
                bombardeioCliques();
            }
        }, 1000);
    });
    
    // Tentativa com foco na janela
    window.addEventListener('focus', () => {
        if (!videoJaTocando && video.paused) {
            console.log('🎯 Janela em foco - tentando auto-clique...');
            setTimeout(simularCliqueNoBotaoPlay, 100);
        }
    });
    
    console.log('⚡ Sistema de auto-clique AGRESSIVO configurado - aguardando oportunidade...');
});

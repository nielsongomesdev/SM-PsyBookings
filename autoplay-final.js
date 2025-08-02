// document.addEventListener('DOMContentLoaded', () => {
//     const video = document.querySelector('.secao-abertura-video');
//     if (!video) return;

//     video.muted = true;
//     video.autoplay = true;
//     video.loop = true;
//     video.playsInline = true;
//     video.volume = 0;
//     video.defaultMuted = true;
//     video.setAttribute('playsinline', '');
//     video.setAttribute('webkit-playsinline', '');
//     video.setAttribute('muted', '');
//     video.setAttribute('autoplay', '');
//     video.setAttribute('loop', '');
//     video.setAttribute('preload', 'metadata');

//     let tentativasAutoClique = 0;
//     const maxTentativas = 15;
//     let videoJaTocando = false;

//     const simularCliqueNoBotaoPlay = () => {
//         if (videoJaTocando || tentativasAutoClique >= maxTentativas) return;
//         tentativasAutoClique++;
//         const rect = video.getBoundingClientRect();
//         const centerX = rect.left + rect.width / 2;
//         const centerY = rect.top + rect.height / 2;
//         const eventos = [
//             new TouchEvent('touchstart', {
//                 bubbles: true,
//                 cancelable: true,
//                 view: window,
//                 touches: [{
//                     clientX: centerX,
//                     clientY: centerY,
//                     target: video,
//                     identifier: 0
//                 }]
//             }),
//             new TouchEvent('touchend', {
//                 bubbles: true,
//                 cancelable: true,
//                 view: window,
//                 changedTouches: [{
//                     clientX: centerX,
//                     clientY: centerY,
//                     target: video,
//                     identifier: 0
//                 }]
//             }),
//             new MouseEvent('mousedown', {
//                 bubbles: true,
//                 cancelable: true,
//                 clientX: centerX,
//                 clientY: centerY,
//                 button: 0
//             }),
//             new MouseEvent('mouseup', {
//                 bubbles: true,
//                 cancelable: true,
//                 clientX: centerX,
//                 clientY: centerY,
//                 button: 0
//             }),
//             new MouseEvent('click', {
//                 bubbles: true,
//                 cancelable: true,
//                 clientX: centerX,
//                 clientY: centerY,
//                 button: 0
//             })
//         ];
//         eventos.forEach((evento, index) => {
//             setTimeout(() => {
//                 video.dispatchEvent(evento);
//             }, index * 30);
//         });
//         setTimeout(async () => {
//             try {
//                 video.muted = true;
//                 video.volume = 0;
//                 await video.play();
//                 videoJaTocando = true;
//             } catch (error) {}
//         }, 300);
//     };

//     const bombardeioCliques = () => {
//         if (videoJaTocando) return;
//         for (let i = 0; i < 5; i++) {
//             setTimeout(() => {
//                 simularCliqueNoBotaoPlay();
//             }, i * 200);
//         }
//     };

//     const iniciarAutoClique = () => {
//         if (video.readyState >= 2 && video.paused && !videoJaTocando) {
//             simularCliqueNoBotaoPlay();
//         }
//     };

//     const observer = new IntersectionObserver((entries) => {
//         entries.forEach(entry => {
//             if (entry.isIntersecting && video.paused && !videoJaTocando) {
//                 setTimeout(iniciarAutoClique, 100);
//                 setTimeout(bombardeioCliques, 1000);
//             }
//         });
//     }, { threshold: 0.2 });
//     observer.observe(video);

//     video.addEventListener('loadeddata', () => {
//         setTimeout(iniciarAutoClique, 100);
//     });

//     video.addEventListener('canplay', () => {
//         setTimeout(iniciarAutoClique, 50);
//     });

//     video.addEventListener('play', () => {
//         videoJaTocando = true;
//         tentativasAutoClique = maxTentativas;
//     });

//     video.addEventListener('pause', () => {
//         if (videoJaTocando) {
//             setTimeout(async () => {
//                 try {
//                     await video.play();
//                 } catch (error) {
//                     videoJaTocando = false;
//                     setTimeout(bombardeioCliques, 100);
//                 }
//             }, 50);
//         }
//     });

//     const handleUserInteraction = async (event) => {
//         if (!videoJaTocando) {
//             try {
//                 await video.play();
//                 videoJaTocando = true;
//             } catch (error) {}
//         }
//     };

//     ['touchstart', 'click', 'scroll', 'keydown', 'mousemove'].forEach(event => {
//         document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
//     });

//     const intervalos = [200, 500, 800, 1200, 1800, 2500, 3500, 5000, 7000, 10000];
//     intervalos.forEach(tempo => {
//         setTimeout(() => {
//             if (!videoJaTocando && video.paused) {
//                 simularCliqueNoBotaoPlay();
//             }
//         }, tempo);
//     });

//     window.addEventListener('load', () => {
//         setTimeout(() => {
//             if (!videoJaTocando && video.paused) {
//                 bombardeioCliques();
//             }
//         }, 1000);
//     });

//     window.addEventListener('focus', () => {
//         if (!videoJaTocando && video.paused) {
//             setTimeout(simularCliqueNoBotaoPlay, 100);
//         }
//     });
// });

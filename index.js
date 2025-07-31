window.addEventListener('scroll', () => {
    const barraNavegacao = document.querySelector('.barra-navegacao');
    if (window.scrollY > 50) {
        barraNavegacao.classList.add('scrolled');
    } else {
        barraNavegacao.classList.remove('scrolled');
    }
});

const menuHamburguer = document.querySelector('.menu-hamburguer');
const menuLinks = document.querySelector('.barra-navegacao-menu');

menuHamburguer.addEventListener('click', () => {
    menuHamburguer.classList.toggle('active');
    menuLinks.classList.toggle('active');
});

document.querySelectorAll('.barra-navegacao-menu a').forEach(link => {
    link.addEventListener('click', () => {
        menuHamburguer.classList.remove('active');
        menuLinks.classList.remove('active');
    });
});

document.addEventListener('click', (e) => {
    if (!menuHamburguer.contains(e.target) && !menuLinks.contains(e.target)) {
        menuHamburguer.classList.remove('active');
        menuLinks.classList.remove('active');
    }
});

const observador = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
});

const cardsParaObservar = document.querySelectorAll('.cartao-artista');
cardsParaObservar.forEach((card) => observador.observe(card));

function criarParticulas() {
    const containerParticulas = document.querySelector('.fundo-particulas');
    
    if (!containerParticulas) {
        console.warn('Container de partículas não encontrado');
        return;
    }
    
    const totalParticulas = 50;
    containerParticulas.innerHTML = '';
    
    for (let i = 0; i < totalParticulas; i++) {
        const particula = document.createElement('div');
        particula.className = 'particula';
        
        particula.style.left = Math.random() * 100 + '%';
        particula.style.animationDelay = Math.random() * 6 + 's';
        particula.style.animationDuration = (6 + Math.random() * 4) + 's';
        
        const tamanho = 1 + Math.random() * 3;
        particula.style.width = tamanho + 'px';
        particula.style.height = tamanho + 'px';
        
        containerParticulas.appendChild(particula);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    criarParticulas();
    setInterval(criarParticulas, 12000);
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

function abrirEmail() {
    if (window.innerWidth > 768) {
        window.open('https://mail.google.com/mail/?view=cm&fs=1&to=smpsybookings@gmail.com&su=Contato%20via%20Site%20S%26M%20PsyBookings', '_blank');
        return false;
    }
    return true;
}

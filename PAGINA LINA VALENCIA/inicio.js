$(document).ready(function() {
    // =========================================================
    // 1. INICIALIZACIÓN DEL CARRUSEL Y LOADER
    // =========================================================
    var $myCarousel = $('#myCarousel');
    $myCarousel.carousel({
        interval: 5000,
        pause: 'hover'
    });

    // Controles del carrusel (Flechas)
    $('.left.carousel-control').on('click', function(e) {
        e.preventDefault();
        $myCarousel.carousel('prev');
    });
    $('.right.carousel-control').on('click', function(e) {
        e.preventDefault();
        $myCarousel.carousel('next');
    });

    // Salida Controlada y limpia del Loader
    function launchSite() {
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 500); 
    }

    // Disparamos la carga inicial del sitio
    launchSite();
});

// =========================================================
// 2. EFECTO PARALLAX (CORAZONES) Y CAMBIO DE COLOR PASTEL
// =========================================================
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Animación de los corazones flotando hacia arriba
    const corazones = document.querySelectorAll('.corazon');
    corazones.forEach((corazon, index) => {
        const speed = 0.4 + (index * 0.2); 
        corazon.style.transform = `translateY(-${scrollY * speed}px) rotate(${scrollY * 0.05}deg)`;
    });

    // Cambio de color de fondo (Crema Avainillado -> Rosa Pastel Empolvado)
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    let porcentajeScroll = (scrollY / alturaTotal) * 1.2; 
    
    if (porcentajeScroll > 1) porcentajeScroll = 1;
    if (porcentajeScroll < 0) porcentajeScroll = 0;

    // Color INICIAL: Crema Avainillado
    const inicioR = 253, inicioG = 250, inicioB = 244;
    
    // Color FINAL: Rosa Pastel Empolvado
    const finR = 238, finG = 211, finB = 215;

    // Cálculo matemático de la transición suave
    const r = Math.round(inicioR + (finR - inicioR) * porcentajeScroll); 
    const g = Math.round(inicioG + (finG - inicioG) * porcentajeScroll); 
    const b = Math.round(inicioB + (finB - inicioB) * porcentajeScroll); 

    // Aplicar el color calculado al contenedor de corazones
    const bgCorazones = document.querySelector('.bg-corazones');
    if(bgCorazones) {
        bgCorazones.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    }
});

// =========================================================
// 3. EFECTO "SLIDE REVEAL" (APARICIÓN DE TORTAS Y TEXTO)
// =========================================================
document.addEventListener("DOMContentLoaded", function() {
    
    const observerOptions = {
        threshold: 0.15 // Se activa cuando el 15% de la sección es visible
    };

    const esenciaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Cuando el usuario BAJA y ve la sección: Activa la animación
                entry.target.querySelectorAll('.anim-desde-izq, .anim-desde-der, .anim-desde-centro')
                    .forEach(el => el.classList.add('aparecer'));
            } else {
                // Cuando el usuario SUBE y la sección desaparece: Reinicia la animación
                entry.target.querySelectorAll('.anim-desde-izq, .anim-desde-der, .anim-desde-centro')
                    .forEach(el => el.classList.remove('aparecer'));
            }
        });
    }, observerOptions);

   // Buscamos TODAS las secciones que queremos vigilar y las animamos
    const seccionesAAnimar = document.querySelectorAll('.nuestra-esencia, .clientes-satisfechos');
    seccionesAAnimar.forEach(seccion => {
        esenciaObserver.observe(seccion);
    });
});

// =========================================================
// 4. NAVEGACIÓN LATERAL (SIDENAV MÓVIL)
// =========================================================
function openNav() { 
    document.getElementById("mySidenav").style.width = "280px"; 
}

function closeNav() { 
    document.getElementById("mySidenav").style.width = "0"; 
}
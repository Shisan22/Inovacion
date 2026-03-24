/* ═══════════════════════════════════════════════
   InfoFilter — main.js
   Interacciones y animaciones
   ═══════════════════════════════════════════════ */

// ─── CONTADOR ANIMADO EN EL HERO ───
(function animateCounter() {
  const el = document.getElementById('counterNum');
  if (!el) return;
  const target = 1247893;
  const duration = 2200;
  const start = Date.now();
  const step = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target).toLocaleString('es-CO');
    if (progress < 1) requestAnimationFrame(step);
  };
  setTimeout(() => requestAnimationFrame(step), 600);
})();

// ─── MENÚ MÓVIL ───
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

navToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Cierra el menú al hacer clic en un enlace
navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ─── NAVBAR: SOMBRA AL HACER SCROLL ───
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 20
    ? '0 4px 32px rgba(0,0,0,0.4)'
    : 'none';
});

// ─── ANIMACIÓN DE ENTRADA AL HACER SCROLL (Intersection Observer) ───
const observerConfig = {
  threshold: 0.1,
  rootMargin: '0px 0px -60px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerConfig);

// Selecciona elementos a animar al entrar en pantalla
const animTargets = document.querySelectorAll(
  '.problema-card, .stat-item, .modulo-card, .tool-card, .met-step'
);

animTargets.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
  observer.observe(el);
});

// ─── FORMULARIO DE INSCRIPCIÓN ───
function handleFormSubmit(e) {
  e.preventDefault();
  const input  = e.target.querySelector('.cta-input');
  const button = e.target.querySelector('button');
  const email  = input.value;

  button.textContent = '¡Listo! Te confirmaremos pronto ✓';
  button.style.background = 'var(--color-success)';
  input.value = '';
  input.disabled = true;
  button.disabled = true;

  // Restaurar botón después de 5 segundos
  setTimeout(() => {
    button.textContent = 'Quiero inscribirme';
    button.style.background = '';
    input.disabled = false;
    button.disabled = false;
  }, 5000);
}

// ─── BARRA DE PROGRESO DE LECTURA ───
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  height: 2px;
  background: var(--color-accent);
  z-index: 200;
  transition: width 0.1s linear;
  width: 0%;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop    = window.scrollY;
  const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  progressBar.style.width = scrollPercent + '%';
});

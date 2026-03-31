/* ========================================
   YASSCREW — Main JavaScript
   Global: loader, cursor, nav, animations
   ======================================== */

// ─── LOADER ──────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const progress = document.getElementById('loaderProgress');
  const loaderText = document.getElementById('loaderText');

  if (!loader) return;

  document.body.classList.add('loading');

  const steps = [
    { value: 30, text: 'Inicializando...' },
    { value: 60, text: 'Carregando assets...' },
    { value: 85, text: 'Preparando 3D...' },
    { value: 100, text: 'Pronto!' }
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i < steps.length) {
      if (progress) progress.style.width = steps[i].value + '%';
      if (loaderText) loaderText.textContent = steps[i].text;
      i++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
        initParticles();
        initCounters();
      }, 400);
    }
  }, 350);
});

// ─── CUSTOM CURSOR ───────────────────────
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursor) {
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  }
});

function animateCursor() {
  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;
  if (cursorFollower) {
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top = followerY + 'px';
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, [onclick], .color-btn, .piece-btn, .size-btn').forEach(el => {
  el.addEventListener('mouseenter', () => { if (cursor) cursor.classList.add('active'); });
  el.addEventListener('mouseleave', () => { if (cursor) cursor.classList.remove('active'); });
});

// ─── HEADER SCROLL ───────────────────────
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (!header) return;
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}, { passive: true });

// ─── HAMBURGER MENU ──────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ─── PARTICLES ───────────────────────────
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 6 + 4) + 's';
    p.style.animationDelay = (Math.random() * 8) + 's';
    p.style.width = (Math.random() * 3 + 1) + 'px';
    p.style.height = p.style.width;
    container.appendChild(p);
  }
}

// ─── COUNTER ANIMATION ───────────────────
function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const update = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.floor(current).toLocaleString('pt-BR');
        requestAnimationFrame(update);
      } else {
        counter.textContent = target.toLocaleString('pt-BR');
      }
    };
    update();
  });
}

// ─── AOS (Animate On Scroll) ──────────────
function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  elements.forEach(el => observer.observe(el));
}

window.addEventListener('load', initAOS);

// ─── TESTIMONIALS SLIDER ──────────────────
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial-card');
const testimonialDots = document.querySelectorAll('.testimonial-dots .dot');

function goToTestimonial(index) {
  if (!testimonials.length) return;
  testimonials[currentTestimonial].classList.remove('active');
  if (testimonialDots[currentTestimonial]) testimonialDots[currentTestimonial].classList.remove('active');
  currentTestimonial = index;
  testimonials[currentTestimonial].classList.add('active');
  if (testimonialDots[currentTestimonial]) testimonialDots[currentTestimonial].classList.add('active');
}

// Auto testimonial
setInterval(() => {
  if (testimonials.length > 0) {
    goToTestimonial((currentTestimonial + 1) % testimonials.length);
  }
}, 5000);

// ─── PREVIEW COLOR CHANGE ─────────────────
function changePreviewColor(color) {
  const shirt = document.getElementById('previewShirt');
  if (shirt) shirt.style.background = color;

  const sleeve = document.querySelectorAll('#tshirt3dPreview .tshirt-sleeve');
  sleeve.forEach(s => s.style.background = color);

  // Update active state on palette
  document.querySelectorAll('.vs-palette-item').forEach(item => {
    item.style.borderColor = 'transparent';
  });
}

// ─── ROTATE PREVIEW ───────────────────────
let previewRotation = 0;
function rotatePreview(dir) {
  const body = document.querySelector('.tshirt-body');
  if (!body) return;
  previewRotation += dir === 'left' ? -45 : 45;
  body.style.transform = `rotateY(${previewRotation}deg)`;
}

// ─── SMOOTH SCROLL ────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ─── PARALLAX HERO ────────────────────────
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero-content');
  if (hero) {
    const scrolled = window.pageYOffset;
    hero.style.transform = `translateY(${scrolled * 0.2}px)`;
    hero.style.opacity = 1 - scrolled * 0.003;
  }
}, { passive: true });

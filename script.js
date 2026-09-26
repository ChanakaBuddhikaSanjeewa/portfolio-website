// ============================================
// NAV: scroll background + mobile menu
// ============================================
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  updateProgressBar();
}, { passive: true });

burger.addEventListener('click', () => {
  nav.classList.toggle('menu-open');
  burger.classList.toggle('open');
});

document.querySelectorAll('.nav__link, .nav__cta').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('menu-open');
    burger.classList.remove('open');
  });
});

// ============================================
// SCROLL PROGRESS BAR
// ============================================
const progressBar = document.getElementById('progressBar');
function updateProgressBar() {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = scrolled + '%';
}

// ============================================
// TYPED ROLE TEXT (hero eyebrow)
// ============================================
const roles = [
  'FULL-STACK LEANING DEVELOPER',
  'IT UNDERGRADUATE',
  'CYBERSECURITY ENTHUSIAST',
  'DATA & AUTOMATION TINKERER'
];
const typedEl = document.getElementById('typedRole');
let roleIdx = 0, charIdx = 0, deleting = false;

function typeLoop() {
  const current = roles[roleIdx];
  if (!deleting) {
    charIdx++;
    typedEl.textContent = current.slice(0, charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1600);
      return;
    }
  } else {
    charIdx--;
    typedEl.textContent = current.slice(0, charIdx);
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
    }
  }
  setTimeout(typeLoop, deleting ? 35 : 55);
}
if (typedEl) typeLoop();

// ============================================
// HERO SPOTLIGHT — follows pointer
// ============================================
const heroSection = document.querySelector('.hero');
const spotlight = document.getElementById('spotlight');
if (heroSection && spotlight && matchMedia('(hover:hover)').matches) {
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    spotlight.style.setProperty('--x', x + '%');
    spotlight.style.setProperty('--y', y + '%');
  });
}

// ============================================
// SCROLL REVEAL (IntersectionObserver)
// ============================================
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ============================================
// ANIMATED COUNTERS (about facts)
// ============================================
const counters = document.querySelectorAll('.fact__num');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });
counters.forEach(c => counterObserver.observe(c));

function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ============================================
// CONTACT FORM — Express Node.js Backend API
// ============================================
const API_URL = 'https://portfolio-website-production-05b8.up.railway.app/api/contact';
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

if (contactForm) {
  const submitBtn = contactForm.querySelector('.form-submit');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      if (formNote) formNote.textContent = 'Please fill in all fields!';
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (formNote) formNote.textContent = 'Sending message...';

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await res.json();

      if (res.ok) {
        if (formNote) formNote.textContent = 'Message sent successfully!';
        contactForm.reset();
      } else {
        if (formNote) formNote.textContent = data.message || 'Something went wrong. Please try again.';
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      if (formNote) formNote.textContent = 'Could not connect to the server.';
    } finally {
      if (submitBtn) submitBtn.disabled = false;

      // Clear the notice after 5 seconds
      setTimeout(() => {
        if (formNote) formNote.textContent = '';
      }, 5000);
    }
  });
}

// ============================================
// SMOOTH ANCHOR SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId.length > 1) {
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});
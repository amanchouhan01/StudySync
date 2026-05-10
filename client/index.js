// =============================================
//  StudySync — index.js  (complete)
// =============================================

const OWNER_EMAIL = 'amanc0508@gmail.com';

/* ── tiny helpers ── */
const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ══════════════════════════════════════════════
   ADD IDs to landmark sections so nav links work
   ══════════════════════════════════════════════ */
const sectionMap = {
  home:     '.content',
  features: '.feature-container',
  pricing:  '.newsletter-container',
  blog:     '.testimonial-container',
  about:    '.company-container',
  contact:  '.footer-container',
};
Object.entries(sectionMap).forEach(([id, sel]) => {
  const el = $(sel);
  if (el && !el.id) el.id = id;
});

/* ── Logo → scroll to top ── */
$$('.logo, .logo-link').forEach(a => {
  a.setAttribute('href', '#');
  a.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMenu();
  });
});

/* ══════════════════════════════════════════════
   SMOOTH SCROLL for all anchor links
   ══════════════════════════════════════════════ */
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  const id = anchor.getAttribute('href').slice(1);
  if (!id) return;
  const target = document.getElementById(id);
  if (target) {
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
    closeMenu();
  }
});

/* ══════════════════════════════════════════════
   STICKY HEADER
   ══════════════════════════════════════════════ */
const headerWrap = $('.header');
window.addEventListener('scroll', () => {
  headerWrap?.classList.toggle('header--scrolled', window.scrollY > 10);
}, { passive: true });

/* ══════════════════════════════════════════════
   DARK MODE TOGGLE
   ══════════════════════════════════════════════ */
const headerContent = $('.header-content');
const darkBtn = document.createElement('button');
darkBtn.className = 'dark-toggle';
darkBtn.setAttribute('aria-label', 'Toggle dark mode');
darkBtn.innerHTML = `<span class="dark-icon">🌙</span>`;

// Create a right-side wrapper (3rd grid column) and move contact + dark + hamburger into it
const menuBtn = $('.menu-button');
const contactBtn2 = $('.contact-button');
const headerRight = document.createElement('div');
headerRight.className = 'header-right';
headerContent.appendChild(headerRight);
if (contactBtn2) headerRight.appendChild(contactBtn2);
headerRight.appendChild(darkBtn);
if (menuBtn) headerRight.appendChild(menuBtn);

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let isDark = localStorage.getItem('ss-dark') === 'true' || (localStorage.getItem('ss-dark') === null && prefersDark);

function applyDark(dark) {
  document.documentElement.classList.toggle('dark', dark);
  darkBtn.querySelector('.dark-icon').textContent = dark ? '☀️' : '🌙';
  localStorage.setItem('ss-dark', dark);
}
applyDark(isDark);
darkBtn.addEventListener('click', () => { isDark = !isDark; applyDark(isDark); });

/* ══════════════════════════════════════════════
   MOBILE HAMBURGER MENU
   ══════════════════════════════════════════════ */
const nav = $('.nav');
const backdrop = document.createElement('div');
backdrop.className = 'mobile-backdrop';
document.body.appendChild(backdrop);

const closeX = document.createElement('button');
closeX.className = 'nav-close-btn';
closeX.innerHTML = '✕';
closeX.setAttribute('aria-label', 'Close menu');
nav?.prepend(closeX);

function openMenu() {
  nav?.classList.add('nav--open');
  backdrop.classList.add('backdrop--visible');
  document.body.style.overflow = 'hidden';
  menuBtn?.setAttribute('aria-expanded', 'true');
}
function closeMenu() {
  nav?.classList.remove('nav--open');
  backdrop.classList.remove('backdrop--visible');
  document.body.style.overflow = '';
  menuBtn?.setAttribute('aria-expanded', 'false');
}

menuBtn?.addEventListener('click', openMenu);
closeX?.addEventListener('click', closeMenu);
backdrop.addEventListener('click', closeMenu);

/* ══════════════════════════════════════════════
   ACTIVE NAV LINK on scroll
   ══════════════════════════════════════════════ */
const navLinks = $$('.nav-link');
const sectionEls = Object.keys(sectionMap).map(id => document.getElementById(id)).filter(Boolean);

new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('nav-link--active'));
      navLinks.find(a => a.getAttribute('href') === `#${entry.target.id}`)?.classList.add('nav-link--active');
    }
  });
}, { threshold: 0.35 }).observe && (() => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('nav-link--active'));
        navLinks.find(a => a.getAttribute('href') === `#${e.target.id}`)?.classList.add('nav-link--active');
      }
    });
  }, { threshold: 0.35 });
  sectionEls.forEach(el => obs.observe(el));
})();

/* Coming-soon hint for unbuilt pages */
['pricing','blog'].forEach(id => {
  navLinks.find(a => a.getAttribute('href') === `#${id}`)
    ?.addEventListener('click', () => setTimeout(() =>
      showToast(`📌 ${id.charAt(0).toUpperCase()+id.slice(1)} page coming soon!`, 'info'), 500));
});

/* ══════════════════════════════════════════════
   "Contact Us" button → contact modal
   ══════════════════════════════════════════════ */
$('.contact-button')?.addEventListener('click', (e) => {
  e.preventDefault();
  openModal({
    title: 'Contact Us',
    body: `
      <input type="text"  id="ct-name"    class="modal-input" placeholder="Your Name *">
      <input type="email" id="ct-email"   class="modal-input" placeholder="Your Email *">
      <select id="ct-subject" class="modal-input">
        <option value="">Select subject…</option>
        <option>General Inquiry</option>
        <option>Technical Support</option>
        <option>Billing</option>
        <option>Partnership</option>
        <option>Feedback</option>
      </select>
      <textarea id="ct-msg" class="modal-input" rows="4" placeholder="Your message… *" style="resize:vertical"></textarea>
    `,
    confirmText: 'Send Message',
    onConfirm() {
      const name    = $('#ct-name').value.trim();
      const email   = $('#ct-email').value.trim();
      const subject = $('#ct-subject').value || 'General Inquiry';
      const msg     = $('#ct-msg').value.trim();
      if (!name || !email || !msg) { showToast('Please fill in all required fields.', 'error'); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Invalid email address.', 'error'); return false; }
      sendEmail({
        to: OWNER_EMAIL,
        subject: `[StudySync Contact] ${subject} — from ${name}`,
        body: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${msg}`,
      });
      showToast(`Message sent! We'll reply to ${email} shortly.`, 'success');
    }
  });
});

/* ══════════════════════════════════════════════
   "Start Now" button → sign-up modal
   ══════════════════════════════════════════════ */
$('.start-button')?.addEventListener('click', (e) => {
  e.preventDefault();
  openModal({
    title: 'Create Your Free Account',
    body: `
      <input type="text"     id="su-name"  class="modal-input" placeholder="Full Name *">
      <input type="email"    id="su-email" class="modal-input" placeholder="Email Address *">
      <input type="password" id="su-pass"  class="modal-input" placeholder="Password (min 8 chars) *">
    `,
    confirmText: 'Get Started Free',
    onConfirm() {
      const name  = $('#su-name').value.trim();
      const email = $('#su-email').value.trim();
      const pass  = $('#su-pass').value;
      if (!name || !email || !pass) { showToast('Please fill in all fields.', 'error'); return false; }
      if (pass.length < 8) { showToast('Password must be ≥ 8 characters.', 'error'); return false; }
      sendEmail({
        to: OWNER_EMAIL,
        subject: `[StudySync] New Sign-Up: ${name}`,
        body: `New user sign-up:\nName: ${name}\nEmail: ${email}`,
      });
      showToast(`Welcome, ${name}! Check your inbox to verify.`, 'success');
    }
  });
});

/* ══════════════════════════════════════════════
   "Take Tour" button → guided tour
   ══════════════════════════════════════════════ */
const tourSteps = [
  { e:'👋', h:'Welcome to StudySync!',  t:'Your all-in-one platform for seamless, personalized learning. Let us walk you through in just 3 steps.' },
  { e:'🎯', h:'Personalized Paths',     t:'Our platform builds a unique learning journey for every student — adapting in real-time to your goals and progress.' },
  { e:'📊', h:'Track Your Progress',    t:'Powerful dashboards give you and your teacher instant insights. Know exactly where to focus next.' },
  { e:'🎓', h:'Earn Certificates',      t:'Complete courses and earn industry-recognized certificates backed by Google, Microsoft, LinkedIn and more.' },
];
let tourStep = 0;
function showTourStep() {
  const s = tourSteps[tourStep], last = tourStep === tourSteps.length - 1;
  openModal({
    title: `${s.e} ${s.h}`,
    body: `
      <p style="line-height:1.75;margin-bottom:14px">${s.t}</p>
      <div style="display:flex;gap:6px;justify-content:center">
        ${tourSteps.map((_,i)=>`<div style="width:8px;height:8px;border-radius:50%;background:${i===tourStep?'#6366f1':'#ddd'}"></div>`).join('')}
      </div>`,
    confirmText: last ? 'Get Started!' : 'Next →',
    cancelText:  tourStep > 0 ? '← Back' : 'Skip Tour',
    onConfirm() {
      if (last) showToast('Tour complete! Click "Start Now" to sign up.', 'success');
      else { tourStep++; closeModal(); setTimeout(showTourStep, 180); return false; }
    },
    onCancel() {
      if (tourStep > 0) { tourStep--; closeModal(); setTimeout(showTourStep, 180); return false; }
    }
  });
}
$('.tour-button')?.addEventListener('click', (e) => { e.preventDefault(); tourStep = 0; showTourStep(); });

/* ══════════════════════════════════════════════
   NEWSLETTER FORM
   ══════════════════════════════════════════════ */
$('.news-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('.news-email');
  const email = input.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.', 'error');
    input.focus(); return;
  }
  sendEmail({ to: OWNER_EMAIL, subject: '[StudySync] New Newsletter Subscriber', body: `New subscriber: ${email}` });
  showToast(`🎉 Subscribed! Check ${email} for a confirmation.`, 'success');
  input.value = '';
});

/* ══════════════════════════════════════════════
   SCROLL-REVEAL ANIMATION
   ══════════════════════════════════════════════ */
const revealEls = $$('.feature-card, .testimonial-card, .company-logo');
revealEls.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 3) * 80}ms`;
});
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('reveal--visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObs.observe(el));

/* ══════════════════════════════════════════════
   HELPER — open mailto link
   ══════════════════════════════════════════════ */
function sendEmail({ to, subject, body }) {
  window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/* ══════════════════════════════════════════════
   HELPER — Toast notifications
   ══════════════════════════════════════════════ */
const toastWrap = document.createElement('div');
toastWrap.className = 'ss-toast-wrap';
document.body.appendChild(toastWrap);

function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `ss-toast ss-toast--${type}`;
  t.textContent = msg;
  toastWrap.appendChild(t);
  setTimeout(() => t.style.opacity = '0', 2700);
  setTimeout(() => t.remove(), 3100);
}

/* ══════════════════════════════════════════════
   HELPER — Modal system
   ══════════════════════════════════════════════ */
let currentOverlay = null;
function closeModal() {
  if (!currentOverlay) return;
  currentOverlay.remove();
  currentOverlay = null;
  document.body.style.overflow = '';
}
function openModal({ title, body, confirmText='Confirm', cancelText='Cancel', onConfirm, onCancel } = {}) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'ss-overlay';
  overlay.innerHTML = `
    <div class="ss-modal" role="dialog" aria-modal="true">
      <button class="ss-modal-close" aria-label="Close">✕</button>
      <h2 class="ss-modal-title">${title}</h2>
      <div class="ss-modal-body">${body}</div>
      <div class="ss-modal-actions">
        <button class="ss-btn ss-btn--secondary ss-cancel">${cancelText}</button>
        <button class="ss-btn ss-btn--primary ss-confirm">${confirmText}</button>
      </div>
    </div>`;

  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  overlay.querySelector('.ss-modal-close').addEventListener('click', closeModal);
  overlay.querySelector('.ss-cancel').addEventListener('click', () => { if (onCancel && onCancel() === false) return; closeModal(); });
  overlay.querySelector('.ss-confirm').addEventListener('click', () => { if (onConfirm && onConfirm() === false) return; closeModal(); });

  const esc = e => { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', esc); } };
  document.addEventListener('keydown', esc);

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  currentOverlay = overlay;
  setTimeout(() => overlay.querySelector('input,select,textarea')?.focus(), 60);
}
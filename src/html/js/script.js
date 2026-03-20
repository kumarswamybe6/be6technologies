/* SCROLL PROGRESS */
window.addEventListener('scroll', () => {
  const el = document.getElementById('scroll-progress');
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  el.style.width = pct + '%';
});

/* CURSOR GLOW */
const cursor = document.getElementById('cursor-glow');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

/* SCROLL REVEAL */
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger').forEach(el => ro.observe(el));

/* MODULE ACCORDION */
document.querySelectorAll('.mod-card').forEach(card => {
  card.addEventListener('click', e => {
    if (e.target.closest('.brochure-btn')) return;
    const open = card.classList.contains('open');
    document.querySelectorAll('.mod-card.open').forEach(c => { if (c !== card) c.classList.remove('open'); });
    card.classList.toggle('open', !open);
  });
});

/* FAQ ACCORDION */
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* STAT COUNT-UP */
const statNums = document.querySelectorAll('.stat-num[data-target]');
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target, target = +el.dataset.target, dur = 1400;
      let start = null;
      const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.floor(p * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + (el.dataset.target === '11' ? '+' : '');
      };
      requestAnimationFrame(step);
      statObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
statNums.forEach(el => statObs.observe(el));

/* RIPPLE */
document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const r = document.createElement('span');
    r.classList.add('ripple');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
    this.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  });
});

/* SMOOTH NAV ACTIVE STATES */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const navObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + e.target.id ? 'var(--accent)' : '';
      });
    }
  });
}, { threshold: 0.45 });
sections.forEach(s => navObs.observe(s));


/* ═══════════════════════════════
   HERO BUBBLE / PARTICLE CANVAS
═══════════════════════════════ */
(function() {
  const canvas = document.getElementById('bubble-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = {x: -1000, y: -1000};

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  const COLORS = [
    'rgba(0,210,180,',
    'rgba(56,189,248,',
    'rgba(0,240,208,',
    'rgba(129,140,248,',
    'rgba(0,180,160,',
  ];

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 30;
      this.r = 1.5 + Math.random() * 5;
      this.baseR = this.r;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(0.25 + Math.random() * 0.6);
      this.alpha = 0.08 + Math.random() * 0.22;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.012 + Math.random() * 0.018;
      this.life = 0;
      this.maxLife = 280 + Math.random() * 300;
      // Some particles are "glow dots"
      this.glow = Math.random() > 0.75;
    }
    update() {
      this.life++;
      this.pulse += this.pulseSpeed;
      const pr = 1 + 0.2 * Math.sin(this.pulse);
      this.r = this.baseR * pr;

      // Mouse repel
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.x += dx / dist * force * 1.8;
        this.y += dy / dist * force * 1.8;
      }

      this.x += this.vx;
      this.y += this.vy;

      // fade in/out
      const fadeZone = 40;
      let a = this.alpha;
      if (this.life < fadeZone) a = this.alpha * (this.life / fadeZone);
      if (this.life > this.maxLife - fadeZone) a = this.alpha * ((this.maxLife - this.life) / fadeZone);
      this.currentAlpha = a;

      if (this.life > this.maxLife || this.y < -30) this.reset(false);
    }
    draw() {
      ctx.save();
      if (this.glow) {
        const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3.5);
        grd.addColorStop(0, this.color + (this.currentAlpha * 1.5) + ')');
        grd.addColorStop(1, this.color + '0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.currentAlpha + ')';
      ctx.fill();
      ctx.restore();
    }
  }

  // Lines between nearby particles
  function drawConnections() {
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < maxDist) {
          const alpha = (1 - d/maxDist) * 0.06;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = 'rgba(0,210,180,' + alpha + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function init() {
    resize();
    const count = Math.min(Math.floor((W * H) / 10000), 120);
    particles = Array.from({length: count}, () => new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => { resize(); });
  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  document.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

  // Wait for hero to be visible
  setTimeout(() => { init(); animate(); }, 100);
})();
/* ═══════════════════════════════════════
   BROCHURE REGISTER MODAL
═══════════════════════════════════════ */
(function () {
  const overlay   = document.getElementById('brochure-modal');
  const closeBtn  = document.getElementById('bm-close');
  const submitBtn = document.getElementById('bm-submit');
  const submitTxt = document.getElementById('bm-submit-text');
  const submitLdr = document.getElementById('bm-submit-loader');
  const stepForm  = document.getElementById('bm-step-form');
  const stepOk    = document.getElementById('bm-step-success');
  const openBtn   = document.getElementById('bm-open-brochure');

  let pendingBrochureUrl  = '#';
  let pendingModuleName   = 'Module';
  let pendingModuleNum    = '';
  let pendingModuleEmoji  = '📘';

  /* Module emoji map */
  const moduleEmojis = {
    'Java Full Stack Developer'   : '☕',
    'Data Science'                : '📊',
    'Cyber Security'              : '🔒',
    'AI & Machine Learning'       : '🤖',
    'Cloud Computing'             : '☁️',
    'Python Full Stack Developer' : '🐍',
    'Salesforce Development'      : '☁️',
    'SAP (ERP & S/4HANA)'        : '🏭',
  };

  /* ── Attach click to every brochure button ── */
  document.querySelectorAll('.brochure-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      pendingBrochureUrl = this.getAttribute('href') || '#';

      /* Grab module name & number from parent card */
      const card = this.closest('.mod-card');
      pendingModuleName  = card ? card.querySelector('.mod-head h3').textContent.trim() : 'Module';
      pendingModuleNum   = card ? card.querySelector('.mod-num').textContent.trim()     : '';
      pendingModuleEmoji = moduleEmojis[pendingModuleName] || '📘';

      openModal();
    });
  });

  /* ── Open modal ── */
  function openModal() {
    resetForm();

    /* Update modal header to show which module */
    document.getElementById('bm-modal-emoji').textContent  = pendingModuleEmoji;
    document.getElementById('bm-modal-modnum').textContent = pendingModuleNum;
    document.getElementById('bm-modal-modname').textContent = pendingModuleName;

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('bm-name').focus(), 400);
  }

  /* ── Close modal ── */
  function closeModal() {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ── Reset form fields ── */
  function resetForm() {
    stepForm.style.display = '';
    stepOk.style.display = 'none';
    ['bm-name','bm-phone','bm-email'].forEach(id => {
      const el = document.getElementById(id);
      el.value = '';
      el.classList.remove('bm-error');
    });
    ['err-name','err-phone','err-email'].forEach(id => {
      document.getElementById(id).textContent = '';
    });
    submitBtn.disabled = false;
    submitTxt.style.display = '';
    submitLdr.style.display = 'none';
  }

  /* ── Close triggers ── */
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
  });

  /* ── Validators ── */
  function validateName(v)  { return v.trim().length >= 2; }
  function validatePhone(v) { return /^[6-9]\d{9}$/.test(v.replace(/\s+/g, '')); }
  function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

  function showError(fieldId, errId, msg) {
    document.getElementById(fieldId).classList.add('bm-error');
    document.getElementById(errId).textContent = msg;
  }
  function clearError(fieldId, errId) {
    document.getElementById(fieldId).classList.remove('bm-error');
    document.getElementById(errId).textContent = '';
  }

  /* ── Live validation ── */
  document.getElementById('bm-name').addEventListener('input', function () {
    validateName(this.value)
      ? clearError('bm-name','err-name')
      : showError('bm-name','err-name','Please enter your full name (min 2 chars)');
  });
  document.getElementById('bm-phone').addEventListener('input', function () {
    validatePhone(this.value)
      ? clearError('bm-phone','err-phone')
      : showError('bm-phone','err-phone','Enter a valid 10-digit mobile number');
  });
  document.getElementById('bm-email').addEventListener('input', function () {
    validateEmail(this.value)
      ? clearError('bm-email','err-email')
      : showError('bm-email','err-email','Enter a valid email address');
  });

  /* ── Submit ── */
  submitBtn.addEventListener('click', function () {
    const name  = document.getElementById('bm-name').value;
    const phone = document.getElementById('bm-phone').value;
    const email = document.getElementById('bm-email').value;

    let valid = true;
    if (!validateName(name))  { showError('bm-name','err-name','Please enter your full name (min 2 chars)'); valid = false; }
    if (!validatePhone(phone)){ showError('bm-phone','err-phone','Enter a valid 10-digit mobile number'); valid = false; }
    if (!validateEmail(email)){ showError('bm-email','err-email','Enter a valid email address'); valid = false; }
    if (!valid) return;

    /* Show loader */
    submitBtn.disabled = true;
    submitTxt.style.display = 'none';
    submitLdr.style.display = '';

    setTimeout(() => {
      /* Save registration to localStorage */
      const registration = {
        name      : name.trim(),
        phone     : phone.trim(),
        email     : email.trim(),
        module    : pendingModuleName,
        moduleNum : pendingModuleNum,
        timestamp : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };
      const existing = JSON.parse(localStorage.getItem('be6_registrations') || '[]');
      existing.push(registration);
      localStorage.setItem('be6_registrations', JSON.stringify(existing));

      /* Switch to success screen */
      stepForm.style.display = 'none';
      stepOk.style.display   = '';

      /* Populate success screen */
      document.getElementById('bm-success-name').textContent = name.trim().split(' ')[0];

      document.getElementById('bm-success-details').innerHTML =
        `<div class="bm-detail-row"><span class="bm-detail-label">👤 Name</span><span class="bm-detail-val">${name.trim()}</span></div>` +
        `<div class="bm-detail-row"><span class="bm-detail-label">📱 Phone</span><span class="bm-detail-val">${phone.trim()}</span></div>` +
        `<div class="bm-detail-row"><span class="bm-detail-label">✉️ Email</span><span class="bm-detail-val">${email.trim()}</span></div>` +
        `<div class="bm-detail-row bm-module-row">
           <span class="bm-detail-label">📘 Module</span>
           <span class="bm-detail-val bm-module-highlight">
             ${pendingModuleEmoji} ${pendingModuleNum} — ${pendingModuleName}
           </span>
         </div>`;

      /* Auto-open brochure */
      setTimeout(() => { window.open(pendingBrochureUrl, '_blank'); }, 800);
    }, 1200);
  });

  /* ── Manual open button on success screen ── */
  openBtn.addEventListener('click', function () {
    window.open(pendingBrochureUrl, '_blank');
    closeModal();
  });
})();
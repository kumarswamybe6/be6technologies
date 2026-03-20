// ─── DROPDOWN ─────────────────────────────────────────────
const accTrigger  = document.getElementById("accTrigger");
const accPanel    = document.getElementById("accPanel");
const accLabel    = document.getElementById("accLabel");
const courseInput = document.getElementById("course");

accTrigger.addEventListener("click", e => {
  e.stopPropagation();
  accPanel.classList.toggle("open");
  accTrigger.classList.toggle("open");
});
document.addEventListener("click", () => {
  accPanel.classList.remove("open");
  accTrigger.classList.remove("open");
});
document.querySelectorAll(".acc-option").forEach(opt => {
  opt.addEventListener("click", () => {
    document.querySelectorAll(".acc-option").forEach(o => o.classList.remove("selected"));
    opt.classList.add("selected");
    accLabel.textContent = opt.dataset.val;
    accTrigger.classList.add("selected-state");
    accTrigger.classList.remove("error");
    courseInput.value = opt.dataset.val;
    accPanel.classList.remove("open");
    accTrigger.classList.remove("open");
  });
});

// ─── COUNT-UP ─────────────────────────────────────────────
function animateCount(el) {
  const target = +el.dataset.target;
  const dur = 1700;
  const start = performance.now();
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(easeOut(p) * target).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  })(start);
}
const statsEl = document.querySelector(".stats");
if (statsEl) {
  new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting) {
      document.querySelectorAll(".count-up").forEach(animateCount);
      obs.disconnect();
    }
  }, { threshold: 0.3 }).observe(statsEl);
}

// ─── FORM SUBMIT ───────────────────────────────────────────
document.getElementById("applyForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const name   = document.getElementById("name").value.trim();
  const email  = document.getElementById("email").value.trim();
  const phone  = document.getElementById("phone").value.trim();
  const course = courseInput.value;

  // ── Validation ──
  if (!name)                          return triggerError("field-name");
  if (!email || !email.includes("@")) return triggerError("field-email");
  if (!phone || phone.length < 7)     return triggerError("field-phone");
  if (!course) { accTrigger.classList.add("error"); return; }

  const btn     = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  btnText.textContent = "Submitting…";
  btn.classList.add("loading");
  btn.disabled = true;

  const payload = { name, email, phone, course };

  // ── Backend not connected yet — shows success directly ──
  // TODO: When your backend is ready, replace this block with a fetch() call
  setTimeout(() => {
    showSuccess(name, email, course);
  }, 800);
});

// ─── FIELD ERRORS ─────────────────────────────────────────
function triggerError(id) {
  const el = document.getElementById(id);
  el.classList.add("error", "shaking");
  el.querySelector("input")?.focus();
  setTimeout(() => el.classList.remove("shaking"), 450);
}

["name","email","phone"].forEach(id => {
  document.getElementById(id).addEventListener("input", () => {
    document.getElementById("field-" + id).classList.remove("error");
  });
});

// ─── TOAST ERROR ──────────────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById("errorToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "errorToast";
    toast.style.cssText = `
      position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
      background:#1e293b; border:1px solid #ff4d6d; color:#ff8fa3;
      padding:12px 22px; border-radius:10px; font-size:0.85rem;
      font-family:'Instrument Sans',sans-serif;
      z-index:9999; box-shadow:0 8px 28px rgba(0,0,0,0.5);
      white-space:nowrap; animation:fadeIn 0.3s ease;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.remove(), 5000);
}

// ─── SUCCESS ───────────────────────────────────────────────
function showSuccess(name, email, course) {
  const form = document.getElementById("applyForm");
  const note = document.querySelector(".form-note");
  form.style.transition = "opacity 0.3s, transform 0.3s";
  form.style.opacity = "0";
  form.style.transform = "translateY(-12px)";
  note.style.transition = "opacity 0.3s";
  note.style.opacity = "0";
  setTimeout(() => {
    form.style.display = "none";
    note.style.display = "none";
    document.getElementById("successMeta").innerHTML =
      row("Name", name) + row("Email", email) + row("Course", course);
    document.getElementById("successState").style.display = "block";
    launchConfetti();
  }, 320);
}

function row(k, v) {
  return `<div class="success-meta-row"><span class="key">${k}</span><span class="val">${esc(v)}</span></div>`;
}
function esc(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ─── CONFETTI ──────────────────────────────────────────────
function launchConfetti() {
  const colors = ["#00dc82","#00c875","#00a8ff","#4fc3f7","#ffffff","#b2f5e5","#ffd166","#a78bfa"];
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      const c = document.createElement("div");
      const s = Math.random() * 8 + 4;
      c.style.cssText = `
        position:fixed; top:-14px;
        left:${Math.random()*100}vw;
        width:${s}px; height:${s*(Math.random()>0.45?1:2.8)}px;
        background:${colors[0|Math.random()*colors.length]};
        opacity:${0.65+Math.random()*0.35}; z-index:9999;
        border-radius:${Math.random()>0.4?'50%':'2px'};
        animation:fall ${Math.random()*2.5+1.8}s linear forwards;
      `;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4600);
    }, i * 16);
  }
}
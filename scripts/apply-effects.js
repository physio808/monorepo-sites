/**
 * apply-effects.js
 * Lit effects-report.json et génère les composants Astro correspondants
 * Usage : node apply-effects.js <site-slug>
 * Ex    : node apply-effects.js webdesigner-gp
 */

const fs = require('fs');
const path = require('path');

const SLUG = process.argv[2] || 'webdesigner-gp';
const REPORT = path.join(__dirname, 'scraper', 'effects-report.json');
const SITE_DIR = path.join(__dirname, '..', 'sites', SLUG);

if (!fs.existsSync(REPORT)) {
  console.error('❌ effects-report.json introuvable. Lance d\'abord : node scripts/scraper/extract-effects.js');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
const { top_js_libs, top_features } = report.summary;

const hasLib   = (lib) => top_js_libs.some(l => l.startsWith(lib));
const hasFeat  = (feat) => top_features.some(f => f.startsWith(feat));

console.log('='.repeat(60));
console.log(`  APPLICATION DES EFFETS → sites/${SLUG}`);
console.log('='.repeat(60));
console.log('\nEffets détectés sur ThemeForest :');
console.log('  libs    :', top_js_libs.join(', '));
console.log('  features:', top_features.join(', '));

const components = path.join(SITE_DIR, 'src', 'components');
const pages      = path.join(SITE_DIR, 'src', 'pages');
fs.mkdirSync(components, { recursive: true });

// ── 1. PRELOADER (5/8 sites) ────────────────────────────────
if (hasFeat('preloader')) {
  fs.writeFileSync(path.join(components, 'Preloader.astro'), `---
// Preloader — présent sur 5/8 templates ThemeForest analysés
---
<div id="preloader" role="status" aria-label="Chargement en cours">
  <div class="preloader__inner">
    <div class="preloader__logo">SW</div>
    <div class="preloader__bar">
      <div class="preloader__progress" id="preloader-progress"></div>
    </div>
  </div>
</div>

<style>
  #preloader {
    position: fixed;
    inset: 0;
    background: #0a0a0a;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.6s ease, visibility 0.6s ease;
  }
  #preloader.hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }
  .preloader__inner {
    text-align: center;
  }
  .preloader__logo {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--color-primary, #0e7490);
    letter-spacing: -0.05em;
    margin-bottom: 1.5rem;
    animation: pulse 1.5s ease-in-out infinite;
  }
  .preloader__bar {
    width: 200px;
    height: 3px;
    background: rgba(255,255,255,0.1);
    border-radius: 99px;
    overflow: hidden;
    margin: 0 auto;
  }
  .preloader__progress {
    height: 100%;
    background: var(--color-primary, #0e7490);
    border-radius: 99px;
    width: 0%;
    transition: width 0.1s linear;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
</style>

<script>
  const preloader = document.getElementById('preloader');
  const progress = document.getElementById('preloader-progress');

  // Simuler progression
  let pct = 0;
  const interval = setInterval(() => {
    pct = Math.min(pct + Math.random() * 15, 90);
    if (progress) progress.style.width = pct + '%';
  }, 100);

  window.addEventListener('load', () => {
    clearInterval(interval);
    if (progress) progress.style.width = '100%';
    setTimeout(() => {
      preloader?.classList.add('hidden');
    }, 300);
  });
</script>
`);
  console.log('  ✓ Preloader.astro');
}

// ── 2. CUSTOM CURSOR (2/8 sites) ────────────────────────────
if (hasFeat('custom_cursor')) {
  fs.writeFileSync(path.join(components, 'CustomCursor.astro'), `---
// Custom cursor magnétique — présent sur 2/8 templates ThemeForest analysés
---
<div id="cursor-dot" aria-hidden="true"></div>
<div id="cursor-outline" aria-hidden="true"></div>

<style>
  #cursor-dot,
  #cursor-outline {
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 10000;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s;
  }
  #cursor-dot {
    width: 8px;
    height: 8px;
    background: var(--color-accent, #f97316);
  }
  #cursor-outline {
    width: 36px;
    height: 36px;
    border: 2px solid rgba(14, 116, 144, 0.5);
    transition: width 0.2s, height 0.2s, border-color 0.2s;
  }
  body:has(a:hover) #cursor-outline,
  body:has(button:hover) #cursor-outline {
    width: 56px;
    height: 56px;
    border-color: var(--color-accent, #f97316);
  }
  @media (hover: none) {
    #cursor-dot, #cursor-outline { display: none; }
  }
</style>

<script>
  const dot = document.getElementById('cursor-dot');
  const outline = document.getElementById('cursor-outline');
  let ox = 0, oy = 0;

  document.addEventListener('mousemove', (e) => {
    const x = e.clientX, y = e.clientY;
    if (dot) { dot.style.left = x + 'px'; dot.style.top = y + 'px'; }
    // outline suit avec délai (lerp)
    ox += (x - ox) * 0.12;
    oy += (y - oy) * 0.12;
    if (outline) { outline.style.left = ox + 'px'; outline.style.top = oy + 'px'; }
  });

  function lerp() {
    if (outline) {
      ox += (parseFloat(dot?.style.left || '0') - ox) * 0.12;
      oy += (parseFloat(dot?.style.top || '0') - oy) * 0.12;
      outline.style.left = ox + 'px';
      outline.style.top = oy + 'px';
    }
    requestAnimationFrame(lerp);
  }
  lerp();
</script>
`);
  console.log('  ✓ CustomCursor.astro');
}

// ── 3. SCROLL REVEAL (GSAP ScrollTrigger — 2/8 sites) ───────
if (hasLib('gsap') || hasLib('scrolltrigger')) {
  fs.writeFileSync(path.join(components, 'ScrollReveal.astro'), `---
// Scroll reveal animations (GSAP ScrollTrigger pattern — 3/8 sites)
// Utilise CSS pur + IntersectionObserver pour économiser les tokens/bundle
---
<style is:global>
  [data-reveal] {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  [data-reveal="left"] { transform: translateX(-50px); }
  [data-reveal="right"] { transform: translateX(50px); }
  [data-reveal="scale"] { transform: scale(0.85); }
  [data-reveal="fade"] { transform: none; }

  [data-reveal].revealed {
    opacity: 1;
    transform: none;
  }

  /* Délai via data-delay="100" (ms) */
  [data-reveal][data-delay="100"].revealed { transition-delay: 0.1s; }
  [data-reveal][data-delay="200"].revealed { transition-delay: 0.2s; }
  [data-reveal][data-delay="300"].revealed { transition-delay: 0.3s; }
  [data-reveal][data-delay="400"].revealed { transition-delay: 0.4s; }
  [data-reveal][data-delay="500"].revealed { transition-delay: 0.5s; }
  [data-reveal][data-delay="600"].revealed { transition-delay: 0.6s; }

  /* Stagger enfants automatique */
  [data-stagger] > * {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }
  [data-stagger].revealed > *:nth-child(1) { opacity:1; transform:none; transition-delay: 0.05s; }
  [data-stagger].revealed > *:nth-child(2) { opacity:1; transform:none; transition-delay: 0.15s; }
  [data-stagger].revealed > *:nth-child(3) { opacity:1; transform:none; transition-delay: 0.25s; }
  [data-stagger].revealed > *:nth-child(4) { opacity:1; transform:none; transition-delay: 0.35s; }
  [data-stagger].revealed > *:nth-child(5) { opacity:1; transform:none; transition-delay: 0.45s; }
  [data-stagger].revealed > *:nth-child(6) { opacity:1; transform:none; transition-delay: 0.55s; }

  @media (prefers-reduced-motion: reduce) {
    [data-reveal], [data-stagger] > * {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
  }
</style>

<script>
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal], [data-stagger]').forEach(el => observer.observe(el));
</script>
`);
  console.log('  ✓ ScrollReveal.astro (IntersectionObserver — pas de lib externe)');
}

// ── 4. COMPTEURS ANIMÉS (4/8 sites) ────────────────────────
if (hasFeat('animated_counters')) {
  fs.writeFileSync(path.join(components, 'AnimatedCounter.astro'), `---
interface Props {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  duration?: number;
}
const { value, suffix = '', prefix = '', label, duration = 2000 } = Astro.props;
---
<div class="counter" data-counter data-target={value} data-duration={duration}>
  <div class="counter__value">
    <span class="counter__prefix">{prefix}</span>
    <span class="counter__number">0</span>
    <span class="counter__suffix">{suffix}</span>
  </div>
  <p class="counter__label">{label}</p>
</div>

<style>
  .counter { text-align: center; padding: 1.5rem; }
  .counter__value { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; color: var(--color-primary, #0e7490); line-height: 1; margin-bottom: 0.5rem; }
  .counter__prefix, .counter__suffix { font-size: 0.6em; }
  .counter__label { color: #64748b; font-size: 0.9rem; font-weight: 500; }
</style>

<script>
  function animateCounter(el: HTMLElement) {
    const target = parseInt(el.dataset.target || '0');
    const duration = parseInt(el.dataset.duration || '2000');
    const numEl = el.querySelector('.counter__number');
    if (!numEl) return;

    let start = 0;
    const startTime = performance.now();

    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(ease * target);
      numEl.textContent = current.toLocaleString('fr-FR');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll<HTMLElement>('[data-counter]').forEach(el => observer.observe(el));
</script>
`);
  console.log('  ✓ AnimatedCounter.astro');
}

// ── 5. TYPED TEXT (1/8 sites) ───────────────────────────────
if (hasFeat('typed_text')) {
  fs.writeFileSync(path.join(components, 'TypedText.astro'), `---
interface Props {
  words: string[];
  speed?: number;
  deleteSpeed?: number;
  pause?: number;
}
const { words, speed = 80, deleteSpeed = 50, pause = 1800 } = Astro.props;
---
<span class="typed-text" data-words={JSON.stringify(words)} data-speed={speed} data-delete={deleteSpeed} data-pause={pause}>
  <span class="typed-text__word"></span>
  <span class="typed-text__cursor" aria-hidden="true">|</span>
</span>

<style>
  .typed-text { display: inline-flex; align-items: center; gap: 2px; }
  .typed-text__word { color: var(--color-accent, #f97316); font-weight: inherit; }
  .typed-text__cursor {
    color: var(--color-accent, #f97316);
    animation: blink 0.8s ease-in-out infinite;
    font-weight: 300;
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
</style>

<script>
  document.querySelectorAll<HTMLElement>('.typed-text').forEach(container => {
    const words: string[] = JSON.parse(container.dataset.words || '[]');
    const speed = parseInt(container.dataset.speed || '80');
    const del = parseInt(container.dataset.delete || '50');
    const pause = parseInt(container.dataset.pause || '1800');
    const wordEl = container.querySelector<HTMLElement>('.typed-text__word');
    if (!wordEl || words.length === 0) return;

    let wordIndex = 0, charIndex = 0, deleting = false;

    function type() {
      const current = words[wordIndex];
      if (!deleting) {
        wordEl!.textContent = current.slice(0, ++charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(type, pause);
          return;
        }
        setTimeout(type, speed);
      } else {
        wordEl!.textContent = current.slice(0, --charIndex);
        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
        setTimeout(type, del);
      }
    }
    setTimeout(type, 500);
  });
</script>
`);
  console.log('  ✓ TypedText.astro');
}

// ── 6. DARK MODE TOGGLE (4/8 sites) ─────────────────────────
if (hasFeat('dark_mode')) {
  fs.writeFileSync(path.join(components, 'DarkModeToggle.astro'), `---
---
<button id="dark-mode-toggle" aria-label="Basculer le mode sombre" title="Mode sombre">
  <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
  <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
</button>

<style>
  #dark-mode-toggle {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: currentColor;
    transition: background 0.2s;
  }
  #dark-mode-toggle:hover { background: rgba(0,0,0,0.08); }
  #dark-mode-toggle svg { width: 1.25rem; height: 1.25rem; }
  .icon-moon { display: none; }
  [data-theme="dark"] .icon-sun { display: none; }
  [data-theme="dark"] .icon-moon { display: block; }
</style>

<script>
  const btn = document.getElementById('dark-mode-toggle');
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;

  btn?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
</script>
`);
  console.log('  ✓ DarkModeToggle.astro');
}

// ── 7. BACK TO TOP (3/8 sites) ──────────────────────────────
if (hasFeat('back_to_top')) {
  fs.writeFileSync(path.join(components, 'BackToTop.astro'), `---
---
<button id="back-to-top" aria-label="Retour en haut de la page">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
</button>

<style>
  #back-to-top {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: var(--color-primary, #0e7490);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(14,116,144,0.4);
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s, transform 0.3s;
    z-index: 100;
  }
  #back-to-top.visible { opacity: 1; transform: translateY(0); }
  #back-to-top:hover { background: #0369a1; transform: translateY(-2px); }
  #back-to-top svg { width: 1.25rem; height: 1.25rem; }
</style>

<script>
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    btn?.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
</script>
`);
  console.log('  ✓ BackToTop.astro');
}

// ── 8. SCROLL PROGRESS BAR ───────────────────────────────────
fs.writeFileSync(path.join(components, 'ScrollProgress.astro'), `---
---
<div id="scroll-progress" aria-hidden="true" role="progressbar" aria-valuemin={0} aria-valuemax={100}></div>

<style>
  #scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary, #0e7490), var(--color-accent, #f97316));
    width: 0%;
    z-index: 9998;
    transition: width 0.1s linear;
  }
</style>

<script>
  const bar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
    if (bar) { bar.style.width = pct + '%'; bar.setAttribute('aria-valuenow', Math.round(pct).toString()); }
  }, { passive: true });
</script>
`);
console.log('  ✓ ScrollProgress.astro');

// ── 9. DARK MODE CSS GLOBAL ──────────────────────────────────
const darkModeCss = `
/* ── Mode sombre (généré par apply-effects.js) ── */
[data-theme="dark"] {
  --bg: #0a0a0f;
  --bg-secondary: #111118;
  --text: #e2e8f0;
  --text-muted: #94a3b8;
  --border: rgba(255,255,255,0.08);
  --card-bg: #16161e;
  --color-primary: #22d3ee;
  --color-accent: #fb923c;
}
[data-theme="dark"] body { background: var(--bg); color: var(--text); }
[data-theme="dark"] .bg-light { background: var(--bg-secondary) !important; }
[data-theme="dark"] .post-card,
[data-theme="dark"] .project-card,
[data-theme="dark"] .service-card,
[data-theme="dark"] .profile-card,
[data-theme="dark"] .sidebar-cta,
[data-theme="dark"] .sidebar-tags,
[data-theme="dark"] .sidebar-share { background: var(--card-bg); border-color: var(--border); }
[data-theme="dark"] h1, [data-theme="dark"] h2, [data-theme="dark"] h3 { color: var(--text); }
[data-theme="dark"] header { background: rgba(10,10,15,0.95); border-color: var(--border); }
`;

// Écrire dans un fichier CSS dédié
const publicDir = path.join(SITE_DIR, 'public');
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'dark-mode.css'), darkModeCss);
console.log('  ✓ dark-mode.css');

// ── Résumé ───────────────────────────────────────────────────
console.log('\n' + '='.repeat(60));
console.log('  COMPOSANTS GÉNÉRÉS (zéro lib externe)');
console.log('='.repeat(60));
console.log(`\n  Dossier : sites/${SLUG}/src/components/`);
console.log('\n  À ajouter dans Layout.astro :');
console.log('  1. Importer et placer <Preloader /> avant </body>');
console.log('  2. Importer et placer <ScrollProgress /> dans <head>');
console.log('  3. Importer et placer <BackToTop /> avant </body>');
console.log('  4. Importer et placer <ScrollReveal /> (global styles)');
console.log('  5. Importer et placer <CustomCursor /> (desktop only)');
console.log('  6. Importer et placer <DarkModeToggle /> dans le header');
console.log('\n  Usage dans les pages :');
console.log('  <section data-reveal>...</section>');
console.log('  <div data-stagger>...</div>');
console.log('  <AnimatedCounter value={50} suffix="+" label="Sites créés" />');
console.log('  <TypedText words={["Créateur de sites", "Expert SEO", "Designer"]} />');

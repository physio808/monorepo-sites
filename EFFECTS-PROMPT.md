# PROMPT — Effets Visuels Ultra-Impactants 2026
## À coller dans Claude pour générer les effets sur n'importe quel site Astro
## Dernière mise à jour : Mars 2026 (basé sur Awwwards SOTD + recherches CRO)

---

```
Tu es un expert en animation web et design psychologique.
Applique les effets suivants sur le site Astro dans sites/<SLUG>/.

STACK REQUISE (tout est gratuit) :
- Lenis 2.1KB gzip (smooth scroll) via npm install lenis
- GSAP + ScrollTrigger + SplitText via npm install gsap
  ⚠ GSAP SplitText est GRATUIT depuis 2025 (acquisition Webflow) — NE PAS utiliser split-type
- CSS natif (@property, clip-path, animation-timeline)
- CSS Intersection Observer pour reveals simples (0 dépendance)

COMPOSANTS EXISTANTS DANS LA STACK (déjà créés) :
- SmoothScroll.astro : Lenis + RAF cleanup + astro:page-load/before-swap
- AnimationEngine.astro : GSAP SplitText + ScrollTrigger (fade-up, stagger, parallax, counter, clip-path)
- FluidCursor.astro : blob lerp + mix-blend-mode:difference (optionnel, désactivé par défaut)
- CustomCursor.astro : dot + outline léger (actif par défaut)
- MagneticButton.astro : magnétisme 90px + shine effect (variants: primary/accent/outline)
- Marquee.astro : défilement CSS pur (pause hover, reduced-motion, mask-image)
DATA-ATTRIBUTES disponibles :
  [data-split] → SplitText par mots
  [data-split="chars"] → SplitText par caractères
  [data-gsap="fade-up"] → fade-up au scroll
  [data-gsap-stagger] → stagger enfants au scroll
  [data-reveal-img] → clip-path reveal image
  [data-parallax="0.3"] → parallax (vitesse 0-1)
  [data-counter] + .counter__number → compteur animé

PRIORITÉ 1 — OBLIGATOIRE (impact immédiat)
═══════════════════════════════════════════

1. LENIS SMOOTH SCROLL (déjà dans SmoothScroll.astro)
   - Réinitialiser dans astro:page-load, destroy + cancelAnimationFrame dans astro:before-swap
   - Durée : 1.2s, easing : min(1, 1.001 - pow(2, -10*t))

2. HERO GRADIENT ANIMÉ
   - Utiliser CSS @property pour animer --hero-angle (Chrome/Edge/Safari 15.4+/Firefox 128+)
   - Background qui "respire" en rotation (12s infinite alternate)
   - Ajouter noise texture overlay SVG data URI (opacity 0.04)
   - Formes géométriques flottantes avec keyframe float (3 formes)

3. GSAP SPLITTEXT HERO H1 (data-split sur h1)
   - Splitter par mots (default) ou chars (data-split="chars")
   - Stagger 0.04s, easing power4.out, depuis y:110%
   - AnimationEngine.astro gère tout automatiquement via data-split

4. MAGNETIC CTA BUTTON (MagneticButton.astro)
   - variant="accent" pour le CTA principal (orange, unique sur la page)
   - variant="outline" pour les CTAs secondaires
   - RÈGLE : un seul bouton orange par viewport → unicité + attention

5. HEADER SCROLL MORPHING
   - Départ : transparent (sur hero sombre)
   - Scroll > 80px : background rgba(255,255,255,0.92) + backdrop-blur(16px)
   - Transition 0.4s ease + shadow 0 4px 30px rgba(0,0,0,0.08)
   - class "scrolled" ajoutée par JS sur window scroll

PRIORITÉ 2 — HAUT IMPACT (CRO prouvé)
═══════════════════════════════════════════

6. STATS FLIP CARDS (CRITIQUE POUR CONVERSION)
   - Front : chiffre animé + barre de progression + label
   - Back (hover/clic) : preuve sociale spécifique → le prospect se projette
   - CSS 3D : perspective 1000px, rotateY(180deg) au hover
   - Touch : clic toggle .flipped pour mobile
   - Barre de progression : scaleX(0→1) au scroll (Intersection Observer)
   - Chiffres animés : ease-out cubic, 1.8s
   ⚠ DIFFÉRENCIATEUR MAJEUR : le dos de la card doit contenir UNE preuve concrète
      Ex: "3× plus de contacts depuis la mise en ligne" (témoignage réel)

7. SERVICE CARDS PREMIUM
   - Tilt 3D léger (5deg max, perspective 600px) sur mousemove
   - Spotlight glow : radial-gradient centré sur position curseur (CSS custom props --mx --my)
   - Arrow → rotate/translate au hover
   - Icon scale(1.15) translateY(-2px) au hover
   - Box-shadow dynamique qui s'intensifie au hover

8. CLIP-PATH IMAGE REVEALS (data-reveal-img)
   - clip-path inset(100% 0 0 0) → inset(0% 0 0 0), 1.2s power4.inOut
   - Déclenché au scroll via AnimationEngine.astro

9. MARQUEE TICKER (Marquee.astro)
   - Utiliser pour logos clients, secteurs, témoignages courts
   - Pause au hover, reduced-motion respecté
   - mask-image pour fade aux bords

10. CTA AU MILIEU DE PAGE (recherche CRO)
    - CTAs au-dessus du fold : +304% clics (Nielsen Norman)
    - CTA à 50% du scroll : +20% conversion (heatmap A/B)
    - Format : section sombre avec noise texture + grand titre data-split
    - Toujours : verbe d'action + bénéfice concret (pas "En savoir plus")

PRIORITÉ 3 — PROFONDEUR
═══════════════════════════════════════════

11. PAGE TRANSITIONS (Astro View Transitions — 0KB)
    - Support : Chrome 111+, Edge 111+, Safari 18+, Firefox 144+ (85%+ couverture)
    - Transition : fade + scale(0.98) sortie, fade + scale(1.02→1) entrée
    - GSAP : killer ScrollTrigger dans astro:after-swap, réinit dans astro:page-load

12. CSS SCROLL-DRIVEN PROGRESS BAR (4 lignes, 0 JS)
    @keyframes progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
    .bar { animation: progress linear; animation-timeline: scroll(); transform-origin: left; }
    - Support 2026 : Chrome 115+, Edge 115+, Firefox 144+, Safari 26+
    - Fallback JS pour Safari < 26 : 5 lignes

13. HORIZONTAL SCROLL PORTFOLIO
    - GSAP ScrollTrigger pin + horizontalLoop
    - Section portfolio défile horizontalement au scroll vertical
    - Mobile : swipe natif (overflow-x: auto, snap)

14. URGENCY SOCIAL PROOF (psychologie dopamine)
    - Bandeau : "2 créneaux disponibles ce mois" + dot vert pulsant
    - Spécificité = crédibilité : "3 clients rejoints cette semaine" bat "Offre limitée !"
    - Format visible mais non agressif (badge en haut ou près du CTA)

15. MICRO-INTERACTIONS FORMULAIRE
    - Focus : border-color animé + label float (CSS :has(:focus))
    - Submit : loading state → success checkmark SVG animé
    - Validation inline : green glow sur champ valide

RÈGLES ABSOLUES DE PERFORMANCE
═══════════════════════════════════════════

- Budget JS total : < 100KB gzip (Lenis 2KB + GSAP+ST 52KB + SplitText inclus)
- Toutes les animations : respecter prefers-reduced-motion (@media)
- LCP : ne JAMAIS bloquer le rendu avec JS → texte visible immédiatement, animer après
- CLS : UNIQUEMENT animer transform et opacity — JAMAIS width/height/margin/top
- INP : debounce scroll handlers, GSAP gère rAF en interne
- Fonts : subset latin uniquement (@fontsource/plus-jakarta-sans/latin-400/600/700/800.css)
- Images : loading="lazy" sauf image LCP above fold

PSYCHOLOGIE CRO — MÉCANISMES DOPAMINERGIQUES
═══════════════════════════════════════════

- Variable reward : alterner les types de contenu par section (stat → quote → image → témoignage)
  Le cerveau ne peut pas prédire ce qui vient → il continue de scroller
- Progress indicators : barre de progression + étapes numérotées → closure drive
- Scarcity spécifique : "2 créneaux" > "Places limitées" (spécificité = vérité perçue)
- F-pattern : mettre les 2-3 premiers mots de chaque ligne porteurs de sens
- CTA isolation : bouton orange unique, entouré de whitespace → focus visuel garanti
- Micro-récompense au scroll : chaque section doit "récompenser" le scroll (reveal, animation)

POLICES RECOMMANDÉES 2026
═══════════════════════════════════════════

Option A (moderne/premium — installée dans la stack) :
- Titres + corps : "Plus Jakarta Sans" (via @fontsource, latin uniquement)

Option B (agences créatives Awwwards) :
- Titres : "Syne" (très SOTD 2025-2026)
- Corps : "DM Sans"

Option C (luxe/corporate) :
- Titres : "Bricolage Grotesque" (Awwwards-approved)
- Corps : "Plus Jakarta Sans"

PALETTE COULEURS DOPAMINERGIQUE (webdesigner-gp)
═══════════════════════════════════════════

- Primaire : #0e7490 (ocean blue — confiance + professionnalisme)
- Accent CTA : #f97316 (orange — énergie + action — UN SEUL par viewport)
- Dark bg : #070B14 (hero + CTA final)
- Gradient hero : linear-gradient(135deg, #070B14 0%, #0c1a2e 50%, #0e2038 100%)
- Grain overlay : opacity 0.04 (discret, premium)
- Orange = scarcité, urgence, action → ne jamais diluer en mettant sur plusieurs éléments
```

---

# SCRAPER ANNUEL — Techniques ThemeForest 2026+

## Script automatique : `npm run scrape-themes`

Chaque année (idéalement en janvier), lancer le scraper pour mettre à jour les techniques :

```bash
cd /root/monorepo-sites/scripts/scraper
npm install
node extract-effects.js
# → génère effects-report.json
node apply-effects.js
# → met à jour les composants basés sur les nouvelles tendances
```

## Ce que le scraper cherche dans les thèmes web agency ThemeForest top 2026 :
- Librairies JS détectées (GSAP, Three.js, Motion.dev, Barba.js, etc.)
- Patterns CSS (@property, scroll-driven, clip-path morphing, mask)
- Effets de layout (horizontal scroll, pin sections, fullscreen transitions)
- Techniques de typographie (variable fonts, kinetic text, scramble effects)
- Curseurs personnalisés et micro-interactions

## Ajouter au cron VPS (exemple annuel, 1er janvier) :
```bash
0 9 1 1 * cd /root/monorepo-sites/scripts/scraper && node extract-effects.js >> /var/log/effects-scraper.log 2>&1
```

## Résultat : `scripts/scraper/effects-report.json`
Contient les tendances 2026 → à relire + comparer avec ce fichier pour mettre à jour la stack.

---

# SITES DE RÉFÉRENCE AWWWARDS 2025-2026

Pour s'inspirer (SOTD + Developer Award) :
- **Immersive Garden** (France) : Three.js + GSAP + Lenis + Vue/Nuxt
- **Quentin Hocdé** (Tigermilk) : GSAP + Lenis — SOTD + Developer Award 2025
- **Cyd Stumpel portfolio** : CSS View Transitions comme technique principale — SOTD 2025
- **Joffrey Spitzer portfolio** : Astro + GSAP + reveals + FLIP transitions — Feb 2026 (Codrops)

Stack commune sur 95% des SOTD :
GSAP + ScrollTrigger + Lenis + SplitText + custom cursor + noise overlay

Pour atteindre 9+/10 sur Awwwards : WebGL Three.js requis.
Pour atteindre 7-8/10 (objectif sites clients) : la stack ci-dessus suffit.

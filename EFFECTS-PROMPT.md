# PROMPT — Effets Visuels Ultra-Impactants 2026
## À coller dans Claude pour générer les effets sur n'importe quel site Astro

---

```
Tu es un expert en animation web et design psychologique.
Applique les effets suivants sur le site Astro dans sites/<SLUG>/.

STACK REQUISE (tout est gratuit) :
- Lenis (smooth scroll) via npm install lenis
- GSAP + ScrollTrigger via npm install gsap
- SplitType via npm install split-type
- CSS natif (@property, clip-path, animation-timeline)

EFFETS À IMPLÉMENTER — dans cet ordre de priorité :

═══════════════════════════════════════════
PRIORITÉ 1 — OBLIGATOIRE (impact immédiat)
═══════════════════════════════════════════

1. LENIS SMOOTH SCROLL
   - Installer lenis, initialiser dans Layout.astro
   - Compatibilité Astro View Transitions : réinitialiser dans astro:page-load
   - Easing : cubic-bezier(0.16, 1, 0.3, 1), duration: 1.2

2. HERO GRADIENT ANIMÉ
   - Utiliser CSS @property pour animer --gradient-angle
   - Background qui "respire" en rotation douce (8s infinite)
   - Ajouter noise texture overlay via SVG data URI (opacity 0.04)
   - Ajouter floating shapes en parallaxe (3 formes géométriques)

3. SPLITTYPE HERO H1
   - Splitter le H1 en mots avec SplitType
   - Animation stagger : chaque mot entre du bas en 0.08s d'intervalle
   - Easing : cubic-bezier(0.16, 1, 0.3, 1)
   - Déclencher après preloader

4. MAGNETIC CTA BUTTON
   - Le bouton principal s'attire vers le curseur (rayon : 80px)
   - Effet : translate(x*0.4, y*0.4) en mousemove
   - Retour smooth en mouseleave
   - Shine effect : lumière qui traverse de gauche à droite au hover

5. HEADER SCROLL MORPHING
   - Départ : transparent, logo couleur, liens blancs (sur hero sombre)
   - Au scroll > 80px : background rgba(255,255,255,0.92) + backdrop-blur(16px)
   - Transition : 0.4s ease
   - Shadow apparaît : 0 4px 30px rgba(0,0,0,0.08)

═══════════════════════════════════════════
PRIORITÉ 2 — HAUT IMPACT
═══════════════════════════════════════════

6. CLIP-PATH REVEALS
   - Images : entrée avec clip-path inset(100% 0 0 0) → inset(0 0 0 0)
   - Déclenché par IntersectionObserver
   - Duration : 1s, easing cubic-bezier(0.16, 1, 0.3, 1)

7. MARQUEE TICKER INFINI
   - Section "Ils me font confiance" : logos défilent en boucle
   - CSS pur : animation translate(-50%) linear infinite
   - Pause au hover
   - Duplicer les éléments pour seamless loop

8. CARDS 3D TILT
   - Cards services et portfolio : tilt CSS 3D au survol (max 8deg)
   - Formule : rotateX(y * 0.1deg) rotateY(-x * 0.1deg)
   - Shadow dynamique qui suit le tilt
   - Transition retour : 0.5s ease

9. SCROLLTRIGGER TEXTES
   - H2 de chaque section : SplitType + GSAP stagger par mot
   - Paragraphes : fade-up simple avec ScrollTrigger
   - Timeline par section pour synchronisation

10. MENU MOBILE FULLSCREEN
    - Overlay sombre avec flou
    - Liens entrent en stagger (0.1s entre chaque)
    - Fermeture avec animation inverse
    - Animation hamburger → croix (morphing SVG)

═══════════════════════════════════════════
PRIORITÉ 3 — PROFONDEUR
═══════════════════════════════════════════

11. PAGE TRANSITIONS (Astro View Transitions)
    - Transition : fade + scale(0.98) en sortie
    - Entrée : fade + scale(1.02) → 1
    - Duration : 400ms

12. CURSOR BLOB FLUIDE
    - Cercle qui suit le curseur avec lerp (0.08)
    - S'agrandit sur les liens/boutons (scale 2.5)
    - Couleur change selon la section (clair/sombre)
    - Mix-blend-mode: difference sur sections sombres

13. HORIZONTAL SCROLL PORTFOLIO
    - Section portfolio : scroll horizontal dans container fixé
    - GSAP ScrollTrigger : pin + horizontalLoop
    - Cards défilent de droite à gauche au scroll vertical

14. URGENCY SOCIAL PROOF
    - Bandeau : "3 créneaux disponibles ce mois" avec dot vert pulsant
    - Compteur "X personnes ont demandé un devis cette semaine"
    - Format : badge visible mais pas agressif

15. MICRO-INTERACTIONS FORM
    - Focus : border-color animé + label float
    - Submit : loading state → success animation
    - Success : micro confetti (canvas 5KB)

═══════════════════════════════════════════
RÈGLES ABSOLUES DE PERFORMANCE
═══════════════════════════════════════════

- Lenis + GSAP + SplitType = ~37KB gzip total → ACCEPTABLE
- Toutes les animations : respecter prefers-reduced-motion
- CSS @keyframes pour animations CSS-only (0KB)
- Images : toujours loading="lazy" sauf LCP (above fold)
- Fonts : font-display: swap, subset latin+latin-ext uniquement
- GSAP : importer uniquement ce dont on a besoin (tree-shaking)
- SplitType : détruire et recréer sur resize (debounce 200ms)
- Lenis : destroy() dans astro:before-swap, recréer dans astro:page-load

═══════════════════════════════════════════
POLICES RECOMMANDÉES 2026
═══════════════════════════════════════════

Option A (moderne/premium) :
- Titres : "Plus Jakarta Sans" (variable font, -5% poids vs Inter)
- Corps : "Inter" (lecture optimale)

Option B (élégant/créatif) :
- Titres : "Syne" (très tendance agences créatives 2025-2026)
- Corps : "DM Sans"

Option C (luxe/corporate) :
- Titres : "Bricolage Grotesque" (Awwwards-approved)
- Corps : "Plus Jakarta Sans"

Chargement : Google Fonts avec preconnect + font-display:swap
Ou mieux : auto-héberger via fontsource (@fontsource/inter)

═══════════════════════════════════════════
PALETTE COULEURS DOPAMINERGIQUE
═══════════════════════════════════════════

Pour webdesigner-gp (web agency Guadeloupe) :
- Primaire : #0e7490 (ocean blue — professionnel + confiance)
- Accent CTA : #f97316 (orange energique — action)
- Dark bg : #070B14 (plus profond que #0f172a — premium)
- Gradient hero : linear-gradient(135deg, #070B14 0%, #0c1a2e 50%, #0e2038 100%)
- Grain : opacity 0.035 — discret mais présent

RÈGLE CTA :
- Couleur orange (#f97316) UNIQUEMENT pour le CTA principal
- Un seul CTA orange par vue — crée l'unicité et l'attention
- Tous les autres boutons : primaire bleu ou outline
```

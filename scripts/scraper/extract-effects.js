/**
 * extract-effects.js
 * Scrape ThemeForest "web agency" → visite 8 demos → extrait effets CSS/JS
 * Output : effects-report.json (compact, pour Claude)
 *
 * Usage : node extract-effects.js [keyword] [count]
 * Ex    : node extract-effects.js "web agency" 8
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

const KEYWORD = process.argv[2] || 'web agency';
const COUNT = parseInt(process.argv[3] || '8');
const OUTPUT = path.join(__dirname, 'effects-report.json');

// Librairies JS connues qui génèrent des effets visuels
const JS_LIBS = {
  gsap: /gsap|TweenMax|TweenLite|TimelineMax/i,
  scrolltrigger: /ScrollTrigger/i,
  lottie: /lottie|bodymovin/i,
  particles: /particles\.js|tsParticles/i,
  three: /three\.js|THREE\./i,
  aos: /AOS\.init|aos\.js/i,
  swiper: /Swiper|swiper\.js/i,
  splide: /Splide/i,
  splittext: /SplitText|SplitType/i,
  barba: /barba\.js|barba\.init/i,
  locomotive: /LocomotiveScroll/i,
  scrollmagic: /ScrollMagic/i,
  vivus: /Vivus/i,
  typed: /Typed\.js|new Typed/i,
  countup: /CountUp/i,
  isotope: /Isotope/i,
  magnific: /magnificPopup/i,
  tilt: /VanillaTilt|jquery\.tilt/i,
};

// Patterns CSS d'effets
const CSS_PATTERNS = {
  parallax: /parallax/i,
  reveal: /reveal|fade-in|fade-up|slide-in/i,
  floating: /float|levitate|bob/i,
  glitch: /glitch/i,
  gradient_text: /background-clip.*text|webkit-background-clip.*text/i,
  glassmorphism: /backdrop-filter|blur\(/i,
  neumorphism: /box-shadow.*inset.*box-shadow/i,
  cursor_custom: /cursor:|cursor-dot|cursor-follow/i,
  magnetic: /magnetic/i,
  typewriter: /typewriter|typing-text/i,
  counter: /counter|odometer/i,
  sticky: /position.*sticky|sticky-header/i,
  smooth_scroll: /scroll-behavior.*smooth/i,
  clip_path: /clip-path/i,
  mask: /mask-image|webkit-mask/i,
};

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function launchBrowser() {
  return puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080',
    ],
  });
}

async function getThemeForestDemos(browser, keyword, count) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  const searchUrl = `https://themeforest.net/search/${encodeURIComponent(keyword)}?category=site-templates&compatible_with=HTML5`;
  console.log(`\n🔍 Recherche ThemeForest : "${keyword}"`);
  console.log(`   URL : ${searchUrl}`);

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(3000);

    // Extraire les items et leurs liens de preview
    const items = await page.evaluate((n) => {
      const results = [];
      // Sélecteurs ThemeForest (peuvent changer)
      const cards = document.querySelectorAll('[data-item-id], .item-card, article[class*="item"]');

      cards.forEach((card, i) => {
        if (i >= n) return;
        const titleEl = card.querySelector('h3 a, h2 a, .item-title a, [class*="title"] a');
        const previewEl = card.querySelector('a[href*="live-preview"], a[href*="preview"], .item-thumbnail a');
        const priceEl = card.querySelector('[class*="price"]');

        if (titleEl) {
          results.push({
            title: titleEl.textContent?.trim() || 'Unknown',
            themeforest_url: titleEl.href || '',
            preview_url: previewEl?.href || '',
            price: priceEl?.textContent?.trim() || '',
          });
        }
      });
      return results;
    }, count);

    if (items.length === 0) {
      // Fallback: chercher via URL patterns dans le HTML
      const html = await page.content();
      console.log('   → Sélecteurs standards échoués, extraction via regex...');

      const previewMatches = [...html.matchAll(/href="(https:\/\/[^"]*(?:preview|demo|live)[^"]*?)"/gi)];
      const titleMatches = [...html.matchAll(/class="[^"]*title[^"]*"[^>]*>([^<]{5,80})</gi)];

      for (let i = 0; i < Math.min(count, previewMatches.length); i++) {
        items.push({
          title: titleMatches[i]?.[1]?.trim() || `Theme ${i+1}`,
          preview_url: previewMatches[i][1],
          themeforest_url: '',
        });
      }
    }

    console.log(`   ✓ ${items.length} thèmes trouvés`);
    await page.close();
    return items;

  } catch (err) {
    console.log(`   ✗ ThemeForest inaccessible: ${err.message}`);
    await page.close();
    return [];
  }
}

async function extractSiteEffects(browser, site) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  const effects = {
    title: site.title,
    url: site.preview_url || site.themeforest_url,
    js_libs: [],
    css_effects: [],
    animations: [],
    colors: [],
    fonts: [],
    layout_features: [],
    accessible: false,
    error: null,
  };

  try {
    await page.goto(effects.url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await sleep(2000);

    // Extraire tout le HTML + scripts
    const { html, scripts, styles, inlineScripts } = await page.evaluate(() => {
      const scriptTags = [...document.querySelectorAll('script[src]')].map(s => s.src);
      const inlineJs = [...document.querySelectorAll('script:not([src])')].map(s => s.textContent).join('\n');
      const stylesheets = [...document.querySelectorAll('link[rel="stylesheet"]')].map(s => s.href);
      return {
        html: document.documentElement.outerHTML.substring(0, 50000), // Cap à 50Ko
        scripts: scriptTags,
        styles: stylesheets,
        inlineScripts: inlineJs.substring(0, 30000),
      };
    });

    effects.accessible = true;
    const allText = html + scripts.join(' ') + inlineScripts;

    // Détecter les librairies JS
    for (const [lib, pattern] of Object.entries(JS_LIBS)) {
      if (pattern.test(allText)) {
        effects.js_libs.push(lib);
      }
    }

    // Détecter les effets CSS dans le HTML/classes
    for (const [effect, pattern] of Object.entries(CSS_PATTERNS)) {
      if (pattern.test(allText)) {
        effects.css_effects.push(effect);
      }
    }

    // Extraire les @keyframes via computed styles
    const keyframes = await page.evaluate(() => {
      const names = new Set();
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (rule.type === CSSRule.KEYFRAMES_RULE) {
              names.add(rule.name);
            }
            if (rule.type === CSSRule.STYLE_RULE && rule.style.animationName) {
              names.add(rule.style.animationName);
            }
          }
        } catch (e) { /* CORS */ }
      }
      return [...names];
    });
    effects.animations = keyframes.slice(0, 20); // Max 20

    // Extraire les couleurs dominantes (CSS variables)
    const colors = await page.evaluate(() => {
      const vars = [];
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (rule.type === CSSRule.STYLE_RULE && rule.selectorText === ':root') {
              const text = rule.cssText;
              const matches = [...text.matchAll(/--(color|primary|accent|bg|text|dark|light)[^:]*:\s*([^;]+)/gi)];
              matches.forEach(m => vars.push(`${m[0].trim()}`));
            }
          }
        } catch (e) {}
      }
      return vars.slice(0, 15);
    });
    effects.colors = colors;

    // Extraire les polices utilisées
    const fonts = await page.evaluate(() => {
      const fontSet = new Set();
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (rule.type === CSSRule.FONT_FACE_RULE) {
              const family = rule.style.getPropertyValue('font-family');
              if (family) fontSet.add(family.replace(/['"]/g, '').trim());
            }
          }
        } catch (e) {}
      }
      // Google Fonts depuis les links
      const gfLinks = [...document.querySelectorAll('link[href*="fonts.google"]')].map(l => l.href);
      gfLinks.forEach(l => {
        const m = l.match(/family=([^&:]+)/);
        if (m) fontSet.add(m[1].replace(/\+/g, ' '));
      });
      return [...fontSet].slice(0, 5);
    });
    effects.fonts = fonts;

    // Détecter features layout
    const features = await page.evaluate(() => {
      const feats = [];
      if (document.querySelector('.preloader, #preloader, [class*="preload"]')) feats.push('preloader');
      if (document.querySelector('[class*="cursor"], .custom-cursor')) feats.push('custom_cursor');
      if (document.querySelector('[class*="scroll-progress"], .progress-bar')) feats.push('scroll_progress');
      if (document.querySelector('[class*="back-to-top"], .scroll-top')) feats.push('back_to_top');
      if (document.querySelector('[class*="dark-mode"], [data-theme]')) feats.push('dark_mode_toggle');
      if (document.querySelector('[class*="parallax"]')) feats.push('parallax_elements');
      if (document.querySelector('[class*="counter"], [data-count]')) feats.push('animated_counters');
      if (document.querySelector('[class*="typed"], [data-typed]')) feats.push('typed_text');
      if (document.querySelector('[class*="swiper"], [class*="slider"], [class*="carousel"]')) feats.push('slider');
      if (document.querySelector('[class*="sticky"], [data-sticky]')) feats.push('sticky_header');
      if (document.querySelector('[class*="menu-overlay"], [class*="fullscreen-menu"]')) feats.push('fullscreen_menu');
      if (document.querySelector('video[autoplay], [class*="video-bg"]')) feats.push('video_background');
      if (document.querySelector('canvas')) feats.push('canvas_animation');
      if (document.querySelector('[class*="particle"]')) feats.push('particles');
      if (document.querySelector('[class*="tilt"], [data-tilt]')) feats.push('tilt_effect');
      if (document.querySelector('[class*="magnetic"]')) feats.push('magnetic_effect');
      return feats;
    });
    effects.layout_features = features;

    console.log(`   ✓ ${effects.url}`);
    console.log(`     libs: [${effects.js_libs.join(', ')}] | features: [${effects.layout_features.join(', ')}]`);

  } catch (err) {
    effects.error = err.message;
    console.log(`   ✗ ${effects.url} — ${err.message}`);
  }

  await page.close();
  return effects;
}

async function main() {
  console.log('='.repeat(60));
  console.log('  SCRAPER EFFETS THEMEFOREST');
  console.log(`  Keyword: "${KEYWORD}" | Count: ${COUNT}`);
  console.log('='.repeat(60));

  const browser = await launchBrowser();

  try {
    // 1. Obtenir les demos ThemeForest
    let sites = await getThemeForestDemos(browser, KEYWORD, COUNT);

    // Fallback si ThemeForest bloqué : vraies demos ThemeForest bestsellers (2024-2025)
    if (sites.length === 0) {
      console.log('\n⚠ ThemeForest bloqué — utilisation des vraies demos bestsellers GSAP');
      sites = [
        { title: 'Dixor - Creative Digital Agency (ValidThemes)', preview_url: 'https://validthemes.net/site-template/dixor/' },
        { title: 'Abstrak - Creative Agency (AxilThemes)', preview_url: 'https://new.axilthemes.com/demo/template/abstrak/' },
        { title: 'Runok - Web Agency (RRDevs)', preview_url: 'https://html.rrdevs.net/runok/' },
        { title: 'Abstrak Digital Agency v2 (AxilThemes)', preview_url: 'https://new.axilthemes.com/demo/template/abstrak/index-1.html' },
        { title: 'Abstrak Creative v3 (AxilThemes)', preview_url: 'https://new.axilthemes.com/demo/template/abstrak/index-2.html' },
        { title: 'Dixor Landing Page (ValidThemes)', preview_url: 'https://validthemes.net/site-template/landing-page/dixor/index.html' },
        { title: 'Webteck - IT Solution (Themeholy)', preview_url: 'https://html.themeholy.com/webteck/demo/' },
        { title: 'Saor - SEO Agency (Themeholy)', preview_url: 'https://html.themeholy.com/saor/demo/' },
      ].slice(0, COUNT);
    }

    // Filtrer ceux qui ont une URL de preview
    const validSites = sites.filter(s => s.preview_url && s.preview_url.startsWith('http'));
    console.log(`\n📋 ${validSites.length} sites à analyser`);

    // 2. Extraire les effets de chaque site
    console.log('\n🔬 Extraction des effets...');
    const results = [];
    for (let i = 0; i < validSites.length; i++) {
      console.log(`\n[${i+1}/${validSites.length}] ${validSites[i].title}`);
      const effects = await extractSiteEffects(browser, validSites[i]);
      results.push(effects);
      if (i < validSites.length - 1) await sleep(1500);
    }

    // 3. Agréger — trouver les effets les plus communs
    const allLibs = {};
    const allFeatures = {};
    const allCssEffects = {};
    const allAnimations = new Set();
    const allFonts = {};

    results.forEach(r => {
      r.js_libs.forEach(l => allLibs[l] = (allLibs[l] || 0) + 1);
      r.layout_features.forEach(f => allFeatures[f] = (allFeatures[f] || 0) + 1);
      r.css_effects.forEach(e => allCssEffects[e] = (allCssEffects[e] || 0) + 1);
      r.animations.forEach(a => allAnimations.add(a));
      r.fonts.forEach(f => allFonts[f] = (allFonts[f] || 0) + 1);
    });

    const topLibs = Object.entries(allLibs).sort((a,b) => b[1]-a[1]).map(([k,v]) => `${k}(${v}/${results.length})`);
    const topFeatures = Object.entries(allFeatures).sort((a,b) => b[1]-a[1]).map(([k,v]) => `${k}(${v}/${results.length})`);
    const topFonts = Object.entries(allFonts).sort((a,b) => b[1]-a[1]).slice(0,5).map(([k,v]) => k);

    const report = {
      keyword: KEYWORD,
      sites_analyzed: results.filter(r => r.accessible).length,
      generated_at: new Date().toISOString(),
      // Résumé agrégé (compact pour Claude)
      summary: {
        top_js_libs: topLibs,
        top_features: topFeatures,
        common_animations: [...allAnimations].slice(0, 15),
        top_fonts: topFonts,
      },
      // Détail par site
      sites: results,
    };

    fs.writeFileSync(OUTPUT, JSON.stringify(report, null, 2));

    // Afficher le résumé
    console.log('\n' + '='.repeat(60));
    console.log('  RÉSUMÉ DES EFFETS DÉTECTÉS');
    console.log('='.repeat(60));
    console.log('\nLibrairies JS les plus utilisées :');
    topLibs.forEach(l => console.log(`  • ${l}`));
    console.log('\nFeatures les plus communes :');
    topFeatures.forEach(f => console.log(`  • ${f}`));
    console.log('\nAnimations CSS trouvées :');
    [...allAnimations].slice(0, 10).forEach(a => console.log(`  • ${a}`));
    console.log('\nPolices populaires :');
    topFonts.forEach(f => console.log(`  • ${f}`));
    console.log(`\n✓ Rapport sauvegardé : ${OUTPUT}`);

  } finally {
    await browser.close();
  }
}

main().catch(console.error);

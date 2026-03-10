#!/usr/bin/env bash
# =============================================================
# add-site.sh — Ajouter un nouveau site Astro au monorepo
# Usage : ./scripts/add-site.sh <slug> <domaine> [auteur]
# Exemple : ./scripts/add-site.sh site-2 monsite.fr "Mon Equipe"
# =============================================================
set -euo pipefail

SLUG="${1:-}"
DOMAIN="${2:-}"
AUTHOR="${3:-Équipe}"

if [[ -z "$SLUG" || -z "$DOMAIN" ]]; then
  echo "Usage: $0 <slug> <domaine> [auteur]"
  echo "Ex:    $0 site-2 monsite.fr 'Mon Equipe'"
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE_DIR="$REPO_ROOT/sites/$SLUG"
KEYSTATIC_CONFIG="$REPO_ROOT/sites/site-1/keystatic.config.ts"
COLLECTION_KEY="${SLUG//-/_}_blog"

# ── 1. Vérifications
if [[ -d "$SITE_DIR" ]]; then
  echo "❌ Le site '$SLUG' existe déjà dans sites/"
  exit 1
fi
if grep -q "'$DOMAIN'" "$KEYSTATIC_CONFIG" 2>/dev/null; then
  echo "❌ '$DOMAIN' est déjà dans keystatic.config.ts"
  exit 1
fi

echo "✅ Création du site : $SLUG ($DOMAIN)"

# ── 2. Créer la structure Astro minimale
mkdir -p "$SITE_DIR/src/content/blog"
mkdir -p "$SITE_DIR/src/pages/blog"
mkdir -p "$SITE_DIR/src/layouts"
mkdir -p "$SITE_DIR/public"

cat > "$SITE_DIR/package.json" << EOF
{
  "name": "sites-$SLUG",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "@astrojs/cloudflare": "^12.6.12",
    "@astrojs/react": "^4.4.2",
    "@astrojs/sitemap": "^3.7.0",
    "@keystatic/astro": "^5.0.6",
    "@keystatic/core": "^0.5.48",
    "astro": "^5.17.1",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  }
}
EOF

cat > "$SITE_DIR/astro.config.mjs" << EOF
// @ts-check
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import sitemap from '@astrojs/sitemap'
import keystatic from '@keystatic/astro'
import react from '@astrojs/react'

export default defineConfig({
  site: 'https://$DOMAIN',
  output: 'static',
  adapter: cloudflare({ platformProxy: { enabled: true } }),
  integrations: [react(), sitemap(), keystatic()],
  image: { service: { entrypoint: 'astro/assets/services/compile' } },
})
EOF

cat > "$SITE_DIR/tsconfig.json" << 'EOF'
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["src/*"] } }
}
EOF

cat > "$SITE_DIR/src/content/config.ts" << 'EOF'
import { defineCollection, z } from 'astro:content'
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('Équipe'),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
})
export const collections = { blog }
EOF

TODAY=$(date +%Y-%m-%d)
cat > "$SITE_DIR/src/content/blog/bienvenue.md" << EOF
---
title: Bienvenue sur $DOMAIN
description: Premier article du blog de $DOMAIN
pubDate: $TODAY
author: $AUTHOR
tags: [bienvenue]
draft: false
---

Bienvenue sur le blog de **$DOMAIN** !
EOF

cat > "$SITE_DIR/src/pages/index.astro" << 'ASTRO'
---
import { getCollection } from 'astro:content'
const articles = (await getCollection('blog'))
  .filter(a => !a.data.draft)
  .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
---
<!doctype html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>Blog</title></head>
<body>
  <h1>Blog</h1>
  <ul>{articles.map(a => <li><a href={`/blog/${a.slug}/`}>{a.data.title}</a></li>)}</ul>
</body>
</html>
ASTRO

cat > "$SITE_DIR/src/pages/blog/[slug].astro" << 'ASTRO'
---
import { getCollection } from 'astro:content'
export async function getStaticPaths() {
  const articles = await getCollection('blog')
  return articles.filter(a => !a.data.draft).map(a => ({ params: { slug: a.slug }, props: { article: a } }))
}
const { article } = Astro.props
const { Content } = await article.render()
---
<!doctype html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>{article.data.title}</title><meta name="description" content={article.data.description} /></head>
<body><article><h1>{article.data.title}</h1><Content /></article></body>
</html>
ASTRO

# Copier le keystatic.config.ts de site-1 (le CMS est partagé)
cat > "$SITE_DIR/keystatic.config.ts" << EOF
// Ce fichier est géré par sites/site-1/keystatic.config.ts (CMS central)
// Il est requis par @keystatic/astro mais le vrai config est dans site-1
export { default } from '../site-1/keystatic.config'
EOF

echo "✅ Structure Astro créée dans sites/$SLUG/"

# ── 3. Mettre à jour keystatic.config.ts via Python (gestion multiline sûre)
python3 << PYEOF
import re

config_path = "$KEYSTATIC_CONFIG"
with open(config_path, 'r') as f:
    content = f.read()

collection_key = "$COLLECTION_KEY"
domain = "$DOMAIN"
slug = "$SLUG"
author = "$AUTHOR"

# Bloc navigation à injecter
nav_marker = "      // ── Nouveaux sites ajoutés via scripts/add-site.sh ──"
nav_entry = f"      '{domain}': ['{collection_key}'],\n{nav_marker}"
content = content.replace(nav_marker, nav_entry)

# Bloc collection à injecter
col_marker = "    // ── Nouveaux sites générés automatiquement par scripts/add-site.sh ──"
col_block = f"""    // ── {domain} (Astro)
    // Géré par : sites/{slug}/  |  URL : {domain}
    {collection_key}: collection({{
      label: '📝 Articles — {domain}',
      slugField: 'title',
      path: 'sites/{slug}/src/content/blog/*',
      entryLayout: 'content',
      format: {{ contentField: 'content' }},
      schema: articleSchema('{author}'),
    }}),

{col_marker}"""
content = content.replace(col_marker, col_block)

with open(config_path, 'w') as f:
    f.write(content)

print("✅ keystatic.config.ts mis à jour")
PYEOF

# ── 4. Résumé
echo ""
echo "============================================"
echo "✅ Site '$SLUG' ($DOMAIN) créé !"
echo "============================================"
echo "Prochaines étapes :"
echo "  1. cd sites/$SLUG && npm install"
echo "  2. git add -A && git commit -m 'feat: nouveau site $DOMAIN'"
echo "  3. git push origin main"
echo "  4. Cloudflare Pages → nouveau projet :"
echo "     Root dir : sites/$SLUG | Build : npm run build | Output : dist"
echo "  5. blog.sakaybrile.uk/keystatic → '$DOMAIN' apparaît dans la sidebar"

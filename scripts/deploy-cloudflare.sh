#!/bin/bash
# ============================================================
# deploy-cloudflare.sh — Déploiement automatique Cloudflare Pages
# Usage : bash scripts/deploy-cloudflare.sh <slug> <domain> [env_vars...]
# Ex    : bash scripts/deploy-cloudflare.sh webdesigner-gp webdesigner.sakaybrile.uk
# ============================================================
set -euo pipefail

# ── Paramètres ──────────────────────────────────────────────
SLUG="${1:-}"
DOMAIN="${2:-}"

if [[ -z "$SLUG" || -z "$DOMAIN" ]]; then
  echo "Usage: bash scripts/deploy-cloudflare.sh <slug> <domain>"
  echo "  Ex : bash scripts/deploy-cloudflare.sh webdesigner-gp webdesigner.sakaybrile.uk"
  exit 1
fi

# ── Credentials (auto-export) ────────────────────────────────
set -a
source /root/.secrets/vault.env
set +a

ACCOUNT_ID="7f6679d48a029459b1d274ef91428f06"
CF_TOKEN="$CLOUDFLARE_PAGES_TOKEN"
CF_DNS_TOKEN="$CLOUDFLARE_TOKEN"
ZONE_ID="$CLOUDFLARE_ZONE_ID"
SITE_DIR="sites/$SLUG"
PROJECT_NAME="$SLUG"
ROOT_DIR="$SITE_DIR"

# ── Variables d'environnement Cloudflare Pages (optionnel) ───
# Ajout de KEYSTATIC si keystatic.config.ts présent
ENV_VARS="{}"
if [[ -f "$SITE_DIR/keystatic.config.ts" ]]; then
  KEYSTATIC_PROJECT="physio808/monorepo-sites"
  ENV_VARS=$(python3 -c "
import json
env = {
  'KEYSTATIC_CLOUD_PROJECT': {'type': 'plain_text', 'value': 'physio808/monorepo-sites'},
  'NODE_VERSION': {'type': 'plain_text', 'value': '22'}
}
print(json.dumps(env))
")
fi

echo ""
echo "========================================================"
echo "  DÉPLOIEMENT CLOUDFLARE PAGES"
echo "  Site    : $SLUG"
echo "  Domaine : $DOMAIN"
echo "  Repo    : physio808/monorepo-sites / $ROOT_DIR"
echo "========================================================"
echo ""

# ── ÉTAPE 1 : Vérifier si le projet existe déjà ─────────────
echo "[1/5] Vérification projet existant..."

EXISTING=$(curl -s \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects" \
  -H "Authorization: Bearer $CF_TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
projects = [p['name'] for p in d.get('result', [])]
print('EXISTS' if '$PROJECT_NAME' in projects else 'NEW')
")

if [[ "$EXISTING" == "EXISTS" ]]; then
  echo "  ⚠ Projet '$PROJECT_NAME' existe déjà — mise à jour de la config..."
  ACTION="update"
else
  echo "  → Nouveau projet à créer"
  ACTION="create"
fi

# ── ÉTAPE 2 : Créer ou mettre à jour le projet ──────────────
echo ""
echo "[2/5] $([[ $ACTION == 'create' ]] && echo 'Création' || echo 'Mise à jour') du projet Pages..."

PROJECT_PAYLOAD=$(python3 -c "
import json

payload = {
  'name': '$PROJECT_NAME',
  'production_branch': 'main',
  'source': {
    'type': 'github',
    'config': {
      'owner': 'physio808',
      'owner_id': '259898570',
      'repo_name': 'monorepo-sites',
      'repo_id': '1173738841',
      'production_branch': 'main',
      'pr_comments_enabled': True,
      'deployments_enabled': True,
      'production_deployments_enabled': True,
      'preview_deployment_setting': 'none',
      'path_includes': ['$ROOT_DIR/*']
    }
  },
  'build_config': {
    'build_command': 'npm run build',
    'destination_dir': 'dist',
    'root_dir': '$ROOT_DIR'
  },
  'deployment_configs': {
    'production': {
      'environment_variables': $ENV_VARS
    }
  }
}

print(json.dumps(payload))
")

if [[ "$ACTION" == "create" ]]; then
  RESP=$(curl -s -X POST \
    "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$PROJECT_PAYLOAD")
else
  RESP=$(curl -s -X PATCH \
    "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$PROJECT_PAYLOAD")
fi

SUCCESS=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success','false'))")
if [[ "$SUCCESS" != "True" ]]; then
  echo "  ✗ Erreur lors de la création/mise à jour du projet:"
  echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); [print('   ', e['message']) for e in d.get('errors',[])]"
  exit 1
fi

PAGES_SUBDOMAIN=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('result',{}).get('subdomain',''))")
echo "  ✓ Projet $ACTION — URL Pages : https://$PAGES_SUBDOMAIN"

# ── ÉTAPE 3 : Ajouter le domaine personnalisé ────────────────
echo ""
echo "[3/5] Ajout du domaine personnalisé : $DOMAIN..."

sleep 3  # Laisser le projet se stabiliser

DOMAIN_RESP=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$DOMAIN\"}")

DOMAIN_SUCCESS=$(echo "$DOMAIN_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success','false'))" 2>/dev/null || echo "false")
DOMAIN_ERR=$(echo "$DOMAIN_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message',''))" 2>/dev/null || echo "")

if [[ "$DOMAIN_SUCCESS" == "True" ]]; then
  echo "  ✓ Domaine $DOMAIN ajouté avec succès"
elif echo "$DOMAIN_ERR" | grep -qi "already"; then
  echo "  ✓ Domaine $DOMAIN déjà configuré"
else
  echo "  ⚠ Domaine : $DOMAIN_ERR"
  echo "  → Le DNS CNAME sera créé quand même"
fi

# ── ÉTAPE 4 : Créer l'enregistrement DNS CNAME ──────────────
echo ""
echo "[4/5] Configuration DNS : $DOMAIN → $PAGES_SUBDOMAIN..."

# Vérifier si le DNS existe déjà
DNS_LIST=$(curl -s \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=$DOMAIN&type=CNAME" \
  -H "Authorization: Bearer $CF_DNS_TOKEN")

DNS_EXISTS=$(echo "$DNS_LIST" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('result',[])))")

if [[ "$DNS_EXISTS" -gt "0" ]]; then
  # Mettre à jour le DNS existant
  DNS_ID=$(echo "$DNS_LIST" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['result'][0]['id'])")
  DNS_RESP=$(curl -s -X PUT \
    "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$DNS_ID" \
    -H "Authorization: Bearer $CF_DNS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"type\": \"CNAME\", \"name\": \"$DOMAIN\", \"content\": \"$PAGES_SUBDOMAIN\", \"proxied\": true, \"ttl\": 1}")
  echo "  ✓ DNS CNAME mis à jour : $DOMAIN → $PAGES_SUBDOMAIN"
else
  # Créer le DNS
  DNS_RESP=$(curl -s -X POST \
    "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CF_DNS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"type\": \"CNAME\", \"name\": \"$DOMAIN\", \"content\": \"$PAGES_SUBDOMAIN\", \"proxied\": true, \"ttl\": 1}")
  DNS_OK=$(echo "$DNS_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success','false'))")
  if [[ "$DNS_OK" == "True" ]]; then
    echo "  ✓ DNS CNAME créé : $DOMAIN → $PAGES_SUBDOMAIN"
  else
    echo "  ⚠ DNS :" $(echo "$DNS_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','erreur inconnue'))")
  fi
fi

# ── ÉTAPE 5 : Déclencher un déploiement ─────────────────────
echo ""
echo "[5/5] Déclenchement du premier déploiement..."

DEPLOY_RESP=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json")

DEPLOY_OK=$(echo "$DEPLOY_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success','false'))" 2>/dev/null || echo "false")
DEPLOY_ID=$(echo "$DEPLOY_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('result',{}).get('id','?'))" 2>/dev/null || echo "?")

if [[ "$DEPLOY_OK" == "True" ]]; then
  echo "  ✓ Déploiement déclenché : $DEPLOY_ID"
else
  DEPLOY_ERR=$(echo "$DEPLOY_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message',''))" 2>/dev/null || echo "")
  echo "  ⚠ Déploiement : $DEPLOY_ERR (le push GitHub déclenchera le build automatiquement)"
fi

# ── Résumé ───────────────────────────────────────────────────
echo ""
echo "========================================================"
echo "  DÉPLOIEMENT TERMINÉ"
echo ""
echo "  Projet      : https://dash.cloudflare.com/$ACCOUNT_ID/pages/view/$PROJECT_NAME"
echo "  URL Pages   : https://$PAGES_SUBDOMAIN"
echo "  URL finale  : https://$DOMAIN"
echo ""
echo "  Le site sera en ligne dès la fin du build (~2-3 min)"
echo "========================================================"

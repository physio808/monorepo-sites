import { config, collection, fields } from '@keystatic/core'

// Schéma d'article réutilisable pour tous les sites
function articleSchema(defaultAuthor: string) {
  return {
    title: fields.slug({ name: { label: 'Titre' } }),
    description: fields.text({
      label: 'Description SEO (150-160 caractères)',
      multiline: true,
      validation: { length: { min: 50, max: 160 } },
    }),
    pubDate: fields.date({ label: 'Date de publication' }),
    author: fields.text({
      label: 'Auteur',
      defaultValue: defaultAuthor,
    }),
    tags: fields.array(
      fields.text({ label: 'Tag' }),
      { label: 'Tags', itemLabel: props => props.value }
    ),
    image: fields.text({
      label: 'Image (chemin ou URL)',
      validation: { length: { min: 0, max: 255 } },
    }),
    draft: fields.checkbox({
      label: 'Brouillon (ne pas publier)',
      defaultValue: false,
    }),
    content: fields.markdoc({
      label: 'Contenu',
      extension: 'md',
    }),
  }
}

export default config({
  storage: {
    kind: 'cloud',
  },

  cloud: {
    project: process.env.KEYSTATIC_CLOUD_PROJECT as string,
  },

  ui: {
    brand: {
      name: '🗂 CMS Multi-Sites',
    },
    navigation: {
      'sakaybrile.uk': ['sakaybrile_blog'],
      'Matieu White': ['matieuwhite_blog'],
      'webdesigner.sakaybrile.uk': ['webdesigner_gp_blog'],
      // ── Nouveaux sites ajoutés via scripts/add-site.sh ──
    },
  },

  collections: {
    // ── Site 1 : sakaybrile.uk (blog Astro)
    // Géré par : sites/site-1/  |  URL : blog.sakaybrile.uk
    sakaybrile_blog: collection({
      label: '📝 Articles — sakaybrile.uk',
      slugField: 'title',
      path: 'sites/site-1/src/content/blog/*',
      entryLayout: 'content',
      format: { contentField: 'content' },
      schema: articleSchema('Équipe Sakaybrile'),
    }),

    // ── Site 2 : matieuwhite.com (contenu stocké dans monorepo)
    // Géré par : content/matieuwhite/blog/  |  URL : matieuwhite.com
    matieuwhite_blog: collection({
      label: '📝 Articles — matieuwhite.com',
      slugField: 'title',
      path: 'content/matieuwhite/blog/*',
      entryLayout: 'content',
      format: { contentField: 'content' },
      schema: articleSchema('Matieu White'),
    }),

    // ── webdesigner.sakaybrile.uk (Astro)
    // Géré par : sites/webdesigner-gp/  |  URL : webdesigner.sakaybrile.uk
    webdesigner_gp_blog: collection({
      label: '📝 Articles — webdesigner.sakaybrile.uk',
      slugField: 'title',
      path: 'sites/webdesigner-gp/src/content/blog/*',
      entryLayout: 'content',
      format: { contentField: 'content' },
      schema: articleSchema('Sakaybrile Web Design'),
    }),

    // ── Nouveaux sites générés automatiquement par scripts/add-site.sh ──
  },
})

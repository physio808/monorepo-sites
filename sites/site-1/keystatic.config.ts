import { config, collection, fields } from '@keystatic/core'

export default config({
  storage: {
    kind: 'cloud',
  },

  cloud: {
    project: process.env.KEYSTATIC_CLOUD_PROJECT as string,
  },

  ui: {
    brand: {
      name: 'Sakaybrile Blog',
    },
  },

  collections: {
    blog: collection({
      label: 'Articles de blog',
      slugField: 'title',
      path: 'sites/site-1/src/content/blog/*',
      entryLayout: 'content',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Titre' } }),
        description: fields.text({
          label: 'Description (meta SEO — 50 à 160 caractères)',
          multiline: true,
          validation: { length: { min: 50, max: 160 } },
        }),
        pubDate: fields.date({ label: 'Date de publication' }),
        author: fields.text({
          label: 'Auteur',
          defaultValue: 'Équipe Sakaybrile',
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
      },
    }),
  },
})

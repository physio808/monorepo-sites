import { config, collection, fields } from '@keystatic/core'

export default config({
  storage: {
    kind: 'github',
    repo: {
      owner: 'physio808',
      name: 'monorepo-sites',
    },
    branchPrefix: 'keystatic/',
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
          label: 'Description (meta SEO)',
          multiline: true,
          validation: { length: { min: 50, max: 160 } },
        }),
        pubDate: fields.date({ label: 'Date de publication' }),
        author: fields.text({ label: 'Auteur', defaultValue: 'Équipe Sakaybrile' }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          { label: 'Tags', itemLabel: props => props.value }
        ),
        image: fields.text({ label: 'Image (URL ou chemin)', validation: { length: { min: 0, max: 255 } } }),
        draft: fields.checkbox({ label: 'Brouillon', defaultValue: false }),
        content: fields.markdoc({
          label: 'Contenu',
          extension: 'md',
        }),
      },
    }),
  },
})

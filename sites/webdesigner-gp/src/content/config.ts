import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('Sakaybrile Web Design'),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    draft: z.boolean().default(false),
    canonical: z.string().optional(),
  }),
})

const portfolio = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    client: z.string(),
    type: z.enum(['vitrine', 'ecommerce', 'seo', 'refonte']),
    tags: z.array(z.string()).default([]),
    image: z.string(),
    imageAlt: z.string(),
    url: z.string().optional(),
    date: z.coerce.date(),
    featured: z.boolean().default(false),
  }),
})

export const collections = { blog, portfolio }

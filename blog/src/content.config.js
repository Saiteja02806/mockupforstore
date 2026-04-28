import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string(),
    featured: z.boolean().default(false),
    ctaFrame: z.string().default('pill-phone'),
    readingTime: z.string().optional(),
    canonical: z.string().url().optional(),
    keywords: z.array(z.string()).optional(),
  }),
})

export const collections = { blog }

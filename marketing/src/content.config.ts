import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string(),
    featured: z.boolean(),
    ctaFrame: z.string().optional(),
    readingTime: z.string().optional(),
    canonical: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }),
})

export const collections = { blog }

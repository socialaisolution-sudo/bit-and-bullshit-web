import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      keyword: z.string(),
      category: z.enum(["entlarven", "learning", "denkfehler"]),
      order: z.number(),
      aeraLink: z.string().url().optional(),
      draft: z.boolean().default(true),
      featured: z.boolean().default(false),
      image: image().optional(),
      imageAlt: z.string().optional(),
    }),
});

export const collections = { blog };

import { z } from "zod";

// Define the schema for our news items
export const newsItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  link: z.string().url(),
  pubDate: z.string(),
  guid: z.string(),
  imageUrl: z.string().optional(),
  formattedDate: z.string()
});

export type NewsItem = z.infer<typeof newsItemSchema>;
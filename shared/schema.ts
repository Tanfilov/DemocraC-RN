import { z } from "zod";
import { pgTable, serial, text, varchar, integer, date, timestamp, uniqueIndex, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Database schema
export const politicians = pgTable('politicians', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  party: varchar('party', { length: 100 }),
  position: varchar('position', { length: 255 }),
  imageUrl: text('image_url'),
  mentionCount: integer('mention_count').default(0),
});

export const ratings = pgTable('ratings', {
  id: serial('id').primaryKey(),
  politicianId: integer('politician_id').references(() => politicians.id).notNull(),
  userId: varchar('user_id', { length: 255 }),
  rating: integer('rating').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the schema for our news items
export const newsItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  link: z.string().url(),
  pubDate: z.string(),
  guid: z.string(),
  imageUrl: z.string().optional(),
  formattedDate: z.string(),
  source: z.string().optional() // Source of the news (Ynet, Mako, etc.)
});

// Zod schemas for validation
export const politicianSchema = z.object({
  id: z.number(),
  name: z.string(),
  party: z.string().optional(),
  position: z.string().optional(),
  imageUrl: z.string().optional(),
  mentionCount: z.number().default(0),
});

export const ratingSchema = z.object({
  id: z.number().optional(),
  politicianId: z.number(),
  userId: z.string().optional(),
  rating: z.number().min(1).max(5),
  createdAt: z.date().optional(),
});

// Insert schemas
export const insertPoliticianSchema = createInsertSchema(politicians).omit({ id: true });
export const insertRatingSchema = createInsertSchema(ratings).omit({ id: true, createdAt: true });

// Types
export type NewsItem = z.infer<typeof newsItemSchema>;
export type Politician = z.infer<typeof politicianSchema>;
export type Rating = z.infer<typeof ratingSchema>;
export type InsertPolitician = z.infer<typeof insertPoliticianSchema>;
export type InsertRating = z.infer<typeof insertRatingSchema>;
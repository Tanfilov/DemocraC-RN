import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (kept from original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// News article schema
export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  url: text("url").notNull(),
  imageUrl: text("image_url"),
  source: text("source").notNull(),
  category: text("category").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  topicId: integer("topic_id").notNull(),
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({
  id: true,
});

// News topics (grouped related articles)
export const newsTopics = pgTable("news_topics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary"),
  category: text("category").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const insertNewsTopicSchema = createInsertSchema(newsTopics).omit({
  id: true,
});

// Politicians
export const politicians = pgTable("politicians", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  title: text("title"),
  description: text("description"),
  imageUrl: text("image_url"),
});

export const insertPoliticianSchema = createInsertSchema(politicians).omit({
  id: true,
});

// Politician mentions in articles
export const politicianMentions = pgTable("politician_mentions", {
  id: serial("id").primaryKey(),
  politicianId: integer("politician_id").notNull(),
  articleId: integer("article_id").notNull(),
});

export const insertPoliticianMentionSchema = createInsertSchema(politicianMentions).omit({
  id: true,
});

// Politician ratings
export const politicianRatings = pgTable("politician_ratings", {
  id: serial("id").primaryKey(),
  politicianId: integer("politician_id").notNull(),
  userId: integer("user_id"),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull(),
});

export const insertPoliticianRatingSchema = createInsertSchema(politicianRatings).omit({
  id: true,
  createdAt: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;

export type NewsTopic = typeof newsTopics.$inferSelect;
export type InsertNewsTopic = z.infer<typeof insertNewsTopicSchema>;

export type Politician = typeof politicians.$inferSelect;
export type InsertPolitician = z.infer<typeof insertPoliticianSchema>;

export type PoliticianMention = typeof politicianMentions.$inferSelect;
export type InsertPoliticianMention = z.infer<typeof insertPoliticianMentionSchema>;

export type PoliticianRating = typeof politicianRatings.$inferSelect;
export type InsertPoliticianRating = z.infer<typeof insertPoliticianRatingSchema>;

// API Types
export type NewsSource = {
  id: string;
  name: string;
};

export type NewsCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type TopicWithArticles = {
  id: number;
  title: string;
  summary: string;
  category: string;
  updatedAt: string;
  articles: NewsArticle[];
  politicians: (Politician & { rating?: number })[];
};

export type PoliticianWithRating = Politician & {
  averageRating: number;
  totalRatings: number;
  userRating?: number;
};

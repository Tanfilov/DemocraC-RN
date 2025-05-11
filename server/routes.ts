import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { rssService } from "./services/rssService";
import { politicianRecognitionService } from "./services/politicianRecognition";
import { insertRatingSchema } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { politicians, ratings } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Fetch RSS news with politician detection
  app.get("/api/news", async (req, res) => {
    try {
      const news = await rssService.fetchRssNews();
      
      // Add politicians detected in each news item
      const newsWithPoliticians = await Promise.all(news.map(async (item) => {
        const text = `${item.title} ${item.description}`;
        const detectedPoliticians = await politicianRecognitionService.detectPoliticians(text);
        
        return {
          ...item,
          politicians: detectedPoliticians
        };
      }));
      
      res.json(newsWithPoliticians);
    } catch (error) {
      console.error("Error fetching RSS news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  // Get all politicians
  app.get("/api/politicians", async (req, res) => {
    try {
      const allPoliticians = await db.select().from(politicians);
      res.json(allPoliticians);
    } catch (error) {
      console.error("Error fetching politicians:", error);
      res.status(500).json({ message: "Failed to fetch politicians" });
    }
  });

  // Get a specific politician
  app.get("/api/politicians/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [politician] = await db
        .select()
        .from(politicians)
        .where(eq(politicians.id, id));
      
      if (!politician) {
        return res.status(404).json({ message: "Politician not found" });
      }
      
      res.json(politician);
    } catch (error) {
      console.error("Error fetching politician:", error);
      res.status(500).json({ message: "Failed to fetch politician" });
    }
  });

  // Rate a politician
  app.post("/api/politicians/:id/rate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate the rating
      const result = insertRatingSchema.safeParse({
        ...req.body,
        politicianId: id
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid rating data", 
          errors: result.error.format() 
        });
      }
      
      // Check if politician exists
      const [politician] = await db
        .select()
        .from(politicians)
        .where(eq(politicians.id, id));
      
      if (!politician) {
        return res.status(404).json({ message: "Politician not found" });
      }
      
      // Save the rating
      const [newRating] = await db
        .insert(ratings)
        .values(result.data)
        .returning();
      
      res.json(newRating);
    } catch (error) {
      console.error("Error rating politician:", error);
      res.status(500).json({ message: "Failed to rate politician" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
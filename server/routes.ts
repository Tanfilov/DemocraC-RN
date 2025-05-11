import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { rssService } from "./services/rssService";
import { politicianRecognitionService } from "./services/politicianRecognition";
import { insertRatingSchema } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { politicians, ratings } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Fetch RSS news with politician detection
  app.get("/api/news", async (req, res) => {
    try {
      const news = await rssService.fetchRssNews();
      
      // Fetch all politicians
      const allPoliticians = await db.select().from(politicians);
      
      // Prepare map for article-specific ratings
      const politicianRatingsMap = new Map<string, Map<number, {id: number, rating: number, sum: number, count: number}>>();
      
      // Fetch ALL ratings for simplicity (in a real app with many ratings, we'd want to optimize this)
      const allRatings = await db.select().from(ratings);
      
      // Group ratings by article and politician
      for (const rating of allRatings) {
        const articleId = rating.articleId || 'global';
        
        // Initialize article map if it doesn't exist
        if (!politicianRatingsMap.has(articleId)) {
          politicianRatingsMap.set(articleId, new Map());
        }
        
        // Get the article's politician map
        const articlePoliticianMap = politicianRatingsMap.get(articleId)!;
        
        // Initialize politician rating if it doesn't exist
        if (!articlePoliticianMap.has(rating.politicianId)) {
          articlePoliticianMap.set(rating.politicianId, {
            id: rating.politicianId,
            rating: 0,
            count: 0,
            sum: 0
          });
        }
        
        // Update the rating sum and count
        const politicianRating = articlePoliticianMap.get(rating.politicianId)!;
        politicianRating.sum = (politicianRating.sum || 0) + rating.rating;
        politicianRating.count = (politicianRating.count || 0) + 1;
        politicianRating.rating = politicianRating.sum / politicianRating.count;
      }
      
      // Add politicians detected in each news item and simplify source names
      const newsWithPoliticians = await Promise.all(news.map(async (item) => {
        const text = `${item.title} ${item.description}`;
        const detectedPoliticians = await politicianRecognitionService.detectPoliticians(text);
        
        // Use article guid as identifier for article-specific ratings
        const articleId = item.guid;
        
        // Get the article-specific rating map, or use global ratings as fallback
        const articleRatingsMap = politicianRatingsMap.get(articleId) || politicianRatingsMap.get('global');
        
        // Update with article-specific ratings from database
        const updatedPoliticians = detectedPoliticians.map(politician => {
          const politicianId = politician.politicianId;
          // If we have article-specific ratings for this politician
          if (articleRatingsMap && articleRatingsMap.has(politicianId)) {
            const ratingInfo = articleRatingsMap.get(politicianId);
            if (ratingInfo && ratingInfo.rating > 0) {
              return {
                ...politician,
                rating: ratingInfo.rating
              };
            }
          }
          return politician;
        });
        
        // Simplify source name to just "Ynet" or "Mako"
        let source = item.source;
        if (source && source.startsWith('Ynet')) {
          source = 'Ynet';
        } else if (source && source.startsWith('Mako')) {
          source = 'Mako';
        }
        
        return {
          ...item,
          source,
          politicians: updatedPoliticians
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
        politicianId: id,
        articleId: req.body.articleId || null
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
      
      // Check if user already rated this politician in this article
      if (req.body.userId && req.body.articleId) {
        const existingRatings = await db
          .select()
          .from(ratings)
          .where(
            and(
              eq(ratings.politicianId, id),
              eq(ratings.userId, req.body.userId),
              eq(ratings.articleId, req.body.articleId)
            )
          );
        
        // If there's an existing rating, update it instead of creating a new one
        if (existingRatings.length > 0) {
          const [updatedRating] = await db
            .update(ratings)
            .set({ rating: req.body.rating })
            .where(eq(ratings.id, existingRatings[0].id))
            .returning();
            
          return res.json(updatedRating);
        }
      }
      
      // Save the new rating
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
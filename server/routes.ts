import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { rssService } from "./services/rssService";
import { politicianRecognitionService } from "./services/politicianRecognition";
import { insertRatingSchema } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { politicians, ratings } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple mobile refresh endpoint - just returns the current time
  app.get("/api/mobile/ping", (req, res) => {
    console.log("Mobile ping received");
    res.json({
      timestamp: Date.now(),
      server_time: new Date().toISOString(),
      status: "ok"
    });
  });
  
  // Direct RSS fetch endpoint for mobile app - no caching
  app.get("/api/mobile/rss", async (req, res) => {
    try {
      console.log("Mobile RSS fetch requested");
      
      // Add cache control headers
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Directly fetch from Ynet RSS feed without using the service
      const ynetUrl = `https://www.ynet.co.il/Integration/StoryRss2.xml?_t=${Date.now()}`;
      console.log(`Fetching from ${ynetUrl}`);
      
      const axios = require('axios');
      const xml2js = require('xml2js');
      
      const response = await axios.get(ynetUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        timeout: 10000
      });
      
      // Parse XML
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(response.data);
      
      // Just return the raw parsed data
      res.json({
        timestamp: Date.now(),
        ynet_data: result,
        fetch_time: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching RSS for mobile:", error);
      res.status(500).json({
        error: String(error),
        timestamp: Date.now()
      });
    }
  });
  // Special endpoint for mobile app to force fresh content
  app.get("/api/news/mobile", async (req, res) => {
    try {
      console.log('Mobile app requested fresh news');
      
      // Set cache control headers to prevent caching
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Force a completely fresh fetch by clearing any internal cache
      await rssService.clearCache();
      const news = await rssService.fetchRssNews(true); // true = force fresh
      
      // Fetch all politicians and ratings
      const allPoliticians = await db.select().from(politicians);
      const allRatings = await db.select().from(ratings);
      
      // Prepare map for article-specific ratings
      const politicianRatingsMap = new Map<string, Map<number, {id: number, rating: number, sum: number, count: number}>>();
      
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
        
        // Calculate the average rating
        politicianRating.rating = politicianRating.sum / politicianRating.count;
      }
      
      // Process each news item to detect politicians and add ratings
      const processedNews = await Promise.all(news.map(async (newsItem) => {
        try {
          // Combine all text fields for politician detection
          const fullText = [newsItem.title, newsItem.description].filter(Boolean).join(' ');
          
          // Detect politicians
          const detectedPoliticians = await politicianRecognitionService.detectPoliticians(fullText);
          
          // Get article ID
          const articleId = newsItem.guid || newsItem.link;
          
          // Get article-specific ratings map or fall back to global ratings
          const articleRatingsMap = politicianRatingsMap.get(articleId);
          const globalRatingsMap = politicianRatingsMap.get('global');
          
          // Update politicians with ratings
          const enhancedPoliticians = detectedPoliticians.map(politician => {
            const politicianId = politician.politicianId;
            
            // Try article-specific rating first, then global rating
            const articleRating = articleRatingsMap?.get(politicianId)?.rating;
            const globalRating = globalRatingsMap?.get(politicianId)?.rating;
            
            return {
              ...politician,
              rating: articleRating || globalRating || undefined
            };
          });
          
          // Format source name
          let source = newsItem.source;
          if (source && source.includes('Ynet')) {
            source = 'Ynet';
          } else if (source && source.includes('Mako')) {
            source = 'Mako';
          }
          
          return {
            ...newsItem,
            source,
            politicians: enhancedPoliticians
          };
        } catch (error) {
          console.error('Error processing news item:', error);
          return newsItem;
        }
      }));
      
      // Add timestamp to response to force client refresh
      res.json({
        timestamp: Date.now(),
        news: processedNews,
        forceRefresh: true,
        mobileFetch: true // Flag to indicate this came from the mobile endpoint
      });
    } catch (error) {
      console.error("Error fetching RSS news for mobile:", error);
      res.status(500).json({ 
        message: "Failed to fetch news",
        error: String(error)
      });
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
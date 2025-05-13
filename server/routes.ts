import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { rssService } from "./services/rssService";
import { politicianRecognitionService } from "./services/politicianRecognition";
import { insertRatingSchema } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { politicians, ratings } from "@shared/schema";
import axios from "axios";
import * as xml2js from "xml2js";

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
  
  // Special endpoint for React Native WebView wrapper
  app.get("/api/webview/news", async (req, res) => {
    try {
      console.log("WebView app news request received");
      
      // Set proper JSON content type header
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      
      // Add cache control headers
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Force a fresh fetch
      await rssService.clearCache();
      const news = await rssService.fetchRssNews(true);
      
      // Process news items to add politicians
      const processedNews = await Promise.all(news.map(async (newsItem) => {
        try {
          const detectedPoliticians = await politicianRecognitionService.detectPoliticians(
            `${newsItem.title} ${newsItem.description || ''}`
          );
          
          return {
            ...newsItem,
            politicians: detectedPoliticians
          };
        } catch (error) {
          console.error("Error processing news item:", error);
          return newsItem;
        }
      }));
      
      // Return a simple, reliable format
      res.json({
        status: "success",
        timestamp: Date.now(),
        count: processedNews.length,
        items: processedNews
      });
    } catch (error) {
      console.error("Error in WebView news endpoint:", error);
      res.status(200).json({
        status: "error",
        message: String(error),
        timestamp: Date.now(),
        items: []
      });
    }
  });
  
  // Direct RSS fetch endpoint for mobile app - no caching
  app.get("/api/mobile/rss", async (req, res) => {
    try {
      console.log("Mobile RSS fetch requested at", new Date().toISOString());
      
      // Add cache control and CORS headers
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      
      // Using axios and xml2js imports from the top of the file
      
      // Define all RSS sources with unique timestamp for cache busting
      const timestamp = Date.now();
      const sources = [
        {
          url: `https://www.ynet.co.il/Integration/StoryRss2.xml?_t=${timestamp}`,
          name: 'Ynet'
        },
        {
          url: `https://rcs.mako.co.il/rss/news-military.xml?Partner=interlink&_t=${timestamp}`,
          name: 'Mako Military'
        },
        {
          url: `https://rcs.mako.co.il/rss/news-law.xml?Partner=interlink&_t=${timestamp}`,
          name: 'Mako Law'
        }
      ];
      
      // Create a parser
      const parser = new xml2js.Parser({ explicitArray: false });
      
      // Fetch from all sources in parallel
      const results = await Promise.allSettled(sources.map(async (source) => {
        try {
          console.log(`Fetching from ${source.name}: ${source.url}`);
          
          const response = await axios.get(source.url, {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0',
              'User-Agent': 'Mozilla/5.0 (Mobile) DemocraC App'
            },
            timeout: 10000
          });
          
          // Parse XML
          const result = await parser.parseStringPromise(response.data);
          return {
            name: source.name,
            data: result,
            success: true
          };
        } catch (error: any) {
          console.error(`Error fetching from ${source.name}:`, error?.message || String(error));
          return {
            name: source.name,
            error: error?.message || String(error),
            success: false
          };
        }
      }));
      
      // Process successful results to add politicians
      const processedResults = await Promise.all(results.map(async (result) => {
        // Only process successful results
        if (result.status === 'fulfilled' && result.value?.success) {
          try {
            // Get RSS items
            const rssChannel = result.value.data?.rss?.channel;
            if (!rssChannel || !rssChannel.item) {
              return result; // Return as is if no items
            }
            
            // Process items to detect politicians
            const items = Array.isArray(rssChannel.item) ? rssChannel.item : [rssChannel.item];
            
            // Process each item to detect politicians
            const itemsWithPoliticians = await Promise.all(items.map(async (item: any) => {
              // Combine title and description for better detection
              const fullText = `${item.title || ''} ${item.description || ''}`;
              
              // Detect politicians
              const detectedPoliticians = await politicianRecognitionService.detectPoliticians(fullText);
              
              // Add politicians to the item
              return {
                ...item,
                politicians: detectedPoliticians
              };
            }));
            
            // Replace the items with processed ones
            return {
              ...result,
              value: {
                ...result.value,
                processedItems: itemsWithPoliticians
              }
            };
          } catch (err: any) {
            console.error('Error processing RSS items for politicians:', err?.message || String(err));
            return result; // Return original result on error
          }
        }
        return result;
      }));
      
      // Return processed results
      res.json({
        timestamp: timestamp,
        fetch_time: new Date().toISOString(),
        results: processedResults,
        mobile_endpoint: true
      });
    } catch (error: any) {
      console.error("Error fetching RSS for mobile:", error?.message || String(error));
      res.status(500).json({
        error: error?.message || String(error),
        timestamp: Date.now(),
        status: 'error'
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
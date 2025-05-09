import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPoliticianRatingSchema } from "@shared/schema";
import { fetchNewsFromAPI, searchNews } from "./services/newsService";
import { summarizeText, identifyPoliticians } from "./services/openaiService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // API routes
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getNewsCategories();
      res.json({ categories });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  app.get("/api/sources", async (_req: Request, res: Response) => {
    try {
      const sources = await storage.getNewsSources();
      res.json({ sources });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sources" });
    }
  });
  
  // Get topics with their articles and mentioned politicians
  app.get("/api/topics", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      // Attempt to fetch from News API if not enough data
      await refreshNewsData();
      
      const topics = await storage.getTopicsWithArticles(category, limit, offset);
      res.json({ topics });
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });
  
  // Get a single topic with its articles and mentioned politicians
  app.get("/api/topics/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }
      
      const topic = await storage.getTopicWithArticles(id);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      res.json({ topic });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch topic" });
    }
  });
  
  // Get top rated politicians
  app.get("/api/politicians/top", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const politicians = await storage.getTopRatedPoliticians(limit);
      res.json({ politicians });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top politicians" });
    }
  });
  
  // Get all politicians
  app.get("/api/politicians", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const politicians = await storage.getPoliticians(limit, offset);
      res.json({ politicians });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch politicians" });
    }
  });
  
  // Get a politician by ID
  app.get("/api/politicians/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid politician ID" });
      }
      
      const politician = await storage.getPolitician(id);
      if (!politician) {
        return res.status(404).json({ message: "Politician not found" });
      }
      
      const averageRating = await storage.getPoliticianAverageRating(id);
      const ratings = await storage.getPoliticianRatings(id);
      const articles = await storage.getArticlesWithPolitician(id);
      
      res.json({
        politician: {
          ...politician,
          averageRating,
          totalRatings: ratings.length,
        },
        articles,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch politician" });
    }
  });
  
  // Rate a politician
  app.post("/api/politicians/:id/rate", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid politician ID" });
      }
      
      const politician = await storage.getPolitician(id);
      if (!politician) {
        return res.status(404).json({ message: "Politician not found" });
      }
      
      const ratingSchema = insertPoliticianRatingSchema.omit({ politicianId: true, userId: true });
      const validationResult = ratingSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid rating data",
          errors: validationResult.error.errors
        });
      }
      
      // Save the rating
      const { rating, comment } = validationResult.data;
      const newRating = await storage.createPoliticianRating({
        politicianId: id,
        userId: null, // Anonymous for now
        rating,
        comment: comment || null,
      });
      
      const averageRating = await storage.getPoliticianAverageRating(id);
      
      res.json({ 
        rating: newRating,
        averageRating
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to save rating" });
    }
  });
  
  // Search for news
  app.get("/api/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string | undefined;
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      const articles = await searchNews(query);
      
      res.json({ articles });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search news" });
    }
  });
  
  // Refresh news data from external API
  app.post("/api/refresh", async (_req: Request, res: Response) => {
    try {
      await refreshNewsData();
      res.json({ message: "News data refreshed successfully" });
    } catch (error) {
      console.error("Refresh error:", error);
      res.status(500).json({ message: "Failed to refresh news data" });
    }
  });
  
  // Manually fetch news from Ynet
  app.get("/api/fetch-ynet", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string || "politics";
      
      console.log(`Manual fetch from Ynet for category: ${category}`);
      const articles = await fetchNewsFromAPI(category);
      
      // Create a new topic if we have articles
      if (articles.length > 0) {
        // Use the first article's title as the topic title
        const topicTitle = articles[0].title;
        const topicSummary = articles[0].content;
        
        // Create or get topic
        const topic = await storage.upsertTopic({
          title: topicTitle,
          summary: topicSummary,
          category,
          updatedAt: new Date()
        });
        
        // Process articles and identify politicians
        const processedArticles = [];
        const foundPoliticians = new Set<string>();
        
        for (const article of articles) {
          const savedArticle = await storage.upsertArticle({
            title: article.title,
            content: article.content,
            summary: article.summary || null,
            url: article.url,
            imageUrl: article.imageUrl || null,
            source: article.source,
            category,
            publishedAt: new Date(article.publishedAt),
            topicId: topic.id
          });
          
          processedArticles.push(savedArticle);
          
          // Try to identify politicians in the article
          try {
            const politicianNames = await identifyPoliticians(`${article.title}. ${article.content}`);
            
            for (const politicianName of politicianNames) {
              // Skip very short names (likely false positives)
              if (politicianName.length < 6) continue;
              
              foundPoliticians.add(politicianName);
              
              const politician = await storage.upsertPolitician({
                name: politicianName,
                title: null,
                description: null,
                imageUrl: null
              });
              
              // Add mention
              await storage.addPoliticianMention({
                politicianId: politician.id,
                articleId: savedArticle.id
              });
            }
          } catch (err) {
            console.error("Failed to process politicians for article:", err);
          }
        }
        
        // Get the politicians with mentions in these articles
        const politiciansInArticles = await storage.getPoliticiansInTopicArticles(topic.id);
        
        res.json({ 
          message: `Fetched ${articles.length} articles from Ynet for category: ${category}`, 
          topic,
          articles: articles.slice(0, 5).map(a => a.title),  // Show just a sample
          foundPoliticians: Array.from(foundPoliticians),
          politiciansInArticles
        });
      } else {
        res.json({ message: "No articles found for category: " + category });
      }
    } catch (error) {
      console.error("Error in /api/fetch-ynet:", error);
      res.status(500).json({ message: "Error fetching from Ynet", error: String(error) });
    }
  });
  
  // Fetch political news specifically
  app.get("/api/fetch-political-news", async (_req: Request, res: Response) => {
    try {
      console.log("Fetching political news from Ynet");
      const articles = await fetchNewsFromAPI("politics");
      
      // Create or update topics and process politicians
      const processedTopics = [];
      const processedPoliticians = new Set<string>();
      
      if (articles.length > 0) {
        // Group articles by some similarity measure
        const articleGroups: Record<string, any[]> = {};
        
        for (const article of articles) {
          // Create a simple hash key for grouping similar articles
          const words = article.title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
          const key = words.slice(0, 3).sort().join('-');
          
          if (!articleGroups[key]) {
            articleGroups[key] = [];
          }
          
          articleGroups[key].push(article);
        }
        
        // Process each group of articles
        for (const [key, groupArticles] of Object.entries(articleGroups)) {
          if (groupArticles.length < 1) continue; // Ensure we have at least one article
          
          // Create or update topic
          const topicTitle = groupArticles[0].title;
          const topicSummary = groupArticles[0].content;
          
          const topic = await storage.upsertTopic({
            title: topicTitle,
            summary: topicSummary,
            category: "politics",
            updatedAt: new Date()
          });
          
          processedTopics.push(topic);
          
          // Process each article in the group
          for (const article of groupArticles) {
            const savedArticle = await storage.upsertArticle({
              title: article.title,
              content: article.content,
              summary: article.summary || null,
              url: article.url,
              imageUrl: article.imageUrl || null,
              source: article.source,
              category: "politics",
              publishedAt: new Date(article.publishedAt),
              topicId: topic.id
            });
            
            // Try to identify politicians in the article
            try {
              const politicianNames = await identifyPoliticians(`${article.title}. ${article.content}`);
              
              for (const politicianName of politicianNames) {
                // Skip very short names (likely false positives)
                if (politicianName.length < 6) continue;
                
                processedPoliticians.add(politicianName);
                
                const politician = await storage.upsertPolitician({
                  name: politicianName,
                  title: null,
                  description: null,
                  imageUrl: null
                });
                
                // Add mention
                await storage.addPoliticianMention({
                  politicianId: politician.id,
                  articleId: savedArticle.id
                });
              }
            } catch (err) {
              console.error("Failed to process politicians for article:", err);
            }
          }
        }
      }
      
      // Get top politicians based on mentions
      const topPoliticians = await storage.getTopRatedPoliticians(10);
      
      res.json({
        message: `Processed ${articles.length} political news articles`,
        topics: processedTopics,
        politicians: Array.from(processedPoliticians),
        topPoliticians
      });
    } catch (error) {
      console.error("Error fetching political news:", error);
      res.status(500).json({ message: "Error fetching political news", error: String(error) });
    }
  });

  // Add specific politician endpoint
  app.get("/api/fetch-politician/:name", async (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      
      if (!name) {
        return res.status(400).json({ error: "Politician name is required" });
      }
      
      // Check if politician exists
      let politician = await storage.getPoliticianByName(name);
      
      // If not, create new politician
      if (!politician) {
        politician = await storage.createPolitician({
          name: name,
          title: "פוליטיקאי ישראלי", // Generic Israeli politician title
          description: `פוליטיקאי ישראלי בשם ${name}`,
          imageUrl: null
        });
        console.log(`Created new politician: ${name}`);
      }
      
      // Set initial rating if none exists
      const ratings = await storage.getPoliticianRatings(politician.id);
      if (ratings.length === 0) {
        await storage.createPoliticianRating({
          politicianId: politician.id,
          userId: null,
          rating: 3, // Default middle rating
          comment: "דירוג ראשוני",
          createdAt: new Date()
        });
      }
      
      const averageRating = await storage.getPoliticianAverageRating(politician.id);
      
      res.status(200).json({
        success: true,
        politician: {
          ...politician,
          averageRating,
          totalRatings: ratings.length,
        },
        message: `Politician ${name} has been added to the system.`
      });
    } catch (error) {
      console.error(`Error adding politician ${req.params.name}:`, error);
      res.status(500).json({ error: "Failed to add politician" });
    }
  });
  
  return httpServer;
}

// Helper function to refresh news data
async function refreshNewsData() {
  try {
    console.log("Refreshing news data...");
    const categories = await storage.getNewsCategories();
    
    for (const category of categories) {
      // Get news for this category
      const news = await fetchNewsFromAPI(category.id);
      
      if (news.length > 0) {
        // Create or update topics based on news
        let topicIndex = 1;
        
        // Group by similar titles/content (simplified approach)
        const topicGroups: Record<string, any[]> = {};
        
        for (const article of news) {
          // Create a simple hash key for grouping similar articles
          const words = article.title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
          const key = words.slice(0, 3).sort().join('-');
          
          if (!topicGroups[key]) {
            topicGroups[key] = [];
          }
          
          topicGroups[key].push(article);
        }
        
        // Process each topic group
        for (const [key, articles] of Object.entries(topicGroups)) {
          if (articles.length < 2) continue; // Only care about topics with multiple articles
          
          // Create or update topic
          const title = articles[0].title;
          
          // Combine articles for summarization
          const combinedText = articles.map(a => `${a.title}. ${a.content}`).join("\n\n");
          const summary = await summarizeText(combinedText);
          
          const topic = await storage.upsertTopic({
            title,
            summary,
            category: category.id,
            updatedAt: new Date(),
          });
          
          // Process each article
          for (const article of articles) {
            const existingArticle = await storage.upsertArticle({
              title: article.title,
              content: article.content,
              summary: article.summary || null,
              url: article.url,
              imageUrl: article.imageUrl || null,
              source: article.source,
              category: category.id,
              publishedAt: new Date(article.publishedAt),
              topicId: topic.id,
            });
            
            // Process politicians mentioned in the article
            try {
              const politicians = await identifyPoliticians(
                `${article.title}. ${article.content}`
              );
              
              // Create/update politicians and add mentions
              for (const politicianName of politicians) {
                // Skip very short names (likely false positives)
                if (politicianName.length < 6) continue;
                
                const politician = await storage.upsertPolitician({
                  name: politicianName,
                  title: null,
                  description: null,
                  imageUrl: null,
                });
                
                // Add mention
                await storage.addPoliticianMention({
                  politicianId: politician.id,
                  articleId: existingArticle.id,
                });
              }
            } catch (error) {
              console.error("Failed to process politicians for article:", error);
            }
          }
          
          topicIndex++;
        }
      }
    }
    
    console.log("News data refresh completed");
  } catch (error) {
    console.error("Failed to refresh news:", error);
    throw error;
  }
}

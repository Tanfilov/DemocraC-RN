import type { Express } from "express";
import { createServer, type Server } from "http";
import { rssService } from "./services/rssService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Fetch RSS news
  app.get("/api/news", async (req, res) => {
    try {
      const news = await rssService.fetchRssNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching RSS news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
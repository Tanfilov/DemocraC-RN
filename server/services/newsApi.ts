import { InsertArticle } from "@shared/schema";

interface NewsApiResponse {
  articles: NewsApiArticle[];
  status: string;
  totalResults: number;
}

interface NewsApiArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

interface ProcessedArticle {
  title: string;
  content: string;
  summary?: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
  sources: string[];
  url: string;
}

class NewsApiService {
  private apiKey: string;
  private baseUrl: string = "https://newsapi.org/v2";
  
  constructor() {
    this.apiKey = process.env.NEWS_API_KEY || "";
    
    if (!this.apiKey) {
      console.warn("NEWS_API_KEY not found in environment variables");
    }
  }
  
  private async fetchFromApi(endpoint: string, params: Record<string, string>): Promise<NewsApiResponse> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add API key and parameters
    url.searchParams.append("apiKey", this.apiKey);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }
    
    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`News API request failed: ${response.status} ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching from News API:", error);
      throw error;
    }
  }
  
  private mapCategory(query: string): string {
    // Simple mapping of search queries to categories
    const mappings: Record<string, string> = {
      "president": "Politics",
      "senate": "Politics",
      "congress": "Politics",
      "election": "Politics",
      "government": "Politics",
      "policy": "Politics",
      "stock": "Business",
      "market": "Business",
      "economy": "Business",
      "finance": "Business",
      "investment": "Business",
      "tech": "Technology",
      "technology": "Technology",
      "software": "Technology",
      "ai": "Technology",
      "movie": "Entertainment",
      "celebrity": "Entertainment",
      "music": "Entertainment",
      "sports": "Sports",
      "team": "Sports",
      "athlete": "Sports",
      "game": "Sports",
      "health": "Health",
      "medical": "Health",
      "disease": "Health",
      "hospital": "Health",
      "treatment": "Health"
    };
    
    const lowercaseQuery = query.toLowerCase();
    
    for (const [key, category] of Object.entries(mappings)) {
      if (lowercaseQuery.includes(key)) {
        return category;
      }
    }
    
    return "General";
  }
  
  private getDefaultImageForCategory(category: string): string {
    const defaultImages: Record<string, string> = {
      "Politics": "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "Business": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      "Technology": "https://images.unsplash.com/photo-1618477460930-d8bffff64172?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      "Entertainment": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      "Sports": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      "Health": "https://pixabay.com/get/g66a029f1f9acc14810bba8fe85efc1d8b7ed42951615b2d54f01db786debd22e5766774258d4bc9ae449327ab98cade05ba0d7a5df00459e25de6cc947ca6936_1280.jpg"
    };
    
    return defaultImages[category] || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&h=400";
  }
  
  async fetchLatestNews(): Promise<ProcessedArticle[]> {
    if (!this.apiKey) {
      throw new Error("NEWS_API_KEY not set in environment variables");
    }
    
    const politicsResponse = await this.fetchFromApi("/top-headlines", {
      category: "politics",
      language: "en",
      pageSize: "10"
    });
    
    const businessResponse = await this.fetchFromApi("/top-headlines", {
      category: "business",
      language: "en",
      pageSize: "10"
    });
    
    const technologyResponse = await this.fetchFromApi("/top-headlines", {
      category: "technology",
      language: "en",
      pageSize: "10"
    });
    
    // Process articles from all responses
    const processedArticles: ProcessedArticle[] = [];
    
    // Helper function to process articles
    const processArticles = (articles: NewsApiArticle[], defaultCategory: string) => {
      for (const article of articles) {
        if (!article.title || !article.content || article.title.includes("[Removed]")) {
          continue;
        }
        
        const category = this.mapCategory(article.title) || defaultCategory;
        const imageUrl = article.urlToImage || this.getDefaultImageForCategory(category);
        
        // Track sources for articles with similar titles
        const existingArticleIndex = processedArticles.findIndex(
          a => this.similarity(a.title, article.title) > 0.7
        );
        
        if (existingArticleIndex !== -1) {
          // Add source to existing article
          if (!processedArticles[existingArticleIndex].sources.includes(article.source.name)) {
            processedArticles[existingArticleIndex].sources.push(article.source.name);
          }
        } else {
          // Add as new article
          processedArticles.push({
            title: article.title,
            content: article.content,
            category,
            imageUrl,
            publishedAt: article.publishedAt,
            sources: [article.source.name],
            url: article.url
          });
        }
      }
    };
    
    processArticles(politicsResponse.articles, "Politics");
    processArticles(businessResponse.articles, "Business");
    processArticles(technologyResponse.articles, "Technology");
    
    return processedArticles;
  }
  
  // Utility function to calculate title similarity for grouping articles
  private similarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
  
  private levenshteinDistance(s1: string, s2: string): number {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    
    const costs = new Array(s2.length + 1);
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) {
        costs[s2.length] = lastValue;
      }
    }
    
    return costs[s2.length];
  }
  
  // Get news by topic
  async getNewsByTopic(topic: string, limit: number = 10): Promise<ProcessedArticle[]> {
    if (!this.apiKey) {
      throw new Error("NEWS_API_KEY not set in environment variables");
    }
    
    const response = await this.fetchFromApi("/everything", {
      q: topic,
      language: "en",
      sortBy: "publishedAt",
      pageSize: limit.toString()
    });
    
    const processedArticles: ProcessedArticle[] = [];
    const processArticles = (articles: NewsApiArticle[]) => {
      for (const article of articles) {
        if (!article.title || !article.content || article.title.includes("[Removed]")) {
          continue;
        }
        
        const category = this.mapCategory(article.title);
        const imageUrl = article.urlToImage || this.getDefaultImageForCategory(category);
        
        // Check for similar articles
        const existingArticleIndex = processedArticles.findIndex(
          a => this.similarity(a.title, article.title) > 0.7
        );
        
        if (existingArticleIndex !== -1) {
          // Add source to existing article
          if (!processedArticles[existingArticleIndex].sources.includes(article.source.name)) {
            processedArticles[existingArticleIndex].sources.push(article.source.name);
          }
        } else {
          // Add as new article
          processedArticles.push({
            title: article.title,
            content: article.content,
            category,
            imageUrl,
            publishedAt: article.publishedAt,
            sources: [article.source.name],
            url: article.url
          });
        }
      }
    };
    
    processArticles(response.articles);
    return processedArticles;
  }
  
  // Search articles
  async searchArticles(query: string, limit: number = 20): Promise<ProcessedArticle[]> {
    if (!this.apiKey) {
      throw new Error("NEWS_API_KEY not set in environment variables");
    }
    
    const response = await this.fetchFromApi("/everything", {
      q: query,
      language: "en",
      sortBy: "relevancy",
      pageSize: limit.toString()
    });
    
    const processedArticles: ProcessedArticle[] = [];
    const processArticles = (articles: NewsApiArticle[]) => {
      for (const article of articles) {
        if (!article.title || !article.content || article.title.includes("[Removed]")) {
          continue;
        }
        
        const category = this.mapCategory(article.title);
        const imageUrl = article.urlToImage || this.getDefaultImageForCategory(category);
        
        // Check for similar articles
        const existingArticleIndex = processedArticles.findIndex(
          a => this.similarity(a.title, article.title) > 0.7
        );
        
        if (existingArticleIndex !== -1) {
          // Add source to existing article
          if (!processedArticles[existingArticleIndex].sources.includes(article.source.name)) {
            processedArticles[existingArticleIndex].sources.push(article.source.name);
          }
        } else {
          // Add as new article
          processedArticles.push({
            title: article.title,
            content: article.content,
            category,
            imageUrl,
            publishedAt: article.publishedAt,
            sources: [article.source.name],
            url: article.url
          });
        }
      }
    };
    
    processArticles(response.articles);
    return processedArticles;
  }
}

export const newsApiService = new NewsApiService();

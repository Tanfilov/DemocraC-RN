import {
  type User,
  type InsertUser,
  type NewsArticle,
  type InsertNewsArticle,
  type NewsTopic,
  type InsertNewsTopic,
  type Politician,
  type InsertPolitician,
  type PoliticianMention,
  type InsertPoliticianMention,
  type PoliticianRating,
  type InsertPoliticianRating,
  type TopicWithArticles,
  type PoliticianWithRating,
  type NewsSource,
  type NewsCategory
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // News Articles
  getArticle(id: number): Promise<NewsArticle | undefined>;
  getArticlesByTopic(topicId: number): Promise<NewsArticle[]>;
  createArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  upsertArticle(article: InsertNewsArticle & { id?: number }): Promise<NewsArticle>;
  
  // News Topics
  getTopic(id: number): Promise<NewsTopic | undefined>;
  getTopics(category?: string, limit?: number, offset?: number): Promise<NewsTopic[]>;
  createTopic(topic: InsertNewsTopic): Promise<NewsTopic>;
  upsertTopic(topic: InsertNewsTopic & { id?: number }): Promise<NewsTopic>;
  getTopicsWithArticles(category?: string, limit?: number, offset?: number): Promise<TopicWithArticles[]>;
  getTopicWithArticles(id: number): Promise<TopicWithArticles | undefined>;
  
  // Politicians
  getPolitician(id: number): Promise<Politician | undefined>;
  getPoliticianByName(name: string): Promise<Politician | undefined>;
  getPoliticians(limit?: number, offset?: number): Promise<Politician[]>;
  createPolitician(politician: InsertPolitician): Promise<Politician>;
  upsertPolitician(politician: InsertPolitician & { id?: number }): Promise<Politician>;
  getTopRatedPoliticians(limit?: number): Promise<PoliticianWithRating[]>;
  
  // Politician Mentions
  addPoliticianMention(mention: InsertPoliticianMention): Promise<PoliticianMention>;
  getPoliticianMentions(articleId: number): Promise<PoliticianMention[]>;
  getPoliticiansInArticle(articleId: number): Promise<Politician[]>;
  getArticlesWithPolitician(politicianId: number): Promise<NewsArticle[]>;
  
  // Politician Ratings
  getPoliticianRating(politicianId: number, userId?: number): Promise<PoliticianRating | undefined>;
  getPoliticianRatings(politicianId: number): Promise<PoliticianRating[]>;
  createPoliticianRating(rating: InsertPoliticianRating): Promise<PoliticianRating>;
  updatePoliticianRating(id: number, rating: Partial<InsertPoliticianRating>): Promise<PoliticianRating>;
  getPoliticianAverageRating(politicianId: number): Promise<number>;
  
  // Other
  getNewsSources(): Promise<NewsSource[]>;
  getNewsCategories(): Promise<NewsCategory[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, NewsArticle>;
  private topics: Map<number, NewsTopic>;
  private politicians: Map<number, Politician>;
  private politicianMentions: Map<number, PoliticianMention>;
  private politicianRatings: Map<number, PoliticianRating>;
  
  private userId: number;
  private articleId: number;
  private topicId: number;
  private politicianId: number;
  private mentionId: number;
  private ratingId: number;
  
  private sources: NewsSource[];
  private categories: NewsCategory[];

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.topics = new Map();
    this.politicians = new Map();
    this.politicianMentions = new Map();
    this.politicianRatings = new Map();
    
    this.userId = 1;
    this.articleId = 1;
    this.topicId = 1;
    this.politicianId = 1;
    this.mentionId = 1;
    this.ratingId = 1;
    
    // Predefined sources - Hebrew news sites
    this.sources = [
      { id: "ynet", name: "Ynet" },
      { id: "n12", name: "N12" },
      { id: "walla", name: "Walla News" },
      { id: "haaretz", name: "Haaretz" },
      { id: "maariv", name: "Maariv" },
      { id: "israelhayom", name: "Israel Hayom" },
      { id: "calcalist", name: "Calcalist" },
      { id: "globes", name: "Globes" },
    ];
    
    // Predefined categories in Hebrew
    this.categories = [
      { id: "politics", name: "פוליטיקה", icon: "account_balance", color: "#3b82f6" },
      { id: "business", name: "עסקים", icon: "business", color: "#f97316" },
      { id: "technology", name: "טכנולוגיה", icon: "devices", color: "#14b8a6" },
      { id: "entertainment", name: "בידור", icon: "theaters", color: "#ec4899" },
      { id: "sports", name: "ספורט", icon: "sports_soccer", color: "#22c55e" },
      { id: "health", name: "בריאות", icon: "local_hospital", color: "#a855f7" },
      { id: "security", name: "ביטחון", icon: "security", color: "#dc2626" },
    ];
    
    // Initialize with sample data
    this.initializeWithSampleData();
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // News Articles
  async getArticle(id: number): Promise<NewsArticle | undefined> {
    return this.articles.get(id);
  }
  
  async getArticlesByTopic(topicId: number): Promise<NewsArticle[]> {
    return Array.from(this.articles.values())
      .filter(article => article.topicId === topicId);
  }
  
  async createArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const id = this.articleId++;
    const newArticle: NewsArticle = { ...article, id };
    this.articles.set(id, newArticle);
    return newArticle;
  }
  
  async upsertArticle(article: InsertNewsArticle & { id?: number }): Promise<NewsArticle> {
    if (article.id && this.articles.has(article.id)) {
      const updatedArticle = { ...this.articles.get(article.id)!, ...article };
      this.articles.set(article.id, updatedArticle);
      return updatedArticle;
    } else {
      return this.createArticle(article);
    }
  }
  
  // News Topics
  async getTopic(id: number): Promise<NewsTopic | undefined> {
    return this.topics.get(id);
  }
  
  async getTopics(category?: string, limit?: number, offset = 0): Promise<NewsTopic[]> {
    let topics = Array.from(this.topics.values());
    
    if (category) {
      topics = topics.filter(topic => topic.category === category);
    }
    
    // Sort by updated date
    topics = topics.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    if (limit) {
      topics = topics.slice(offset, offset + limit);
    }
    
    return topics;
  }
  
  async createTopic(topic: InsertNewsTopic): Promise<NewsTopic> {
    const id = this.topicId++;
    const newTopic: NewsTopic = { ...topic, id };
    this.topics.set(id, newTopic);
    return newTopic;
  }
  
  async upsertTopic(topic: InsertNewsTopic & { id?: number }): Promise<NewsTopic> {
    if (topic.id && this.topics.has(topic.id)) {
      const updatedTopic = { ...this.topics.get(topic.id)!, ...topic };
      this.topics.set(topic.id, updatedTopic);
      return updatedTopic;
    } else {
      return this.createTopic(topic);
    }
  }
  
  async getTopicsWithArticles(category?: string, limit?: number, offset = 0): Promise<TopicWithArticles[]> {
    const topics = await this.getTopics(category, limit, offset);
    
    return Promise.all(topics.map(async (topic) => {
      const articles = await this.getArticlesByTopic(topic.id);
      
      const politicianIds = new Set<number>();
      for (const article of articles) {
        const mentions = await this.getPoliticianMentions(article.id);
        for (const mention of mentions) {
          politicianIds.add(mention.politicianId);
        }
      }
      
      const politicians = await Promise.all(
        Array.from(politicianIds).map(async (id) => {
          const politician = await this.getPolitician(id);
          const avgRating = await this.getPoliticianAverageRating(id);
          return { ...politician!, rating: avgRating };
        })
      );
      
      return {
        ...topic,
        articles,
        politicians,
      };
    }));
  }
  
  async getTopicWithArticles(id: number): Promise<TopicWithArticles | undefined> {
    const topic = await this.getTopic(id);
    if (!topic) return undefined;
    
    const articles = await this.getArticlesByTopic(topic.id);
    
    const politicianIds = new Set<number>();
    for (const article of articles) {
      const mentions = await this.getPoliticianMentions(article.id);
      for (const mention of mentions) {
        politicianIds.add(mention.politicianId);
      }
    }
    
    const politicians = await Promise.all(
      Array.from(politicianIds).map(async (id) => {
        const politician = await this.getPolitician(id);
        const avgRating = await this.getPoliticianAverageRating(id);
        return { ...politician!, rating: avgRating };
      })
    );
    
    return {
      ...topic,
      articles,
      politicians,
    };
  }
  
  // Politicians
  async getPolitician(id: number): Promise<Politician | undefined> {
    return this.politicians.get(id);
  }
  
  async getPoliticianByName(name: string): Promise<Politician | undefined> {
    return Array.from(this.politicians.values()).find(
      (politician) => politician.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  async getPoliticians(limit?: number, offset = 0): Promise<Politician[]> {
    let politicians = Array.from(this.politicians.values());
    
    if (limit) {
      politicians = politicians.slice(offset, offset + limit);
    }
    
    return politicians;
  }
  
  async createPolitician(politician: InsertPolitician): Promise<Politician> {
    const id = this.politicianId++;
    const newPolitician: Politician = { ...politician, id };
    this.politicians.set(id, newPolitician);
    return newPolitician;
  }
  
  async upsertPolitician(politician: InsertPolitician & { id?: number }): Promise<Politician> {
    if (politician.id && this.politicians.has(politician.id)) {
      const updatedPolitician = { ...this.politicians.get(politician.id)!, ...politician };
      this.politicians.set(politician.id, updatedPolitician);
      return updatedPolitician;
    } else {
      // Check if politician with same name exists
      const existingPolitician = await this.getPoliticianByName(politician.name);
      if (existingPolitician) {
        const updatedPolitician = { ...existingPolitician, ...politician };
        this.politicians.set(existingPolitician.id, updatedPolitician);
        return updatedPolitician;
      }
      
      return this.createPolitician(politician);
    }
  }
  
  async getTopRatedPoliticians(limit = 10): Promise<PoliticianWithRating[]> {
    const politicians = await this.getPoliticians();
    
    const politiciansWithRatings = await Promise.all(politicians.map(async (politician) => {
      const ratings = await this.getPoliticianRatings(politician.id);
      const totalRatings = ratings.length;
      const averageRating = totalRatings
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;
      
      return {
        ...politician,
        averageRating,
        totalRatings,
      };
    }));
    
    return politiciansWithRatings
      .filter(p => p.totalRatings > 0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);
  }
  
  // Politician Mentions
  async addPoliticianMention(mention: InsertPoliticianMention): Promise<PoliticianMention> {
    const id = this.mentionId++;
    const newMention: PoliticianMention = { ...mention, id };
    this.politicianMentions.set(id, newMention);
    return newMention;
  }
  
  async getPoliticianMentions(articleId: number): Promise<PoliticianMention[]> {
    return Array.from(this.politicianMentions.values())
      .filter(mention => mention.articleId === articleId);
  }
  
  async getPoliticiansInArticle(articleId: number): Promise<Politician[]> {
    const mentions = await this.getPoliticianMentions(articleId);
    const politicians = await Promise.all(
      mentions.map(mention => this.getPolitician(mention.politicianId))
    );
    
    return politicians.filter((p): p is Politician => p !== undefined);
  }
  
  async getArticlesWithPolitician(politicianId: number): Promise<NewsArticle[]> {
    const mentions = Array.from(this.politicianMentions.values())
      .filter(mention => mention.politicianId === politicianId);
    
    const articles = await Promise.all(
      mentions.map(mention => this.getArticle(mention.articleId))
    );
    
    return articles.filter((a): a is NewsArticle => a !== undefined);
  }
  
  // Politician Ratings
  async getPoliticianRating(politicianId: number, userId?: number): Promise<PoliticianRating | undefined> {
    return Array.from(this.politicianRatings.values()).find(
      rating => rating.politicianId === politicianId && 
                (userId ? rating.userId === userId : true)
    );
  }
  
  async getPoliticianRatings(politicianId: number): Promise<PoliticianRating[]> {
    return Array.from(this.politicianRatings.values())
      .filter(rating => rating.politicianId === politicianId);
  }
  
  async createPoliticianRating(rating: InsertPoliticianRating): Promise<PoliticianRating> {
    const id = this.ratingId++;
    const newRating: PoliticianRating = { 
      ...rating, 
      id, 
      createdAt: new Date() 
    };
    this.politicianRatings.set(id, newRating);
    return newRating;
  }
  
  async updatePoliticianRating(id: number, rating: Partial<InsertPoliticianRating>): Promise<PoliticianRating> {
    const existingRating = this.politicianRatings.get(id);
    if (!existingRating) {
      throw new Error(`Rating with id ${id} not found`);
    }
    
    const updatedRating = { ...existingRating, ...rating };
    this.politicianRatings.set(id, updatedRating);
    return updatedRating;
  }
  
  async getPoliticianAverageRating(politicianId: number): Promise<number> {
    const ratings = await this.getPoliticianRatings(politicianId);
    if (ratings.length === 0) return 0;
    
    return ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;
  }
  
  // Other
  async getNewsSources(): Promise<NewsSource[]> {
    return this.sources;
  }
  
  async getNewsCategories(): Promise<NewsCategory[]> {
    return this.categories;
  }
  
  // Helper method to initialize with sample data
  private initializeWithSampleData() {
    // Sample politicians with image URLs of real politicians (these are placeholders)
    const politicians = [
      { 
        name: "Senator Sarah Johnson", 
        title: "Senator",
        description: "Senate Energy Committee Chair",
        imageUrl: "https://randomuser.me/api/portraits/women/32.jpg"
      },
      { 
        name: "Senator Michael Roberts", 
        title: "Senator",
        description: "Senate Committee on Technology",
        imageUrl: "https://randomuser.me/api/portraits/men/54.jpg"
      },
      { 
        name: "Rep. Daniel Chen", 
        title: "Representative",
        description: "House Technology Committee",
        imageUrl: "https://randomuser.me/api/portraits/men/72.jpg"
      },
      { 
        name: "Sec. Thomas Williams", 
        title: "Secretary",
        description: "Treasury Secretary",
        imageUrl: "https://randomuser.me/api/portraits/men/45.jpg"
      },
      { 
        name: "Min. Amanda Parker", 
        title: "Minister",
        description: "Minister of Culture",
        imageUrl: "https://randomuser.me/api/portraits/women/28.jpg"
      },
      { 
        name: "Gov. Maria Rodriguez", 
        title: "Governor",
        description: "State Governor",
        imageUrl: "https://randomuser.me/api/portraits/women/63.jpg"
      },
      { 
        name: "Sen. James Wilson", 
        title: "Senator",
        description: "Senate Judiciary Committee",
        imageUrl: "https://randomuser.me/api/portraits/men/39.jpg"
      },
      { 
        name: "Pres. Alexander Hamilton", 
        title: "President",
        description: "President, Former Treasury Secretary",
        imageUrl: "https://randomuser.me/api/portraits/men/23.jpg"
      }
    ];
    
    politicians.forEach(p => {
      const politician = this.createPolitician(p);
      // Add some random ratings to have data for display
      for (let i = 0; i < 5; i++) {
        this.createPoliticianRating({
          politicianId: politician.id,
          userId: null,
          rating: Math.floor(Math.random() * 5) + 1,
          comment: null,
        });
      }
    });
  }
}

export const storage = new MemStorage();

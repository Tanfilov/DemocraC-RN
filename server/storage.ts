import { 
  articles, type Article, type InsertArticle,
  politicians, type Politician, type InsertPolitician,
  articlePoliticians, type ArticlePolitician, type InsertArticlePolitician,
  ratings, type Rating, type InsertRating,
  newsletterSubscribers, type NewsletterSubscriber, type InsertNewsletterSubscriber,
  users, type User, type InsertUser
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Article methods
  getArticles(topicFilter?: string, searchTerm?: string): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  getFeaturedArticle(): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  
  // Politician methods
  getPoliticians(): Promise<Politician[]>;
  getPolitician(id: number): Promise<Politician | undefined>;
  getPoliticianByName(name: string): Promise<Politician | undefined>;
  getPoliticiansForArticle(articleId: number): Promise<Politician[]>;
  createPolitician(politician: InsertPolitician): Promise<Politician>;
  incrementMentionCount(id: number): Promise<Politician>;
  ratePolitician(rating: InsertRating): Promise<Politician>;
  
  // Article-Politician relationship methods
  linkArticleToPolitician(articleId: number, politicianId: number): Promise<ArticlePolitician>;
  
  // Newsletter methods
  subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, Article>;
  private politicians: Map<number, Politician>;
  private articlePoliticians: Map<number, ArticlePolitician>;
  private ratings: Map<number, Rating>;
  private subscribers: Map<number, NewsletterSubscriber>;
  
  private userIdCounter: number;
  private articleIdCounter: number;
  private politicianIdCounter: number;
  private articlePoliticianIdCounter: number;
  private ratingIdCounter: number;
  private subscriberIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.politicians = new Map();
    this.articlePoliticians = new Map();
    this.ratings = new Map();
    this.subscribers = new Map();
    
    this.userIdCounter = 1;
    this.articleIdCounter = 1;
    this.politicianIdCounter = 1;
    this.articlePoliticianIdCounter = 1;
    this.ratingIdCounter = 1;
    this.subscriberIdCounter = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Sample politicians
    const samplePoliticians: InsertPolitician[] = [
      {
        name: "President Joe Biden",
        party: "Democrat",
        position: "President of the United States",
        imageUrl: "https://pixabay.com/get/g9079a1bc7cedd5de8828a2d4e1e6085f36c7c33b9e3fffc593500f03dcabc1f75c86be3a6b662200475d442d86abc472534c519f944fc59c4d4e822a0a0233af_1280.jpg"
      },
      {
        name: "Senator Bernie Sanders",
        party: "Independent",
        position: "U.S. Senator, Vermont",
        imageUrl: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"
      },
      {
        name: "Senator Mitch McConnell",
        party: "Republican",
        position: "Senate Minority Leader",
        imageUrl: "https://pixabay.com/get/g20f267eb3e6422a7f4c3a2be1d9f95ca8cec91d32168d43bd1017fea2a6b926364121bd5e14ae24a25ffcc816a439b23b75440c6fd82c7039e36b776fbf39f81_1280.jpg"
      },
      {
        name: "Speaker Nancy Pelosi",
        party: "Democrat",
        position: "Speaker of the House",
        imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"
      },
      {
        name: "Vice President Kamala Harris",
        party: "Democrat",
        position: "Vice President",
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"
      },
      {
        name: "Rep. Kevin McCarthy",
        party: "Republican",
        position: "House Minority Leader",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"
      },
      {
        name: "Sen. Elizabeth Warren",
        party: "Democrat",
        position: "U.S. Senator, Massachusetts",
        imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"
      },
      {
        name: "Sen. Ted Cruz",
        party: "Republican",
        position: "U.S. Senator, Texas",
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"
      }
    ];
    
    for (const politician of samplePoliticians) {
      this.createPolitician(politician);
    }
    
    // Set initial ratings
    this.ratePolitician({ politicianId: 1, rating: 3 });
    this.ratePolitician({ politicianId: 2, rating: 4 });
    this.ratePolitician({ politicianId: 3, rating: 2 });
    this.ratePolitician({ politicianId: 4, rating: 3 });
    this.ratePolitician({ politicianId: 5, rating: 4 });
    this.ratePolitician({ politicianId: 6, rating: 2 });
    this.ratePolitician({ politicianId: 7, rating: 3 });
    this.ratePolitician({ politicianId: 8, rating: 1 });
    
    // Sample articles
    const sampleArticles: InsertArticle[] = [
      {
        title: "Senate Passes Bipartisan Infrastructure Bill After Months of Negotiations",
        content: "After months of intense negotiations, the Senate has passed a $1 trillion bipartisan infrastructure bill, marking a significant victory for President Biden's economic agenda. The legislation includes funding for roads, bridges, broadband internet, and other traditional infrastructure projects.",
        summary: "After months of intense negotiations, the Senate has passed a $1 trillion bipartisan infrastructure bill, marking a significant victory for President Biden's economic agenda. The legislation includes funding for roads, bridges, broadband internet, and other traditional infrastructure projects.",
        category: "Politics",
        imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
        publishedAt: new Date().toISOString(),
        sources: ["CNN", "Washington Post", "New York Times", "Politico", "NBC News", "Fox News"],
        url: "https://example.com/infrastructure-bill"
      },
      {
        title: "Tech Giants Announce New AI Standards Coalition at Annual Conference",
        content: "Leading technology companies have formed a new coalition to establish ethical standards for artificial intelligence development and implementation across industries.",
        summary: "Leading technology companies have formed a new coalition to establish ethical standards for artificial intelligence development and implementation across industries.",
        category: "Technology",
        imageUrl: "https://images.unsplash.com/photo-1618477460930-d8bffff64172?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        sources: ["TechCrunch", "Wired", "The Verge", "MIT Technology Review", "CNET", "Ars Technica", "Engadget", "Gizmodo", "ZDNet", "TechRadar", "Digital Trends", "VentureBeat"],
        url: "https://example.com/ai-standards"
      },
      {
        title: "New Climate Bill Faces Uphill Battle in Congress Despite Public Support",
        content: "Despite polls showing broad public support for climate action, the latest environmental legislation is meeting resistance from lawmakers representing fossil fuel-producing states.",
        summary: "Despite polls showing broad public support for climate action, the latest environmental legislation is meeting resistance from lawmakers representing fossil fuel-producing states.",
        category: "Politics",
        imageUrl: "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        sources: ["Washington Post", "NPR", "Reuters", "Bloomberg", "The Hill", "CNBC", "The Guardian", "BBC"],
        url: "https://example.com/climate-bill"
      },
      {
        title: "Markets React Positively to Federal Reserve's Latest Interest Rate Decision",
        content: "Global markets showed positive gains after the Federal Reserve announced it would maintain current interest rates while signaling optimism about economic recovery trends.",
        summary: "Global markets showed positive gains after the Federal Reserve announced it would maintain current interest rates while signaling optimism about economic recovery trends.",
        category: "Business",
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        sources: ["Bloomberg", "CNBC", "Wall Street Journal", "Financial Times", "Reuters", "Business Insider", "Forbes", "MarketWatch", "Yahoo Finance", "Investor's Business Daily", "Barron's", "The Economist", "Morningstar", "Seeking Alpha", "TheStreet"],
        url: "https://example.com/fed-rates"
      },
      {
        title: "CDC Updates Guidelines for Upcoming Flu Season Amid Ongoing Pandemic",
        content: "The Centers for Disease Control and Prevention has released new recommendations for the upcoming flu season, including guidance on co-administration with COVID-19 vaccines.",
        summary: "The Centers for Disease Control and Prevention has released new recommendations for the upcoming flu season, including guidance on co-administration with COVID-19 vaccines.",
        category: "Health",
        imageUrl: "https://pixabay.com/get/g66a029f1f9acc14810bba8fe85efc1d8b7ed42951615b2d54f01db786debd22e5766774258d4bc9ae449327ab98cade05ba0d7a5df00459e25de6cc947ca6936_1280.jpg",
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        sources: ["CNN Health", "NBC News", "WebMD", "CDC", "Mayo Clinic", "Johns Hopkins Medicine", "Medical News Today", "Health.com", "Healthline"],
        url: "https://example.com/cdc-flu"
      },
      {
        title: "International Olympic Committee Announces Host City for 2032 Summer Games",
        content: "After a competitive bidding process, the International Olympic Committee has selected Brisbane, Australia as the host city for the 2032 Summer Olympic Games.",
        summary: "After a competitive bidding process, the International Olympic Committee has selected Brisbane, Australia as the host city for the 2032 Summer Olympic Games.",
        category: "Sports",
        imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        sources: ["ESPN", "BBC Sport", "Sports Illustrated", "NBC Olympics", "Olympic Channel", "Sky Sports", "The Athletic"],
        url: "https://example.com/olympics-2032"
      },
      {
        title: "Streaming Services Dominate Emmy Nominations as Traditional Networks Struggle",
        content: "For the third consecutive year, streaming platforms like Netflix, HBO Max, and Disney+ have received the majority of Emmy nominations, highlighting the ongoing shift in television consumption.",
        summary: "For the third consecutive year, streaming platforms like Netflix, HBO Max, and Disney+ have received the majority of Emmy nominations, highlighting the ongoing shift in television consumption.",
        category: "Entertainment",
        imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        sources: ["Variety", "Hollywood Reporter", "Deadline", "Entertainment Weekly", "TV Line", "Vulture"],
        url: "https://example.com/emmy-nominations"
      }
    ];
    
    for (const article of sampleArticles) {
      this.createArticle(article);
    }
    
    // Link politicians to articles
    this.linkArticleToPolitician(1, 1); // Biden to infrastructure
    this.linkArticleToPolitician(1, 2); // Sanders to infrastructure
    this.linkArticleToPolitician(1, 3); // McConnell to infrastructure
    this.linkArticleToPolitician(1, 4); // Pelosi to infrastructure
    
    this.linkArticleToPolitician(3, 1); // Biden to climate bill
    this.linkArticleToPolitician(3, 7); // Warren to climate bill
    this.linkArticleToPolitician(3, 8); // Cruz to climate bill
    
    this.linkArticleToPolitician(4, 1); // Biden to Fed rates
    
    // Increment mention counts
    this.incrementMentionCount(1); // Biden +2
    this.incrementMentionCount(1);
    this.incrementMentionCount(2); // Sanders +1
    this.incrementMentionCount(3); // McConnell +1
    this.incrementMentionCount(4); // Pelosi +1
    this.incrementMentionCount(7); // Warren +1
    this.incrementMentionCount(8); // Cruz +1
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Article methods
  async getArticles(topicFilter?: string, searchTerm?: string): Promise<Article[]> {
    let articles = Array.from(this.articles.values());
    
    // Apply topic filter if provided
    if (topicFilter && topicFilter.toLowerCase() !== "all") {
      articles = articles.filter(article => 
        article.category.toLowerCase() === topicFilter.toLowerCase()
      );
    }
    
    // Apply search if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      articles = articles.filter(article => 
        article.title.toLowerCase().includes(term) || 
        article.summary.toLowerCase().includes(term) ||
        article.content.toLowerCase().includes(term)
      );
    }
    
    // Sort by publish date (newest first)
    return articles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }
  
  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }
  
  async getFeaturedArticle(): Promise<Article | undefined> {
    // Return the newest article as featured
    const articles = Array.from(this.articles.values());
    return articles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )[0];
  }
  
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.articleIdCounter++;
    const article: Article = { ...insertArticle, id };
    this.articles.set(id, article);
    return article;
  }
  
  // Politician methods
  async getPoliticians(): Promise<Politician[]> {
    return Array.from(this.politicians.values())
      .sort((a, b) => b.mentionCount - a.mentionCount);
  }
  
  async getPolitician(id: number): Promise<Politician | undefined> {
    return this.politicians.get(id);
  }
  
  async getPoliticianByName(name: string): Promise<Politician | undefined> {
    return Array.from(this.politicians.values()).find(
      politician => politician.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  async getPoliticiansForArticle(articleId: number): Promise<Politician[]> {
    const articlePoliticianLinks = Array.from(this.articlePoliticians.values())
      .filter(link => link.articleId === articleId);
    
    const politicianIds = articlePoliticianLinks.map(link => link.politicianId);
    
    const politicians = politicianIds
      .map(id => this.politicians.get(id))
      .filter((politician): politician is Politician => !!politician);
    
    return politicians;
  }
  
  async createPolitician(insertPolitician: InsertPolitician): Promise<Politician> {
    const id = this.politicianIdCounter++;
    const politician: Politician = {
      ...insertPolitician,
      id,
      averageRating: 0,
      totalRatings: 0,
      mentionCount: 0
    };
    this.politicians.set(id, politician);
    return politician;
  }
  
  async incrementMentionCount(id: number): Promise<Politician> {
    const politician = this.politicians.get(id);
    if (!politician) {
      throw new Error(`Politician with ID ${id} not found`);
    }
    
    const updatedPolitician = {
      ...politician,
      mentionCount: politician.mentionCount + 1
    };
    
    this.politicians.set(id, updatedPolitician);
    return updatedPolitician;
  }
  
  async ratePolitician(rating: InsertRating): Promise<Politician> {
    const { politicianId, rating: ratingValue } = rating;
    
    const politician = this.politicians.get(politicianId);
    if (!politician) {
      throw new Error(`Politician with ID ${politicianId} not found`);
    }
    
    // Validate rating value
    if (ratingValue < 1 || ratingValue > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    
    // Add the rating
    const ratingId = this.ratingIdCounter++;
    const newRating: Rating = {
      id: ratingId,
      politicianId,
      userId: rating.userId,
      rating: ratingValue,
      createdAt: new Date().toISOString()
    };
    
    this.ratings.set(ratingId, newRating);
    
    // Update the politician's average rating
    const politicianRatings = Array.from(this.ratings.values())
      .filter(r => r.politicianId === politicianId);
    
    const totalRatings = politicianRatings.length;
    const averageRating = totalRatings > 0
      ? politicianRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;
    
    const updatedPolitician = {
      ...politician,
      averageRating,
      totalRatings,
      rating: ratingValue // For simplicity, showing last rating in UI
    };
    
    this.politicians.set(politicianId, updatedPolitician);
    return updatedPolitician;
  }
  
  // Article-Politician relationship methods
  async linkArticleToPolitician(articleId: number, politicianId: number): Promise<ArticlePolitician> {
    // Check if article exists
    const article = this.articles.get(articleId);
    if (!article) {
      throw new Error(`Article with ID ${articleId} not found`);
    }
    
    // Check if politician exists
    const politician = this.politicians.get(politicianId);
    if (!politician) {
      throw new Error(`Politician with ID ${politicianId} not found`);
    }
    
    // Check if link already exists
    const existingLink = Array.from(this.articlePoliticians.values()).find(
      link => link.articleId === articleId && link.politicianId === politicianId
    );
    
    if (existingLink) {
      return existingLink;
    }
    
    // Create new link
    const id = this.articlePoliticianIdCounter++;
    const link: ArticlePolitician = {
      id,
      articleId,
      politicianId
    };
    
    this.articlePoliticians.set(id, link);
    return link;
  }
  
  // Newsletter methods
  async subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    // Check if email already exists
    const existingSubscriber = Array.from(this.subscribers.values()).find(
      sub => sub.email.toLowerCase() === subscriber.email.toLowerCase()
    );
    
    if (existingSubscriber) {
      return existingSubscriber;
    }
    
    const id = this.subscriberIdCounter++;
    const newSubscriber: NewsletterSubscriber = {
      id,
      email: subscriber.email,
      createdAt: new Date().toISOString()
    };
    
    this.subscribers.set(id, newSubscriber);
    return newSubscriber;
  }
}

export const storage = new MemStorage();

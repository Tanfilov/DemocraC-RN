import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import { 
  InsertNewsArticle, InsertNewsTopic, InsertPolitician, 
  InsertPoliticianMention, InsertPoliticianRating, InsertUser,
  NewsArticle, NewsTopic, Politician, PoliticianMention, 
  PoliticianRating, PoliticianWithRating, TopicWithArticles, User,
  newsArticles, newsTopics, politicians, politicianMentions, politicianRatings, users
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // News Articles
  async getArticle(id: number): Promise<NewsArticle | undefined> {
    const [article] = await db.select().from(newsArticles).where(eq(newsArticles.id, id));
    return article;
  }

  async getArticlesByTopic(topicId: number): Promise<NewsArticle[]> {
    return db.select().from(newsArticles).where(eq(newsArticles.topicId, topicId));
  }

  async createArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const [newArticle] = await db.insert(newsArticles).values(article).returning();
    return newArticle;
  }

  async upsertArticle(article: InsertNewsArticle & { id?: number }): Promise<NewsArticle> {
    if (article.id) {
      // Try to update existing article
      const [existing] = await db.select().from(newsArticles).where(eq(newsArticles.id, article.id));
      if (existing) {
        const [updated] = await db
          .update(newsArticles)
          .set(article)
          .where(eq(newsArticles.id, article.id))
          .returning();
        return updated;
      }
    }
    
    // Check if article with same URL exists
    if (article.url) {
      const [existing] = await db.select().from(newsArticles).where(eq(newsArticles.url, article.url));
      if (existing) {
        const [updated] = await db
          .update(newsArticles)
          .set(article)
          .where(eq(newsArticles.id, existing.id))
          .returning();
        return updated;
      }
    }
    
    // Create new article
    const [newArticle] = await db.insert(newsArticles).values(article).returning();
    return newArticle;
  }

  // News Topics
  async getTopic(id: number): Promise<NewsTopic | undefined> {
    const [topic] = await db.select().from(newsTopics).where(eq(newsTopics.id, id));
    return topic;
  }

  async getTopics(category?: string, limit?: number, offset = 0): Promise<NewsTopic[]> {
    let query = db.select().from(newsTopics).orderBy(desc(newsTopics.updatedAt));
    
    if (category) {
      query = query.where(eq(newsTopics.category, category));
    }
    
    return query.offset(offset).limit(limit || 100);
  }

  async createTopic(topic: InsertNewsTopic): Promise<NewsTopic> {
    const [newTopic] = await db.insert(newsTopics).values(topic).returning();
    return newTopic;
  }

  async upsertTopic(topic: InsertNewsTopic & { id?: number }): Promise<NewsTopic> {
    if (topic.id) {
      // Try to update existing topic
      const [existing] = await db.select().from(newsTopics).where(eq(newsTopics.id, topic.id));
      if (existing) {
        const [updated] = await db
          .update(newsTopics)
          .set(topic)
          .where(eq(newsTopics.id, topic.id))
          .returning();
        return updated;
      }
    }
    
    // Try to find topic with similar title and category
    const [existing] = await db
      .select()
      .from(newsTopics)
      .where(and(
        eq(newsTopics.category, topic.category),
        sql`${newsTopics.title} LIKE ${`%${topic.title.substring(0, 20)}%`}`
      ));
    
    if (existing) {
      const [updated] = await db
        .update(newsTopics)
        .set(topic)
        .where(eq(newsTopics.id, existing.id))
        .returning();
      return updated;
    }
    
    // Create new topic
    const [newTopic] = await db.insert(newsTopics).values(topic).returning();
    return newTopic;
  }

  async getTopicsWithArticles(category?: string, limit?: number, offset = 0): Promise<TopicWithArticles[]> {
    const topics = await this.getTopics(category, limit, offset);
    
    return Promise.all(topics.map(async (topic) => {
      const articles = await this.getArticlesByTopic(topic.id);
      const topicPoliticians = await this.getPoliticiansInTopicArticles(topic.id);
      
      const politicianPromises = topicPoliticians.map(async (politician) => {
        const rating = await this.getPoliticianAverageRating(politician.id);
        return {
          ...politician,
          rating,
        };
      });
      
      const politicians = await Promise.all(politicianPromises);
      
      return {
        ...topic,
        updatedAt: topic.updatedAt.toISOString(),
        articles,
        politicians,
        summary: topic.summary || '',
      };
    }));
  }

  async getTopicWithArticles(id: number): Promise<TopicWithArticles | undefined> {
    const topic = await this.getTopic(id);
    if (!topic) return undefined;
    
    const articles = await this.getArticlesByTopic(topic.id);
    const topicPoliticians = await this.getPoliticiansInTopicArticles(topic.id);
    
    const politicianPromises = topicPoliticians.map(async (politician) => {
      const rating = await this.getPoliticianAverageRating(politician.id);
      return {
        ...politician,
        rating,
      };
    });
    
    const politicians = await Promise.all(politicianPromises);
    
    return {
      ...topic,
      updatedAt: topic.updatedAt.toISOString(),
      articles,
      politicians,
      summary: topic.summary || '',
    };
  }

  // Politicians
  async getPolitician(id: number): Promise<Politician | undefined> {
    const [politician] = await db.select().from(politicians).where(eq(politicians.id, id));
    return politician;
  }

  async getPoliticianByName(name: string): Promise<Politician | undefined> {
    const [politician] = await db.select().from(politicians).where(eq(politicians.name, name));
    return politician;
  }

  async getPoliticians(limit?: number, offset = 0): Promise<Politician[]> {
    return db.select().from(politicians).offset(offset).limit(limit || 100);
  }

  async createPolitician(politician: InsertPolitician): Promise<Politician> {
    const [newPolitician] = await db.insert(politicians).values(politician).returning();
    return newPolitician;
  }

  async upsertPolitician(politician: InsertPolitician & { id?: number }): Promise<Politician> {
    if (politician.id) {
      // Try to update existing politician
      const [existing] = await db.select().from(politicians).where(eq(politicians.id, politician.id));
      if (existing) {
        const [updated] = await db
          .update(politicians)
          .set(politician)
          .where(eq(politicians.id, politician.id))
          .returning();
        return updated;
      }
    }
    
    // Try to find by name
    const [existing] = await db.select().from(politicians).where(eq(politicians.name, politician.name));
    if (existing) {
      const [updated] = await db
        .update(politicians)
        .set(politician)
        .where(eq(politicians.id, existing.id))
        .returning();
      return updated;
    }
    
    // Create new politician
    const [newPolitician] = await db.insert(politicians).values(politician).returning();
    return newPolitician;
  }

  async getTopRatedPoliticians(limit = 10): Promise<PoliticianWithRating[]> {
    // This query gets politicians with their average rating and total rating count
    const ratingsSubquery = db
      .select({
        politicianId: politicianRatings.politicianId,
        averageRating: sql<number>`AVG(${politicianRatings.rating})`.as('average_rating'),
        totalRatings: sql<number>`COUNT(${politicianRatings.id})`.as('total_ratings')
      })
      .from(politicianRatings)
      .groupBy(politicianRatings.politicianId)
      .as('ratings');
    
    const results = await db
      .select({
        id: politicians.id,
        name: politicians.name,
        title: politicians.title,
        description: politicians.description,
        imageUrl: politicians.imageUrl,
        averageRating: ratingsSubquery.averageRating,
        totalRatings: ratingsSubquery.totalRatings
      })
      .from(politicians)
      .leftJoin(ratingsSubquery, eq(politicians.id, ratingsSubquery.politicianId))
      .orderBy(desc(ratingsSubquery.averageRating))
      .limit(limit);
    
    return results.map(row => ({
      id: row.id,
      name: row.name,
      title: row.title,
      description: row.description,
      imageUrl: row.imageUrl,
      averageRating: row.averageRating || 0,
      totalRatings: row.totalRatings ||
      0
    }));
  }

  // Politician Mentions
  async addPoliticianMention(mention: InsertPoliticianMention): Promise<PoliticianMention> {
    // Check if this mention already exists
    const [existing] = await db
      .select()
      .from(politicianMentions)
      .where(and(
        eq(politicianMentions.politicianId, mention.politicianId),
        eq(politicianMentions.articleId, mention.articleId)
      ));
    
    if (existing) {
      return existing;
    }
    
    const [newMention] = await db.insert(politicianMentions).values(mention).returning();
    return newMention;
  }

  async getPoliticianMentions(articleId: number): Promise<PoliticianMention[]> {
    return db.select().from(politicianMentions).where(eq(politicianMentions.articleId, articleId));
  }

  async getPoliticiansInArticle(articleId: number): Promise<Politician[]> {
    const mentions = await this.getPoliticianMentions(articleId);
    const politicianIds = mentions.map(mention => mention.politicianId);
    
    if (politicianIds.length === 0) {
      return [];
    }
    
    const politiciansList = await Promise.all(
      politicianIds.map(id => this.getPolitician(id))
    );
    
    return politiciansList.filter(p => p !== undefined) as Politician[];
  }

  async getPoliticiansInTopicArticles(topicId: number): Promise<Politician[]> {
    const articles = await this.getArticlesByTopic(topicId);
    const articleIds = articles.map(article => article.id);
    
    if (articleIds.length === 0) {
      return [];
    }
    
    // Get unique politicians from all articles
    const mentionsQuery = db
      .select({ politicianId: politicianMentions.politicianId })
      .from(politicianMentions)
      .where(sql`${politicianMentions.articleId} IN (${articleIds.join(',')})`)
      .groupBy(politicianMentions.politicianId);
    
    const mentions = await mentionsQuery;
    const politicianIds = mentions.map(m => m.politicianId);
    
    if (politicianIds.length === 0) {
      return [];
    }
    
    return db
      .select()
      .from(politicians)
      .where(sql`${politicians.id} IN (${politicianIds.join(',')})`);
  }

  async getArticlesWithPolitician(politicianId: number): Promise<NewsArticle[]> {
    const mentions = await db
      .select()
      .from(politicianMentions)
      .where(eq(politicianMentions.politicianId, politicianId));
    
    const articleIds = mentions.map(mention => mention.articleId);
    
    if (articleIds.length === 0) {
      return [];
    }
    
    return db
      .select()
      .from(newsArticles)
      .where(sql`${newsArticles.id} IN (${articleIds.join(',')})`);
  }

  // Politician Ratings
  async getPoliticianRating(politicianId: number, userId?: number): Promise<PoliticianRating | undefined> {
    let query = db
      .select()
      .from(politicianRatings)
      .where(eq(politicianRatings.politicianId, politicianId));
    
    if (userId) {
      // Create a new query with combined conditions
      const results = await db
        .select()
        .from(politicianRatings)
        .where(and(
          eq(politicianRatings.politicianId, politicianId),
          eq(politicianRatings.userId, userId)
        ))
        .orderBy(desc(politicianRatings.createdAt))
        .limit(1);
      
      return results[0];
    }
    
    const [rating] = await query.orderBy(desc(politicianRatings.createdAt)).limit(1);
    return rating;
  }

  async getPoliticianRatings(politicianId: number): Promise<PoliticianRating[]> {
    return db
      .select()
      .from(politicianRatings)
      .where(eq(politicianRatings.politicianId, politicianId))
      .orderBy(desc(politicianRatings.createdAt));
  }

  async createPoliticianRating(rating: InsertPoliticianRating): Promise<PoliticianRating> {
    const [newRating] = await db
      .insert(politicianRatings)
      .values({
        ...rating,
        createdAt: new Date(),
      })
      .returning();
    
    return newRating;
  }

  async updatePoliticianRating(id: number, rating: Partial<InsertPoliticianRating>): Promise<PoliticianRating> {
    const [updatedRating] = await db
      .update(politicianRatings)
      .set(rating)
      .where(eq(politicianRatings.id, id))
      .returning();
    
    return updatedRating;
  }

  async getPoliticianAverageRating(politicianId: number): Promise<number> {
    const result = await db
      .select({
        averageRating: sql<number>`AVG(${politicianRatings.rating})`.as('average_rating')
      })
      .from(politicianRatings)
      .where(eq(politicianRatings.politicianId, politicianId));
    
    return result[0]?.averageRating || 0;
  }

  // Other
  async getNewsSources(): Promise<{ id: string; name: string; }[]> {
    return [
      { id: "ynet", name: "Ynet" },
      { id: "n12", name: "N12" },
      { id: "walla", name: "Walla News" }
    ];
  }

  async getNewsCategories(): Promise<{ id: string; name: string; icon: string; color: string; }[]> {
    return [
      { id: "politics", name: "פוליטיקה", icon: "vote", color: "#3b82f6" },
      { id: "business", name: "כלכלה", icon: "trending-up", color: "#10b981" },
      { id: "technology", name: "טכנולוגיה", icon: "cpu", color: "#6366f1" },
      { id: "entertainment", name: "בידור", icon: "tv", color: "#ec4899" },
      { id: "sports", name: "ספורט", icon: "dumbbell", color: "#f59e0b" },
      { id: "health", name: "בריאות", icon: "heart-pulse", color: "#ef4444" },
      { id: "security", name: "ביטחון", icon: "shield", color: "#64748b" }
    ];
  }
}
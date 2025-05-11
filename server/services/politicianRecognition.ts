import { db } from '../db';
import { politicians } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Hard-coded data for politicians and their aliases since our schema doesn't store aliases
const politicianAliases: Record<string, string[]> = {
  "בנימין נתניהו": ["ביבי", "נתניהו", "בנימין ביבי נתניהו"],
  "יריב לוין": ["לוין"],
  "אמיר אוחנה": ["אוחנה"],
  "ניר ברקת": ["ברקת"],
  "אבי דיכטר": ["דיכטר"],
  "ישראל כץ": ["כץ", "ישראל כץ"],
  "יואב גלנט": ["גלנט"],
  "אביגדור ליברמן": ["ליברמן", "איווט"],
  "יאיר לפיד": ["לפיד"],
  "בני גנץ": ["גנץ"],
};

interface PoliticianWithAliases {
  id: number;
  name: string;
  party: string;
  position: string;
  imageUrl: string;
  mentionCount: number;
  aliases: string[];
}

interface PoliticianMention {
  politicianId: number;
  name: string;
  party: string;
  position: string;
  imageUrl: string;
  rating?: number;
}

class PoliticianRecognitionService {
  private cachedPoliticians: PoliticianWithAliases[] = [];
  private lastFetchTime: number = 0;
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Initialize with empty array, will be populated on first call
    this.cachedPoliticians = [];
  }

  private async ensurePoliticiansLoaded(): Promise<PoliticianWithAliases[]> {
    const now = Date.now();
    
    // If cache is valid, use it
    if (
      this.cachedPoliticians.length > 0 && 
      now - this.lastFetchTime < this.cacheDuration
    ) {
      return this.cachedPoliticians;
    }
    
    try {
      // Fetch politicians from database
      const dbPoliticians = await db.select().from(politicians);
      
      // Convert to our format with aliases
      this.cachedPoliticians = dbPoliticians.map(politician => {
        return {
          id: politician.id,
          name: politician.name,
          party: politician.party || '',
          position: politician.position || '',
          imageUrl: politician.image_url || '',
          mentionCount: politician.mention_count || 0,
          aliases: politicianAliases[politician.name] || []
        };
      });
      
      this.lastFetchTime = now;
      return this.cachedPoliticians;
    } catch (error) {
      console.error("Error loading politicians:", error);
      
      // Return cached data if available, even if stale
      if (this.cachedPoliticians.length > 0) {
        return this.cachedPoliticians;
      }
      
      // If no cached data, return empty array
      return [];
    }
  }

  /**
   * Detects mentions of politicians in the given text
   */
  public async detectPoliticians(text: string): Promise<PoliticianMention[]> {
    if (!text) return [];
    
    // Make sure we have politicians loaded
    const politicians = await this.ensurePoliticiansLoaded();
    if (politicians.length === 0) return [];
    
    const mentions: PoliticianMention[] = [];
    const lowerText = text.toLowerCase();
    
    // Search for each politician and their aliases in the text
    for (const politician of politicians) {
      // Check if the politician's name is in the text
      if (lowerText.includes(politician.name.toLowerCase())) {
        mentions.push({
          politicianId: politician.id,
          name: politician.name,
          party: politician.party || '',
          position: politician.position || '',
          imageUrl: politician.imageUrl || '',
          rating: politician.mentionCount ? politician.mentionCount / 20 : 0 // Use mentionCount to calculate an initial rating
        });
        continue; // Skip checking aliases if the full name is found
      }
      
      // Check aliases
      for (const alias of politician.aliases) {
        if (alias && lowerText.includes(alias.toLowerCase())) {
          mentions.push({
            politicianId: politician.id,
            name: politician.name,
            party: politician.party || '',
            position: politician.position || '',
            imageUrl: politician.imageUrl || '',
            rating: politician.mentionCount ? politician.mentionCount / 20 : 0
          });
          break; // Found a match in aliases, no need to check more
        }
      }
    }
    
    // Remove duplicates
    const uniqueMentions = Array.from(new Map(mentions.map(m => [m.politicianId, m])).values());
    
    return uniqueMentions;
  }
}

export const politicianRecognitionService = new PoliticianRecognitionService();
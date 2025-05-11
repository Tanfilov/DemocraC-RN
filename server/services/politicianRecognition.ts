import { knessetMembers } from '../data/politicians';

interface Politician {
  id: number;
  name: string;
  party: string;
  position: string;
  imageUrl: string;
  rating?: number;
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
  private politicians: Politician[];

  constructor() {
    this.politicians = knessetMembers;
  }

  /**
   * Detects mentions of politicians in the given text
   */
  public detectPoliticians(text: string): PoliticianMention[] {
    if (!text) return [];
    
    const mentions: PoliticianMention[] = [];
    const lowerText = text.toLowerCase();
    
    // Search for each politician and their aliases in the text
    for (const politician of this.politicians) {
      // Check if the politician's name is in the text
      if (lowerText.includes(politician.name.toLowerCase())) {
        mentions.push({
          politicianId: politician.id,
          name: politician.name,
          party: politician.party,
          position: politician.position,
          imageUrl: politician.imageUrl,
          rating: politician.rating
        });
        continue; // Skip checking aliases if the full name is found
      }
      
      // Check aliases
      for (const alias of politician.aliases) {
        if (alias && lowerText.includes(alias.toLowerCase())) {
          mentions.push({
            politicianId: politician.id,
            name: politician.name,
            party: politician.party,
            position: politician.position,
            imageUrl: politician.imageUrl,
            rating: politician.rating
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
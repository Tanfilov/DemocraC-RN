import { InsertPolitician } from "@shared/schema";
import { openaiService } from "./openai";

interface DetectedPolitician {
  name: string;
  party: string;
  position: string;
  imageUrl: string;
}

// Sample politician images for fallback
const politicianImages: Record<string, string> = {
  "democrat": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200",
  "republican": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200",
  "independent": "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200",
  "default": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"
};

class EntityRecognitionService {
  async detectPoliticians(text: string): Promise<DetectedPolitician[]> {
    try {
      // Use OpenAI to identify politicians in the text
      const identifiedPoliticians = await openaiService.identifyPoliticians(text);
      
      // Enrich with images based on party affiliation
      return identifiedPoliticians.map(politician => {
        const party = politician.party.toLowerCase();
        let imageUrl;
        
        if (party.includes("democrat")) {
          imageUrl = politicianImages.democrat;
        } else if (party.includes("republican")) {
          imageUrl = politicianImages.republican;
        } else if (party.includes("independent")) {
          imageUrl = politicianImages.independent;
        } else {
          imageUrl = politicianImages.default;
        }
        
        return {
          ...politician,
          imageUrl
        };
      });
    } catch (error) {
      console.error("Error detecting politicians:", error);
      return [];
    }
  }
  
  // Basic NLP-based detection without OpenAI fallback
  async detectPoliticiansBasic(text: string): Promise<DetectedPolitician[]> {
    // Common politician titles and positions
    const titles = [
      "President", "Vice President", "VP", "Senator", "Sen.",
      "Representative", "Rep.", "Governor", "Gov.", "Secretary",
      "Sec.", "Speaker", "Congressman", "Congresswoman", "Prime Minister",
      "Chancellor", "Minister", "Mayor"
    ];
    
    // Create a regex pattern for matching titles with names
    const titlePattern = titles.map(title => `${title}\\s+[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*`).join("|");
    const titleRegex = new RegExp(`(${titlePattern})`, "g");
    
    // Extract potential matches
    const matches = text.match(titleRegex) || [];
    
    // Process matches into politician objects
    const detectedPoliticians: DetectedPolitician[] = [];
    
    for (const match of matches) {
      const nameParts = match.split(/\s+/);
      const title = nameParts[0];
      const name = nameParts.slice(1).join(" ");
      
      if (name) {
        // Basic party detection (very simplistic)
        let party = "Unknown";
        if (text.toLowerCase().includes(`${name.toLowerCase()} democrat`)) {
          party = "Democrat";
        } else if (text.toLowerCase().includes(`${name.toLowerCase()} republican`)) {
          party = "Republican";
        }
        
        const position = title;
        
        // Determine image URL based on party
        let imageUrl = politicianImages.default;
        if (party === "Democrat") {
          imageUrl = politicianImages.democrat;
        } else if (party === "Republican") {
          imageUrl = politicianImages.republican;
        }
        
        detectedPoliticians.push({
          name: `${title} ${name}`,
          party,
          position,
          imageUrl
        });
      }
    }
    
    return detectedPoliticians;
  }
}

export const entityRecognitionService = new EntityRecognitionService();

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
import OpenAI from "openai";

class OpenAIService {
  private openai: OpenAI;
  
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || "";
    
    if (!apiKey) {
      console.warn("OPENAI_API_KEY not found in environment variables");
    }
    
    this.openai = new OpenAI({ 
      apiKey: apiKey
    });
  }
  
  async summarizeArticle(text: string): Promise<string> {
    if (!this.openai.apiKey) {
      throw new Error("OPENAI_API_KEY not set in environment variables");
    }
    
    try {
      // Truncate text if it's too long to avoid token limits
      const truncatedText = text.length > 4000 ? text.substring(0, 4000) + "..." : text;
      
      const prompt = `Please summarize the following news article concisely in 2-3 sentences while preserving the key information and main points:\n\n${truncatedText}`;
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.5,
      });
      
      const summary = response.choices[0].message.content?.trim() || "";
      
      // If no summary was generated, return a portion of the original text
      if (!summary) {
        return text.length > 200 ? text.substring(0, 200) + "..." : text;
      }
      
      return summary;
    } catch (error) {
      console.error("Error generating summary with OpenAI:", error);
      // Return truncated original content as fallback
      return text.length > 200 ? text.substring(0, 200) + "..." : text;
    }
  }
  
  async identifyPoliticians(text: string): Promise<{
    name: string;
    party: string;
    position: string;
  }[]> {
    if (!this.openai.apiKey) {
      throw new Error("OPENAI_API_KEY not set in environment variables");
    }
    
    try {
      const prompt = `
        Please identify all politicians mentioned in the following text. 
        For each politician, provide their full name, political party (Democrat, Republican, Independent, or Unknown), 
        and their current position or role. Return the information in JSON format like this:
        [
          {
            "name": "Full Name",
            "party": "Party Affiliation",
            "position": "Current Position"
          }
        ]
        
        If no politicians are mentioned, return an empty array.
        
        Text: ${text}
      `;
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });
      
      const content = response.choices[0].message.content;
      if (!content) {
        return [];
      }
      
      const jsonResponse = JSON.parse(content);
      
      // Handle both possible response formats: direct array or { politicians: [] }
      if (Array.isArray(jsonResponse)) {
        return jsonResponse;
      } else if (jsonResponse.politicians && Array.isArray(jsonResponse.politicians)) {
        return jsonResponse.politicians;
      }
      
      return [];
    } catch (error) {
      console.error("Error identifying politicians with OpenAI:", error);
      return [];
    }
  }
  
  async analyzeArticleSentiment(text: string): Promise<{
    sentiment: "positive" | "negative" | "neutral";
    score: number;
  }> {
    if (!this.openai.apiKey) {
      throw new Error("OPENAI_API_KEY not set in environment variables");
    }
    
    try {
      const prompt = `
        Analyze the sentiment of the following news article text. 
        Return a JSON object with:
        1. "sentiment": either "positive", "negative", or "neutral"
        2. "score": a number between 0 and 1 indicating confidence
        
        Text: ${text}
      `;
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });
      
      const content = response.choices[0].message.content;
      if (!content) {
        return { sentiment: "neutral", score: 0.5 };
      }
      
      return JSON.parse(content);
    } catch (error) {
      console.error("Error analyzing sentiment with OpenAI:", error);
      return { sentiment: "neutral", score: 0.5 };
    }
  }
}

export const openaiService = new OpenAIService();

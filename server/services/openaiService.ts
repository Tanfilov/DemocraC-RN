import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-your-key-here" 
});

// Summarize news articles
export async function summarizeText(text: string): Promise<string> {
  try {
    if (!text || text.length < 50) {
      return text;
    }
    
    // If OPENAI_API_KEY isn't set, return a truncated version of the text
    if (!process.env.OPENAI_API_KEY) {
      console.log("No OpenAI API key found, returning truncated text");
      return text.substring(0, 200) + "...";
    }
    
    const prompt = `Please summarize the following news in a concise paragraph, maintaining the key points and important details:\n\n${text}`;

    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    return response.choices[0].message.content || "Failed to generate summary.";
  } catch (error) {
    console.error("Error summarizing text:", error);
    // Fallback to returning a portion of the original text
    return text.substring(0, 200) + "...";
  }
}

// Identify politicians mentioned in an article (supports Hebrew text)
export async function identifyPoliticians(text: string): Promise<string[]> {
  try {
    if (!text || text.length < 50) {
      return [];
    }
    
    // If OPENAI_API_KEY isn't set, use simple heuristics
    if (!process.env.OPENAI_API_KEY) {
      console.log("No OpenAI API key found, using simple heuristics");
      return extractPoliticianNamesHeuristic(text);
    }
    
    const prompt = `
      Please identify all politicians (current or former government officials, elected representatives, etc.) mentioned in the following text.
      The text may be in Hebrew or English. 
      Return a JSON array containing only their names, with no additional information. For example: ["יצחק הרצוג", "בנימין נתניהו"] or ["John Smith", "Jane Doe"]
      
      Text:
      ${text}
    `;

    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    
    const content = response.choices[0].message.content;
    if (!content) return [];
    
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.politicians)) {
        return parsed.politicians;
      } else if (Array.isArray(parsed.names)) {
        return parsed.names;
      } else if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (parseError) {
      console.error("Error parsing politician names:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Error identifying politicians:", error);
    // Fallback to simple extraction
    return extractPoliticianNamesHeuristic(text);
  }
}

// Simple heuristic-based extraction for fallback (supports Hebrew)
function extractPoliticianNamesHeuristic(text: string): string[] {
  const politicians: string[] = [];
  
  // Check if text contains Hebrew characters
  const hasHebrew = /[\u0590-\u05FF]/.test(text);
  
  if (hasHebrew) {
    // Hebrew patterns - common titles in Hebrew followed by names
    const hebrewTitlePatterns = [
      /\b(ראש הממשלה|שר|שרת|ח\"כ|חבר כנסת|חברת כנסת|נשיא|נשיאת|סגן|סגנית)\s+([א-ת]+(?:\s+[א-ת]+){0,3})\b/g,
    ];
    
    for (const pattern of hebrewTitlePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[2]) {
          politicians.push(match[0]); // Include title + name
        }
      }
    }
  } else {
    // English patterns - common titles followed by names
    const englishTitlePatterns = [
      /\b(President|Pres\.|Senator|Sen\.|Representative|Rep\.|Governor|Gov\.|Minister|Min\.|Secretary|Sec\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g,
    ];
    
    for (const pattern of englishTitlePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[2]) {
          politicians.push(match[0]); // Include title + name
        }
      }
    }
  }
  
  return [...new Set(politicians)]; // Remove duplicates
}

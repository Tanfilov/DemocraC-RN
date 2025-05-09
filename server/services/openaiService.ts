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
export function extractPoliticianNamesHeuristic(text: string): string[] {
  const politicians: string[] = [];
  
  // Check if text contains Hebrew characters
  const hasHebrew = /[\u0590-\u05FF]/.test(text);
  
  if (hasHebrew) {
    // Comprehensive list of Israeli politicians 
    const commonIsraeliPoliticians = [
      "בנימין נתניהו", "ביבי", "יריב לוין", "אלי כהן", "יואב גלנט", "דודי אמסלם",
      "אמיר אוחנה", "יואב קיש", "ניר ברקת", "מירי רגב", "מיקי זוהר",
      "אבי דיכטר", "ישראל כ\"ץ", "שלמה קרעי", "עמיחי שיקלי", "דני דנון",
      "עידית סילמן", "דוד ביטן", "יולי אדלשטיין", "אליהו רביבו", "גלית דיסטל אטבריאן",
      "ניסים ואטורי", "שלום דנינו", "חיים כץ", "אופיר אקוניס", "טלי גוטליב",
      "חנוך מילביצקי", "בועז ביסמוט", "משה סעדה", "אליהו דלל", "גילה גמליאל",
      "אופיר כץ", "מאיה גולן", "יאיר לפיד", "אורנה ברביבאי", "מאיר כהן",
      "קרין אלהרר", "מירב כהן", "יואל רזבוזוב", "אלעזר שטרן", "מיקי לוי",
      "מרב בן-ארי", "רם בן-ברק", "יואב סגלוביץ'", "בועז טופורובסקי", "מיכל שיר סגמן",
      "עידן רול", "יוראי להב-הרצנו", "ולדימיר בליאק", "רון כץ", "מתי סרפתי הרכבי",
      "טטיאנה מזרסקי", "יסמין פרידמן", "דבורה ביטון", "משה טור-פז", "סימון דוידסון",
      "נאור שירי", "בצלאל סמוטריץ'", "איתמר בן גביר", "אופיר סופר", "אורית סטרוק",
      "יצחק וסרלאוף", "שמחה רוטמן", "אלמוג כהן", "מיכל וולדיגר", "עמיחי אליהו",
      "צביקה פוגל", "אבי מעוז", "אוהד טל", "לימור סון הר-מלך", "משה סולומון",
      "בני גנץ", "גדעון סער", "גדי איזנקוט", "פנינה תמנו-שטה", "יפעת שאשא-ביטון",
      "חילי טרופר", "זאב אלקין", "מיכאל ביטון", "מתן כהנא", "אורית פרקש-הכהן",
      "שרן השכל", "אלון שוסטר", "אריה דרעי", "יעקב מרגי", "יואב בן צור",
      "מיכאל מלכיאלי", "חיים ביטון", "משה ארבל", "ינון אזולאי", "משה אבוטבול",
      "אוריאל בוסו", "יוסף טייב", "אברהם בצלאל", "יצחק גולדקנופף", "משה גפני",
      "מאיר פרוש", "אורי מקלב", "יעקב טסלר", "יעקב אשר", "ישראל אייכלר",
      // Additional common politicians for backward compatibility
      "איילת שקד", "אביגדור ליברמן", "יצחק הרצוג", "בוז'י הרצוג",
      "משה כחלון", "נפתלי בנט", "ניצן הורוביץ", "אהוד ברק", "מנסור עבאס",
      "יאיר גולן", "אורלי לוי אבקסיס", "עמיר פרץ", "מרב מיכאלי", "יועז הנדל",
      "אלי אבידר", "יובל שטייניץ", "אביגדור קהלני", "יעקב ליצמן", "צביקה האוזר",
      "אורן חזן", "ציפי לבני", "בוגי יעלון", "שלי יחימוביץ", "עיסאווי פריג",
      "אבי גבאי", "רון חולדאי", "יוסי כהן", "אהוד אולמרט", "אריאל שרון", "שמעון פרס"
    ];
    
    // Political party names
    const israeliParties = [
      "ליכוד",
      "יש עתיד",
      "כחול לבן",
      "הציונות הדתית",
      "העבודה",
      "מרצ",
      "ימינה",
      "ישראל ביתנו",
      "רע\"מ",
      "ש\"ס",
      "יהדות התורה",
      "תקווה חדשה",
      "הרשימה המשותפת",
      "המחנה הממלכתי",
      "חד\"ש",
      "בל\"ד",
      "תע\"ל",
      "דגל התורה",
      "אגודת ישראל",
      "עוצמה יהודית",
      "נעם",
      "עתיד אחד",
      "צירוף",
      "זהות"
    ];
    
    // Hebrew patterns - common titles in Hebrew followed by names
    const hebrewTitlePatterns = [
      /\b(ראש הממשלה|שר|שרת|ח\"כ|חבר(?:ת)? (?:ה)?כנסת|נשיא(?:ת)?|סגן|סגנית)\s+([א-ת\s'"]{2,}(?:\s[א-ת\s'"]{2,})*)\b/g,
      /\b(יו"ר|ראש|מזכ"ל|מנהיג(?:ת)?)\s+([א-ת\s'"]{2,}(?:\s[א-ת\s'"]{2,})*)\b/g,
      /\b(השר(?:ה)?|הח"כ)\s+([א-ת\s'"]{2,}(?:\s[א-ת\s'"]{2,})*)\b/g,
    ];
    
    // Check if text contains any of the common politicians
    for (const politician of commonIsraeliPoliticians) {
      // Using a more flexible search to catch variations with or without quotes
      const escapedName = politician.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const pattern = new RegExp(`\\b${escapedName}\\b`, 'i');
      if (pattern.test(text)) {
        politicians.push(politician);
      }
    }
    
    // Check for party references that might indicate political context
    for (const party of israeliParties) {
      if (text.includes(party)) {
        // If a political party is mentioned, the text is more likely to be political
        // This doesn't add politicians directly but helps with filtering
        console.log(`Found political party mentioned: ${party}`);
      }
    }
    
    // Extract politicians with titles
    for (const pattern of hebrewTitlePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[2]) {
          // Extract name without the title
          const name = match[2].trim();
          if (name.length > 3 && 
              !name.includes(" את ") && 
              !name.includes(" של ") && 
              !name.includes(" עם ") && 
              !name.includes(" על ")) {
            politicians.push(name);
          }
        }
      }
    }
    
    // Look for patterns of first and last names (without titles)
    const hebrewNamePattern = /\b([א-ת]{2,})\s+([א-ת]{2,})\b/g;
    let nameMatch;
    while ((nameMatch = hebrewNamePattern.exec(text)) !== null) {
      const fullName = nameMatch[0].trim();
      // More strict filtering to avoid common false positives
      const commonWords = [
        "את", "של", "עם", "על", "אבל", "כמו", "אחרי", "לפני", 
        "בתוך", "מחוץ", "מעל", "מתחת", "בין", "כדי", "ואת", "אולי",
        "אפשר", "אסור", "מותר", "יכול", "צריך", "רוצה", "אומר", "אין"
      ];
      
      const isProbablyNotName = commonWords.some(word => 
        fullName.includes(` ${word} `) || 
        fullName.startsWith(`${word} `) || 
        fullName.endsWith(` ${word}`)
      );
      
      // Check if the name matches a pattern typical of Israeli names
      const looksLikeIsraeliName = /^[א-ת]{2,} [א-ת]{2,}(?: [א-ת]{2,})?$/.test(fullName);
      
      // Minimum length to avoid false positives, and check structure
      if (fullName.length > 6 && looksLikeIsraeliName && !isProbablyNotName) {
        politicians.push(fullName);
      }
    }
    
  } else {
    // English patterns - common titles followed by names
    const englishTitlePatterns = [
      /\b(President|Pres\.|Prime Minister|PM|Senator|Sen\.|Representative|Rep\.|Governor|Gov\.|Minister|Min\.|Secretary|Sec\.|Congressman|Congresswoman|Speaker)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b/g,
    ];
    
    for (const pattern of englishTitlePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[2]) {
          // Extract name without the title
          politicians.push(match[2].trim());
        }
      }
    }
  }
  
  // Remove duplicates
  const uniquePoliticians = Array.from(new Set(politicians));
  
  // Filter out very short names (likely false positives)
  return uniquePoliticians.filter(name => name.length > 5);
}

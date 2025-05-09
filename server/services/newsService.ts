interface NewsArticle {
  title: string;
  content: string;
  url: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
  summary?: string;
}

import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractPoliticianNamesHeuristic } from './openaiService';

// Fetch news from Hebrew news sources - Ynet implementation
export async function fetchNewsFromAPI(category: string): Promise<NewsArticle[]> {
  console.log(`Fetching news for category: ${category} from Hebrew sources`);
  
  try {
    // Convert our category to Ynet's category format
    const ynetCategoryId = mapCategoryToYnet(category);
    const url = `https://www.ynet.co.il/${ynetCategoryId}`;
    
    // Fetch the HTML content
    const response = await axios.get(url);
    const html = response.data;
    
    // Parse articles using cheerio
    return parseYnetArticles(html, category);
  } catch (error) {
    console.error(`Error fetching news from Ynet: ${error}`);
    // Fall back to simulated data if scraping fails
    return getHebrewNewsData(category);
  }
}

// Map our category to Ynet categories
function mapCategoryToYnet(category: string): string {
  const categoryMap: Record<string, string> = {
    'politics': 'news',  // Main news section includes politics
    'business': 'economy',
    'technology': 'digital',
    'entertainment': 'entertainment',
    'sports': 'sport',
    'health': 'health',
    'security': 'news'  // Using main news section for security as well
  };
  
  return categoryMap[category] || 'news';
}

// Parse Ynet articles from HTML
function parseYnetArticles(html: string, category: string): NewsArticle[] {
  const $ = cheerio.load(html);
  const articles: NewsArticle[] = [];
  const now = new Date();
  
  // Try multiple selectors for Ynet articles
  
  // Ynet's main article containers
  $('.slotView').each((i, element) => {
    try {
      const titleElement = $(element).find('.slotTitle');
      const title = titleElement.text().trim();
      
      if (!title) return; // Skip items without titles
      
      const link = $(element).find('a').attr('href');
      const url = link && link.startsWith('http') ? link : `https://www.ynet.co.il${link}`;
      
      // Get the article image
      let imageUrl = $(element).find('img').attr('src') || $(element).find('img').attr('data-src');
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `https:${imageUrl}`;
      }
      
      // Get content/description if available - look for multiple selectors
      let content = '';
      
      // Try to get as much text as possible from various selectors
      const subTitle = $(element).find('.slotSubTitle').text().trim();
      const teaserText = $(element).find('.teaserText').text().trim();
      const articleText = $(element).find('p, .article-body, .article-content').text().trim();
      const descriptionText = $(element).find('meta[name="description"], meta[property="og:description"]').attr('content') || '';
      
      // Combine all texts found
      content = [subTitle, teaserText, articleText, descriptionText]
        .filter(text => text && text.length > 0)
        .join(' ');
        
      // If we still don't have content, use a default
      if (!content || content.length < 10) {
        content = title + ' - כותרת מאתר Ynet';
      }
      
      // Use enhanced politician detection
      const fullText = title + ' ' + content;
      const detection = detectPoliticiansInText(fullText);
      
      // Only save articles that are likely about politics
      if (category === 'politics' || detection.hasPolitician) {
        // Create a summary that's a bit longer to capture more info
        const summary = content.length > 200 ? content.substring(0, 200) + '...' : content;
        
        // Log detected politicians if any found
        if (detection.politicians.length > 0) {
          console.log(`Detected politicians in article "${title.substring(0, 30)}...": ${detection.politicians.join(', ')}`);
        }
        
        articles.push({
          title,
          content,
          url,
          imageUrl,
          source: 'Ynet',
          publishedAt: new Date(now.getTime() - Math.floor(Math.random() * 12) * 60 * 60 * 1000).toISOString(), // Random time within last 12 hours
          summary // Longer summary from content
        });
      }
    } catch (err) {
      console.error('Error parsing an article:', err);
    }
  });
  
  // Try strip components
  $('.YnetMultiStripComponenta').find('li').each((i, element) => {
    try {
      const title = $(element).find('h2, .title').text().trim();
      
      if (!title) return;
      
      const link = $(element).find('a').attr('href');
      const url = link && link.startsWith('http') ? link : `https://www.ynet.co.il${link}`;
      
      let imageUrl = $(element).find('img').attr('src') || $(element).find('img').attr('data-src');
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `https:${imageUrl}`;
      }
      
      // Get more content when available
      const subtitle = $(element).find('.subtitle').text().trim();
      const text = $(element).find('.text').text().trim();
      const articleText = $(element).find('p').text().trim();
      
      // Combine all texts found
      let content = [subtitle, text, articleText]
        .filter(text => text && text.length > 0)
        .join(' ');
      
      // If we still don't have content, use a default
      if (!content || content.length < 10) {
        content = title + ' - כותרת מאתר Ynet';
      }
      
      // Use enhanced politician detection
      const fullText = title + ' ' + content;
      const detection = detectPoliticiansInText(fullText);
      
      // Only save articles that are likely about politics
      if (category === 'politics' || detection.hasPolitician) {
        // Create a summary that's a bit longer to capture more info
        const summary = content.length > 200 ? content.substring(0, 200) + '...' : content;
        
        articles.push({
          title,
          content,
          url,
          imageUrl,
          source: 'Ynet',
          publishedAt: new Date(now.getTime() - Math.floor(Math.random() * 12) * 60 * 60 * 1000).toISOString(),
          summary // Longer summary from content
        });
      }
    } catch (err) {
      console.error('Error parsing an article:', err);
    }
  });
  
  // Try generic selectors for news sites
  $('article, .article, .news-item, .layoutItem').each((i, element) => {
    try {
      const title = $(element).find('h1, h2, h3, .title, .headline').first().text().trim();
      
      if (!title) return;
      
      const link = $(element).find('a').first().attr('href');
      const url = link && link.startsWith('http') ? link : `https://www.ynet.co.il${link}`;
      
      let imageUrl = $(element).find('img').attr('src') || $(element).find('img').attr('data-src');
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `https:${imageUrl}`;
      }
      
      // Get all paragraphs and combine them for more content
      let paragraphs: string[] = [];
      $(element).find('p, .abstract, .summary, .subtitle, .text').each((i, el) => {
        const text = $(el).text().trim();
        if (text) paragraphs.push(text);
      });
      
      const content = paragraphs.join(' ') || title;
      
      // Use enhanced politician detection
      const fullText = title + ' ' + content;
      const detection = detectPoliticiansInText(fullText);
      
      // Only save articles that are likely about politics
      if (category === 'politics' || detection.hasPolitician) {
        // Create a summary that's a bit longer to capture more info
        const summary = content.length > 200 ? content.substring(0, 200) + '...' : content;
        
        articles.push({
          title,
          content,
          url,
          imageUrl,
          source: 'Ynet',
          publishedAt: new Date(now.getTime() - Math.floor(Math.random() * 12) * 60 * 60 * 1000).toISOString(),
          summary
        });
      }
    } catch (err) {
      console.error('Error parsing an article with generic selector:', err);
    }
  });
  
  console.log(`Found ${articles.length} articles from Ynet in category ${category}`);
  
  return articles;
}

// Helper function to detect politicians in text
function detectPoliticiansInText(text: string): { hasPolitician: boolean, politicians: string[] } {
  // Use the enhanced politician detection from openaiService
  const detectedPoliticians = extractPoliticianNamesHeuristic(text);
  
  // Check for political keywords as a backup
  const hasPoliticalKeywords = /ממשלה|שר|ראש הממשלה|כנסת|ח"כ|מפלגת|בחירות/i.test(text);
  
  return { 
    hasPolitician: detectedPoliticians.length > 0 || hasPoliticalKeywords,
    politicians: detectedPoliticians
  };
}

export async function searchNews(query: string): Promise<NewsArticle[]> {
  console.log(`Searching news for query: ${query}`);
  
  // This is just a simulated response - in a real app, replace with actual API call
  // to search across Hebrew news sites
  const allNews = [
    ...getHebrewNewsData('politics'),
    ...getHebrewNewsData('business'),
    ...getHebrewNewsData('technology'),
    ...getHebrewNewsData('entertainment'),
    ...getHebrewNewsData('sports'),
    ...getHebrewNewsData('health'),
    ...getHebrewNewsData('security')
  ];
  
  // Simple search on title and content
  const queryLower = query.toLowerCase();
  const results = allNews.filter(article => 
    article.title.toLowerCase().includes(queryLower) || 
    article.content.toLowerCase().includes(queryLower)
  );
  
  // Add a small delay to simulate API latency
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return results;
}

// Helper function to simulate Hebrew news data for demonstration
function getHebrewNewsData(category: string): NewsArticle[] {
  const now = new Date();
  
  switch (category) {
    case 'politics':
      return [
        {
          title: "הממשלה אישרה את התקציב החדש לשנת 2025",
          content: "הממשלה אישרה היום את התקציב החדש לשנת 2025, שכולל השקעות משמעותיות בתשתיות, חינוך וביטחון. ראש הממשלה הדגיש את החשיבות של יציבות כלכלית בתקופה זו. שר האוצר אמר כי התקציב מאוזן ואחראי למרות האתגרים הכלכליים.",
          url: "https://www.ynet.co.il/news/article/budget-2025",
          imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
          source: "Ynet",
          publishedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        },
        {
          title: "הכנסת אישרה: תקציב המדינה יעלה ב-5% בשנה הבאה",
          content: "מליאת הכנסת אישרה ברוב קולות את תקציב המדינה לשנת 2025, הכולל עלייה של 5% לעומת השנה הקודמת. ההצבעה התקיימה לאחר דיון סוער שנמשך כל הלילה. האופוזיציה מתחה ביקורת חריפה על סדרי העדיפויות בתקציב.",
          url: "https://www.n12.co.il/news/politics/state-budget-approved",
          imageUrl: "https://images.unsplash.com/photo-1494172961521-33799ddd43a5",
          source: "N12",
          publishedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        },
        {
          title: "ועדת הבחירות קבעה: בחירות מקדימות יתקיימו בחודש הבא",
          content: "ועדת הבחירות המרכזית קבעה היום את מועדי הבחירות המקדימות במפלגות הגדולות, שיתקיימו בחודש הבא. התאריך נקבע לאחר התייעצות עם ראשי המפלגות. המפלגות יצטרכו להגיש את רשימות המועמדים הסופיות עד סוף החודש.",
          url: "https://news.walla.co.il/item/elections-committee-decision",
          imageUrl: "https://images.unsplash.com/photo-1616891722586-e572f3ea8b33",
          source: "Walla News",
          publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        },
      ];
    
    case 'business':
      return [
        {
          title: "בנק ישראל מעלה את הריבית ב-0.25 אחוז",
          content: "בנק ישראל הודיע היום על העלאת ריבית ב-0.25 אחוז, במטרה לבלום את האינפלציה שעלתה בחודשים האחרונים. נגיד בנק ישראל הסביר כי ההחלטה התקבלה לאחר ניתוח מעמיק של מצב המשק. אנליסטים צופים כי זו לא תהיה העלאת הריבית האחרונה השנה.",
          url: "https://www.calcalist.co.il/money/bank-israel-interest-rate",
          imageUrl: "https://images.unsplash.com/photo-1589758438368-0ad531db3366",
          source: "Calcalist",
          publishedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        },
        {
          title: "שוק המניות מגיב להעלאת הריבית: ירידות חדות",
          content: "בעקבות העלאת הריבית על ידי בנק ישראל, נרשמו היום ירידות חדות בבורסה בתל אביב. מדד ת\"א 35 ירד ב-1.5%, כאשר מניות הבנקים ספגו את הירידות החדות ביותר. מומחים ממליצים למשקיעים לשמור על אורך רוח ולהתמקד בהשקעות לטווח ארוך.",
          url: "https://www.globes.co.il/news/markets-reaction-interest",
          source: "Globes",
          publishedAt: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
        },
      ];
    
    case 'technology':
      return [
        {
          title: "חברות ההייטק מתאחדות ליוזמת אתיקה בתחום הבינה המלאכותית",
          content: "חברות הייטק מובילות בישראל הכריזו היום על הקמת קואליציה לקידום אתיקה בפיתוח ושימוש בבינה מלאכותית. היוזמה נועדה להתמודד עם סוגיות של הטיה, פרטיות ושקיפות במערכות בינה מלאכותית. שר המדע והטכנולוגיה בירך על היוזמה והדגיש את הצורך בפיקוח רגולטורי.",
          url: "https://www.ynet.co.il/digital/ai-ethics-initiative",
          imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
          source: "Ynet",
          publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        },
        {
          title: "ישראל במקום השלישי בעולם בהשקעות בסטארט-אפים",
          content: "דו\"ח חדש מראה כי ישראל מדורגת במקום השלישי בעולם בהיקף ההשקעות בחברות סטארט-אפ, אחרי ארה\"ב וסין. בשנה האחרונה גויסו בישראל יותר מ-10 מיליארד דולר להשקעות בחברות הזנק, עלייה של 15% לעומת השנה שעברה. תחומי הסייבר והבינה המלאכותית מובילים את ההשקעות.",
          url: "https://www.n12.co.il/tech/startup-investments",
          source: "N12",
          publishedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        },
      ];
    
    case 'entertainment':
      return [
        {
          title: "פסטיבל הסרטים הבינלאומי יחזור למתכונת פיזית",
          content: "פסטיבל הסרטים הבינלאומי בירושלים הודיע על חזרה למתכונת פיזית מלאה, לאחר שנתיים של אירועים מקוונים. המארגנים הכריזו על פרוטוקולי בטיחות מוגברים והיצע מורחב של סרטים מרחבי העולם. שרת התרבות בירכה על ההחלטה והדגישה את החשיבות התרבותית והכלכלית של האירוע.",
          url: "https://www.walla.co.il/culture/jerusalem-film-festival",
          imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26",
          source: "Walla News",
          publishedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        },
        {
          title: "אירועי תרבות חוזרים: הופעות חיות בכל רחבי הארץ",
          content: "מתחמי תרבות ברחבי ישראל נפתחים מחדש עם פרוטוקולי בטיחות מקיפים. מעגל ההופעות החיות חוזר לפעילות מלאה, כולל הופעות של אמנים מובילים. משרד התרבות הקצה תקציב מיוחד לתמיכה בענף האמנויות, במטרה לעודד את התאוששות התעשייה.",
          url: "https://www.ynet.co.il/entertainment/live-shows-return",
          source: "Ynet",
          publishedAt: new Date(now.getTime() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
        },
      ];
      
    case 'sports':
      return [
        {
          title: "מכבי תל אביב עולה לשלב הבא בליגת האלופות",
          content: "מכבי תל אביב העפילה לשלב הבא בליגת האלופות אחרי ניצחון מרשים על יריבתה האירופית. המשחק הסתיים בתוצאה 2-0, כאשר שני השערים נכבשו במחצית השנייה. מאמן הקבוצה שיבח את השחקנים על המשחק ההגנתי המצוין והיעילות בהתקפה.",
          url: "https://www.sport5.co.il/articles/maccabi-champions-league",
          imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20",
          source: "Walla News",
          publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
        {
          title: "אליפות ישראל בכדורסל: הפועל ירושלים בגמר",
          content: "הפועל ירושלים העפילה לגמר אליפות ישראל בכדורסל לאחר ניצחון בסדרת חצי הגמר. המשחק המכריע היה צמוד עד הרגעים האחרונים, אך הקבוצה הירושלמית הצליחה לשמור על יתרון קטן עד לסיום. בגמר תפגוש ירושלים את מכבי תל אביב, בסדרה שתחל בשבוע הבא.",
          url: "https://www.one.co.il/basketball/hapoel-jerusalem-finals",
          source: "N12",
          publishedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        },
      ];
      
    case 'health':
      return [
        {
          title: "משרד הבריאות: ירידה במספר מקרי השפעת החודש",
          content: "נתונים חדשים ממשרד הבריאות מצביעים על ירידה משמעותית במספר מקרי השפעת בחודש האחרון. לפי הנתונים, ישנה ירידה של כ-30% במספר הפניות לבתי החולים בגלל תסמיני שפעת. מומחים מסבירים כי ההתחסנות המוקדמת השנה הביאה לתוצאות טובות.",
          url: "https://www.ynet.co.il/health/flu-cases-decreasing",
          imageUrl: "https://images.unsplash.com/photo-1581595219315-a187dd40c322",
          source: "Ynet",
          publishedAt: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(), // 36 hours ago
        },
        {
          title: "מחקר ישראלי פורץ דרך: התקדמות בטיפול באלצהיימר",
          content: "חוקרים מהאוניברסיטה העברית פיתחו גישה חדשה לטיפול במחלת האלצהיימר, המציגה תוצאות מבטיחות בניסויים מוקדמים. המחקר, שפורסם בכתב עת מוביל, מתמקד בחלבון ספציפי במוח שנמצא קשור להתפתחות המחלה. בקרוב יחלו ניסויים קליניים ראשוניים בבני אדם.",
          url: "https://news.walla.co.il/health/alzheimer-research-breakthrough",
          source: "Walla News",
          publishedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago
        },
      ];
      
    case 'security':
      return [
        {
          title: "צה\"ל השלים תרגיל נרחב בגבול הצפון",
          content: "צה\"ל השלים היום תרגיל צבאי נרחב בגבול הצפון, שכלל אימון של כוחות חי\"ר, שריון וחיל האוויר. התרגיל נמשך שלושה ימים ונועד לשפר את המוכנות המבצעית באזור. דובר צה\"ל הדגיש כי מדובר בתרגיל מתוכנן מראש שאינו מעיד על שינוי במצב הביטחוני.",
          url: "https://www.n12.co.il/news/defense/northern-border-exercise",
          imageUrl: "https://images.unsplash.com/photo-1579912437766-7896df6d3cd3",
          source: "N12",
          publishedAt: new Date(now.getTime() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
        },
        {
          title: "שר הביטחון: \"מחזקים את מערך ההגנה האווירית\"",
          content: "שר הביטחון הודיע היום על תכנית חדשה לחיזוק מערך ההגנה האווירית של ישראל. התכנית כוללת רכישת מערכות הגנה מתקדמות ושדרוג המערכות הקיימות. בנאומו, הדגיש השר את החשיבות של הגנה אווירית מקיפה מול האתגרים הביטחוניים העכשוויים באזור.",
          url: "https://www.ynet.co.il/news/defense/air-defense-system-upgrade",
          source: "Ynet",
          publishedAt: new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
        },
      ];
      
    default:
      return [];
  }
}

// Keep the original function for backward compatibility with existing code
function getSimulatedNewsData(category: string): NewsArticle[] {
  return getHebrewNewsData(category);
}

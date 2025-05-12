import axios from 'axios';
import * as xml2js from 'xml2js';

interface RssItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  guid: string;
  enclosure?: {
    $: {
      url: string;
      type: string;
    }
  };
}

interface RssSource {
  url: string;
  name: string;
}

interface ParsedRssItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  guid: string;
  imageUrl?: string;
  formattedDate: string;
  source: string;
  date: Date; // Actual date object for sorting
}

class RssService {
  private rssSources: RssSource[] = [
    {
      url: 'https://www.ynet.co.il/Integration/StoryRss2.xml',
      name: 'Ynet'
    },
    {
      url: 'https://rcs.mako.co.il/rss/news-military.xml?Partner=interlink',
      name: 'Mako'
    },
    {
      url: 'https://rcs.mako.co.il/rss/news-law.xml?Partner=interlink',
      name: 'Mako'
    }
  ];
  
  async fetchRssNews(): Promise<ParsedRssItem[]> {
    try {
      // Fetch all RSS feeds in parallel
      const allNewsPromises = this.rssSources.map(source => this.fetchFromSource(source));
      const allNewsArrays = await Promise.all(allNewsPromises);
      
      // Combine all news items into a single array
      const allNews = allNewsArrays.flat();
      
      // Sort by date (newest first)
      return allNews.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
      throw error;
    }
  }
  
  private async fetchFromSource(source: RssSource): Promise<ParsedRssItem[]> {
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const urlWithTimestamp = source.url.includes('?') 
        ? `${source.url}&_t=${timestamp}` 
        : `${source.url}?_t=${timestamp}`;
      
      // Fetch the RSS feed with cache-busting headers
      const response = await axios.get(urlWithTimestamp, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      // Parse XML to JS object
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(response.data);
      
      // Extract items from RSS feed
      const items = result.rss.channel.item;
      
      // Handle both array and single item cases
      const itemsArray = Array.isArray(items) ? items : [items];
      
      // Process each news item
      return itemsArray.map((item: RssItem) => {
        // Parse the date
        const date = new Date(item.pubDate);
        
        // Format the date for display
        const formattedDate = date.toLocaleDateString('he-IL', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // First try to get enclosure image
        let imageUrl = item.enclosure?.$?.url;
        
        // If no enclosure image, try to extract from description HTML
        if (!imageUrl && item.description) {
          const imgMatch = item.description.match(/<img[^>]+src=['"]([^'"]+)['"]/i);
          if (imgMatch && imgMatch[1]) {
            imageUrl = imgMatch[1];
            
            // Make sure it's an absolute URL
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = imageUrl.startsWith('//') ? 'https:' + imageUrl : 'https://' + imageUrl;
            }
          }
        }

        // Handle specific image formats based on source
        if (imageUrl) {
          if (imageUrl.includes('ynet-pic')) {
            // Replace medium with large for Ynet images
            imageUrl = imageUrl.replace('_medium.jpg', '_large.jpg');
          } else if (imageUrl.includes('mako')) {
            // Keep the large-sized Mako images
            imageUrl = imageUrl.replace('/small/', '/large/').replace('/medium/', '/large/');
          }
        }
        
        return {
          title: item.title,
          description: item.description,
          link: item.link,
          pubDate: item.pubDate,
          guid: item.guid || item.link, // Use link as fallback guid
          imageUrl,
          formattedDate,
          source: source.name,
          date: date // Keep original Date object for sorting
        };
      });
    } catch (error) {
      console.error(`Error fetching or parsing RSS feed from ${source.url}:`, error);
      // Return empty array on error for this source instead of failing entirely
      return [];
    }
  }
}

export const rssService = new RssService();
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

interface ParsedRssItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  guid: string;
  imageUrl?: string;
  formattedDate: string;
}

class RssService {
  private rssUrl: string = 'https://www.ynet.co.il/Integration/StoryRss2.xml';
  
  async fetchRssNews(): Promise<ParsedRssItem[]> {
    try {
      // Fetch the RSS feed
      const response = await axios.get(this.rssUrl);
      
      // Parse XML to JS object
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(response.data);
      
      // Extract items from RSS feed
      const items = result.rss.channel.item;
      
      // Process each news item
      return items.map((item: RssItem) => {
        // Format the date
        const date = new Date(item.pubDate);
        const formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // Extract image URL if available
        const imageUrl = item.enclosure?.$?.url;
        
        return {
          title: item.title,
          description: item.description,
          link: item.link,
          pubDate: item.pubDate,
          guid: item.guid,
          imageUrl,
          formattedDate
        };
      });
    } catch (error) {
      console.error('Error fetching or parsing RSS feed:', error);
      throw error;
    }
  }
}

export const rssService = new RssService();
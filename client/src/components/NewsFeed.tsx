import { useQuery } from "@tanstack/react-query";
import { NewsItem } from "@shared/schema";
import NewsCard from "./NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { PoliticianMention } from "@/lib/types";
import PoliticianRatingModal from "./PoliticianRatingModal";

// Extended NewsItem type to include politicians
interface EnhancedNewsItem extends NewsItem {
  politicians?: PoliticianMention[];
  source?: string; // Source of the news (Ynet, Mako, etc.)
  date?: Date; // Date object for sorting
}

export default function NewsFeed() {
  // State for manual refresh control
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Function to manually trigger refresh
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered, timestamp:', new Date().toISOString());
    setRefreshKey(prev => {
      const newKey = prev + 1;
      console.log(`Refresh key updated: ${prev} -> ${newKey}`);
      return newKey;
    });
  };
  
  // Auto-refresh timer and app visibility handling
  useEffect(() => {
    // Function to handle visibility change (when app returns from background)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('App became visible, refreshing news...');
        handleManualRefresh();
      }
    };
    
    // Set up regular refresh timer
    const timer = setInterval(() => {
      console.log('Timer refresh triggered');
      handleManualRefresh();
    }, 30000); // Check for updates every 30 seconds
    
    // Set up visibility change listener for mobile app
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set up Capacitor-specific app state listener if available
    if (window.Capacitor && window.Capacitor.isPluginAvailable('App')) {
      console.log('Setting up Capacitor app state listener');
      // @ts-ignore - Capacitor types might not be available
      window.Capacitor.Plugins.App.addListener('appStateChange', (state: { isActive: boolean }) => {
        if (state.isActive) {
          console.log('App became active via Capacitor, refreshing news...');
          handleManualRefresh();
        }
      });
    }
    
    // Initial refresh
    handleManualRefresh();
    
    // Clean up listeners
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (window.Capacitor && window.Capacitor.isPluginAvailable('App')) {
        // @ts-ignore - Capacitor types might not be available
        window.Capacitor.Plugins.App.removeAllListeners();
      }
    };
  }, []);
  
  // Define the response types
  type RegularNewsResponse = {
    timestamp: number;
    news: EnhancedNewsItem[];
  };
  
  type MobileRssResponse = {
    timestamp: number;
    fetch_time: string;
    results: Array<{
      status: 'fulfilled' | 'rejected';
      value?: {
        name: string;
        data: any;
        success: boolean;
        processedItems?: Array<any>; // Items with politicians
      };
      reason?: any;
    }>;
    mobile_endpoint: boolean;
  };
  
  // Combined response type
  type NewsResponse = RegularNewsResponse | MobileRssResponse;
  
  // Check if we're in a mobile app environment
  const isMobileApp = window.location.href.includes('capacitor') || 
                     (window.Capacitor && window.Capacitor.isPluginAvailable('App'));
  
  console.log('Environment check - Mobile app:', isMobileApp);
  
  // Choose the appropriate endpoint based on environment
  const apiEndpoint = isMobileApp ? "/api/mobile/rss" : "/api/news";
  console.log('Using API endpoint:', apiEndpoint);
  
  // Fetch news from the API with updated response format
  const { data: newsResponse, isLoading, isError, error, refetch } = useQuery<NewsResponse>({
    queryKey: [apiEndpoint, refreshKey], // Add refreshKey to force refetch
    refetchOnWindowFocus: true, // Enable refetch when window gets focus
    refetchOnMount: true,
    refetchInterval: isMobileApp ? 10000 : 30000, // More frequent polling for mobile
    staleTime: isMobileApp ? 5000 : 15000, // Shorter stale time for mobile
    retry: 3, // Retry failed requests
    retryDelay: 1000, // Wait 1 second between retries
  });
  
  // Add effect for logging
  useEffect(() => {
    if (newsResponse) {
      console.log('News response received:', newsResponse);
      
      // Type guard for narrowing response type
      const mobileResponse = newsResponse as MobileRssResponse;
      const regularResponse = newsResponse as RegularNewsResponse;
      
      // Type guard to check response type
      if ('results' in newsResponse) {
        console.log('Mobile RSS fetch succeeded, timestamp:', mobileResponse.timestamp, 
                   'fetch time:', mobileResponse.fetch_time,
                   'sources:', mobileResponse.results.length);
      } else if ('news' in newsResponse) {
        console.log('News fetch succeeded, timestamp:', regularResponse.timestamp, 
                   'items:', regularResponse.news?.length);
      }
    }
  }, [newsResponse]);
  
  // Process mobile RSS or use regular news
  const news = useMemo(() => {
    if (!newsResponse) return [];
    
    // Type assertion for narrowing
    const mobileResponse = newsResponse as MobileRssResponse;
    const regularResponse = newsResponse as RegularNewsResponse;
    
    // Handle the response from mobile RSS endpoint - type guard with new format
    if ('results' in newsResponse) {
      try {
        console.log('Processing mobile RSS data from multiple sources');
        
        // Process all successful results
        const allNewsItems: EnhancedNewsItem[] = [];
        
        newsResponse.results.forEach(result => {
          if (result.status === 'fulfilled' && result.value?.success) {
            const sourceName = result.value.name;
            console.log(`Processing ${sourceName} RSS data`);
            
            // Access the RSS channel data
            const rssChannel = result.value.data?.rss?.channel;
            if (!rssChannel) {
              console.warn(`No RSS channel found for ${sourceName}`);
              return; // Skip this source
            }
            
            // Get items
            const rssItems = rssChannel.item;
            if (!rssItems) {
              console.warn(`No items found for ${sourceName}`);
              return; // Skip this source
            }
            
            // Handle both array and single item cases
            const itemsArray = Array.isArray(rssItems) ? rssItems : [rssItems];
            
            // Map items to our format
            const parsedItems = itemsArray.map((item: any) => ({
              title: item.title || '',
              description: item.description || '',
              link: item.link || '',
              guid: item.guid || item.link,
              pubDate: item.pubDate || '',
              formattedDate: new Date(item.pubDate).toLocaleDateString('he-IL'),
              source: sourceName,
              imageUrl: item.enclosure?.$?.url || '',
              date: new Date(item.pubDate),
              politicians: [] // No politicians detected yet
            }));
            
            // Add to our collection
            allNewsItems.push(...parsedItems);
          } else {
            console.warn('Failed to fetch from source:', result);
          }
        });
        
        // Sort all items by date, newest first
        return allNewsItems.sort((a, b) => {
          const dateA = a.date?.getTime() || 0;
          const dateB = b.date?.getTime() || 0;
          return dateB - dateA;
        });
      } catch (err) {
        console.error('Error processing RSS data:', err);
        return [];
      }
    }
    
    // Regular news response - type guard
    if ('news' in newsResponse) {
      return regularResponse.news || [];
    }
    
    return [];
  }, [newsResponse]);
  
  // For the global rating modal
  const [showGlobalRatingModal, setShowGlobalRatingModal] = useState(false);
  const [articlesWithPoliticians, setArticlesWithPoliticians] = useState<PoliticianMention[]>([]);
  
  // Check for returning from an article and show the rating modal globally
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleHashChange = () => {
      // Check if we're returning from an article
      const hash = window.location.hash;
      if (hash && hash.startsWith('#return-from-') && news) {
        // Get the last viewed article from sessionStorage
        const lastArticleId = sessionStorage.getItem('lastViewedArticle');
        
        if (lastArticleId && hash === `#${lastArticleId}`) {
          // Find the article with mentioned politicians
          const articleWithPoliticians = news?.find(article => {
            const articleId = article.guid || article.link;
            const hashedArticleId = btoa(articleId).replace(/=/g, '').substring(0, 10);
            return lastArticleId === `return-from-${hashedArticleId}`;
          }) as EnhancedNewsItem | undefined;
          
          if (articleWithPoliticians && articleWithPoliticians.politicians?.length) {
            // Show the global rating modal
            setArticlesWithPoliticians(articleWithPoliticians.politicians);
            setTimeout(() => {
              setShowGlobalRatingModal(true);
              // Clear the hash to prevent showing the modal again if the page is refreshed
              history.replaceState(null, document.title, window.location.pathname);
              // Clear sessionStorage
              sessionStorage.removeItem('lastViewedArticle');
            }, 300);
          }
        }
      }
    };
    
    // Listen for hash changes (back button navigation)
    window.addEventListener('hashchange', handleHashChange);
    // Check on mount too
    handleHashChange();
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [news, refreshKey]);

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    // Show skeleton loading state
    return (
      <div className="flex flex-col gap-4 max-w-screen-sm mx-auto">
        {Array(4).fill(null).map((_, i) => (
          <div key={i} className="mobile-card bg-white dark:bg-slate-900 dark:border-slate-800">
            <Skeleton className="h-[300px] w-full dark:bg-slate-800" style={{borderTopLeftRadius: "12px", borderTopRightRadius: "12px"}}/>
            <div className="p-4">
              <div className="flex justify-between mb-3">
                <Skeleton className="h-4 w-24 dark:bg-slate-800" />
                <Skeleton className="h-5 w-16 dark:bg-slate-800" />
              </div>
              <Skeleton className="h-7 w-full mb-3 dark:bg-slate-800" />
              <Skeleton className="h-4 w-full mb-2 dark:bg-slate-800" />
              <Skeleton className="h-4 w-3/4 mb-2 dark:bg-slate-800" />
              <Skeleton className="h-4 w-5/6 mb-4 dark:bg-slate-800" />
              <Skeleton className="h-10 w-full rounded-lg dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-6 text-right dark:bg-red-950 dark:text-red-200 dark:border-red-800">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>שגיאה</AlertTitle>
        <AlertDescription className="flex flex-col gap-2 items-end">
          <p>טעינת החדשות נכשלה: {(error as Error)?.message || "שגיאה לא ידועה"}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex gap-2 items-center dark:border-red-800 dark:text-red-200 dark:hover:bg-red-900" 
            onClick={handleManualRefresh}
          >
            <RefreshCw className="h-4 w-4 ml-1" />
            נסה שוב
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!news || news.length === 0) {
    return (
      <Alert className="mb-6 text-right dark:bg-slate-900 dark:border-slate-800 dark:text-gray-300">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="dark:text-gray-200">אין חדשות זמינות</AlertTitle>
        <AlertDescription className="flex flex-col gap-2 items-end">
          <p>אין כרגע מאמרי חדשות זמינים.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex gap-2 items-center dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800" 
            onClick={handleManualRefresh}
          >
            <RefreshCw className="h-4 w-4 ml-1" />
            רענן
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-2 max-w-screen-sm mx-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleManualRefresh} 
          className="text-xs flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>רענן חדשות</span>
        </Button>
      </div>
      
      <div className="flex flex-col gap-4 max-w-screen-sm mx-auto">
        {news.map((article) => (
          <NewsCard key={article.guid} article={article} />
        ))}
      </div>
      
      {/* Global rating modal - shown when returning from an article via URL hash */}
      <PoliticianRatingModal
        politicians={articlesWithPoliticians}
        isOpen={showGlobalRatingModal}
        onClose={() => setShowGlobalRatingModal(false)}
        articleId="global" // Use a special identifier for the global rating modal
      />
    </div>
  );
}
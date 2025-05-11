import { useQuery } from "@tanstack/react-query";
import { NewsItem } from "@shared/schema";
import NewsCard from "./NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { PoliticianMention } from "@/lib/types";
import PoliticianRatingModal from "./PoliticianRatingModal";

// Extended NewsItem type to include politicians
interface EnhancedNewsItem extends NewsItem {
  politicians?: PoliticianMention[];
}

export default function NewsFeed() {
  // Fetch news from the API
  const { data: news, isLoading, isError, error, refetch } = useQuery<EnhancedNewsItem[]>({
    queryKey: ["/api/news"],
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
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
          const articleWithPoliticians = news.find(article => {
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
  }, [news]);

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    // Show skeleton loading state
    return (
      <div className="flex flex-col gap-4 max-w-screen-sm mx-auto">
        {Array(4).fill(null).map((_, i) => (
          <div key={i} className="mobile-card">
            <Skeleton className="h-[300px] w-full" style={{borderTopLeftRadius: "12px", borderTopRightRadius: "12px"}}/>
            <div className="p-4">
              <div className="flex justify-between mb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-7 w-full mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-5/6 mb-4" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-6 text-right">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>שגיאה</AlertTitle>
        <AlertDescription className="flex flex-col gap-2 items-end">
          <p>טעינת החדשות נכשלה: {(error as Error)?.message || "שגיאה לא ידועה"}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex gap-2 items-center" 
            onClick={handleRefresh}
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
      <Alert className="mb-6 text-right">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>אין חדשות זמינות</AlertTitle>
        <AlertDescription className="flex flex-col gap-2 items-end">
          <p>אין כרגע מאמרי חדשות זמינים.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex gap-2 items-center" 
            onClick={handleRefresh}
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
      <div className="flex justify-end mb-4 px-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex gap-1 items-center rounded-full h-9 w-9 p-0 justify-center" 
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">רענן</span>
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
      />
    </div>
  );
}
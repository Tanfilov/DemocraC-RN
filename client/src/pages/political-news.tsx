import { useEffect, useRef } from "react";
import NewsCard from "@/components/news/NewsCard";
import { usePoliticalNews } from "@/hooks/usePoliticalNews";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PoliticalNews() {
  const { 
    politicalTopics, 
    topicsWithPoliticians, 
    isLoading, 
    isRefreshing, 
    refreshPoliticalNews,
    isLoadingMore,
    loadMoreArticles 
  } = usePoliticalNews();
  
  const loaderRef = useRef(null);
  
  // Setup intersection observer for load more functionality
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !isLoadingMore) {
          loadMoreArticles();
        }
      },
      { threshold: 0.1 }
    );
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loadMoreArticles, isLoading, isLoadingMore]);
  
  // Combine all topics, prioritizing those with politicians
  const allTopics = [
    ...(topicsWithPoliticians || []), 
    ...(politicalTopics || []).filter(topic => 
      !(topicsWithPoliticians || []).some(t => t?.id === topic?.id)
    )
  ];
  
  return (
    <main className="container mx-auto px-4 py-4">
      <section className="space-y-6">
        {isLoading && allTopics.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="w-full h-96 rounded-lg" />
            <Skeleton className="w-full h-96 rounded-lg" />
            <Skeleton className="w-full h-96 rounded-lg" />
            <Skeleton className="w-full h-96 rounded-lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allTopics.map((topic) => (
                <NewsCard key={topic.id} topic={topic} />
              ))}
            </div>
            
            {/* Loading indicator and sentinel element for infinite scroll */}
            <div 
              ref={loaderRef}
              className="py-6 flex justify-center"
            >
              {isLoadingMore && (
                <Loader2 className="animate-spin h-6 w-6 text-primary" />
              )}
            </div>
            
            {/* Manual refresh button */}
            <Button
              variant="outline"
              className="w-full py-3 mb-8"
              onClick={refreshPoliticalNews}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? "מעדכן..." : "רענן חדשות"}
            </Button>
          </>
        )}
      </section>
    </main>
  );
}
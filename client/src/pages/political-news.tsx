import NewsCard from "@/components/news/NewsCard";
import { usePoliticalNews } from "@/hooks/usePoliticalNews";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PoliticalNews() {
  const { politicalTopics, topicsWithPoliticians, isLoading, isRefreshing, refreshPoliticalNews } = usePoliticalNews();
  
  return (
    <main className="container mx-auto px-4 py-4">
      <section className="space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="w-full h-96 rounded-lg" />
            <Skeleton className="w-full h-96 rounded-lg" />
            <Skeleton className="w-full h-96 rounded-lg" />
            <Skeleton className="w-full h-96 rounded-lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* All political news with priority to those with politicians */}
              {[...topicsWithPoliticians, ...politicalTopics.filter(
                topic => !topicsWithPoliticians.some(t => t.id === topic.id)
              )].map((topic) => (
                <NewsCard key={topic.id} topic={topic} />
              ))}
            </div>
            
            {politicalTopics.length > 0 && (
              <Button
                variant="outline"
                className="w-full py-3"
                onClick={refreshPoliticalNews}
                disabled={isRefreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? "מעדכן..." : "טען עוד כתבות"}
              </Button>
            )}
          </>
        )}
      </section>
    </main>
  );
}
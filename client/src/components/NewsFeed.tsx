import { useQuery } from "@tanstack/react-query";
import { NewsItem } from "@shared/schema";
import NewsCard from "./NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewsFeed() {
  // Fetch news from the API
  const { data: news, isLoading, isError, error, refetch } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    // Show skeleton loading state
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(null).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <div className="flex justify-between mb-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-4 w-5/6 mb-1" />
              <div className="flex justify-between mt-4 pt-4 border-t">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>Failed to load news: {(error as Error)?.message || "Unknown error"}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="self-start flex gap-2 items-center" 
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!news || news.length === 0) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No News Available</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>There are currently no news articles available.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="self-start flex gap-2 items-center" 
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex gap-2 items-center" 
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article) => (
          <NewsCard key={article.guid} article={article} />
        ))}
      </div>
    </div>
  );
}
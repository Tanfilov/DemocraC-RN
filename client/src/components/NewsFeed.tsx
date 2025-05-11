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
      <div className="flex flex-col gap-4 max-w-screen-sm mx-auto">
        {Array(4).fill(null).map((_, i) => (
          <div key={i} className="mobile-card">
            <Skeleton className="h-56 w-full"/>
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
      <div className="flex justify-start mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex gap-2 items-center" 
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4 ml-1" />
          רענן
        </Button>
      </div>
      <div className="flex flex-col gap-4 max-w-screen-sm mx-auto">
        {news.map((article) => (
          <NewsCard key={article.guid} article={article} />
        ))}
      </div>
    </div>
  );
}
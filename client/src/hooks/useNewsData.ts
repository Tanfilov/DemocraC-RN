import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { NewsCategory, NewsSource, TopicWithArticles } from "@shared/schema";

export function useNewsData(category?: string) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch categories
  const categoriesQuery = useQuery({
    queryKey: ["/api/categories"],
  });
  
  // Fetch sources
  const sourcesQuery = useQuery({
    queryKey: ["/api/sources"],
  });
  
  // Fetch topics based on category
  const topicsQuery = useQuery({
    queryKey: ["/api/topics", category],
    queryFn: async () => {
      const url = category 
        ? `/api/topics?category=${category}`
        : "/api/topics";
      
      const res = await fetch(url, {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch topics");
      }
      
      return res.json();
    },
  });
  
  // Mutation to refresh news data
  const refreshMutation = useMutation({
    mutationFn: async () => {
      setIsRefreshing(true);
      const res = await apiRequest("POST", "/api/refresh", undefined);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch topics
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      setIsRefreshing(false);
    },
    onError: () => {
      setIsRefreshing(false);
    },
  });
  
  // Helper function to refresh news
  const refreshNews = () => {
    refreshMutation.mutate();
  };
  
  // If there's no data and it's not loading, refresh automatically
  useEffect(() => {
    if (
      !topicsQuery.isLoading && 
      !topicsQuery.isRefetching &&
      topicsQuery.data?.topics?.length === 0
    ) {
      refreshNews();
    }
  }, [topicsQuery.isLoading, topicsQuery.data]);
  
  const categories: NewsCategory[] = categoriesQuery.data?.categories || [];
  const sources: NewsSource[] = sourcesQuery.data?.sources || [];
  const topics: TopicWithArticles[] = topicsQuery.data?.topics || [];
  
  return {
    categories,
    sources,
    topics,
    isLoading: topicsQuery.isLoading || categoriesQuery.isLoading || sourcesQuery.isLoading,
    isRefreshing,
    refreshNews,
  };
}

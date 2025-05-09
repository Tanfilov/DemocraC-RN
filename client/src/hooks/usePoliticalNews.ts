import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { TopicWithArticles } from "@shared/schema";

export function usePoliticalNews() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch only political topics
  const politicalTopicsQuery = useQuery({
    queryKey: ["/api/topics", "politics"],
    queryFn: async () => {
      const url = "/api/topics?category=politics";
      
      const res = await fetch(url, {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch political topics");
      }
      
      return res.json();
    },
  });
  
  // Mutation to refresh political news specifically
  const refreshPoliticalNewsMutation = useMutation({
    mutationFn: async () => {
      setIsRefreshing(true);
      const res = await apiRequest("GET", "/api/fetch-political-news", undefined);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch topics
      queryClient.invalidateQueries({ queryKey: ["/api/topics", "politics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/politicians"] });
      queryClient.invalidateQueries({ queryKey: ["/api/politicians/top"] });
      setIsRefreshing(false);
    },
    onError: () => {
      setIsRefreshing(false);
    },
  });
  
  // Helper function to refresh political news
  const refreshPoliticalNews = () => {
    refreshPoliticalNewsMutation.mutate();
  };
  
  // Extract political topics with politicians
  const politicalTopics: TopicWithArticles[] = politicalTopicsQuery.data?.topics || [];
  
  // Filter to only include topics that have politicians mentioned
  const topicsWithPoliticians = politicalTopics.filter(
    topic => topic.politicians && topic.politicians.length > 0
  );
  
  return {
    politicalTopics,
    topicsWithPoliticians,
    isLoading: politicalTopicsQuery.isLoading,
    isRefreshing,
    refreshPoliticalNews,
  };
}
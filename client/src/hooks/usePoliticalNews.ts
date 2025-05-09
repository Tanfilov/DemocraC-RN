import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useState, useCallback } from "react";
import { TopicWithArticles } from "@shared/schema";

export function usePoliticalNews() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 20; // Increased limit to fetch more articles
  
  // Fetch political topics with pagination
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["/api/topics", "politics", page],
    queryFn: async () => {
      const url = `/api/topics?category=politics&limit=${limit}&offset=${page * limit}`;
      
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
  const refreshPoliticalNews = useCallback(() => {
    refreshPoliticalNewsMutation.mutate();
  }, [refreshPoliticalNewsMutation]);
  
  // Function to load more articles
  const loadMoreArticles = useCallback(() => {
    if (!isFetching) {
      setPage(prevPage => prevPage + 1);
    }
  }, [isFetching]);

  // Extract all political topics
  const politicalTopics: TopicWithArticles[] = data?.topics || [];
  
  // Filter to only include topics that have politicians mentioned
  const topicsWithPoliticians = politicalTopics.filter(
    topic => topic.politicians && topic.politicians.length > 0
  );
  
  return {
    politicalTopics,
    topicsWithPoliticians,
    isLoading,
    isLoadingMore: isFetching && page > 0,
    loadMoreArticles,
    isRefreshing,
    refreshPoliticalNews,
  };
}
import { useQuery } from "@tanstack/react-query";
import { PoliticianWithRating } from "@shared/schema";

export function usePoliticians() {
  // Fetch top rated politicians
  const topPoliticiansQuery = useQuery({
    queryKey: ["/api/politicians/top"],
  });
  
  // Fetch all politicians
  const allPoliticiansQuery = useQuery({
    queryKey: ["/api/politicians"],
    enabled: false, // Only load when needed
  });
  
  const topPoliticians: PoliticianWithRating[] = topPoliticiansQuery.data?.politicians || [];
  const allPoliticians: PoliticianWithRating[] = allPoliticiansQuery.data?.politicians || [];
  
  return {
    topPoliticians,
    allPoliticians,
    isLoading: topPoliticiansQuery.isLoading,
    loadAllPoliticians: () => allPoliticiansQuery.refetch(),
  };
}

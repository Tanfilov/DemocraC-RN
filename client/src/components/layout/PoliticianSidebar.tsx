import { PoliticianWithRating, NewsSource } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PoliticianCard from "@/components/politicians/PoliticianCard";

interface PoliticianSidebarProps {
  politicians: PoliticianWithRating[];
  sources: NewsSource[];
  isLoading?: boolean;
}

export default function PoliticianSidebar({ politicians, sources, isLoading = false }: PoliticianSidebarProps) {
  if (isLoading) {
    return (
      <aside className="hidden xl:block xl:col-span-3 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-5 w-16" />
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Skeleton className="h-px w-full my-4" />
          <Skeleton className="h-7 w-32 mb-4" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-8 w-16 rounded-md" />
            ))}
          </div>
        </div>
      </aside>
    );
  }
  
  return (
    <aside className="hidden xl:block xl:col-span-3 space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Top Rated Politicians</h2>
          <Button variant="link" size="sm">View All</Button>
        </div>
        
        <div className="space-y-4">
          {politicians.slice(0, 3).map((politician) => (
            <PoliticianCard 
              key={politician.id} 
              politician={politician} 
              variant="compact"
            />
          ))}
        </div>
        
        <hr className="my-4 border-gray-200" />
        
        <h2 className="font-bold text-lg mb-4">News Sources</h2>
        <div className="flex flex-wrap gap-2">
          {sources.slice(0, 7).map((source) => (
            <Badge key={source.id} variant="outline">{source.name}</Badge>
          ))}
          {sources.length > 7 && (
            <Badge variant="outline">+{sources.length - 7} more</Badge>
          )}
        </div>
      </div>
    </aside>
  );
}

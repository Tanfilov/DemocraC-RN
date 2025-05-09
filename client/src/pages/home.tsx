import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import PoliticianSidebar from "@/components/layout/PoliticianSidebar";
import FeaturedNews from "@/components/news/FeaturedNews";
import NewsCard from "@/components/news/NewsCard";
import { useNewsData } from "@/hooks/useNewsData";
import { usePoliticians } from "@/hooks/usePoliticians";
import { NewsCategory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("trending");
  
  const { categories, topics, sources, isLoading, isRefreshing, refreshNews } = useNewsData(activeCategory);
  const { topPoliticians } = usePoliticians();
  
  const handleCategoryChange = (category?: string) => {
    setActiveCategory(category);
  };
  
  return (
    <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Side navigation */}
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      {/* Main content */}
      <section className="lg:col-span-9 xl:col-span-7 space-y-6">
        {/* Top filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg shadow-sm">
          <h2 className="font-bold text-xl mb-3 sm:mb-0">
            {activeCategory ? categories.find(c => c.id === activeCategory)?.name : "Top Stories"}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-[180px] bg-gray-100">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map(source => (
                  <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-gray-100">
                <SelectValue placeholder="Trending" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="discussed">Most Discussed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <>
            <Skeleton className="w-full h-64 rounded-lg" />
            <div className="p-5 space-y-4">
              <Skeleton className="w-1/3 h-8" />
              <Skeleton className="w-full h-24" />
              <div className="flex gap-4">
                <Skeleton className="w-20 h-10 rounded-full" />
                <Skeleton className="w-20 h-10 rounded-full" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="w-full h-96 rounded-lg" />
              <Skeleton className="w-full h-96 rounded-lg" />
              <Skeleton className="w-full h-96 rounded-lg" />
              <Skeleton className="w-full h-96 rounded-lg" />
            </div>
          </>
        ) : (
          <>
            {/* Featured news (first topic) */}
            {topics.length > 0 && (
              <FeaturedNews topic={topics[0]} />
            )}
            
            {/* News Grid */}
            {topics.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topics.slice(1).map((topic) => (
                  <NewsCard key={topic.id} topic={topic} />
                ))}
              </div>
            )}
            
            {topics.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h3 className="text-xl font-bold mb-2">No news found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any news articles for this category. Try selecting a different category or refreshing the news.
                </p>
                <Button onClick={refreshNews} disabled={isRefreshing}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh News
                </Button>
              </div>
            )}
            
            {topics.length > 0 && (
              <Button
                variant="outline"
                className="w-full py-3"
                onClick={refreshNews}
                disabled={isRefreshing}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {isRefreshing ? "Refreshing..." : "Load More Stories"}
              </Button>
            )}
          </>
        )}
      </section>
      
      {/* Right sidebar with politicians */}
      <PoliticianSidebar politicians={topPoliticians} sources={sources} />
    </main>
  );
}

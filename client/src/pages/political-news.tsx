import { useState } from "react";
import PoliticianSidebar from "@/components/layout/PoliticianSidebar";
import FeaturedNews from "@/components/news/FeaturedNews";
import NewsCard from "@/components/news/NewsCard";
import { usePoliticians } from "@/hooks/usePoliticians";
import { usePoliticalNews } from "@/hooks/usePoliticalNews";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewsData } from "@/hooks/useNewsData";

export default function PoliticalNews() {
  const [sortBy, setSortBy] = useState<string>("trending");
  
  const { sources } = useNewsData();
  const { politicalTopics, topicsWithPoliticians, isLoading, isRefreshing, refreshPoliticalNews } = usePoliticalNews();
  const { topPoliticians } = usePoliticians();
  
  return (
    <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main content */}
      <section className="lg:col-span-9 xl:col-span-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow">
          <h1 className="text-3xl font-bold mb-2 text-right">חדשות פוליטיות מעודכנות</h1>
          <p className="text-right opacity-90">
            אוסף חדשות פוליטיות מהאתרים המובילים בישראל. 
            הכתבות מכילות זיהוי אוטומטי של פוליטיקאים וניתן לדרג אותם.
          </p>
        </div>
        
        {/* Top filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <span className="material-icons text-purple-500 ml-2">how_to_vote</span>
            <h2 className="font-bold text-xl mb-3 sm:mb-0">חדשות פוליטיות</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-gray-100">
                <SelectValue placeholder="מיון לפי" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">הכי פופולרי</SelectItem>
                <SelectItem value="recent">החדש ביותר</SelectItem>
                <SelectItem value="politicians">הכי הרבה פוליטיקאים</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline"
              onClick={refreshPoliticalNews}
              disabled={isRefreshing}
              className="bg-white hover:bg-blue-50"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? "מעדכן..." : "עדכן חדשות פוליטיות"}
            </Button>
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
            {topicsWithPoliticians.length > 0 ? (
              <>
                {/* Featured political news (first topic with politicians) */}
                <FeaturedNews topic={topicsWithPoliticians[0]} />
                
                {/* Political News with Politicians Grid */}
                {topicsWithPoliticians.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {topicsWithPoliticians.slice(1).map((topic) => (
                      <NewsCard key={topic.id} topic={topic} />
                    ))}
                  </div>
                )}
                
                {/* Other political news without identified politicians */}
                {politicalTopics.length > topicsWithPoliticians.length && (
                  <div className="mt-8">
                    <div className="flex items-center mb-4">
                      <AlertTriangle className="text-yellow-500 mr-2 h-5 w-5" />
                      <h3 className="text-lg font-semibold">כתבות פוליטיות ללא זיהוי פוליטיקאים</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {politicalTopics
                        .filter(topic => !topic.politicians || topic.politicians.length === 0)
                        .slice(0, 4)
                        .map((topic) => (
                          <NewsCard key={topic.id} topic={topic} />
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              politicalTopics.length > 0 ? (
                <>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 text-center">
                    <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                    <h3 className="text-xl font-bold mb-2">לא נמצאו פוליטיקאים בכתבות</h3>
                    <p className="text-gray-700 mb-4">
                      מצאנו כתבות פוליטיות, אך לא זוהו בהן פוליטיקאים. לחץ על כפתור "עדכן חדשות פוליטיות" כדי לנסות שוב.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {politicalTopics.slice(0, 6).map((topic) => (
                      <NewsCard key={topic.id} topic={topic} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <h3 className="text-xl font-bold mb-2">לא נמצאו חדשות פוליטיות</h3>
                  <p className="text-gray-600 mb-4">
                    לחץ על כפתור "עדכן חדשות פוליטיות" כדי להוריד חדשות פוליטיות מהאתרים המובילים.
                  </p>
                  <Button 
                    onClick={refreshPoliticalNews} 
                    disabled={isRefreshing}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    עדכן חדשות פוליטיות
                  </Button>
                </div>
              )
            )}
            
            {politicalTopics.length > 0 && (
              <Button
                variant="outline"
                className="w-full py-3"
                onClick={refreshPoliticalNews}
                disabled={isRefreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? "מעדכן..." : "טען עוד כתבות פוליטיות"}
              </Button>
            )}
          </>
        )}
      </section>
      
      {/* Right sidebar with top rated politicians */}
      <PoliticianSidebar politicians={topPoliticians} sources={sources} />
    </main>
  );
}
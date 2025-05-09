import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import PoliticianCard from "@/components/politicians/PoliticianCard";
import { Search } from "lucide-react";

export default function PoliticiansPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: topPoliticians, isLoading: isLoadingTop } = useQuery({
    queryKey: ['/api/politicians/top'],
    refetchOnWindowFocus: false,
  });
  
  const { data: allPoliticians, isLoading: isLoadingAll } = useQuery({
    queryKey: ['/api/politicians'],
    refetchOnWindowFocus: false,
  });
  
  // Filter politicians based on search query
  const filteredPoliticians = allPoliticians?.politicians?.filter(
    (politician) => 
      politician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (politician.title && politician.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (politician.description && politician.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];
  
  // Render loading skeletons
  if (isLoadingTop || isLoadingAll) {
    return (
      <div className="container mx-auto py-8 dir-rtl">
        <h1 className="text-3xl font-bold mb-6 text-right">פוליטיקאים</h1>
        
        <div className="mb-6">
          <div className="relative">
            <Skeleton className="h-10 w-full mb-4" />
          </div>
        </div>
        
        <Skeleton className="h-12 w-[300px] mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 dir-rtl">
      <h1 className="text-3xl font-bold mb-6 text-right">פוליטיקאים</h1>
      
      <div className="mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="חיפוש פוליטיקאים..."
            className="pl-10 dir-rtl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <Tabs defaultValue="top" className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="top">מדורגים מובילים</TabsTrigger>
          <TabsTrigger value="all">כל הפוליטיקאים</TabsTrigger>
        </TabsList>
        
        <TabsContent value="top" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPoliticians?.politicians?.map((politician) => (
              <PoliticianCard 
                key={politician.id} 
                politician={politician} 
              />
            ))}
            
            {topPoliticians?.politicians?.length === 0 && (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">לא נמצאו פוליטיקאים מדורגים</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => window.location.href = "/api/fetch-political-news"}
                >
                  טען חדשות פוליטיות
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchQuery 
              ? (filteredPoliticians.length > 0 
                  ? filteredPoliticians.map((politician) => (
                      <PoliticianCard 
                        key={politician.id} 
                        politician={politician} 
                      />
                    ))
                  : <div className="col-span-3 text-center py-8">
                      <p className="text-gray-500">לא נמצאו תוצאות ל "{searchQuery}"</p>
                    </div>
                )
              : allPoliticians?.politicians?.map((politician) => (
                  <PoliticianCard 
                    key={politician.id} 
                    politician={politician} 
                  />
                ))
            }
            
            {allPoliticians?.politicians?.length === 0 && (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">לא נמצאו פוליטיקאים</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => window.location.href = "/api/fetch-political-news"}
                >
                  טען חדשות פוליטיות
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
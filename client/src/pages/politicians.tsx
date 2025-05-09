import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import PoliticianCard from "@/components/politicians/PoliticianCard";
import { Search, User, UserPlus, Users } from "lucide-react";

export default function PoliticiansPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: topPoliticians, isLoading: isLoadingTop } = useQuery({
    queryKey: ['/api/politicians/top'],
    refetchOnWindowFocus: false,
  });
  
  const { data: allPoliticians, isLoading: isLoadingAll } = useQuery({
    queryKey: ['/api/politicians'],
    refetchOnWindowFocus: false,
  });
  
  // Function to fetch a specific politician
  const fetchPolitician = async (name: string) => {
    setIsLoading(true);
    try {
      console.log(`Fetching politician: ${name}`);
      
      // First try the direct fetch-politician endpoint
      try {
        const response = await fetch(`/api/fetch-politician/${encodeURIComponent(name)}`);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Politician data:', data);
          
          toast({
            title: "הוספת פוליטיקאי",
            description: `${name} נוסף בהצלחה למאגר הפוליטיקאים`,
          });
          
          // Refresh the politicians lists
          queryClient.invalidateQueries({ queryKey: ['/api/politicians'] });
          queryClient.invalidateQueries({ queryKey: ['/api/politicians/top'] });
          
          return;
        }
      } catch (err) {
        console.error('Error with fetch-politician endpoint:', err);
      }
      
      // Fallback: Create politician directly with manual POST
      console.log('Using fallback method to create politician');
      const createResponse = await fetch('/api/politicians', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          title: "פוליטיקאי ישראלי",
          description: `פוליטיקאי ישראלי בשם ${name}`,
          imageUrl: null
        }),
      });
      
      if (!createResponse.ok) {
        throw new Error(`Failed to create politician: ${createResponse.statusText}`);
      }
      
      const createData = await createResponse.json();
      console.log('Created politician:', createData);
      
      // Add an initial rating
      await fetch(`/api/politicians/${createData.politician.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: 3,
          comment: "דירוג ראשוני"
        }),
      });
      
      toast({
        title: "הוספת פוליטיקאי",
        description: `${name} נוסף בהצלחה למאגר הפוליטיקאים`,
      });
      
      // Refresh the politicians lists
      queryClient.invalidateQueries({ queryKey: ['/api/politicians'] });
      queryClient.invalidateQueries({ queryKey: ['/api/politicians/top'] });
      
    } catch (error) {
      console.error('Error fetching politician:', error);
      toast({
        title: "שגיאה",
        description: `לא ניתן היה להוסיף את ${name}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
      
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2" 
          onClick={() => fetchPolitician("בנימין נתניהו")}
          disabled={isLoading}
        >
          <UserPlus className="h-4 w-4" />
          הוסף את בנימין נתניהו
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={() => fetchPolitician("יאיר לפיד")}
          disabled={isLoading}
        >
          <UserPlus className="h-4 w-4" />
          הוסף את יאיר לפיד
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={() => fetchPolitician("בני גנץ")}
          disabled={isLoading}
        >
          <UserPlus className="h-4 w-4" />
          הוסף את בני גנץ
        </Button>
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
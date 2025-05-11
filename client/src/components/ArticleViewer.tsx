import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function ArticleViewer() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const url = new URL(window.location.href).searchParams.get("url");

  // Go back to news feed
  const handleBack = () => {
    setLocation("/");
  };

  useEffect(() => {
    if (!url) {
      setError("No article URL provided");
      setLoading(false);
      return;
    }
  }, [url]);
  
  if (error) {
    return (
      <Card className="max-w-4xl mx-auto mt-8">
        <CardHeader>
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              className="p-2 mr-2" 
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-bold">Error</h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <Button className="mt-4" onClick={handleBack}>
            Back to News Feed
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-4 px-4 sm:px-0">
      <div className="mb-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to News
        </Button>
      </div>
      
      <Card className="overflow-hidden mb-8">
        <CardContent className="p-0">
          {loading && (
            <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          {url && (
            <iframe 
              src={url} 
              title="Article Content" 
              className="w-full h-screen border-0"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError("Failed to load the article");
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
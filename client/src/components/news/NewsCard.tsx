import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { TopicWithArticles } from "@shared/schema";
import PoliticianCard from "@/components/politicians/PoliticianCard";
import { Newspaper } from "lucide-react";

interface NewsCardProps {
  topic: TopicWithArticles;
}

export default function NewsCard({ topic }: NewsCardProps) {
  // Find an article with an image
  const articlesWithImages = (topic.articles || []).filter(article => article?.imageUrl);
  const imageUrl = articlesWithImages.length > 0 
    ? articlesWithImages[0].imageUrl 
    : null;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {imageUrl ? (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={topic.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Replace broken images with a placeholder
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loops
              target.src = 'https://via.placeholder.com/400x200?text=תמונה+לא+זמינה';
            }}
          />
        </div>
      ) : (
        // Placeholder for when no image is available
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
          <Newspaper className="h-16 w-16 text-gray-300" />
        </div>
      )}
      
      <CardContent className="p-4">
        <h3 className="text-xl font-bold mb-2 text-right">{topic.title}</h3>
        
        <p className="text-gray-700 mb-3 line-clamp-3 text-right">
          {topic.summary}
        </p>
        
        {topic.politicians && topic.politicians.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <h4 className="font-semibold mb-2 text-right">פוליטיקאים בכתבה</h4>
            
            <div className="flex flex-wrap gap-2 mb-3 justify-end">
              {topic.politicians.map((politician) => (
                <PoliticianCard 
                  key={politician.id} 
                  politician={politician}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-2">
          <Link href={`/topic/${topic.id}`}>
            <div className="text-primary text-sm text-right w-full hover:underline">
              לכתבה המלאה
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

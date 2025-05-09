import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { TopicWithArticles } from "@shared/schema";
import PoliticianCard from "@/components/politicians/PoliticianCard";

interface NewsCardProps {
  topic: TopicWithArticles;
}

export default function NewsCard({ topic }: NewsCardProps) {
  // Use the first article's image (if available)
  const mainArticle = topic.articles[0];
  const imageUrl = mainArticle?.imageUrl;
  
  return (
    <Card className="overflow-hidden">
      {imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={topic.title}
            className="w-full h-full object-cover"
          />
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
            <div className="text-primary text-sm text-right w-full">
              לכתבה המלאה
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

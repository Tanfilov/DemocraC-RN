import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, Share, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Politician, TopicWithArticles } from "@shared/schema";
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
        <div className="flex items-center mb-3">
          <Badge 
            className={`bg-category-${topic.category} hover:bg-category-${topic.category}`}
          >
            {topic.category.charAt(0).toUpperCase() + topic.category.slice(1)}
          </Badge>
          <span className="ml-auto text-sm text-gray-500">
            {formatDistanceToNow(new Date(topic.updatedAt), { addSuffix: true })} • {topic.articles.length} sources
          </span>
        </div>
        
        <h3 className="text-xl font-bold mb-2">{topic.title}</h3>
        
        <p className="text-gray-700 mb-3 line-clamp-3">
          {topic.summary}
        </p>
        
        {topic.politicians.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <h4 className="font-semibold mb-2">Mentioned Politicians</h4>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {topic.politicians.slice(0, 2).map((politician) => (
                <PoliticianCard 
                  key={politician.id} 
                  politician={politician}
                  compact
                />
              ))}
              
              {topic.politicians.length > 2 && (
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <span>+{topic.politicians.length - 2} more</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-2">
          <Link href={`/topic/${topic.id}`}>
            <Button variant="link" className="p-0 h-auto">
              <ExternalLink className="mr-1 h-4 w-4" />
              <span className="text-sm">View Full Story</span>
            </Button>
          </Link>
          
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

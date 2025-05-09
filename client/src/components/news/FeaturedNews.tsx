import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, Share, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopicWithArticles } from "@shared/schema";
import PoliticianCard from "@/components/politicians/PoliticianCard";

interface FeaturedNewsProps {
  topic: TopicWithArticles;
}

export default function FeaturedNews({ topic }: FeaturedNewsProps) {
  // Use the first article's image (if available)
  const mainArticle = topic.articles[0];
  const imageUrl = mainArticle?.imageUrl;
  
  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={topic.title}
          className="w-full h-64 object-cover"
        />
      )}
      
      <div className="p-5">
        <div className="flex items-center mb-4">
          <Badge 
            className={`bg-category-${topic.category} hover:bg-category-${topic.category}`}
          >
            {topic.category.charAt(0).toUpperCase() + topic.category.slice(1)}
          </Badge>
          <span className="ml-auto text-sm text-gray-500">
            {formatDistanceToNow(new Date(topic.updatedAt), { addSuffix: true })} • {topic.articles.length} sources
          </span>
        </div>
        
        <h3 className="text-2xl font-bold mb-3">{topic.title}</h3>
        
        <p className="text-gray-700 mb-4">
          {topic.summary}
        </p>
        
        <div className="mb-4 flex flex-wrap gap-2">
          {topic.category === "politics" && (
            <>
              <Badge variant="outline">Infrastructure</Badge>
              <Badge variant="outline">Senate</Badge>
              <Badge variant="outline">Bipartisan</Badge>
            </>
          )}
          {topic.category === "technology" && (
            <>
              <Badge variant="outline">AI Ethics</Badge>
              <Badge variant="outline">Innovation</Badge>
              <Badge variant="outline">Big Tech</Badge>
            </>
          )}
          {topic.category === "business" && (
            <>
              <Badge variant="outline">Economy</Badge>
              <Badge variant="outline">Interest Rates</Badge>
              <Badge variant="outline">Markets</Badge>
            </>
          )}
          {topic.category === "entertainment" && (
            <>
              <Badge variant="outline">Film Festival</Badge>
              <Badge variant="outline">Culture</Badge>
              <Badge variant="outline">Events</Badge>
            </>
          )}
        </div>
        
        {topic.politicians.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-semibold mb-2">Mentioned Politicians</h4>
            
            <div className="flex flex-wrap gap-4">
              {topic.politicians.map((politician) => (
                <PoliticianCard 
                  key={politician.id} 
                  politician={politician}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 flex justify-between">
          <Link href={`/topic/${topic.id}`}>
            <Button variant="link" className="p-0 h-auto">
              <ExternalLink className="mr-1 h-4 w-4" />
              <span>View Full Story</span>
            </Button>
          </Link>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="icon">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

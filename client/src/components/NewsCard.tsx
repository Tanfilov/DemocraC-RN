import { NewsItem } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";
import { Link } from "wouter";

interface NewsCardProps {
  article: NewsItem;
}

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <div className="mobile-card">
      {article.imageUrl && (
        <div>
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            style={{
              width: "100%",
              height: "300px",
              objectFit: "cover",
              display: "block",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px"
            }} 
          />
        </div>
      )}
      <div className="p-4 text-right">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 ml-1" />
            {article.formattedDate}
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Ynet חדשות
          </Badge>
        </div>
        <h3 className="font-bold text-xl mb-2">{article.title}</h3>
        {/* Process description to remove the small image */}
        <div 
          className="text-sm text-muted-foreground mb-4" 
          dangerouslySetInnerHTML={{ 
            __html: article.description
              .replace(/<div>[\s\S]*?<img[\s\S]*?<\/div>/, '') // Remove entire div with image
              .replace(/<img[^>]*>/g, '') // Remove any remaining img tags
          }} 
        />
        <a 
          href={article.link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block w-full"
        >
          <Button 
            variant="default" 
            className="mobile-button flex items-center justify-center gap-2"
          >
            קריאה באתר
            <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
      </div>
    </div>
  );
}
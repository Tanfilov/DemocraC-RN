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
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
      {article.imageUrl && (
        <div className="w-full overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="article-image" 
          />
        </div>
      )}
      <CardHeader className="pb-2 text-right">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 ml-1" />
            {article.formattedDate}
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Ynet חדשות
          </Badge>
        </div>
        <h3 className="font-bold text-lg">{article.title}</h3>
      </CardHeader>
      <CardContent className="py-2 flex-grow text-right">
        <div 
          className="text-sm text-muted-foreground" 
          dangerouslySetInnerHTML={{ __html: article.description }} 
        />
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-center">
        <a href={article.link} target="_blank" rel="noopener noreferrer" className="inline-block">
          <Button variant="default" className="flex items-center gap-1 px-6">
            קריאה באתר
            <ExternalLink className="h-4 w-4 mr-1" />
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
import { NewsItem } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, ExternalLink } from "lucide-react";
import { Link } from "wouter";

interface NewsCardProps {
  article: NewsItem;
}

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
      {article.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300" 
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Ynet News
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {article.formattedDate}
          </div>
        </div>
        <h3 className="font-bold text-lg">{article.title}</h3>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <div 
          className="text-sm text-muted-foreground" 
          dangerouslySetInnerHTML={{ __html: article.description }} 
        />
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Link href={`/article?url=${encodeURIComponent(article.link)}`}>
          <Button variant="default" size="sm" className="flex items-center gap-1">
            Read More
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <a href={article.link} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            Source
            <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
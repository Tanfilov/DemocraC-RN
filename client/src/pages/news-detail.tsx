import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { NewsArticle, TopicWithArticles } from "@shared/schema";
import PoliticianCard from "@/components/politicians/PoliticianCard";

export default function NewsDetail() {
  const [, params] = useRoute("/topic/:id");
  const topicId = params?.id ? parseInt(params.id) : 0;
  
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/topics/${topicId}`],
    enabled: !!topicId,
  });
  
  const topic = data?.topic as TopicWithArticles | undefined;
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-96 w-full mb-6" />
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  
  if (error || !topic) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">שגיאה בטעינת הכתבה</h1>
            <p className="text-gray-600 mb-4 text-right">
              לא ניתן לטעון את הכתבה. ייתכן שהנושא הוסר או שאירעה שגיאה.
            </p>
            <Link href="/political-news">
              <div className="flex justify-center cursor-pointer text-primary">
                <ArrowRight className="ml-2 h-4 w-4" />
                <span>חזרה לעמוד הראשי</span>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const mainArticle = topic.articles[0];
  const relatedArticles = topic.articles.slice(1);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <Link href="/political-news">
        <div className="mb-4 flex items-center cursor-pointer text-primary">
          <ArrowRight className="ml-2 h-4 w-4" />
          <span>חזרה לכל הכתבות</span>
        </div>
      </Link>
      
      <article className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        {mainArticle.imageUrl && (
          <img 
            src={mainArticle.imageUrl} 
            alt={topic.title}
            className="w-full h-64 object-cover"
          />
        )}
        
        <div className="p-5">
          <h1 className="text-2xl font-bold mb-3 text-right">{topic.title}</h1>
          
          <p className="text-gray-700 mb-4 text-right">{mainArticle.content}</p>
          
          {/* Display politicians mentioned in this topic */}
          {topic.politicians && topic.politicians.length > 0 && (
            <div className="border-t border-gray-100 pt-4 mb-4">
              <h2 className="font-semibold mb-3 text-right">פוליטיקאים שהוזכרו בכתבה</h2>
              <div className="flex flex-wrap gap-4 justify-end">
                {topic.politicians.map(politician => (
                  <PoliticianCard 
                    key={politician.id} 
                    politician={politician}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 text-left">
            <a 
              href={mainArticle.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary"
            >
              מקור הכתבה המלא
            </a>
          </div>
        </div>
      </article>
      
      {/* Related articles from other sources */}
      {relatedArticles.length > 0 && (
        <div className="mt-6">
          <h2 className="font-bold text-xl mb-4 text-right">כתבות נוספות בנושא</h2>
          <div className="space-y-4">
            {relatedArticles.map(article => (
              <RelatedArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RelatedArticleCard({ article }: { article: NewsArticle }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            {article.source}
          </span>
        </div>
        <h3 className="font-semibold mb-2 text-right">{article.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2 text-right">{article.summary || article.content.substring(0, 120) + '...'}</p>
        <div className="text-left">
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary text-sm"
          >
            מקור הכתבה
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

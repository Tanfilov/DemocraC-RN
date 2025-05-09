import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, Share, Clock, Globe } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
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
            <h1 className="text-2xl font-bold mb-4">Error Loading Article</h1>
            <p className="text-gray-600 mb-4">
              We couldn't load this article. The topic may have been removed or an error occurred.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
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
      <Link href="/">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Top Stories
        </Button>
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <main className="lg:col-span-8">
          <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            {mainArticle.imageUrl && (
              <img 
                src={mainArticle.imageUrl} 
                alt={mainArticle.title}
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
                <span className="ml-auto text-sm text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(new Date(mainArticle.publishedAt), { addSuffix: true })} 
                  • {topic.articles.length} sources
                </span>
              </div>
              
              <h1 className="text-2xl font-bold mb-3">{topic.title}</h1>
              
              <p className="text-gray-700 mb-4">{topic.summary}</p>
              
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
              
              {/* Display politicians mentioned in this topic */}
              {topic.politicians.length > 0 && (
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <h2 className="font-semibold mb-3">Mentioned Politicians</h2>
                  <div className="flex flex-wrap gap-4">
                    {topic.politicians.map(politician => (
                      <PoliticianCard 
                        key={politician.id} 
                        politician={politician} 
                        compact
                      />
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex justify-between">
                <a 
                  href={mainArticle.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-primary"
                >
                  <Globe className="mr-1 h-4 w-4" />
                  <span>View Original Source</span>
                </a>
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
          
          {/* Related articles from other sources */}
          {relatedArticles.length > 0 && (
            <div className="mt-6">
              <h2 className="font-bold text-xl mb-4">Related Coverage</h2>
              <div className="space-y-4">
                {relatedArticles.map(article => (
                  <RelatedArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          )}
        </main>
        
        <aside className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
            <h2 className="font-bold text-lg mb-4">Sources Covering This Story</h2>
            <div className="space-y-3">
              {topic.articles.map(article => (
                <div key={article.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold">
                    {article.source.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{article.source}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="ml-auto text-primary text-sm"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <h2 className="font-bold text-lg mb-4">Trending Topics</h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer">AI Ethics</Badge>
                <Badge variant="outline" className="cursor-pointer">Infrastructure</Badge>
                <Badge variant="outline" className="cursor-pointer">Interest Rates</Badge>
                <Badge variant="outline" className="cursor-pointer">Climate Policy</Badge>
                <Badge variant="outline" className="cursor-pointer">Film Festival</Badge>
                <Badge variant="outline" className="cursor-pointer">Elections</Badge>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function RelatedArticleCard({ article }: { article: NewsArticle }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{article.source}</span>
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
          </span>
        </div>
        <h3 className="font-semibold mb-2">{article.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{article.summary || article.content.substring(0, 120) + '...'}</p>
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary text-sm inline-flex items-center"
        >
          <Globe className="mr-1 h-3 w-3" />
          Read full article
        </a>
      </CardContent>
    </Card>
  );
}

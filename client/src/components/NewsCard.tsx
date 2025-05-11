import { NewsItem } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, ExternalLink, User, Users } from "lucide-react";
import { Link } from "wouter";
import { PoliticianMention } from "@/lib/types";
import PoliticianCard from "./PoliticianCard";
import { useState, useEffect, useRef } from "react";
import PoliticianRatingModal from "./PoliticianRatingModal";

interface EnhancedNewsItem extends NewsItem {
  politicians?: PoliticianMention[];
  source?: string; // Source of the news (Ynet, Mako, etc.)
}

interface NewsCardProps {
  article: EnhancedNewsItem;
}

export default function NewsCard({ article }: NewsCardProps) {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const wasArticleViewed = useRef(false);
  
  // Listen for visibility changes and hash changes to detect when user returns from article
  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    
    // Generate a unique ID for this article
    const articleId = article.guid || article.link;
    const hashedArticleId = btoa(articleId).replace(/=/g, '').substring(0, 10);
    
    const handleVisibilityChange = () => {
      // If the user comes back to our app and had viewed an article
      if (
        document.visibilityState === 'visible' && 
        wasArticleViewed.current &&
        article.politicians?.length
      ) {
        // Wait a short time before showing the modal to ensure the app is visible
        setTimeout(() => {
          setShowRatingModal(true);
          // Reset the viewed flag after showing the modal
          wasArticleViewed.current = false;
        }, 300);
      }
    };
    
    // Also listen for popstate events (browser back button)
    const handlePopState = () => {
      const hash = window.location.hash;
      // Check if this is returning from this specific article
      if (hash === `#return-from-${hashedArticleId}` && article.politicians?.length) {
        // Remove the hash so refreshing won't trigger the modal again
        history.replaceState(null, document.title, window.location.pathname);
        // Show the rating modal
        setTimeout(() => {
          setShowRatingModal(true);
          wasArticleViewed.current = false;
        }, 300);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);
    
    // Check on mount if we're returning from an article
    handlePopState();
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [article.politicians, article.guid, article.link]);
  
  const handleArticleClick = () => {
    // Set the flag when the user clicks to view an article
    wasArticleViewed.current = true;
    
    // Generate a unique ID for this article
    const articleId = article.guid || article.link;
    const hashedArticleId = btoa(articleId).replace(/=/g, '').substring(0, 10);
    
    // Set window.location.hash to identify this article when returning
    if (typeof window !== 'undefined' && article.politicians?.length) {
      // Set a temporary hash that we'll check for when the user comes back
      sessionStorage.setItem('lastViewedArticle', `return-from-${hashedArticleId}`);
      // After a short delay (to ensure sessionStorage is set)
      setTimeout(() => {
        window.location.hash = `return-from-${hashedArticleId}`;
      }, 50);
    }
  };
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
            {article.source?.split(' ')[0] || 'חדשות'}
          </Badge>
        </div>
        <h3 
          className="font-bold text-xl mb-2" 
          style={{ 
            fontWeight: 700, 
            lineHeight: 1.2,
            fontSize: '1.35rem'
          }}
        >
          {article.title}
        </h3>
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
          onClick={handleArticleClick}
        >
          <Button 
            variant="default" 
            className="mobile-button flex items-center justify-center gap-2"
          >
            קריאה באתר
            <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
        
        {/* Rating modal that appears when user returns from article */}
        {article.politicians && article.politicians.length > 0 && (
          <PoliticianRatingModal
            politicians={article.politicians}
            isOpen={showRatingModal}
            onClose={() => setShowRatingModal(false)}
          />
        )}

        {/* Politicians mentioned in the article */}
        {article.politicians && article.politicians.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <div className="flex items-center text-sm font-semibold mb-2 gap-1 text-right">
              <Users className="h-4 w-4 ml-1" />
              פוליטיקאים שמוזכרים בכתבה:
            </div>
            <div className="space-y-2">
              {article.politicians.map((politician) => (
                <PoliticianCard 
                  key={politician.politicianId} 
                  politician={{
                    id: politician.politicianId,
                    name: politician.name,
                    party: politician.party,
                    position: politician.position,
                    imageUrl: politician.imageUrl,
                    rating: politician.rating || 0,
                    mentionCount: 0
                  }} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
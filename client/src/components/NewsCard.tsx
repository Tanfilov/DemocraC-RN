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
  // State to track if article should be shown in condensed view
  const [isCondensed, setIsCondensed] = useState(false);
  // Function to toggle between condensed and expanded view
  const toggleCondensed = () => {
    setIsCondensed(!isCondensed);
  };
  
  // Check if article was already read or rated when component mounts
  useEffect(() => {
    const articleId = article.guid || article.link;
    // Check localStorage to see if this article was read or rated
    const articleRatedKey = `rated-politicians-${articleId}`;
    const readArticlesKey = `read-articles`;
    
    // Get read articles from localStorage
    const readArticles = JSON.parse(localStorage.getItem(readArticlesKey) || '[]');
    const hasBeenRead = readArticles.includes(articleId);
    
    // Get rated politicians for this article from localStorage
    const ratedPoliticians = localStorage.getItem(articleRatedKey);
    const hasRatedPoliticians = ratedPoliticians ? JSON.parse(ratedPoliticians).length > 0 : false;
    
    // Set condensed view if article has been read or rated
    setIsCondensed(hasBeenRead || hasRatedPoliticians);
  }, [article.guid, article.link]);
  
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
        wasArticleViewed.current
      ) {
        // Mark this article as read
        const readArticlesKey = `read-articles`;
        const readArticles = JSON.parse(localStorage.getItem(readArticlesKey) || '[]');
        if (!readArticles.includes(articleId)) {
          readArticles.push(articleId);
          localStorage.setItem(readArticlesKey, JSON.stringify(readArticles));
          // Set to condensed view since it's been read
          setIsCondensed(true);
        }
        
        // Only show rating modal if there are politicians to rate
        if (article.politicians?.length) {
          // Check if the user has already rated politicians in this article
          const articleRatedKey = `rated-politicians-${article.guid}`;
          const ratedPoliticians = localStorage.getItem(articleRatedKey);
          const hasRatedBefore = ratedPoliticians ? JSON.parse(ratedPoliticians).length > 0 : false;
          
          // Only show the modal if the user hasn't rated any politicians in this article
          if (!hasRatedBefore) {
            // Wait a short time before showing the modal to ensure the app is visible
            setTimeout(() => {
              setShowRatingModal(true);
              // Reset the viewed flag after showing the modal
              wasArticleViewed.current = false;
            }, 300);
          } else {
            // If already rated, just reset the flag without showing the modal
            wasArticleViewed.current = false;
          }
        } else {
          // No politicians to rate, just reset the viewed flag
          wasArticleViewed.current = false;
        }
      }
    };
    
    // Also listen for popstate events (browser back button)
    const handlePopState = () => {
      const hash = window.location.hash;
      // Check if this is returning from this specific article
      if (hash === `#return-from-${hashedArticleId}`) {
        // Remove the hash so refreshing won't trigger the modal again
        history.replaceState(null, document.title, window.location.pathname);
        
        // Mark this article as read
        const readArticlesKey = `read-articles`;
        const readArticles = JSON.parse(localStorage.getItem(readArticlesKey) || '[]');
        if (!readArticles.includes(articleId)) {
          readArticles.push(articleId);
          localStorage.setItem(readArticlesKey, JSON.stringify(readArticles));
          // Set to condensed view since it's been read
          setIsCondensed(true);
        }
        
        // Only show rating modal if there are politicians to rate
        if (article.politicians?.length) {
          // Check if the user has already rated politicians in this article
          const articleRatedKey = `rated-politicians-${article.guid}`;
          const ratedPoliticians = localStorage.getItem(articleRatedKey);
          const hasRatedBefore = ratedPoliticians ? JSON.parse(ratedPoliticians).length > 0 : false;
          
          // Only show the modal if the user hasn't rated any politicians in this article
          if (!hasRatedBefore) {
            setTimeout(() => {
              setShowRatingModal(true);
              wasArticleViewed.current = false;
            }, 300);
          } else {
            // If already rated, just reset the flag without showing the modal
            wasArticleViewed.current = false;
          }
        } else {
          // No politicians to rate, just reset the viewed flag
          wasArticleViewed.current = false;
        }
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
    <div 
      className={`mobile-card bg-white dark:bg-slate-900 dark:border-slate-800 
        ${isCondensed ? 'condensed-card border-r-4 border-primary border-opacity-50 dark:border-opacity-30 shadow-sm cursor-pointer' : 'shadow-md'}`}
      onClick={isCondensed ? toggleCondensed : undefined}>
      
      {/* Show image only in full view */}
      {!isCondensed && article.imageUrl && (
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
      
      <div className={`${isCondensed ? 'p-3' : 'p-4'} text-right`}>
        {/* Header with date and source badge */}
        <div className="flex justify-between items-center mb-2">
          {!isCondensed && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 ml-1" />
              {article.formattedDate}
            </div>
          )}
          <Badge 
            variant="outline" 
            className={`${isCondensed ? 'text-xs' : ''} bg-primary/10 text-primary dark:bg-primary/20`}
          >
            {article.source?.split(' ')[0] || 'חדשות'}
          </Badge>
        </div>
        
        {/* Title - smaller in condensed view */}
        <h3 
          className={`font-bold ${isCondensed ? 'text-lg mb-1' : 'text-xl mb-2'} text-gray-900 dark:text-gray-100`} 
          style={{ 
            fontWeight: 700, 
            lineHeight: 1.2,
            fontSize: isCondensed ? '1.15rem' : '1.35rem'
          }}
        >
          {article.title}
        </h3>
        
        {/* Description - only shown in full view */}
        {!isCondensed && (
          <div 
            className="text-sm md:text-sm text-base text-muted-foreground mb-4 dark:text-gray-400" 
            style={{ fontSize: 'clamp(1rem, 4vw, 1.125rem)' }} // Responsive font size, larger on mobile
            dangerouslySetInnerHTML={{ 
              __html: article.description
                .replace(/<div>[\s\S]*?<img[\s\S]*?<\/div>/, '') // Remove entire div with image
                .replace(/<img[^>]*>/g, '') // Remove any remaining img tags
            }} 
          />
        )}
        
        {/* Read on website button - only shown in expanded view */}
        {!isCondensed && (
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
        )}
        
        {/* Rating modal that appears when user returns from article */}
        {article.politicians && article.politicians.length > 0 && (
          <PoliticianRatingModal
            politicians={article.politicians}
            isOpen={showRatingModal}
            onClose={() => setShowRatingModal(false)}
            articleId={article.guid}
          />
        )}

        {/* Politicians mentioned in the article */}
        {article.politicians && article.politicians.length > 0 && (
          <div className={`${isCondensed ? 'mt-2' : 'mt-4'} border-t dark:border-slate-700 pt-2`}>
            {!isCondensed && (
              <div className="flex items-center text-sm font-semibold mb-2 gap-1 text-right dark:text-gray-300">
                <Users className="h-4 w-4 ml-1" />
                פוליטיקאים שמוזכרים בכתבה:
              </div>
            )}
            <div className={`${isCondensed ? 'flex flex-wrap gap-2 mt-1' : 'space-y-2'}`}>
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
                  articleId={article.guid}
                  isCondensed={isCondensed}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
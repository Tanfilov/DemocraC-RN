import { useState, useEffect } from 'react';
import { Politician } from '@/lib/types';
import StarRating from './StarRating';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Pencil, Star, Award, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PoliticianRatingModal from './PoliticianRatingModal';

interface PoliticianCardProps {
  politician: Politician;
  articleId: string; // Add articleId to track ratings per article
}

export default function PoliticianCard({ politician, articleId }: PoliticianCardProps) {
  // Using separate states for user's rating and average community rating
  const [averageRating, setAverageRating] = useState(politician.rating || 0);
  const [userRating, setUserRating] = useState(0);
  const [wasRated, setWasRated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const queryClient = useQueryClient();
  
  // State for the rating modal
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Track if this politician was rated in this article specifically
  const [showRatingInArticle, setShowRatingInArticle] = useState(false);
  
  // Force re-render when politician data changes and handle rating management
  useEffect(() => {
    console.log(`Politician ${politician.id} has rating: ${politician.rating}`);
  
    // Check if this politician was rated by the user in this specific article
    const articleRatedKey = `rated-politicians-${articleId}`;
    const ratedPoliticians = localStorage.getItem(articleRatedKey);
    let wasRatedLocally = false;
    
    if (ratedPoliticians) {
      try {
        const parsedRated = JSON.parse(ratedPoliticians);
        wasRatedLocally = parsedRated.includes(politician.id);
        setWasRated(wasRatedLocally);
        
        // If the user has rated this politician in this article, show the rating
        // Otherwise, don't show any rating (will show stars to let user rate)
        setShowRatingInArticle(wasRatedLocally);
      } catch (e) {
        console.error('Error parsing rated politicians', e);
      }
    }
    
    // Set the average rating from the server
    if (politician.rating && politician.rating > 0) {
      setAverageRating(politician.rating);
    }
    
    // Only if the user has already rated this politician in this article
    if (wasRatedLocally) {
      try {
        // Get the user's personal rating from article-specific local storage
        const articleRatingsKey = `politician-ratings-${articleId}`;
        const storedRatings = localStorage.getItem(articleRatingsKey);
        if (storedRatings) {
          const parsedRatings = JSON.parse(storedRatings);
          if (parsedRatings[politician.id]) {
            setUserRating(parsedRatings[politician.id]);
          }
        }
      } catch (e) {
        console.error('Error loading stored ratings', e);
      }
    } else {
      // For unrated politicians, just set user rating to 0
      setUserRating(0);
    }
  }, [politician.id, politician.rating]);

  // Mutation for rating a politician
  const mutation = useMutation({
    mutationFn: async (rating: number) => {
      return apiRequest(
        'POST',
        `/api/politicians/${politician.id}/rate`, 
        { rating, articleId }
      );
    },
    onSuccess: (data) => {
      // Show animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
      
      // Force a reload of news data to update all instances of this politician
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/news'] });
        
        // Make sure the parent components re-render
        queryClient.refetchQueries({ queryKey: ['/api/news'] });
      }, 300); // Short delay to ensure UI feedback comes first
    },
    onError: (error) => {
      console.error('Failed to rate politician:', error);
      // Revert to the previous ratings if there was an error
      setAverageRating(politician.rating || 0);
      
      try {
        const articleRatingsKey = `politician-ratings-${articleId}`;
        const storedRatings = localStorage.getItem(articleRatingsKey);
        if (storedRatings) {
          const parsedRatings = JSON.parse(storedRatings);
          if (parsedRatings[politician.id]) {
            setUserRating(parsedRatings[politician.id]);
          } else {
            setUserRating(0);
          }
        }
      } catch (e) {
        console.error('Error loading stored ratings', e);
        setUserRating(0);
      }
    },
  });

  const handleRatingChange = (newRating: number) => {
    // Always show the modal when clicking on stars, whether it's first rating or changing existing rating
    setShowRatingModal(true);
    return;
  };
  
  // Handle after modal rating
  const handleAfterModalRating = () => {
    setShowRatingModal(false);
    setWasRated(true);
    setShowRatingInArticle(true);
    
    // Force refresh
    queryClient.invalidateQueries({ queryKey: ['/api/news'] });
  };

  return (
    <>
      <div className={`flex flex-col items-start mt-2 p-3 rounded-md transition-all 
        ${wasRated 
          ? 'bg-amber-50 border border-amber-100 dark:bg-amber-900/30 dark:border-amber-800' 
          : 'bg-gray-100 dark:bg-slate-700'} 
        ${isAnimating ? 'scale-105' : ''}`}
      >
        <div className="flex items-center gap-2 w-full">
          <div className="relative">
            {politician.imageUrl && (
              <img
                src={politician.imageUrl}
                alt={politician.name}
                className={`w-10 h-10 rounded-lg object-cover border 
                  ${wasRated 
                    ? 'border-amber-200 dark:border-amber-700' 
                    : 'border-gray-200 dark:border-slate-700'}`
                }
              />
            )}
            {wasRated && (
              <div className="absolute -top-2 -right-2 bg-amber-100 dark:bg-amber-800 rounded-full p-0.5 border border-amber-200 dark:border-amber-700">
                <Star className={`h-3 w-3 ${userRating > 0 ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400' : 'text-amber-400 dark:text-amber-300'}`} />
              </div>
            )}
          </div>
          
          <div className="flex flex-col flex-grow">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm font-semibold flex items-center gap-1 dark:text-gray-200">
                {politician.name}
                {averageRating > 4 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Award className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">דירוג גבוה</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              <div className="text-xs">
                {showRatingInArticle && averageRating > 0 ? (
                  <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300 h-5 px-2 text-[10px]">
                    <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                    <span>דירוג ממוצע: {averageRating.toFixed(1)}</span>
                  </Badge>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">{politician.party}</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between w-full mt-1.5">
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[90px]">{politician.position}</div>
              
              {showRatingInArticle ? (
                // For rated politicians, show both ratings
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600 dark:text-gray-300">הדירוג שלך:</span>
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200 text-xs px-1.5">
                      {userRating.toFixed(1)}
                    </Badge>
                  </div>
                  <div 
                    className="cursor-pointer" 
                    onClick={() => setShowRatingModal(true)}
                    title="לחץ לשינוי הדירוג שלך"
                  >
                    <StarRating
                      rating={userRating}
                      onChange={handleRatingChange}
                      id={`politician-${politician.id}`}
                    />
                  </div>
                </div>
              ) : (
                // For unrated politicians, show empty stars
                <div className="cursor-pointer mt-1" onClick={() => setShowRatingModal(true)}>
                  <StarRating
                    rating={0}
                    onChange={handleRatingChange}
                    id={`politician-${politician.id}-unrated`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Rating modal for this politician */}
      <PoliticianRatingModal
        politicians={[{
          politicianId: politician.id,
          name: politician.name,
          party: politician.party,
          position: politician.position,
          imageUrl: politician.imageUrl,
          rating: userRating
        }]}
        isOpen={showRatingModal}
        onClose={handleAfterModalRating}
        articleId={articleId}
      />
    </>
  );
}
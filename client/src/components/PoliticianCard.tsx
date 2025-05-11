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
  isCondensed?: boolean; // Add prop for condensed view
}

export default function PoliticianCard({ politician, articleId, isCondensed = false }: PoliticianCardProps) {
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
      {/* Condensed View - for read articles */}
      {isCondensed && wasRated ? (
        <div 
          className="inline-flex items-center gap-1.5 p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-100 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          onClick={() => setShowRatingModal(true)}
        >
          {politician.imageUrl && (
            <img
              src={politician.imageUrl}
              alt={politician.name}
              className="w-5 h-5 rounded object-cover object-top"
            />
          )}
          <span className="text-xs font-medium text-amber-800 dark:text-amber-300">{politician.name}</span>
          <Badge className="h-4 text-[10px] px-1 bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200 flex items-center gap-0.5">
            <Star className="h-2 w-2 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400 inline-block" />
            {userRating.toFixed(1)}
          </Badge>
        </div>
      ) : (
        // Regular Full View
        <div className={`mt-2 p-3 rounded-md transition-all 
          ${wasRated 
            ? 'bg-amber-50 border border-amber-100 dark:bg-amber-900/30 dark:border-amber-800' 
            : 'bg-gray-100 dark:bg-slate-700'} 
          ${isAnimating ? 'scale-105' : ''}`}
        >
          {/* Top section with image and name */}
          <div className="flex items-center gap-4 mb-3 w-full">
            <div className="relative flex-shrink-0">
              {politician.imageUrl && (
                <img
                  src={politician.imageUrl}
                  alt={politician.name}
                  className={`w-16 h-16 rounded-lg object-cover object-top shadow-sm`}
                />
              )}
              {wasRated && (
                <div className="absolute -top-2 -right-2 bg-amber-100 dark:bg-amber-800 rounded-full p-0.5 border border-amber-200 dark:border-amber-700">
                  <Star className={`h-3 w-3 ${userRating > 0 ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400' : 'text-amber-400 dark:text-amber-300'}`} />
                </div>
              )}
            </div>
            
            <div className="flex flex-col flex-grow overflow-hidden">
              <div className="flex items-center gap-1 dark:text-gray-200">
                <span className="text-base font-semibold truncate">{politician.name}</span>
                {averageRating > 4 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Award className="h-3 w-3 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">דירוג גבוה</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              {/* Position */}
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate pr-1">{politician.position}</div>
            </div>
          </div>
          
          {/* Rating section */}
          <div className="mt-1 flex flex-wrap justify-end gap-2">
            {showRatingInArticle ? (
              // For rated politicians, show badges that open the rating modal when clicked
              <div 
                className="flex items-center flex-wrap justify-end gap-x-2 gap-y-1 w-full cursor-pointer" 
                onClick={() => setShowRatingModal(true)}
              >
                {/* Your rating */}
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 rounded-full px-2 py-0.5">
                  <span className="text-xs text-amber-700 dark:text-amber-300 whitespace-nowrap">הדירוג שלך:</span>
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200 text-xs px-1.5 flex items-center gap-1 hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                    {userRating.toFixed(1)}
                  </Badge>
                </div>
                
                {/* Average rating - only show if there's a value */}
                {averageRating > 0 && (
                  <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/30 rounded-full px-2 py-0.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">ממוצע:</span>
                    <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs px-1.5">
                      {averageRating.toFixed(1)}
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              // For unrated politicians, show empty stars
              <div className="cursor-pointer flex justify-center w-full" onClick={() => setShowRatingModal(true)}>
                <StarRating
                  rating={0}
                  onChange={handleRatingChange}
                  id={`politician-${politician.id}-unrated`}
                />
              </div>
            )}
          </div>
        </div>
      )}
      
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
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
}

export default function PoliticianCard({ politician }: PoliticianCardProps) {
  const [currentRating, setCurrentRating] = useState(politician.rating || 0);
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
  
    // Check if this politician was rated by the user
    const ratedPoliticians = localStorage.getItem('rated-politicians');
    let wasRatedLocally = false;
    
    if (ratedPoliticians) {
      try {
        const parsedRated = JSON.parse(ratedPoliticians);
        wasRatedLocally = parsedRated.includes(politician.id);
        setWasRated(wasRatedLocally);
        
        // If the user has rated this politician, show the overall average
        // Otherwise, don't show any rating (will show stars to let user rate)
        setShowRatingInArticle(wasRatedLocally);
      } catch (e) {
        console.error('Error parsing rated politicians', e);
      }
    }
    
    // Determine which rating to display (only if user has already rated)
    if (wasRatedLocally) {
      // Show server-side average rating (from all users)
      if (politician.rating && politician.rating > 0) {
        setCurrentRating(politician.rating);
      } else {
        // Fallback if no average rating is available yet
        try {
          const storedRatings = localStorage.getItem('politician-ratings');
          if (storedRatings) {
            const parsedRatings = JSON.parse(storedRatings);
            if (parsedRatings[politician.id]) {
              // Use the locally stored rating as fallback
              setCurrentRating(parsedRatings[politician.id]);
            }
          }
        } catch (e) {
          console.error('Error loading stored ratings', e);
        }
      }
    } else {
      // For unrated politicians, just set to 0 (will show empty stars)
      setCurrentRating(0);
    }
  }, [politician.id, politician.rating]);

  // Mutation for rating a politician
  const mutation = useMutation({
    mutationFn: async (rating: number) => {
      return apiRequest(
        'POST',
        `/api/politicians/${politician.id}/rate`, 
        { rating }
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
      // Revert to the previous rating if there was an error
      setCurrentRating(politician.rating || 0);
    },
  });

  const handleRatingChange = (newRating: number) => {
    // If the user hasn't rated this politician yet, show the modal instead
    if (!wasRated) {
      setShowRatingModal(true);
      return;
    }
    
    // Otherwise, proceed with direct rating (only for already rated politicians)
    setCurrentRating(newRating);
    
    // Store locally immediately (optimistic update)
    try {
      // Mark as rated
      const ratedPoliticians = JSON.parse(localStorage.getItem('rated-politicians') || '[]');
      if (!ratedPoliticians.includes(politician.id)) {
        ratedPoliticians.push(politician.id);
        localStorage.setItem('rated-politicians', JSON.stringify(ratedPoliticians));
        setWasRated(true);
        setShowRatingInArticle(true);
      }
      
      // Store the rating value
      const storedRatings = JSON.parse(localStorage.getItem('politician-ratings') || '{}');
      storedRatings[politician.id] = newRating;
      localStorage.setItem('politician-ratings', JSON.stringify(storedRatings));
      
      // Visual feedback
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    } catch (e) {
      console.error('Error storing rating locally', e);
    }
    
    // Send to server
    mutation.mutate(newRating);
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
      <div className={`flex flex-col items-start mt-2 p-3 rounded-md transition-all ${wasRated ? 'bg-amber-50 border border-amber-100' : 'bg-gray-100'} ${isAnimating ? 'scale-105' : ''}`}>
        <div className="flex items-center gap-2 w-full">
          <div className="relative">
            {politician.imageUrl && (
              <img
                src={politician.imageUrl}
                alt={politician.name}
                className={`w-10 h-10 rounded-lg object-cover border ${wasRated ? 'border-amber-200' : 'border-gray-200'}`}
              />
            )}
            {wasRated && (
              <div className="absolute -top-2 -right-2 bg-amber-100 rounded-full p-0.5 border border-amber-200">
                <Star className={`h-3 w-3 ${currentRating > 0 ? 'fill-amber-500 text-amber-500' : 'text-amber-400'}`} />
              </div>
            )}
          </div>
          
          <div className="flex flex-col flex-grow">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm font-semibold flex items-center gap-1">
                {politician.name}
                {currentRating > 4 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Award className="h-3 w-3 text-amber-500" />
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
                {showRatingInArticle && currentRating > 0 ? (
                  <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700 h-5 px-2 text-[10px]">
                    <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                    <span>{currentRating.toFixed(1)}</span>
                  </Badge>
                ) : (
                  <span className="text-gray-500">{politician.party}</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between w-full mt-1.5">
              <div className="text-xs text-gray-500 truncate max-w-[90px]">{politician.position}</div>
              
              {showRatingInArticle ? (
                // For rated politicians, show the star rating
                <StarRating
                  rating={currentRating}
                  onChange={handleRatingChange}
                  id={`politician-${politician.id}`}
                />
              ) : (
                // For unrated politicians, show a "Rate" button
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 text-xs text-muted-foreground hover:text-primary px-2"
                  onClick={() => setShowRatingModal(true)}
                >
                  <UserPlus className="h-3 w-3 ml-1" />
                  דרג
                </Button>
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
          rating: currentRating
        }]}
        isOpen={showRatingModal}
        onClose={handleAfterModalRating}
      />
    </>
  );
}
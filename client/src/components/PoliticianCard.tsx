import { useState, useEffect } from 'react';
import { Politician } from '@/lib/types';
import StarRating from './StarRating';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Star, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PoliticianCardProps {
  politician: Politician;
}

export default function PoliticianCard({ politician }: PoliticianCardProps) {
  const [currentRating, setCurrentRating] = useState(politician.rating || 0);
  const [wasRated, setWasRated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const queryClient = useQueryClient();

  // Check if this politician was previously rated
  useEffect(() => {
    // Check localStorage to see if this politician was rated by the user
    const ratedPoliticians = localStorage.getItem('rated-politicians');
    if (ratedPoliticians) {
      try {
        const parsedRated = JSON.parse(ratedPoliticians);
        setWasRated(parsedRated.includes(politician.id));
      } catch (e) {
        console.error('Error parsing rated politicians', e);
      }
    }
    
    // If the politician rating changes from outside
    setCurrentRating(politician.rating || 0);
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
      // Track that user rated this politician
      try {
        const ratedPoliticians = localStorage.getItem('rated-politicians') || '[]';
        const parsed = JSON.parse(ratedPoliticians);
        if (!parsed.includes(politician.id)) {
          parsed.push(politician.id);
          localStorage.setItem('rated-politicians', JSON.stringify(parsed));
          setWasRated(true);
        }
      } catch (e) {
        console.error('Error storing rated politicians', e);
      }
      
      // Show animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
      
      // Invalidate queries to refresh politician data
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
    },
    onError: (error) => {
      console.error('Failed to rate politician:', error);
      // Revert to the previous rating if there was an error
      setCurrentRating(politician.rating || 0);
    },
  });

  const handleRatingChange = (newRating: number) => {
    setCurrentRating(newRating);
    mutation.mutate(newRating);
  };

  return (
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
              {currentRating > 0 ? (
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
            <StarRating
              rating={currentRating}
              onChange={handleRatingChange}
              id={`politician-${politician.id}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
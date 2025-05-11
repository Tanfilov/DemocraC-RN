import { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Politician, PoliticianMention } from '@/lib/types';
import StarRating from './StarRating';
import { Award, Check, Star, ThumbsUp, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQueryClient } from '@tanstack/react-query';

interface PoliticianRatingModalProps {
  politicians: PoliticianMention[];
  isOpen: boolean;
  onClose: () => void;
  articleId: string; // Add articleId to track ratings per article
}

export default function PoliticianRatingModal({ 
  politicians, 
  isOpen, 
  onClose,
  articleId
}: PoliticianRatingModalProps) {
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const queryClient = useQueryClient();

  // Initialize ratings when politicians change
  useEffect(() => {
    const initialRatings: Record<number, number> = {};
    politicians.forEach(politician => {
      initialRatings[politician.politicianId] = politician.rating || 0;
    });
    setRatings(initialRatings);
  }, [politicians]);

  const handleRatingChange = (politicianId: number, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [politicianId]: rating
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Submit all ratings in parallel
      const promises = Object.entries(ratings)
        .filter(([_, rating]) => rating > 0) // Only submit if rating is greater than 0
        .map(([politicianId, rating]) => 
          fetch(`/api/politicians/${politicianId}/rate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rating, articleId })
          })
        );
      
      await Promise.all(promises);
      
      // Store ratings in localStorage to persist them
      try {
        // Use article-specific keys for localStorage
        const articleRatedKey = `rated-politicians-${articleId}`;
        const articleRatingsKey = `politician-ratings-${articleId}`;
        
        // Save each politician ID that was rated to localStorage for this specific article
        const ratedPoliticians = JSON.parse(localStorage.getItem(articleRatedKey) || '[]');
        
        Object.entries(ratings)
          .filter(([_, rating]) => rating > 0)
          .forEach(([politicianId]) => {
            const id = parseInt(politicianId, 10);
            if (!ratedPoliticians.includes(id)) {
              ratedPoliticians.push(id);
            }
          });
          
        localStorage.setItem(articleRatedKey, JSON.stringify(ratedPoliticians));
        
        // Also store the actual ratings for this specific article
        const storedRatings = JSON.parse(localStorage.getItem(articleRatingsKey) || '{}');
        Object.entries(ratings)
          .filter(([_, rating]) => rating > 0)
          .forEach(([politicianId, rating]) => {
            storedRatings[politicianId] = rating;
          });
          
        localStorage.setItem(articleRatingsKey, JSON.stringify(storedRatings));
      } catch (e) {
        console.error('Error storing rated politicians', e);
      }
      
      // Force data refresh by invalidating the news query
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      
      // Show animation without showing the separate success screen
      setSubmissionComplete(true);
      
      // Close the modal after the animation completes
      setTimeout(() => {
        onClose();
        // Reset states after closing
        setIsSubmitting(false);
        setSubmissionComplete(false);
      }, 1200); // Give enough time for animation to complete
    } catch (error) {
      console.error('Failed to submit ratings:', error);
      setIsSubmitting(false);
      // Close even on error after a short delay
      setTimeout(onClose, 1000);
    }
  };

  if (!isOpen || politicians.length === 0) return null;

  // Only show the first politician in the list for the streamlined UI
  const currentPolitician = politicians[0];
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md w-[90vw] max-h-[80vh] rounded-xl dark:bg-slate-900 dark:border-slate-700" dir="rtl">
        <DialogTitle className="text-lg font-medium pt-4 text-center dark:text-gray-100">
          איך הייתה מדרג את הפעילות שלו המתוארת בכתבה?
        </DialogTitle>
        
        <div className="py-4 mt-8">
          <div className="flex flex-col items-center gap-3">
            {currentPolitician.imageUrl && (
              <div className="relative">
                <img 
                  src={currentPolitician.imageUrl}
                  alt={currentPolitician.name}
                  className="h-20 w-20 rounded-full object-cover border border-muted dark:border-slate-600"
                />
              </div>
            )}
            <h3 className="text-xl font-bold text-center dark:text-gray-100">
              {currentPolitician.name}
            </h3>
            
            <div className="mt-2 py-4">
              <StarRating
                rating={ratings[currentPolitician.politicianId] || 0}
                onChange={(rating) => handleRatingChange(currentPolitician.politicianId, rating)}
                id={`modal-politician-${currentPolitician.politicianId}`}
                size="large"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-3 mt-6 mb-2">
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !ratings[currentPolitician.politicianId] || submissionComplete} 
            className={`w-[65%] h-12 [&:disabled]:opacity-90 
              ${submissionComplete ? 'submit-button-animation' : ''}
              ${!ratings[currentPolitician.politicianId] ? 'bg-primary/95 dark:bg-primary/80' : 'bg-primary dark:bg-primary/90'} 
              hover:bg-primary/90 dark:hover:bg-primary/80
              dark:text-white
              [&:disabled]:dark:bg-primary/70`}
          >
            {submissionComplete ? (
              <>
                <span className="submit-text">תודה!</span>
                <Check className="h-5 w-5 text-white check-icon" />
              </>
            ) : isSubmitting ? (
              <>שולח...</>
            ) : (
              <>
                <span>שלח</span>
                <ThumbsUp className="h-4 w-4 mr-1" />
              </>
            )}
          </Button>
          
          {!submissionComplete && (
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="w-[35%] h-12 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-800"
            >
              ביטול
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
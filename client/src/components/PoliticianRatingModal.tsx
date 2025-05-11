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
      
      // Show completion status briefly before closing
      setSubmissionComplete(true);
      setTimeout(() => {
        onClose();
        // Reset states after closing
        setIsSubmitting(false);
        setSubmissionComplete(false);
      }, 1500);
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
      <DialogContent className="sm:max-w-md w-[90vw] max-h-[80vh] rounded-xl" dir="rtl">
        <DialogTitle className="text-lg font-medium pt-4 text-center">
          איך הייתה מדרג את הפעילות שלו המתוארת בכתבה?
        </DialogTitle>
        
        {/* Success message */}
        {submissionComplete ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-4 mt-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">תודה על הדירוג!</h3>
          </div>
        ) : (
          <div className="py-4 mt-8">
            <div className="flex flex-col items-center gap-3">
              {currentPolitician.imageUrl && (
                <div className="relative">
                  <img 
                    src={currentPolitician.imageUrl}
                    alt={currentPolitician.name}
                    className="h-20 w-20 rounded-full object-cover border border-muted"
                  />
                </div>
              )}
              <h3 className="text-lg font-semibold text-center">
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
        )}

        <DialogFooter dir="rtl" className="flex gap-3 justify-between mt-6 mb-2">
          {!submissionComplete && (
            <>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !ratings[currentPolitician.politicianId]} 
                className="flex-[3] gap-1 h-12"
              >
                {isSubmitting ? (
                  <>שולח...</>
                ) : (
                  <>
                    שליחה
                    <ThumbsUp className="h-4 w-4 mr-1" />
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-[2] h-12">
                ביטול
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
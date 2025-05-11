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
            body: JSON.stringify({ rating })
          })
        );
      
      await Promise.all(promises);
      
      // Store ratings in localStorage to persist them
      try {
        // Save each politician ID that was rated to localStorage
        const ratedPoliticians = JSON.parse(localStorage.getItem('rated-politicians') || '[]');
        
        Object.entries(ratings)
          .filter(([_, rating]) => rating > 0)
          .forEach(([politicianId]) => {
            const id = parseInt(politicianId, 10);
            if (!ratedPoliticians.includes(id)) {
              ratedPoliticians.push(id);
            }
          });
          
        localStorage.setItem('rated-politicians', JSON.stringify(ratedPoliticians));
        
        // Also store the actual ratings
        const storedRatings = JSON.parse(localStorage.getItem('politician-ratings') || '{}');
        Object.entries(ratings)
          .filter(([_, rating]) => rating > 0)
          .forEach(([politicianId, rating]) => {
            storedRatings[politicianId] = rating;
          });
          
        localStorage.setItem('politician-ratings', JSON.stringify(storedRatings));
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 justify-center">
            <Award className="h-5 w-5 text-primary" />
            דרגו את הפוליטיקאים במאמר
          </DialogTitle>
          <DialogDescription className="text-center">
            התרשמתם מהפוליטיקאים שהוזכרו בכתבה? דרגו אותם עכשיו
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress indicator */}
        {!submissionComplete && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1 font-medium">
              <span>{Object.values(ratings).filter(r => r > 0).length} דורגו</span>
              <span>{politicians.length} סה"כ</span>
            </div>
            <Progress value={(Object.values(ratings).filter(r => r > 0).length / politicians.length) * 100} />
          </div>
        )}

        {/* Success message */}
        {submissionComplete ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">תודה על הדירוג!</h3>
            <p className="text-gray-500">הדירוגים שלך יעזרו לשפר את החוויה עבור כולם</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {politicians.map(politician => (
              <div 
                key={politician.politicianId} 
                className="flex flex-col gap-3 p-4 bg-muted/40 rounded-lg border border-muted"
              >
                <div className="flex items-center gap-3">
                  {politician.imageUrl && (
                    <div className="relative">
                      <img 
                        src={politician.imageUrl}
                        alt={politician.name}
                        className="h-16 w-16 rounded-lg object-cover border border-muted"
                      />
                      {politician.party && (
                        <Badge variant="secondary" className="absolute -bottom-2 start-1/2 -translate-x-1/2 text-xs whitespace-nowrap">
                          {politician.party}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{politician.name}</h3>
                    <p className="text-sm text-muted-foreground">{politician.position}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">דרג/י:</span>
                    {ratings[politician.politicianId] > 0 && (
                      <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>{ratings[politician.politicianId]}</span>
                      </Badge>
                    )}
                  </div>
                  <StarRating
                    rating={ratings[politician.politicianId] || 0}
                    onChange={(rating) => handleRatingChange(politician.politicianId, rating)}
                    id={`modal-politician-${politician.politicianId}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter dir="ltr" className="gap-2 sm:gap-0">
          {!submissionComplete && (
            <>
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                סגירה
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || Object.values(ratings).filter(r => r > 0).length === 0} 
                className="flex-1 sm:flex-none gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    שולח...
                  </>
                ) : (
                  <>
                    <ThumbsUp className="h-4 w-4" />
                    שליחת דירוגים
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
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
import { Users } from 'lucide-react';

interface PoliticianRatingModalProps {
  politicians: PoliticianMention[];
  isOpen: boolean;
  onClose: () => void;
}

export default function PoliticianRatingModal({ 
  politicians, 
  isOpen, 
  onClose 
}: PoliticianRatingModalProps) {
  const [ratings, setRatings] = useState<Record<number, number>>({});

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

  const handleSubmit = () => {
    // Submit all ratings
    Object.entries(ratings).forEach(([politicianId, rating]) => {
      // Only submit if rating is greater than 0
      if (rating > 0) {
        fetch(`/api/politicians/${politicianId}/rate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ rating })
        }).catch(error => {
          console.error(`Failed to submit rating for politician ${politicianId}:`, error);
        });
      }
    });
    
    onClose();
  };

  if (!isOpen || politicians.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            דרגו את הפוליטיקאים במאמר
          </DialogTitle>
          <DialogDescription>
            התרשמתם מהפוליטיקאים שהוזכרו בכתבה? דרגו אותם עכשיו
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {politicians.map(politician => (
            <div 
              key={politician.politicianId} 
              className="flex items-center space-x-4 rtl:space-x-reverse p-3 bg-gray-50 rounded-lg"
            >
              {politician.imageUrl && (
                <img 
                  src={politician.imageUrl}
                  alt={politician.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold mb-1">{politician.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {politician.position}, {politician.party}
                    </div>
                    <StarRating
                      rating={ratings[politician.politicianId] || 0}
                      onChange={(rating) => handleRatingChange(politician.politicianId, rating)}
                      id={`modal-politician-${politician.politicianId}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter dir="ltr">
          <Button onClick={handleSubmit} className="w-full">
            שמירת דירוגים
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
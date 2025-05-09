import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import RatingForm from "./RatingForm";
import { Politician, PoliticianWithRating } from "@shared/schema";

interface PoliticianCardProps {
  politician: Politician | (Politician & { rating?: number; averageRating?: number; totalRatings?: number });
  variant?: "default" | "compact";
}

export default function PoliticianCard({ politician, variant = "default" }: PoliticianCardProps) {
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  const isPoliticianWithRating = (pol: any): pol is PoliticianWithRating => {
    return pol && typeof pol.averageRating !== 'undefined' && typeof pol.totalRatings !== 'undefined';
  };
  
  let averageRating = 0;
  
  try {
    if (isPoliticianWithRating(politician)) {
      averageRating = typeof politician.averageRating === 'number' ? politician.averageRating : 0;
    } else if (politician && (politician as any).rating) {
      averageRating = typeof (politician as any).rating === 'number' ? (politician as any).rating : 0;
    }
  } catch (error) {
    console.error('Error calculating average rating:', error);
  }
    
  const initials = politician.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .substring(0, 2);

  // Direct compact variant
  return (
    <div 
      className="flex items-center gap-2 bg-blue-50 rounded-lg p-2 cursor-pointer hover:bg-blue-100 transition"
      onClick={() => setShowRatingModal(true)}
    >
      <Avatar className="h-6 w-6 ml-1">
        <AvatarImage src={politician.imageUrl || ""} alt={politician.name} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <span className="font-medium text-sm ml-auto">{politician.name}</span>
      {averageRating > 0 && (
        <div className="flex items-center">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs mr-1">{averageRating.toFixed(1)}</span>
        </div>
      )}
      
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">דירוג: {politician.name}</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4 py-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={politician.imageUrl || ""} alt={politician.name} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <h3 className="font-bold text-xl">{politician.name}</h3>
            </div>
            
            <RatingForm 
              politicianId={politician.id} 
              initialRating={isPoliticianWithRating(politician) ? politician.userRating : 0}
              onSuccess={() => setShowRatingModal(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
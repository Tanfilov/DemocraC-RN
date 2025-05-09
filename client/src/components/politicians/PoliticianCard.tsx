import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import StarRating from "./StarRating";
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
  
  const totalRatings = isPoliticianWithRating(politician) 
    ? politician.totalRatings 
    : 0;
    
  const initials = politician.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // For compact variant (used in NewsCard)
  if (variant === "compact") {
    return (
      <div 
        className="flex items-center space-x-2 bg-blue-50 rounded-lg p-2 cursor-pointer hover:bg-blue-100 transition"
        onClick={() => setShowRatingModal(true)}
      >
        <Avatar className="h-6 w-6">
          <AvatarImage src={politician.imageUrl || ""} alt={politician.name} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm">{politician.name}</span>
        {averageRating > 0 && (
          <div className="flex items-center">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs ml-1">{averageRating.toFixed(1)}</span>
          </div>
        )}
        
        <RatingModal 
          politician={politician} 
          open={showRatingModal} 
          onOpenChange={setShowRatingModal} 
        />
      </div>
    );
  }

  // Default full card
  return (
    <Card className="overflow-hidden border-gray-200 hover:border-primary hover:shadow-md transition duration-300">
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
              <AvatarImage src={politician.imageUrl || ""} alt={politician.name} />
              <AvatarFallback className="text-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{politician.name}</CardTitle>
              {politician.title && (
                <CardDescription className="text-gray-700">{politician.title}</CardDescription>
              )}
            </div>
          </div>
        </div>
      </div>

      <CardHeader className="pb-2 pt-4">
        {averageRating > 0 && (
          <div className="flex items-center justify-center mb-2">
            <div className="bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1 flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
              {totalRatings > 0 && (
                <span className="text-sm text-gray-600">מתוך {totalRatings} דירוגים</span>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pb-2">
        {politician.description && (
          <p className="text-gray-700 text-sm py-2">{politician.description}</p>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
          <DialogTrigger asChild>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-sm"
            >
              <Star className="h-4 w-4 mr-2" /> דרג פוליטיקאי
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>דירוג: {politician.name}</DialogTitle>
              <DialogDescription>דרג את הפוליטיקאי מ-1 עד 5 כוכבים</DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center gap-4 py-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={politician.imageUrl || ""} alt={politician.name} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <h3 className="font-bold text-xl">{politician.name}</h3>
                {politician.title && (
                  <p className="text-muted-foreground">{politician.title}</p>
                )}
              </div>
              
              <RatingForm 
                politicianId={politician.id} 
                initialRating={isPoliticianWithRating(politician) ? politician.userRating : 0}
                onSuccess={() => setShowRatingModal(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

interface RatingModalProps {
  politician: Politician | (Politician & { rating?: number; averageRating?: number; totalRatings?: number });
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function RatingModal({ politician, open, onOpenChange }: RatingModalProps) {
  const isPoliticianWithRating = (pol: any): pol is PoliticianWithRating => {
    return pol && typeof pol.averageRating !== 'undefined' && typeof pol.totalRatings !== 'undefined';
  };
  
  const initials = politician.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
    
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>דירוג: {politician.name}</DialogTitle>
          <DialogDescription>דרג את הפוליטיקאי מ-1 עד 5 כוכבים</DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={politician.imageUrl || ""} alt={politician.name} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h3 className="font-bold text-xl">{politician.name}</h3>
            {politician.title && (
              <p className="text-muted-foreground">{politician.title}</p>
            )}
          </div>
          
          <RatingForm 
            politicianId={politician.id} 
            initialRating={isPoliticianWithRating(politician) ? politician.userRating : 0}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Politician, PoliticianWithRating } from "@shared/schema";
import { Button } from "@/components/ui/button";
import StarRating from "./StarRating";
import RatingForm from "./RatingForm";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

interface PoliticianCardProps {
  politician: Politician | PoliticianWithRating;
  variant?: "compact" | "full";
  showRatingButton?: boolean;
}

export default function PoliticianCard({ 
  politician, 
  variant = "full", 
  showRatingButton = true 
}: PoliticianCardProps) {
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  
  // Check if politician has ratings data
  const hasPoliticianRating = "averageRating" in politician;
  
  // Default avatar if no image is provided
  const avatarUrl = politician.imageUrl || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(politician.name)}&background=random`;

  if (variant === "compact") {
    return (
      <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg rtl:space-x-reverse">
        <img 
          src={avatarUrl} 
          alt={politician.name} 
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-medium">{politician.name}</p>
          {politician.title && (
            <p className="text-sm text-gray-500 line-clamp-1">
              {politician.title}
            </p>
          )}
          {hasPoliticianRating && (
            <StarRating 
              value={(politician as PoliticianWithRating).averageRating} 
              size="sm"
            />
          )}
          <div className="flex mt-2 space-x-1 rtl:space-x-reverse">
            <Button size="sm" className="px-2 py-1 text-xs">
              Profile
            </Button>
            {showRatingButton && (
              <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="px-2 py-1 text-xs">
                    Rate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <RatingForm 
                    politicianId={politician.id} 
                    politicianName={politician.name}
                    onClose={() => setRatingDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <img 
            src={avatarUrl} 
            alt={politician.name} 
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
          />
          <div>
            <CardTitle className="text-xl">{politician.name}</CardTitle>
            {politician.title && (
              <p className="text-sm text-gray-500">{politician.title}</p>
            )}
            {hasPoliticianRating && (
              <div className="flex items-center mt-1">
                <StarRating value={(politician as PoliticianWithRating).averageRating} />
                <span className="text-sm text-gray-500 ml-2">
                  ({(politician as PoliticianWithRating).totalRatings} ratings)
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {politician.description && (
          <p className="text-gray-700 mb-4">{politician.description}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" size="sm">
          News Mentions
        </Button>
        {showRatingButton && (
          <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                Rate Politician
              </Button>
            </DialogTrigger>
            <DialogContent>
              <RatingForm 
                politicianId={politician.id} 
                politicianName={politician.name}
                onClose={() => setRatingDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}
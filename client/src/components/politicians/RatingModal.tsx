import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { Politician } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RatingModalProps {
  politician: Politician;
  onClose: () => void;
  onRate: (rating: number) => void;
}

export default function RatingModal({ politician, onClose, onRate }: RatingModalProps) {
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  
  const { mutate, isPending } = useMutation({
    mutationFn: async ({ politicianId, rating, comment }: { politicianId: number, rating: number, comment: string }) => {
      const res = await apiRequest("POST", `/api/politicians/${politicianId}/rate`, { rating, comment });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Rating Submitted",
        description: "Thank you for rating this politician!",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/politicians"] });
      queryClient.invalidateQueries({ queryKey: ["/api/politicians/top"] });
      queryClient.invalidateQueries({ queryKey: [`/api/politicians/${politician.id}`] });
      
      onRate(rating);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = () => {
    mutate({ politicianId: politician.id, rating, comment });
  };
  
  // Extract title if present in the name
  let displayName = politician.name;
  let title = politician.title || "";
  
  if (!title && displayName.includes(".")) {
    const parts = displayName.split(".");
    title = parts[0].trim();
    displayName = parts.slice(1).join(".").trim();
  }
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate This Politician</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center space-x-4 mb-6">
          <img 
            src={politician.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(politician.name)}&background=random`} 
            alt={politician.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-lg">{title && `${title} `}{displayName}</h4>
            <p className="text-gray-600">{politician.description || 'Politician'}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="font-medium mb-3">Your Rating:</p>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="flex items-center justify-center"
                onClick={() => setRating(star)}
              >
                <span className={`material-icons text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                  star
                </span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="rating-comment" className="block font-medium mb-2">
            Comment (Optional):
          </label>
          <Textarea
            id="rating-comment"
            placeholder="Share your thoughts about this politician..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

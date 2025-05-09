import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";

interface RatingFormProps {
  politicianId: number;
  politicianName: string;
  onClose?: () => void;
}

export default function RatingForm({ politicianId, politicianName, onClose }: RatingFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const data = await apiRequest(
        `/api/politicians/${politicianId}/rate`,
        "POST",
        { rating, comment }
      );
      
      toast({
        title: "Rating submitted",
        description: `You rated ${politicianName} ${rating} stars.`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/politicians'] });
      queryClient.invalidateQueries({ queryKey: ['/api/politicians/top'] });
      queryClient.invalidateQueries({ queryKey: [`/api/politicians/${politicianId}`] });
      
      // Reset form
      setRating(0);
      setComment("");
      
      // Close dialog if needed
      if (onClose) onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium">
          Rate {politicianName}
        </h3>
        <p className="text-sm text-gray-500">
          Rate this politician based on their performance and policies
        </p>
      </div>
      
      <div className="flex justify-center p-2">
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="focus:outline-none"
            >
              <span 
                className={`material-icons text-2xl transition-colors ${
                  value <= rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400`}
              >
                {value <= rating ? 'star' : 'star_border'}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="comment">Your comment (optional)</Label>
        <Textarea
          id="comment"
          placeholder="Share your thoughts about this politician..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="h-20"
          dir="auto"
        />
      </div>
      
      <div className="flex justify-end space-x-2 rtl:space-x-reverse">
        {onClose && (
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Rating"}
        </Button>
      </div>
    </form>
  );
}
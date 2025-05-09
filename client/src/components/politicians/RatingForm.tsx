import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import StarRating from "./StarRating";
import { Loader2 } from "lucide-react";

interface RatingFormProps {
  politicianId: number;
  initialRating?: number;
  onSuccess?: () => void;
}

export default function RatingForm({ politicianId, initialRating = 0, onSuccess }: RatingFormProps) {
  const [rating, setRating] = useState<number>(initialRating);
  const [comment, setComment] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!rating) {
        throw new Error("בחר דירוג");
      }
      
      return fetch(`/api/politicians/${politicianId}/rate`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating,
          comment: comment || null
        })
      }).then(res => {
        if (!res.ok) {
          throw new Error(`ארעה שגיאה: ${res.status}`);
        }
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: "הדירוג נשלח בהצלחה",
        description: "תודה על הדירוג שלך",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/politicians'] });
      queryClient.invalidateQueries({ queryKey: ['/api/politicians/top'] });
      
      // Call onSuccess callback
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "שגיאה",
        description: error.message || "אירעה שגיאה בשליחת הדירוג",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="flex flex-col items-center space-y-2">
        <div className="text-sm text-gray-500 mb-1">הדירוג שלך</div>
        <StarRating
          value={rating} 
          onChange={setRating}
          size="lg"
        />
      </div>
      
      <div className="space-y-2">
        <div className="text-sm text-gray-500">תגובה (אופציונלי)</div>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="הוסף תגובה על הפוליטיקאי..."
          className="resize-none h-24"
          dir="rtl"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isPending || !rating}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            שולח...
          </>
        ) : (
          "שלח דירוג"
        )}
      </Button>
    </form>
  );
}
import { useId } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onChange: (rating: number) => void;
  id: string;
}

export default function StarRating({ rating, onChange, id }: StarRatingProps) {
  const uniqueId = useId();
  
  return (
    <div className="star-rating flex text-sm mt-2">
      {[5, 4, 3, 2, 1].map((star) => (
        <div key={star}>
          <input
            type="radio"
            id={`${id}-${uniqueId}-star-${star}`}
            name={`${id}-${uniqueId}-rating`}
            value={star}
            checked={rating === star}
            onChange={() => onChange(star)}
            className="hidden"
          />
          <label
            htmlFor={`${id}-${uniqueId}-star-${star}`}
            className="cursor-pointer"
          >
            <Star 
              className="h-5 w-5" 
              fill={rating >= star ? "currentColor" : "none"}
            />
          </label>
        </div>
      ))}
    </div>
  );
}

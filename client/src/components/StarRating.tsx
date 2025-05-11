import { useState } from "react";
import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onChange: (rating: number) => void;
  id: string;
  size?: 'default' | 'large';
}

export default function StarRating({ rating, onChange, id }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(rating);

  const handleMouseEnter = (index: number) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (index: number) => {
    const newRating = index;
    setSelectedRating(newRating);
    onChange(newRating);
  };

  return (
    <div 
      className="flex flex-row-reverse justify-end gap-1 rtl:flex-row" 
      onMouseLeave={handleMouseLeave}
      dir="rtl"
    >
      {[5, 4, 3, 2, 1].map((index) => (
        <button
          key={`${id}-star-${index}`}
          type="button"
          className="text-amber-500 flex items-center justify-center focus:outline-none"
          onMouseEnter={() => handleMouseEnter(index)}
          onClick={() => handleClick(index)}
          aria-label={`דרג ${index} מתוך 5 כוכבים`}
        >
          <Star
            fill={
              hoverRating >= index || selectedRating >= index
                ? "currentColor" 
                : "none"
            }
            className={`w-5 h-5 ${
              hoverRating >= index
                ? "text-amber-500"
                : selectedRating >= index
                ? "text-amber-500" 
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
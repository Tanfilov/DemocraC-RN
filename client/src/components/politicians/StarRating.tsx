import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  count?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  count = 5,
  size = "md",
  className
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "h-4 w-4";
      case "lg": return "h-7 w-7";
      default: return "h-6 w-6"; // md
    }
  };
  
  const handleMouseMove = (index: number) => {
    if (readOnly) return;
    setHoverValue(index);
  };
  
  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverValue(null);
  };
  
  const handleClick = (index: number) => {
    if (readOnly) return;
    onChange?.(index);
  };
  
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= count; i++) {
      const isFilled = hoverValue !== null ? i <= hoverValue : i <= value;
      
      stars.push(
        <Star
          key={i}
          className={cn(
            getSizeClasses(),
            "cursor-pointer transition-colors",
            isFilled 
              ? "fill-yellow-400 text-yellow-400" 
              : "text-gray-300",
            !readOnly && "hover:text-yellow-500"
          )}
          onMouseMove={() => handleMouseMove(i)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(i)}
        />
      );
    }
    
    return stars;
  };
  
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {renderStars()}
    </div>
  );
}
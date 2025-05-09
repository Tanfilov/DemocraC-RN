import { Politician } from "@shared/schema";
import { useState } from "react";
import StarRating from "./StarRating";
import RatingModal from "./RatingModal";

interface PoliticianCardProps {
  politician: Politician & { rating?: number };
  compact?: boolean;
}

export default function PoliticianCard({ politician, compact = false }: PoliticianCardProps) {
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  const handleClick = () => {
    if (!compact) return;
    setShowRatingModal(true);
  };
  
  // Extract title if present in the name
  let displayName = politician.name;
  let title = politician.title || "";
  
  if (!title && displayName.includes(".")) {
    const parts = displayName.split(".");
    title = parts[0].trim();
    displayName = parts.slice(1).join(".").trim();
  }
  
  const rating = politician.rating || 0;
  
  return (
    <>
      <div 
        className={`flex items-center space-x-3 p-2 bg-gray-50 rounded-lg ${compact ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        <img 
          src={politician.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(politician.name)}&background=random`}
          alt={politician.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-medium">{title && `${title} `}{displayName}</p>
          <StarRating value={rating} />
        </div>
      </div>
      
      {showRatingModal && (
        <RatingModal 
          politician={politician}
          onClose={() => setShowRatingModal(false)}
          onRate={() => setShowRatingModal(false)}
        />
      )}
    </>
  );
}

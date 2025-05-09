interface StarRatingProps {
  value: number;
  total?: number;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ 
  value, 
  total = 5, 
  showValue = true, 
  size = "md" 
}: StarRatingProps) {
  const roundedValue = Math.round(value * 10) / 10; // Round to 1 decimal place
  
  // Determine star size based on prop
  const starClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }[size];
  
  return (
    <div className="flex items-center">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`material-icons ${starClass} ${
            i < Math.floor(value) 
              ? "text-yellow-400" 
              : i === Math.floor(value) && value % 1 >= 0.5
                ? "text-yellow-400" // Would use star_half in a real app
                : "text-gray-300"
          }`}
        >
          {i < Math.floor(value) 
            ? "star" 
            : i === Math.floor(value) && value % 1 >= 0.5
              ? "star" // Would use star_half in a real app
              : "star_border"
          }
        </span>
      ))}
      
      {showValue && value > 0 && (
        <span className="text-xs text-gray-500 ml-1">
          ({roundedValue.toFixed(1)})
        </span>
      )}
    </div>
  );
}

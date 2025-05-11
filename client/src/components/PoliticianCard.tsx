import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Politician } from "@/lib/types";
import StarRating from "./StarRating";
import { cn } from "@/lib/utils";

interface PoliticianCardProps {
  politician: Politician;
}

export default function PoliticianCard({ politician }: PoliticianCardProps) {
  const queryClient = useQueryClient();
  
  const rateMutation = useMutation({
    mutationFn: async (rating: number) => {
      return apiRequest("POST", `/api/politicians/${politician.id}/rate`, { rating });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/politicians"] });
    }
  });

  const handleRatingChange = (rating: number) => {
    rateMutation.mutate(rating);
  };
  
  const partyBorderClass = 
    politician.party.toLowerCase() === "democrat" ? "border-democrat" : 
    politician.party.toLowerCase() === "republican" ? "border-republican" : 
    "border-independent";
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex p-4">
        <div className="flex-shrink-0 mr-4">
          <img 
            src={politician.imageUrl} 
            alt={`Portrait of ${politician.name}`} 
            className={cn(
              "w-16 h-16 rounded-full object-cover border-2",
              partyBorderClass
            )}
          />
        </div>
        <div>
          <h3 className="font-medium">{politician.name}</h3>
          <p className="text-sm text-neutral-500">{politician.party}</p>
          <p className="text-xs text-neutral-400">{politician.position}</p>
          
          <StarRating 
            rating={politician.rating}
            onChange={handleRatingChange}
            id={politician.id.toString()}
          />
        </div>
      </div>
    </div>
  );
}

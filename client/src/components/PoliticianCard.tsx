import { useState } from 'react';
import { Politician } from '@/lib/types';
import StarRating from './StarRating';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PoliticianCardProps {
  politician: Politician;
}

export default function PoliticianCard({ politician }: PoliticianCardProps) {
  const [currentRating, setCurrentRating] = useState(politician.rating || 0);

  // Mutation for rating a politician
  const mutation = useMutation({
    mutationFn: async (rating: number) => {
      return apiRequest(
        'POST',
        `/api/politicians/${politician.id}/rate`, 
        { rating }
      );
    },
    onSuccess: () => {
      // We don't need to do anything on success as we're using optimistic updates
    },
    onError: (error) => {
      console.error('Failed to rate politician:', error);
      // Revert to the previous rating if there was an error
      setCurrentRating(politician.rating || 0);
    },
  });

  const handleRatingChange = (newRating: number) => {
    setCurrentRating(newRating);
    mutation.mutate(newRating);
  };

  return (
    <div className="flex flex-col items-start mt-2 p-2 bg-gray-100 rounded-md">
      <div className="flex items-center gap-2 w-full">
        {politician.imageUrl && (
          <img
            src={politician.imageUrl}
            alt={politician.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
        <div className="flex flex-col flex-grow">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm font-semibold">{politician.name}</div>
            <div className="text-xs text-gray-500">{politician.party}</div>
          </div>
          <div className="flex items-center justify-between w-full mt-1">
            <div className="text-xs text-gray-500">{politician.position}</div>
            <StarRating
              rating={currentRating}
              onChange={handleRatingChange}
              id={`politician-${politician.id}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
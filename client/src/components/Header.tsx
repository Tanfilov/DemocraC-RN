import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "../assets/logo_clean.png";

export default function Header() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    // Invalidate and refetch news
    queryClient.invalidateQueries({ queryKey: ["/api/news"] });
  };

  return (
    <header className="sticky top-0 z-50 shadow-sm bg-white">
      <div className="px-4 py-2 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <img 
            src={logoImage} 
            alt="democra.C Logo" 
            className="h-10 object-contain"
          />
        </Link>
        
        {/* Refresh button moved to header */}
        <Button 
          variant="outline" 
          size="sm" 
          className="flex gap-1 items-center rounded-full h-9 w-9 p-0 justify-center" 
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">רענן</span>
        </Button>
      </div>
    </header>
  );
}
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function Header() {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const handleRefresh = () => {
    // Invalidate and refetch news
    queryClient.invalidateQueries({ queryKey: ["/api/news"] });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 shadow-sm bg-white dark:bg-slate-950">
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex justify-between items-center">
        {/* Left button (refresh) */}
        <Button 
          variant="outline" 
          size="sm" 
          className="flex gap-1 items-center rounded-full h-9 w-9 p-0 justify-center" 
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">רענן</span>
        </Button>

        {/* Center logo placeholder - awaiting new logo from user */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Link href="/" className="flex items-center justify-center">
            <h3 className="text-lg font-bold text-gray-700">democra.C</h3>
          </Link>
        </div>
        
        {/* Right button (dark mode toggle) */}
        <Button 
          variant="outline" 
          size="sm" 
          className="flex gap-1 items-center rounded-full h-9 w-9 p-0 justify-center" 
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="sr-only">החלף מצב תצוגה</span>
        </Button>
      </div>
    </header>
  );
}
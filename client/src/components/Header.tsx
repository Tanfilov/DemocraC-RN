import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function Header() {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const handleRefresh = () => {
    // Invalidate and refetch news - add both refetch and invalidation for reliability
    queryClient.invalidateQueries({ queryKey: ["/api/news"] });
    
    // Add direct fetch call to ensure refresh happens
    fetch('/api/news', { 
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' } 
    })
    .then(response => response.json())
    .then(() => {
      // After fetching fresh data, force a refetch in the query client
      queryClient.refetchQueries({ queryKey: ["/api/news"] });
      
      // Visual feedback for refresh action
      const refreshBtn = document.querySelector('.refresh-btn');
      if (refreshBtn) {
        refreshBtn.classList.add('refreshing');
        setTimeout(() => {
          refreshBtn.classList.remove('refreshing');
        }, 1000);
      }
    })
    .catch(err => console.error('Refresh failed:', err));
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 shadow-sm bg-white dark:bg-slate-900">
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex justify-between items-center">
        {/* Left button (refresh) */}
        <Button 
          variant="outline" 
          size="sm" 
          className="refresh-btn flex gap-1 items-center rounded-full h-9 w-9 p-0 justify-center dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-gray-300" 
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">רענן</span>
        </Button>

        {/* Center logo - fixed path in public folder */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Link href="/" className="flex items-center justify-center">
            {theme === "dark" ? (
              // Dark mode logo
              <div className="h-10 relative">
                <img 
                  src="/logo-transparent.png"
                  alt="democra.C Logo" 
                  className="h-10 object-contain logo-dark-mode"
                />
              </div>
            ) : (
              // Light mode logo
              <img 
                src="/logo-transparent.png"
                alt="democra.C Logo" 
                className="h-10 object-contain"
              />
            )}
          </Link>
        </div>
        
        {/* Right button (dark mode toggle) */}
        <Button 
          variant="outline" 
          size="sm" 
          className="flex gap-1 items-center rounded-full h-9 w-9 p-0 justify-center dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-amber-300" 
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="sr-only">החלף מצב תצוגה</span>
        </Button>
      </div>
    </header>
  );
}
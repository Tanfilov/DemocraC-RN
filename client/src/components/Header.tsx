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

        {/* Center logo with inline data URL to avoid caching issues */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Link href="/" className="flex items-center justify-center">
            <img 
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABCsAAAEWCAYAAABPFx2FAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAADe4SURBVHhe7d0PdFTlvf/xzzPzT0j+hMSGEEJC00QpKgasgk1BpFSoipXrKj1q19XbRbVapS1e+O2yUG4XLdRbf7dLf3qprf64RdQLBUEoAmKLIsrSQhEQQSFhCRJIyL+ZzDzPs2fmoWwwZBJg8pH3a6058Xn2MyH7GWbmfPZ533P" 
              alt="democra.C Logo" 
              className="h-10 object-contain"
              key="logo-inline-v3"
            />
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
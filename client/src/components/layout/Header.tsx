import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Search, Bell, Menu, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { useNewsData } from "@/hooks/useNewsData";

export default function Header() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { categories } = useNewsData();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <span className="material-icons text-primary text-3xl">article</span>
                <h1 className="text-xl font-bold text-gray-800 sm:text-2xl mr-2">חדשות ישראל</h1>
              </a>
            </Link>
          </div>
          
          {/* Desktop Search bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  className="w-full pr-10 bg-gray-100 text-right"
                  placeholder="חיפוש נושאים, פוליטיקאים או מילות מפתח..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              size="icon" 
              variant="ghost" 
              className="md:hidden" 
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Button size="icon" variant="ghost">
              <Bell className="h-5 w-5" />
            </Button>
            
            <Button size="icon" variant="ghost">
              <User className="h-5 w-5" />
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="text-right">תפריט</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <h3 className="font-semibold text-lg mb-3 text-right">קטגוריות חדשות</h3>
                  <ul className="space-y-2 mb-6">
                    <li>
                      <SheetClose asChild>
                        <Link href="/">
                          <a className="flex flex-row-reverse items-center text-primary font-medium p-2 rounded-md bg-blue-50">
                            <span className="material-icons ml-3 text-primary">home</span>
                            <span>סיפורים מובילים</span>
                          </a>
                        </Link>
                      </SheetClose>
                    </li>
                    {categories.map((category) => (
                      <li key={category.id}>
                        <SheetClose asChild>
                          <Link href={`/?category=${category.id}`}>
                            <a className="flex flex-row-reverse items-center text-gray-700 hover:text-primary p-2 rounded-md hover:bg-blue-50 transition">
                              <span className={`material-icons ml-3 text-category-${category.id}`}>{category.icon}</span>
                              <span>{category.name}</span>
                            </a>
                          </Link>
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                  
                  <h3 className="font-semibold text-lg mb-3 text-right">פוליטיקאים מדורגים</h3>
                  <ul className="space-y-2">
                    <li>
                      <SheetClose asChild>
                        <Link href="/politicians/top">
                          <a className="flex flex-row-reverse items-center text-gray-700 hover:text-primary p-2 rounded-md hover:bg-blue-50 transition">
                            <span className="material-icons ml-3">star</span>
                            <span>דירוג גבוה</span>
                          </a>
                        </Link>
                      </SheetClose>
                    </li>
                    <li>
                      <SheetClose asChild>
                        <Link href="/politicians/my-ratings">
                          <a className="flex flex-row-reverse items-center text-gray-700 hover:text-primary p-2 rounded-md hover:bg-blue-50 transition">
                            <span className="material-icons ml-3">star_half</span>
                            <span>הדירוגים שלי</span>
                          </a>
                        </Link>
                      </SheetClose>
                    </li>
                  </ul>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Mobile search bar */}
        {showMobileSearch && (
          <div className="md:hidden py-2">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  className="w-full pr-10 bg-gray-100 text-right"
                  placeholder="חיפוש נושאים, פוליטיקאים או מילות מפתח..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}

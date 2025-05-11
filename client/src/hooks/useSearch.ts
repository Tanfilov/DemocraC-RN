import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { useLocation } from "wouter";

interface SearchContextType {
  searchTerm: string;
  search: (term: string) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();
  
  const search = useCallback((term: string) => {
    setSearchTerm(term);
    
    // If we're not already on the home page, navigate there with the search
    setLocation(`/?search=${encodeURIComponent(term)}`);
  }, [setLocation]);
  
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setLocation("/");
  }, [setLocation]);
  
  return (
    <SearchContext.Provider value={{ searchTerm, search, clearSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextType {
  const context = useContext(SearchContext);
  
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  
  return context;
}

// Default implementation for when the provider isn't available
export function createDefaultSearchContext(): SearchContextType {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();
  
  const search = useCallback((term: string) => {
    setSearchTerm(term);
    setLocation(`/?search=${encodeURIComponent(term)}`);
  }, [setLocation]);
  
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setLocation("/");
  }, [setLocation]);
  
  return { searchTerm, search, clearSearch };
}

const defaultContext = createDefaultSearchContext();
export default () => useContext(SearchContext) || defaultContext;

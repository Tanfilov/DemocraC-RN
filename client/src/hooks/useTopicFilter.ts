import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { useLocation } from "wouter";

interface TopicFilterContextType {
  activeTopic: string;
  setTopic: (topic: string) => void;
}

const TopicFilterContext = createContext<TopicFilterContextType | undefined>(undefined);

export function TopicFilterProvider({ children }: { children: ReactNode }) {
  const [activeTopic, setActiveTopic] = useState("All");
  const [, setLocation] = useLocation();
  
  const setTopic = useCallback((topic: string) => {
    setActiveTopic(topic);
    
    if (topic === "All") {
      setLocation("/");
    } else {
      setLocation(`/?topic=${encodeURIComponent(topic.toLowerCase())}`);
    }
  }, [setLocation]);
  
  return (
    <TopicFilterContext.Provider value={{ activeTopic, setTopic }}>
      {children}
    </TopicFilterContext.Provider>
  );
}

export function useTopicFilter(): TopicFilterContextType {
  const context = useContext(TopicFilterContext);
  
  if (context === undefined) {
    throw new Error("useTopicFilter must be used within a TopicFilterProvider");
  }
  
  return context;
}

// Default implementation for when the provider isn't available
export function createDefaultTopicContext(): TopicFilterContextType {
  const [activeTopic, setActiveTopic] = useState("All");
  const [, setLocation] = useLocation();
  
  const setTopic = useCallback((topic: string) => {
    setActiveTopic(topic);
    
    if (topic === "All") {
      setLocation("/");
    } else {
      setLocation(`/?topic=${encodeURIComponent(topic.toLowerCase())}`);
    }
  }, [setLocation]);
  
  return { activeTopic, setTopic };
}

const defaultContext = createDefaultTopicContext();
export default () => useContext(TopicFilterContext) || defaultContext;

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import NewsDetail from "@/pages/news-detail";
import PoliticiansPage from "@/pages/politicians";
import TopPoliticiansPage from "@/pages/top-politicians";
import Header from "@/components/layout/Header";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/topic/:id" component={NewsDetail} />
      <Route path="/politicians" component={PoliticiansPage} />
      <Route path="/top-politicians" component={TopPoliticiansPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

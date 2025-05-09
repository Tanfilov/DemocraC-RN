import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import PoliticalNews from "@/pages/political-news";
import NewsDetail from "@/pages/news-detail";
import Header from "@/components/layout/Header";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/political-news" />} />
      <Route path="/political-news" component={PoliticalNews} />
      <Route path="/topic/:id" component={NewsDetail} />
      <Route path="/:rest*">
        {() => <Redirect to="/political-news" />}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen" dir="rtl">
          <Header />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

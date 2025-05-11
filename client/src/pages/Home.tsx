import NewsFeed from "@/components/NewsFeed";

export default function Home() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Latest Ynet News</h1>
        <p className="text-muted-foreground">
          Stay updated with the latest news from Ynet RSS feed
        </p>
      </div>
      
      <NewsFeed />
    </div>
  );
}
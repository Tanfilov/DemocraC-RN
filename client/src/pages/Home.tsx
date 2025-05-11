import NewsFeed from "@/components/NewsFeed";

export default function Home() {
  return (
    <div>
      <div className="mb-6 text-right">
        <h1 className="text-3xl font-bold mb-2">חדשות Ynet האחרונות</h1>
        <p className="text-muted-foreground">
          הישארו מעודכנים עם החדשות האחרונות מערוץ ה-RSS של Ynet
        </p>
      </div>
      
      <NewsFeed />
    </div>
  );
}
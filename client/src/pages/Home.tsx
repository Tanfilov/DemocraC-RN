import NewsFeed from "@/components/NewsFeed";

export default function Home() {
  return (
    <div>
      <div className="mb-4 text-right px-2">
        <h1 
          className="text-2xl font-bold mb-1"
          style={{ 
            fontWeight: 700, 
            letterSpacing: '-0.03em',
            fontSize: '1.5rem'
          }}
        >
          חדשות Ynet האחרונות
        </h1>
        <p className="text-sm text-muted-foreground">
          הישארו מעודכנים עם החדשות האחרונות 
        </p>
      </div>
      
      <NewsFeed />
    </div>
  );
}
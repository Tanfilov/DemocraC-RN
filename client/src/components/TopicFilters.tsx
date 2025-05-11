import { useTopicFilter } from "@/hooks/useTopicFilter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TopicWithColor } from "@/lib/types";

const topics: TopicWithColor[] = [
  { name: "All", color: "primary" },
  { name: "Politics", color: "politics" },
  { name: "Business", color: "business" },
  { name: "Technology", color: "technology" },
  { name: "Entertainment", color: "entertainment" },
  { name: "Sports", color: "sports" },
  { name: "Health", color: "health" },
];

export default function TopicFilters() {
  const { activeTopic, setTopic } = useTopicFilter();
  
  return (
    <div className="bg-white shadow-sm border-b border-neutral-200 sticky top-16 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-x-auto whitespace-nowrap py-3 scrollbar-hide">
          <div className="inline-flex space-x-2">
            {topics.map((topic) => (
              <Button
                key={topic.name}
                onClick={() => setTopic(topic.name)}
                variant={activeTopic === topic.name ? "default" : "outline"}
                className={cn(
                  "text-sm font-medium rounded-full",
                  activeTopic === topic.name
                    ? topic.name === "All"
                      ? "bg-primary text-white"
                      : `category-${topic.name.toLowerCase()} text-white`
                    : "bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-300"
                )}
              >
                {topic.name !== "All" && (
                  <span className={`w-3 h-3 rounded-full inline-block category-${topic.name.toLowerCase()} mr-1`}></span>
                )}
                {topic.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

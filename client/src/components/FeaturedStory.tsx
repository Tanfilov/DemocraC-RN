import { Button } from "@/components/ui/button";
import { Article } from "@/lib/types";
import { FileText, BookmarkPlus, Share2 } from "lucide-react";

interface FeaturedStoryProps {
  story: Article;
}

export default function FeaturedStory({ story }: FeaturedStoryProps) {
  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl overflow-hidden shadow-md">
        <div className="md:flex">
          <div className="md:w-2/3 p-6">
            <div className="flex items-center mb-4">
              <span className={`px-2 py-1 category-${story.category.toLowerCase()} text-white text-xs font-medium rounded-full`}>
                {story.category}
              </span>
              <span className="ml-2 text-sm text-neutral-500">
                Trending Topic
              </span>
            </div>
            <h2 className="text-2xl font-serif font-bold mb-3">
              {story.title}
            </h2>
            <p className="text-neutral-500 mb-4">
              {story.summary}
            </p>
            <div className="flex flex-wrap items-center text-sm text-neutral-400 mb-4">
              <span className="mr-4">Multiple sources: </span>
              {story.sources.slice(0, 3).map((source, index) => (
                <span key={index} className="mr-3 font-medium text-neutral-500">{source}</span>
              ))}
              {story.sources.length > 3 && (
                <span className="mr-3 font-medium text-neutral-500">+{story.sources.length - 3} more</span>
              )}
            </div>
            <div className="flex items-center">
              <Button variant="ghost" className="text-primary flex items-center text-sm font-medium">
                <FileText className="h-4 w-4 mr-1" />
                Full Coverage
              </Button>
              <span className="mx-3 text-neutral-300">|</span>
              <Button variant="ghost" className="text-primary flex items-center text-sm font-medium">
                <BookmarkPlus className="h-4 w-4 mr-1" />
                Save
              </Button>
              <span className="mx-3 text-neutral-300">|</span>
              <Button variant="ghost" className="text-primary flex items-center text-sm font-medium">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
          <div className="md:w-1/3">
            <img 
              src={story.imageUrl} 
              alt={story.title} 
              className="h-full w-full object-cover" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

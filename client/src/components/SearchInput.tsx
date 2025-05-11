import { useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchInput() {
  const [localValue, setLocalValue] = useState("");
  const { search } = useSearch();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(localValue);
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <Input
        type="text"
        placeholder="Search news topics or politicians..."
        className="w-full px-4 py-2 pr-10 rounded-full border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}

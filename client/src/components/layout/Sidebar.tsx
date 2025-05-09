import { NewsCategory } from "@shared/schema";
import { Link } from "wouter";

interface SidebarProps {
  categories: NewsCategory[];
  activeCategory?: string;
  onCategoryChange: (category?: string) => void;
}

export default function Sidebar({ categories, activeCategory, onCategoryChange }: SidebarProps) {
  const handleCategoryClick = (categoryId?: string) => {
    onCategoryChange(categoryId);
  };
  
  return (
    <aside className="hidden lg:block lg:col-span-3 xl:col-span-2 space-y-6">
      <nav className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
        <h2 className="font-semibold text-lg mb-4">News Categories</h2>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => handleCategoryClick(undefined)}
              className={`flex items-center w-full text-left ${!activeCategory ? 'text-primary font-medium p-2 rounded-md bg-blue-50' : 'text-gray-700 hover:text-primary p-2 rounded-md hover:bg-blue-50 transition'}`}
            >
              <span className="material-icons mr-3 text-primary">home</span>
              <span>Top Stories</span>
            </button>
          </li>
          
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => handleCategoryClick(category.id)}
                className={`flex items-center w-full text-left ${activeCategory === category.id ? 'text-primary font-medium p-2 rounded-md bg-blue-50' : 'text-gray-700 hover:text-primary p-2 rounded-md hover:bg-blue-50 transition'}`}
              >
                <span className={`material-icons mr-3 text-category-${category.id}`}>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            </li>
          ))}
        </ul>
        
        <hr className="my-4 border-gray-200" />
        
        <h2 className="font-semibold text-lg mb-4">Rated Politicians</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/politicians/top">
              <a className="flex items-center text-gray-700 hover:text-primary p-2 rounded-md hover:bg-blue-50 transition">
                <span className="material-icons mr-3">star</span>
                <span>Top Rated</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/politicians/my-ratings">
              <a className="flex items-center text-gray-700 hover:text-primary p-2 rounded-md hover:bg-blue-50 transition">
                <span className="material-icons mr-3">star_half</span>
                <span>My Ratings</span>
              </a>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

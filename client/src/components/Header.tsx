import { Link } from "wouter";
import { Newspaper } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center">
              <Newspaper className="h-6 w-6 text-primary mr-2" />
              <h1 className="text-xl font-bold text-primary">Ynet News Reader</h1>
            </a>
          </Link>
          <div>
            <a 
              href="https://www.ynet.co.il" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Visit Ynet Website
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
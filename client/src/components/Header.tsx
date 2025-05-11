import { Link } from "wouter";
import { Newspaper } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Newspaper className="h-6 w-6 text-primary ml-2" />
            <h1 className="text-xl font-bold text-primary">קורא חדשות Ynet</h1>
          </Link>
          <div>
            <a 
              href="https://www.ynet.co.il" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              לאתר Ynet
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
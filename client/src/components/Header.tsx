import { Link } from "wouter";
import { Newspaper } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow-md">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Newspaper className="h-6 w-6 text-white ml-2" />
            <h1 className="text-xl font-bold text-white">קורא חדשות Ynet</h1>
          </Link>
          <a 
            href="https://www.ynet.co.il" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-white/80 hover:text-white transition-colors flex items-center"
          >
            לאתר Ynet
          </a>
        </div>
      </div>
    </header>
  );
}
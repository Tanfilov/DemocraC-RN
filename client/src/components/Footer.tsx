import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-3 mt-auto">
      <div className="px-4">
        <div className="flex justify-center items-center">
          <p className="text-xs text-muted-foreground dark:text-gray-400 flex items-center gap-1">
            <span>&copy; {new Date().getFullYear()}</span>
            <Heart className="h-3 w-3 text-red-500 dark:text-red-400" /> 
            <span>democra.C</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-3 mt-auto">
      <div className="px-4">
        <div className="flex justify-center items-center">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span>&copy; {new Date().getFullYear()}</span>
            <Heart className="h-3 w-3 text-red-500" /> 
            <span>קורא חדשות Ynet</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
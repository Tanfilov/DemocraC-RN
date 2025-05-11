import { Link } from "wouter";
// Import the logo image directly
import logoImage from "../assets/logo.png";

export default function Header() {
  return (
    <header className="bg-white sticky top-0 z-50 shadow-md">
      <div className="py-2">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center">
            <img 
              src={logoImage} 
              alt="democra.C Logo" 
              className="h-12 w-full object-contain"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
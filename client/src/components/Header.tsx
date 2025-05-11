import { Link } from "wouter";
import { useEffect, useRef } from "react";
// Import the logo image directly
import logoImage from "../assets/logo.png";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (headerRef.current) {
      const headerElement = headerRef.current;
      const headerRect = headerElement.getBoundingClientRect();
      console.log('Header dimensions:', {
        width: Math.round(headerRect.width),
        height: Math.round(headerRect.height),
        offsetWidth: headerElement.offsetWidth,
        offsetHeight: headerElement.offsetHeight
      });
    }
  }, []);

  return (
    <header ref={headerRef} className="bg-white sticky top-0 z-50 shadow-md">
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
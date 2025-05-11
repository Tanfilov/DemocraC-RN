import { Link } from "wouter";
// Use a direct path to the image
const logoImagePath = "/assets/logo.png";

export default function Header() {
  return (
    <header className="bg-[#FFB74D]/10 sticky top-0 z-50 shadow-md">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="h-12 flex justify-center">
              <img 
                src={logoImagePath} 
                alt="democra.C Logo" 
                className="h-full object-contain"
              />
            </div>
          </Link>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <a 
              href="https://www.ynet.co.il" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center"
            >
              לאתר Ynet
            </a>
            <a 
              href="https://www.mako.co.il" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center"
            >
              לאתר Mako
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
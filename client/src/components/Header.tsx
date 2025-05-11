import { Link } from "wouter";

export default function Header() {
  // The app logo with styling
  return (
    <header className="bg-gradient-to-r from-orange-50 to-orange-100 sticky top-0 z-50 shadow-md">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="h-12 flex items-center">
              <div className="flex items-baseline">
                <span className="text-2xl font-extrabold text-gray-700">democra</span>
                <span className="text-2xl font-extrabold text-orange-500">.C</span>
                <span className="text-xs text-gray-500 mr-1 mb-1">real time</span>
              </div>
              <div className="w-8 h-8 ml-1">
                <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10,25 C10,15 15,5 25,5 C35,5 40,15 40,25" fill="none" stroke="#e05d00" strokeWidth="5" strokeLinecap="round"/>
                  <path d="M20,25 C20,15 22,10 25,10 C28,10 30,15 30,25" fill="none" stroke="#e05d00" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M15,40 C15,32 20,20 25,20 C30,20 35,30 35,40" fill="#e05d00"/>
                  <path d="M38,32 L42,28 L38,24" fill="none" stroke="#e05d00" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
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
import { Link } from "wouter";
import headerBgImage from "../assets/header_bg.png";

export default function Header() {
  return (
    <Link href="/">
      <header 
        className="sticky top-0 z-50 shadow-md overflow-hidden cursor-pointer"
        style={{
          height: "140px", // Taller header to show more of the background
          backgroundImage: `url(${headerBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%' // Position to show the logo in center
        }}
      >
        {/* No overlay text needed as the background image contains the logo */}
      </header>
    </Link>
  );
}
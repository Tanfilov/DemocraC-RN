import { Link } from "wouter";
import headerBgImage from "../assets/header_bg.png";

export default function Header() {
  return (
    <Link href="/">
      <header 
        className="sticky top-0 z-50 shadow-md overflow-hidden cursor-pointer"
        style={{
          height: "80px", // Reduced height
          backgroundImage: `url(${headerBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 25%' // Adjusted to center the logo better
        }}
      >
        {/* No overlay text needed as the background image contains the logo */}
      </header>
    </Link>
  );
}
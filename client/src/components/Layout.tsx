import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import bgImage from "../assets/app_bg.png";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div 
      className="flex flex-col min-h-screen"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Header />
      <main className="flex-grow w-full px-3 py-4">
        {children}
      </main>
      <Footer />
    </div>
  );
}
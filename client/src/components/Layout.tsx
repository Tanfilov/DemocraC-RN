import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <main className="flex-grow w-full px-3 py-4 dark:text-gray-200">
        {children}
      </main>
      <Footer />
    </div>
  );
}
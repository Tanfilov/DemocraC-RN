import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <Link href="/political-news">
            <a className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800 mr-2">חדשות פוליטיות</h1>
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}

import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "../components/Header";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="pt-24 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-6xl font-bold text-gold-500 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Page Not Found</h2>
            <p className="text-slate-600 mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 bg-gold-500 hover:bg-gold-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              <Home size={16} />
              <span>Back to Configurator</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;

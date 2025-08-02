import { Link } from 'react-router-dom';
import { Home, Phone, Info } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TW</span>
          </div>
          <span className="text-xl font-bold text-slate-900">The Wall Shop</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-1 text-slate-600 hover:text-gold-500 transition-colors">
            <Home size={16} />
            <span>Configurator</span>
          </Link>
          <Link to="/about" className="flex items-center space-x-1 text-slate-600 hover:text-gold-500 transition-colors">
            <Info size={16} />
            <span>About</span>
          </Link>
          <Link to="/contact" className="flex items-center space-x-1 text-slate-600 hover:text-gold-500 transition-colors">
            <Phone size={16} />
            <span>Contact</span>
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <a href="tel:+44" className="hidden sm:block text-sm text-slate-600">
            Call: +44 (0) 123 456 789
          </a>
          <button className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-full transition-colors text-sm font-medium">
            Get Quote
          </button>
        </div>
      </div>
    </header>
  );
}

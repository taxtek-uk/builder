import { Link } from 'react-router-dom';
import { Home, Phone, Info, Mail, Grid3X3 } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl text-neutral-800 pl-2">
          The Wall Shop
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-1 text-neutral-600 hover:text-[#b89773] transition-colors">
            <Grid3X3 size={16} />
            <span>Configurator</span>
          </Link>
          <Link to="/about" className="flex items-center space-x-1 text-neutral-600 hover:text-[#b89773] transition-colors">
            <Info size={16} />
            <span>About</span>
          </Link>
          <Link to="/contact" className="flex items-center space-x-1 text-neutral-600 hover:text-[#b89773] transition-colors">
            <Mail size={16} />
            <span>Contact</span>
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <a href="tel:+441417393377" className="hidden sm:block text-sm text-neutral-600 hover:text-[#b89773] transition-colors">
            Call: +44 141 739 3377
          </a>
          <Link to="/quote" className="bg-[#b89773] hover:bg-[#a27f60] text-white px-4 py-2 rounded-full transition-colors text-sm font-medium">
            Get Quote
          </Link>
        </div>
      </div>
    </header>
  );
}

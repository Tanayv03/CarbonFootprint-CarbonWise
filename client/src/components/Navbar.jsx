import { Link, useLocation } from 'react-router-dom';
import { Leaf, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/' },
    { name: 'History', path: '/assistant' }, // Using assistant for history for now
  ];

  return (
    <nav className="sticky top-6 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="glass-earth px-6 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-earth-forest/10 p-2 rounded-2xl group-hover:bg-earth-sage/20 transition-colors">
            <Leaf className="w-6 h-6 text-earth-forest" />
          </div>
          <span className="text-xl font-bold tracking-tight text-earth-forest">
            CarbonWise
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-2 bg-white/40 p-1.5 rounded-full border border-white/50">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-earth-brown/70 hover:text-earth-brown hover:bg-white/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill-earth"
                    className="absolute inset-0 bg-earth-forest shadow-sm rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-white/60 border border-white flex items-center justify-center text-earth-forest hover:bg-earth-sage/30 transition-colors shadow-sm">
            <User className="w-5 h-5" />
          </button>
        </div>
        
      </div>
    </nav>
  );
}

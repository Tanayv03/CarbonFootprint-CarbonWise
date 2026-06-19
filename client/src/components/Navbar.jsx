import { Link, useLocation } from 'react-router-dom';
import { Leaf, BarChart2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/', icon: BarChart2 },
    { name: 'AI Assistant', path: '/assistant', icon: Sparkles },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-green-100 dark:border-green-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ rotate: 180 }} 
              transition={{ duration: 0.3 }}
              className="bg-green-100 p-2 rounded-xl"
            >
              <Leaf className="w-6 h-6 text-green-600" />
            </motion.div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-600">
              CarbonWise
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-green-50 dark:bg-green-800/50 p-1 rounded-2xl">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-green-700 dark:text-green-400' 
                      : 'text-green-600 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white dark:bg-green-800 shadow-sm rounded-xl"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

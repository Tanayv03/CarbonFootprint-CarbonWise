import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-3xl">🌍</span>
            <div className="flex flex-col justify-center">
              <span className="text-[17px] font-bold text-slate-900 leading-tight">Carbon Platform</span>
              <span className="text-[13px] text-[#10b981] font-medium leading-tight">Understand - Track - Reduce</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'bg-[#10b981] text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Calculate
            </Link>
            <Link
              to="/assistant"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/assistant'
                  ? 'text-slate-900 font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              History
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy loading components for code splitting efficiency
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AiAssistant = lazy(() => import('./pages/AiAssistant'));

function App() {
  return (
    <Router>
      <div 
        className="min-h-screen font-sans selection:bg-earth-sage selection:text-earth-brown text-earth-brown relative overflow-hidden"
      >
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:bg-earth-forest focus:text-white focus:p-4 focus:z-[9999] focus:outline-none">
          Skip to main content
        </a>
        {/* Fixed Background Image with subtle overlay */}
        <div 
          className="fixed inset-0 z-0 opacity-40 mix-blend-multiply"
          style={{ 
            backgroundImage: "url('/eco-bg.png')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-earth-beige/80 to-earth-sand/90" />
        
        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" tabIndex="-1">
            <ErrorBoundary>
              <Suspense fallback={<div className="w-full h-64 flex items-center justify-center font-bold text-earth-brown animate-pulse">Loading Application...</div>}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/assistant" element={<AiAssistant />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

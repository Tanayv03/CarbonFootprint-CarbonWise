import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AiAssistant from './pages/AiAssistant';

function App() {
  return (
    <Router>
      <div 
        className="min-h-screen font-sans selection:bg-earth-sage selection:text-earth-brown text-earth-brown relative overflow-hidden"
      >
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
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assistant" element={<AiAssistant />} />
              {/* Optional: Add Analytics, Goals, History empty routes for the navbar links */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

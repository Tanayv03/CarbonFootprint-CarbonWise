import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AiAssistant from './pages/AiAssistant';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#fafafa] text-slate-800 font-sans selection:bg-[#10b981] selection:text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assistant" element={<AiAssistant />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

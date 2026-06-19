import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AiAssistant from './pages/AiAssistant';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-white to-green-50 dark:from-green-800 dark:to-green-900 text-green-900 dark:text-green-50 font-sans selection:bg-eco-green selection:text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
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

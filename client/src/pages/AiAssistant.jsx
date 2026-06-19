import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, ShieldCheck, TrendingDown, Zap, Lightbulb, Car, Coffee, Droplets, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { getUserId } from '../utils/userId';

// Icon Map for dynamic rendering
const ICON_MAP = {
  TrendingDown, Zap, Lightbulb, Car, Coffee, Droplets, Trash2
};

export default function AiAssistant() {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const userId = getUserId();
      
      // Fetch user's historical data from Firestore via Backend
      const historyRes = await axios.get(`/api/footprint/${userId}/history`);
      
      let footprintData = {};
      if (historyRes.data.history && historyRes.data.history.length > 0) {
        // Send the entire history to Gemini for better trend analysis
        footprintData = historyRes.data.history;
      } else {
        // Fallback to local storage if API fails but local exists, or use default
        const storedData = localStorage.getItem('carbonwise_latest_footprint');
        if (storedData) {
          footprintData = [JSON.parse(storedData)];
        } else {
          footprintData = [{
            inputs: { transport: { milesDriven: 100 }, energy: { electricityKwh: 300 } },
            scores: { total: 900 }
          }];
        }
      }

      const response = await axios.post('/api/ai/analyze', {
        footprintData
      });

      if (response.data && response.data.recommendations) {
        setRecommendations(response.data.recommendations);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch AI insights. Make sure the backend server is running, the Gemini API key is configured, and Firebase is initialized.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl shadow-lg shadow-green-500/20 mb-2">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-600">
          Gemini Sustainability Assistant
        </h1>
        <p className="text-white0 max-w-xl mx-auto">
          AI-powered insights tailored precisely to your historical data, identifying your biggest emission sources and creating actionable reduction strategies.
        </p>
      </header>

      {isAnalyzing ? (
        <div className="glass dark:glass-dark rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="mb-6"
          >
            <RefreshCw className="w-12 h-12 text-green-500" />
          </motion.div>
          <h3 className="text-xl font-medium animate-pulse text-green-700 dark:text-green-200">
            Gemini is analyzing your footprint history...
          </h3>
          <div className="mt-8 flex gap-2">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-green-500 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="glass dark:glass-dark rounded-3xl p-8 text-center text-red-500 flex flex-col items-center">
          <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
          <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
          <p>{error}</p>
          <button onClick={fetchInsights} className="mt-6 px-6 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl font-medium">Try Again</button>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="glass dark:glass-dark rounded-3xl p-6 md:p-8 flex items-start gap-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl"></div>
            
            <div className="p-4 bg-white dark:bg-green-800 rounded-2xl shadow-sm z-10 shrink-0 hidden md:block">
              <ShieldCheck className="w-8 h-8 text-green-500" />
            </div>
            
            <div className="z-10">
              <h2 className="text-2xl font-bold mb-3">AI Executive Summary</h2>
              <p className="text-green-600 dark:text-green-200 leading-relaxed">
                Based on your historical footprint data from Firestore, Gemini has generated personalized, highly-specific recommendations targeting your biggest emission sources. Implement these targeted strategies to maximize your carbon reduction!
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-10 mb-4 px-2">Personalized Reduction Strategies</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec, i) => {
              const IconComponent = ICON_MAP[rec.iconName] || Lightbulb;
              return (
                <motion.div
                  key={rec.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="glass dark:glass-dark rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col"
                >
                  <div className={`w-12 h-12 rounded-2xl ${rec.bg} ${rec.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-green-900 dark:text-white">{rec.title}</h4>
                  <p className="text-sm text-green-600 dark:text-green-300 mb-6 flex-1">
                    {rec.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-green-50 dark:border-green-800">
                    <span className="text-xs font-semibold text-white0 uppercase tracking-wider">Est. Savings</span>
                    <span className={`font-bold ${rec.color}`}>{rec.savings}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-center pt-8">
            <button onClick={fetchInsights} className="px-8 py-3 bg-green-900 dark:bg-white text-white dark:text-green-900 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2 group">
              Generate New Plan
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

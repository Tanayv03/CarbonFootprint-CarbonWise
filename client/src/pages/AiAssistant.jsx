import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, ShieldCheck, TrendingDown, Zap, Lightbulb, Car, Coffee, Droplets, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { getUserId } from '../utils/userId';

const ICON_MAP = { TrendingDown, Zap, Lightbulb, Car, Coffee, Droplets, Trash2 };

const COMMON_REMEDIES = [
  {
    title: "Switch to LEDs",
    description: "Replace all incandescent bulbs with LEDs to use 75% less energy.",
    icon: Lightbulb,
    savings: "50 kg CO₂e/mo"
  },
  {
    title: "Reduce Meat Consumption",
    description: "Eat vegetarian meals 2-3 times a week to significantly lower methane and land-use emissions.",
    icon: Coffee,
    savings: "80 kg CO₂e/mo"
  },
  {
    title: "Use Public Transit",
    description: "Take the bus or train instead of driving alone to cut commute emissions drastically.",
    icon: Car,
    savings: "150 kg CO₂e/mo"
  },
  {
    title: "Fix Water Leaks",
    description: "A leaky faucet wastes gallons of water; fixing it saves the energy used to pump and heat water.",
    icon: Droplets,
    savings: "20 kg CO₂e/mo"
  }
];

/**
 * AiAssistant Component
 * Interacts with the backend to generate and display Gemini-powered insights
 * regarding the user's carbon footprint. Displays rule-based fallbacks on failure.
 * 
 * @returns {JSX.Element} The rendered AI Assistant page.
 */
export default function AiAssistant() {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const userId = getUserId();
      const historyRes = await axios.get(`/api/footprint/${userId}/history`);
      
      let footprintData = {};
      if (historyRes.data.history && historyRes.data.history.length > 0) {
        footprintData = historyRes.data.history;
      } else {
        const storedData = localStorage.getItem('carbonwise_latest_footprint');
        if (storedData) {
          footprintData = [JSON.parse(storedData)];
        } else {
          footprintData = [{ inputs: { transport: { milesDriven: 100 }, energy: { electricityKwh: 300 } }, scores: { total: 900 } }];
        }
      }

      const response = await axios.post('/api/ai/analyze', { footprintData });

      if (response.data && response.data.recommendations) {
        setRecommendations(response.data.recommendations);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch AI insights. Make sure the backend server is running and Gemini API is configured.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchInsights();
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="text-center space-y-4 pt-6">
        <div className="inline-flex items-center justify-center p-4 bg-earth-forest/10 rounded-3xl mb-2">
          <Sparkles className="w-8 h-8 text-earth-forest" />
        </div>
        <h1 className="text-4xl font-extrabold text-earth-brown tracking-tight">
          AI Sustainability Advisor
        </h1>
        <p className="text-earth-brown/60 max-w-2xl mx-auto font-medium text-lg">
          Personalized, actionable insights tailored to your historical data. We analyze your trends to identify your highest impact reduction strategies.
        </p>
      </header>

      {isAnalyzing ? (
        <div className="glass-earth p-16 flex flex-col items-center justify-center min-h-[400px]" aria-live="polite" aria-busy="true">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="mb-6">
            <RefreshCw className="w-12 h-12 text-earth-sage" />
          </motion.div>
          <h3 className="text-xl font-bold animate-pulse text-earth-brown">
            Gemini is analyzing your footprint history...
          </h3>
          <div className="mt-8 flex gap-3">
            {[1, 2, 3].map((i) => (
              <motion.div key={i} className="w-3 h-3 bg-earth-forest/50 rounded-full" animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }} />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="glass-earth p-12 text-center flex flex-col items-center bg-red-50/50" aria-live="assertive">
          <AlertCircle className="w-12 h-12 mb-4 text-red-400" aria-hidden="true" />
          <h3 className="text-xl font-bold mb-2 text-red-900">Analysis Failed</h3>
          <p className="text-red-700/80 font-medium max-w-md">{error}</p>
          <button onClick={fetchInsights} className="mt-8 px-8 py-3 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl font-bold transition-colors">Try Again</button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="glass-earth p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden bg-white/80">
            <div className="p-5 bg-earth-forest/10 rounded-3xl shrink-0">
              <ShieldCheck className="w-10 h-10 text-earth-forest" />
            </div>
            <div className="z-10 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-3 text-earth-brown">Executive Summary</h2>
              <p className="text-earth-brown/70 leading-relaxed font-medium text-lg">
                Based on your historical footprint data from Firestore, Gemini has generated personalized, highly-specific recommendations targeting your biggest emission sources. Implement these targeted strategies to maximize your carbon reduction!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec, i) => {
              const IconComponent = ICON_MAP[rec.iconName] || Lightbulb;
              return (
                <motion.div
                  key={rec.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                  className="glass-earth p-8 hover:-translate-y-2 transition-transform duration-300 group flex flex-col"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${rec.bg?.includes('red') ? 'bg-orange-100 text-orange-600' : 'bg-earth-sage/30 text-earth-forest'}`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-xl mb-3 text-earth-brown">{rec.title}</h4>
                  <p className="text-earth-brown/70 font-medium mb-8 flex-1 leading-relaxed">
                    {rec.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-5 border-t border-earth-brown/10">
                    <span className="text-xs font-bold text-earth-brown/40 uppercase tracking-widest">Est. Savings</span>
                    <span className="font-black text-earth-forest text-lg">{rec.savings}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-center pt-8">
            <button aria-label="Generate New AI Insights Plan" onClick={fetchInsights} className="px-8 py-4 bg-earth-forest text-white rounded-full font-bold shadow-lg shadow-earth-forest/20 hover:shadow-xl hover:bg-earth-forest/90 transition-all flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-earth-forest focus:ring-offset-2">
              Generate New Plan
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Common Default Remedies Section */}
      <div className="mt-16 border-t border-earth-brown/10 pt-12">
        <h2 className="text-3xl font-extrabold mb-8 text-earth-brown text-center">Common Ways to Reduce Your Footprint</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COMMON_REMEDIES.map((remedy, i) => (
             <div key={i} className="glass-earth p-6 flex flex-col items-start gap-4 hover:bg-white/60 transition-colors" tabIndex="0" role="region" aria-labelledby={`remedy-title-${i}`}>
               <div className="p-3 bg-earth-sage/20 rounded-xl" aria-hidden="true">
                 <remedy.icon className="w-6 h-6 text-earth-forest" />
               </div>
               <div>
                 <h4 id={`remedy-title-${i}`} className="font-bold text-earth-brown text-lg">{remedy.title}</h4>
                 <p className="text-sm font-medium text-earth-brown/70 mt-2 leading-relaxed">{remedy.description}</p>
                 <div className="mt-4 inline-block px-3 py-1 bg-earth-forest/10 text-earth-forest text-xs font-bold rounded-full">
                   Saves ~{remedy.savings}
                 </div>
               </div>
             </div>
          ))}
        </div>
      </div>

    </div>
  );
}

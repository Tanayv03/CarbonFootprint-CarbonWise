import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, AlertCircle, Zap, Car, Coffee, Trash2, Droplets, Target, Sparkles, Plus, Medal, TrendingDown } from 'lucide-react';
import axios from 'axios';
import { getUserId } from '../utils/userId';

const CATEGORIES = [
  { id: 'transport', title: 'Transportation', icon: Car, color: '#4F7942', bg: 'bg-[#4F7942]/10', textColor: 'text-[#4F7942]' },
  { id: 'energy', title: 'Energy', icon: Zap, color: '#8B6F47', bg: 'bg-[#8B6F47]/10', textColor: 'text-[#8B6F47]' },
  { id: 'food', title: 'Diet', icon: Coffee, color: '#A8C686', bg: 'bg-[#A8C686]/20', textColor: 'text-[#6b8550]' },
  { id: 'water', title: 'Water', icon: Droplets, color: '#A7D8F0', bg: 'bg-[#A7D8F0]/20', textColor: 'text-[#699cb4]' },
  { id: 'waste', title: 'Waste', icon: Trash2, color: '#E6DCCF', bg: 'bg-[#E6DCCF]/40', textColor: 'text-[#9c8b74]' },
];

export default function Dashboard() {
  const [trendData, setTrendData] = useState([]);
  const [formData, setFormData] = useState({
    transport: { milesDriven: 100, flightsTaken: 0 },
    energy: { electricityKwh: 300, gasTherms: 20 },
    food: { meatMeals: 7 },
    water: { dailyShowerMins: 15 },
    waste: { bagsOfTrash: 4 }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('transport');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = getUserId();
        const res = await axios.get(`/api/footprint/${userId}/history`);
        if (res.data.history && res.data.history.length > 0) {
          const formatted = res.data.history.map(record => ({
            month: record.month,
            footprint: record.scores.total
          }));
          setTrendData(formatted);
          const latest = res.data.history[res.data.history.length - 1];
          if (latest.inputs) {
            // Merge backwards compatibility
            setFormData(prev => ({...prev, ...latest.inputs}));
          }
        }
      } catch (error) {
        console.error("Failed to fetch footprint history", error);
      }
    };
    fetchHistory();
  }, []);

  const scores = useMemo(() => {
    const { transport, energy, food, water, waste } = formData;
    const tScore = Math.round((transport.milesDriven * 0.4 * 4) + ((transport.flightsTaken || 0) * 250));
    const eScore = Math.round((energy.electricityKwh * 0.4) + (energy.gasTherms * 5.3));
    const fScore = Math.round((food.meatMeals * 2.5 * 4));
    const wScore = Math.round((water.dailyShowerMins * 30 * 0.05));
    const waScore = Math.round((waste.bagsOfTrash * 10));

    return {
      transport: tScore,
      energy: eScore,
      food: fScore,
      water: wScore,
      waste: waScore,
      total: tScore + eScore + fScore + wScore + waScore
    };
  }, [formData]);

  const breakdownData = useMemo(() => CATEGORIES.map(cat => ({
    name: cat.title,
    value: scores[cat.id] || 1,
    color: cat.color,
    icon: cat.icon,
    bgClass: cat.bg,
    textClass: cat.textColor
  })), [scores]);

  const GLOBAL_AVG = 500; // Monthly avg estimate
  const sustainabilityScore = Math.max(0, Math.min(100, Math.round(100 - ((scores.total / GLOBAL_AVG) * 50))));

  const currentSuggestion = useMemo(() => {
    const highestCat = Object.keys(scores).filter(k => k !== 'total').reduce((a, b) => scores[a] > scores[b] ? a : b);
    if (highestCat === 'transport') return "Your transportation emissions are high. Consider carpooling or utilizing public transit 2 days a week to cut emissions by 15%.";
    if (highestCat === 'energy') return "Energy usage is your largest contributor. Smart thermostats and LED bulbs can reduce this segment significantly.";
    if (highestCat === 'food') return "Diet plays a major role in your footprint. Swapping 2 meat-heavy meals for plant-based options weekly can save ~100kg CO2e monthly.";
    return "You are doing great! Keep optimizing your daily habits to maintain a low footprint.";
  }, [scores]);

  const handleInputChange = useCallback((category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: Number(value) || 0 }
    }));
  }, []);

  const handleNextTab = useCallback(() => {
    const currentIndex = CATEGORIES.findIndex(cat => cat.id === activeTab);
    if (currentIndex < CATEGORIES.length - 1) {
      setActiveTab(CATEGORIES[currentIndex + 1].id);
    }
  }, [activeTab]);

  const handlePrevTab = useCallback(() => {
    const currentIndex = CATEGORIES.findIndex(cat => cat.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(CATEGORIES[currentIndex - 1].id);
    }
  }, [activeTab]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userId = getUserId();
      await axios.post('/api/footprint', { userId, inputs: formData, scores });
      const newMonth = new Date().toLocaleString('default', { month: 'short' });
      setTrendData(prev => [...prev, { month: newMonth, footprint: scores.total }]);
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, scores]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4 pb-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-earth-brown tracking-tight"
          >
            Your Impact
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-earth-brown/60 mt-2 text-lg font-medium"
          >
            Track, analyze, and reduce your carbon footprint.
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="glass-earth p-5 px-8 flex items-center gap-6 border-earth-forest/10"
        >
          <div>
            <div className="text-sm font-semibold text-earth-brown/60 uppercase tracking-wider">Total Monthly</div>
            <div className="text-4xl font-black text-earth-forest">
              {(scores.total / 1000).toFixed(2)}<span className="text-2xl text-earth-sage ml-1">t CO₂e</span>
            </div>
          </div>
          <div className="h-12 w-[1px] bg-earth-brown/10 hidden sm:block"></div>
          <button 
            aria-label="Log new footprint entry"
            onClick={handleSubmit} disabled={isSubmitting}
            className="hidden sm:flex items-center gap-2 bg-earth-forest text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-earth-forest/90 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-earth-forest focus:ring-offset-2"
          >
            {isSubmitting ? 'Syncing...' : 'Log Entry'}
          </button>
        </motion.div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* Quick Add Panel (Col span 7, Row span 2) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-earth md:col-span-7 row-span-2 p-8 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-earth-brown">Quick Logging</h2>
              <p className="text-sm text-earth-brown/60 font-medium mt-1">Adjust your weekly averages.</p>
            </div>
            <div className="flex gap-2 bg-white/50 p-1 rounded-xl">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveTab(cat.id)}
                  aria-label={`Switch to ${cat.title} category`}
                  aria-pressed={activeTab === cat.id}
                  className={`p-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-earth-forest ${activeTab === cat.id ? 'bg-white shadow-sm scale-105' : 'hover:bg-white/40 opacity-60'}`}
                >
                  <cat.icon className={`w-5 h-5 ${activeTab === cat.id ? cat.textColor : 'text-earth-brown'}`} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {activeTab === 'transport' && (
                  <>
                    <div>
                      <label className="flex justify-between text-sm font-semibold text-earth-brown mb-3">
                        <span>Miles driven weekly</span>
                        <span className="text-earth-forest">{formData.transport.milesDriven} mi</span>
                      </label>
                      <input type="range" min="0" max="1000" step="10" className="w-full h-2 bg-earth-sage/30 rounded-lg appearance-none cursor-pointer accent-earth-forest" 
                        value={formData.transport.milesDriven} onChange={(e) => handleInputChange('transport', 'milesDriven', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-earth-brown mb-2">Flights taken</label>
                      <input type="number" className="w-full p-3 rounded-xl border-none bg-white/60 focus:bg-white focus:ring-2 focus:ring-earth-sage outline-none font-medium text-earth-brown transition-all" 
                        value={formData.transport.flightsTaken} onChange={(e) => handleInputChange('transport', 'flightsTaken', e.target.value)} />
                    </div>
                  </>
                )}
                {activeTab === 'energy' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-earth-brown mb-2">Electricity (kWh)</label>
                      <input type="number" className="w-full p-3 rounded-xl border-none bg-white/60 focus:bg-white focus:ring-2 focus:ring-earth-sage outline-none font-medium text-earth-brown transition-all" 
                        value={formData.energy.electricityKwh} onChange={(e) => handleInputChange('energy', 'electricityKwh', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-earth-brown mb-2">Gas (Therms)</label>
                      <input type="number" className="w-full p-3 rounded-xl border-none bg-white/60 focus:bg-white focus:ring-2 focus:ring-earth-sage outline-none font-medium text-earth-brown transition-all" 
                        value={formData.energy.gasTherms} onChange={(e) => handleInputChange('energy', 'gasTherms', e.target.value)} />
                    </div>
                  </div>
                )}
                {activeTab === 'food' && (
                  <div>
                    <label className="flex justify-between text-sm font-semibold text-earth-brown mb-3">
                      <span>Meat-heavy meals weekly</span>
                      <span className="text-earth-forest">{formData.food.meatMeals} meals</span>
                    </label>
                    <input type="range" min="0" max="21" step="1" className="w-full h-2 bg-earth-sage/30 rounded-lg appearance-none cursor-pointer accent-earth-forest" 
                      value={formData.food.meatMeals} onChange={(e) => handleInputChange('food', 'meatMeals', e.target.value)} />
                  </div>
                )}
                {activeTab === 'water' && (
                  <div>
                    <label className="flex justify-between text-sm font-semibold text-earth-brown mb-3">
                      <span>Daily shower duration</span>
                      <span className="text-earth-forest">{formData.water.dailyShowerMins} mins</span>
                    </label>
                    <input type="range" min="0" max="60" step="1" className="w-full h-2 bg-earth-sage/30 rounded-lg appearance-none cursor-pointer accent-earth-forest" 
                      value={formData.water.dailyShowerMins} onChange={(e) => handleInputChange('water', 'dailyShowerMins', e.target.value)} />
                  </div>
                )}
                {activeTab === 'waste' && (
                  <div>
                    <label className="flex justify-between text-sm font-semibold text-earth-brown mb-3">
                      <span>Bags of trash weekly</span>
                      <span className="text-earth-forest">{formData.waste.bagsOfTrash} bags</span>
                    </label>
                    <input type="range" min="0" max="20" step="1" className="w-full h-2 bg-earth-sage/30 rounded-lg appearance-none cursor-pointer accent-earth-forest" 
                      value={formData.waste.bagsOfTrash} onChange={(e) => handleInputChange('waste', 'bagsOfTrash', e.target.value)} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {activeTab !== CATEGORIES[0].id && (
              <button onClick={handlePrevTab} className="w-full sm:w-auto bg-earth-sage/10 text-earth-brown px-6 py-3 rounded-xl font-bold hover:bg-earth-sage/30 transition-colors">
                Previous
              </button>
            )}
            {activeTab !== CATEGORIES[CATEGORIES.length - 1].id && (
              <button onClick={handleNextTab} className="w-full sm:w-auto bg-earth-sage/30 text-earth-forest px-6 py-3 rounded-xl font-bold hover:bg-earth-sage/50 transition-colors">
                Next Category
              </button>
            )}
            <button onClick={handleSubmit} className="w-full sm:hidden bg-earth-forest text-white py-3 rounded-xl font-bold">
              Log Entry
            </button>
          </div>
        </motion.div>

        {/* Sustainability Score Gauge (Col span 5, Row span 1) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-earth md:col-span-5 p-6 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex justify-between items-start z-10">
            <h3 className="font-bold text-earth-brown text-lg">Eco Score</h3>
            <div className="bg-white/60 px-3 py-1 rounded-full text-xs font-bold text-earth-forest flex items-center gap-1 border border-white">
              <Medal className="w-3 h-3" /> Top 20%
            </div>
          </div>
          
          <div className="h-32 w-full mt-4 relative z-10">
            <ResponsiveContainer width="100%" height="200%">
              <PieChart>
                <Pie data={[{value: sustainabilityScore}, {value: 100 - sustainabilityScore}]} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={80} outerRadius={100} paddingAngle={0} dataKey="value" stroke="none" cornerRadius={10}>
                  <Cell fill="#4F7942" />
                  <Cell fill="rgba(255,255,255,0.4)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center">
              <span className="text-5xl font-black text-earth-forest">{sustainabilityScore}</span>
              <span className="text-xs font-bold text-earth-brown/40 uppercase tracking-widest mt-1">Out of 100</span>
            </div>
          </div>
        </motion.div>

        {/* Category Breakdown (Col span 5, Row span 1) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-earth md:col-span-5 p-6 flex flex-col gap-4 overflow-hidden"
        >
          <h3 className="font-bold text-earth-brown text-lg mb-1">Emissions Source</h3>
          <div className="flex flex-col gap-3 flex-1 justify-center">
            {breakdownData.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${item.bgClass}`}>
                    <item.icon className={`w-4 h-4 ${item.textClass}`} />
                  </div>
                  <span className="text-sm font-semibold text-earth-brown">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-white/50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min((item.value / scores.total) * 100, 100)}%`, backgroundColor: item.color }} />
                  </div>
                  <span className="text-sm font-bold text-earth-brown w-10 text-right">{Math.round((item.value / scores.total) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Monthly Trend Chart (Col span 7, Row span 1) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass-earth md:col-span-7 p-6 min-h-[250px] flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-earth-brown text-lg">Trend Analytics</h3>
            <span className="text-xs font-bold text-earth-sage bg-earth-sage/10 px-3 py-1 rounded-full"><TrendingDown className="w-3 h-3 inline mr-1" /> -12% vs last month</span>
          </div>
          <div className="flex-1 w-full">
            {trendData.length > 0 ? (
              <>
                <table className="sr-only">
                  <caption>Monthly Carbon Footprint Trend Data</caption>
                  <thead><tr><th scope="col">Month</th><th scope="col">Total Footprint</th></tr></thead>
                  <tbody>
                    {trendData.map((d, i) => <tr key={i}><td>{d.month}</td><td>{d.footprint} kg CO2e</td></tr>)}
                  </tbody>
                </table>
                <ResponsiveContainer width="100%" height="100%" aria-hidden="true">
                  <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFoot" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F7942" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4F7942" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(139,111,71,0.1)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#8B6F47', opacity: 0.6, fontSize: 12, fontWeight: 600}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#8B6F47', opacity: 0.6, fontSize: 12, fontWeight: 600}} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', color: '#8B6F47', fontWeight: 600 }} 
                      itemStyle={{ color: '#4F7942' }}
                    />
                    <Area type="monotone" dataKey="footprint" stroke="#4F7942" strokeWidth={4} fillOpacity={1} fill="url(#colorFoot)" />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-earth-brown/40 font-medium">
                Log entries to generate trend data.
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Recommendations (Col span 5, Row span 1) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="glass-earth md:col-span-5 p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-earth-forest/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-earth-forest/10 transition-colors"></div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-earth-forest" />
            <h3 className="font-bold text-earth-brown text-lg">AI Insights</h3>
          </div>
          <p className="text-earth-brown/80 font-medium leading-relaxed">
            {currentSuggestion}
          </p>
          <Link to="/assistant" className="mt-6 inline-flex text-sm font-bold text-earth-forest items-center gap-1 hover:gap-2 transition-all">
            Generate detailed plan <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}

// ArrowRight placeholder since it was missing in imports
function ArrowRight(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
}

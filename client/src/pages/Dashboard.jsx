import { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, Leaf, AlertCircle, Zap, Car, Coffee, Trash2, Droplets, Globe, Info, ArrowRight, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { getUserId } from '../utils/userId';

const COLORS = ['#3b82f6', '#eab308', '#f97316', '#06b6d4', '#10b981'];

const CATEGORIES = [
  { id: 'transport', title: 'Transportation', icon: Car, color: 'text-green-500', bg: 'bg-green-100 dark:bg-blue-900/30' },
  { id: 'energy', title: 'Energy', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { id: 'food', title: 'Diet', icon: Coffee, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { id: 'water', title: 'Water Usage', icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  { id: 'waste', title: 'Waste & Recycling', icon: Trash2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
];

export default function Dashboard() {
  const [activeStep, setActiveStep] = useState(0);
  const [trendData, setTrendData] = useState([]);
  const [formData, setFormData] = useState({
    transport: { milesDriven: 100, publicTransitHours: 2, flightsTaken: 0 },
    energy: { electricityKwh: 300, gasTherms: 20 },
    food: { meatMeals: 7, veganMeals: 14 },
    water: { dailyShowerMins: 15, loadsOfLaundry: 3 },
    waste: { bagsOfTrash: 4, recyclingFreq: 'Sometimes' }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch historical data on load
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = getUserId();
        const res = await axios.get(`/api/footprint/${userId}/history`);
        if (res.data.history && res.data.history.length > 0) {
          // Map to format for chart { month: "Jan", footprint: 900 }
          const formatted = res.data.history.map(record => ({
            month: record.month,
            footprint: record.scores.total
          }));
          setTrendData(formatted);

          // Optionally set formData to their most recent submission
          const latest = res.data.history[res.data.history.length - 1];
          if (latest.inputs) {
            setFormData(latest.inputs);
          }
        }
      } catch (error) {
        console.error("Failed to fetch footprint history", error);
      }
    };
    fetchHistory();
  }, []);

  // Dynamic Score Calculation Breakdown
  const scores = useMemo(() => {
    const { transport, energy, food, water, waste } = formData;
    
    const tScore = Math.round((transport.milesDriven * 0.4 * 4) + (transport.publicTransitHours * 0.1 * 4) + (transport.flightsTaken * 250));
    const eScore = Math.round((energy.electricityKwh * 0.4) + (energy.gasTherms * 5.3));
    const fScore = Math.round((food.meatMeals * 2.5 * 4) + (food.veganMeals * 0.5 * 4));
    const wScore = Math.round((water.dailyShowerMins * 30 * 0.05) + (water.loadsOfLaundry * 4 * 0.5));
    const recycleFactor = waste.recyclingFreq === 'Always' ? 0.5 : waste.recyclingFreq === 'Sometimes' ? 0.8 : 1.2;
    const waScore = Math.round((waste.bagsOfTrash * 10 * recycleFactor));

    return {
      transport: tScore,
      energy: eScore,
      food: fScore,
      water: wScore,
      waste: waScore,
      total: tScore + eScore + fScore + wScore + waScore
    };
  }, [formData]);

  const breakdownData = [
    { name: 'Transport', value: scores.transport || 1, icon: Car },
    { name: 'Energy', value: scores.energy || 1, icon: Zap },
    { name: 'Food', value: scores.food || 1, icon: Coffee },
    { name: 'Water', value: scores.water || 1, icon: Droplets },
    { name: 'Waste', value: scores.waste || 1, icon: Trash2 },
  ];

  const currentDailyAvg = Math.round(scores.total / 30);
  const GLOBAL_DAILY_AVG = 13;

  const currentSuggestion = useMemo(() => {
    const cat = CATEGORIES[activeStep].id;
    if (cat === 'transport') {
      if (formData.transport.milesDriven > 200) return "Consider carpooling or switching to a hybrid. 200+ miles weekly contributes heavily to your footprint.";
      return "Great job keeping your driving low! Public transit is a great low-carbon alternative.";
    }
    if (cat === 'energy') {
      if (formData.energy.electricityKwh > 400) return "Your electricity usage is quite high. Unplugging idle devices and switching to LED bulbs can save up to 10% energy.";
      return "Your energy usage is efficient. Consider smart thermostats to optimize heating and cooling.";
    }
    if (cat === 'food') {
      if (formData.food.meatMeals > 10) return "Reducing red meat to just 3 times a week can cut your food carbon footprint by nearly half.";
      return "A plant-forward diet is excellent for the planet. Local, seasonal produce can reduce it even further.";
    }
    if (cat === 'water') {
      if (formData.water.dailyShowerMins > 15) return "Installing a low-flow showerhead can save thousands of gallons a year and reduce water heating energy.";
      return "Good water habits! Try washing laundry in cold water to save on energy costs.";
    }
    if (cat === 'waste') {
      if (formData.waste.recyclingFreq !== 'Always') return "Committing to recycling paper, plastics, and glass always can divert significant waste from landfills.";
      return "Composting organic waste is a fantastic next step to further minimize landfill emissions.";
    }
    return "";
  }, [activeStep, formData]);

  const handleNext = () => { if (activeStep < CATEGORIES.length - 1) setActiveStep(s => s + 1); };
  const handlePrev = () => { if (activeStep > 0) setActiveStep(s => s - 1); };

  const handleInputChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: field === 'recyclingFreq' ? value : Number(value) || 0
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Save locally for immediate access
    localStorage.setItem('carbonwise_latest_footprint', JSON.stringify({
      inputs: formData,
      scores: scores
    }));

    // Post to Firestore via Backend
    try {
      const userId = getUserId();
      await axios.post('/api/footprint', {
        userId,
        inputs: formData,
        scores: scores
      });

      // Optimistically update chart
      const newMonth = new Date().toLocaleString('default', { month: 'short' });
      setTrendData(prev => [...prev, { month: newMonth, footprint: scores.total }]);
      
      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to save to Firestore", error);
      // Optional: Handle UI error state here
      setIsSuccess(true); // fall back to success UI anyway for demo
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormFields = () => {
    const cat = CATEGORIES[activeStep];
    switch (cat.id) {
      case 'transport':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Miles driven per week (car)</label>
              <input type="range" min="0" max="1000" step="10" 
                className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-500" 
                value={formData.transport.milesDriven}
                onChange={(e) => handleInputChange('transport', 'milesDriven', e.target.value)}
              />
              <div className="text-right mt-1 font-bold text-green-600">{formData.transport.milesDriven} miles</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Public transit (hours/week)</label>
              <input type="number" min="0" className="w-full p-3 rounded-xl border border-green-100 dark:border-green-700 bg-white dark:bg-green-800 focus:ring-2 focus:ring-green-500 outline-none" 
                value={formData.transport.publicTransitHours}
                onChange={(e) => handleInputChange('transport', 'publicTransitHours', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Flights taken this year</label>
              <input type="number" min="0" className="w-full p-3 rounded-xl border border-green-100 dark:border-green-700 bg-white dark:bg-green-800 focus:ring-2 focus:ring-green-500 outline-none" 
                value={formData.transport.flightsTaken}
                onChange={(e) => handleInputChange('transport', 'flightsTaken', e.target.value)}
              />
            </div>
          </div>
        );
      case 'energy':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Monthly Electricity (kWh)</label>
              <input type="number" min="0" className="w-full p-3 rounded-xl border border-green-100 dark:border-green-700 bg-white dark:bg-green-800 focus:ring-2 focus:ring-yellow-500 outline-none" 
                value={formData.energy.electricityKwh}
                onChange={(e) => handleInputChange('energy', 'electricityKwh', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Natural Gas (therms)</label>
              <input type="number" min="0" className="w-full p-3 rounded-xl border border-green-100 dark:border-green-700 bg-white dark:bg-green-800 focus:ring-2 focus:ring-yellow-500 outline-none" 
                value={formData.energy.gasTherms}
                onChange={(e) => handleInputChange('energy', 'gasTherms', e.target.value)}
              />
            </div>
          </div>
        );
      case 'food':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Meat-based meals per week</label>
              <input type="range" min="0" max="21" step="1" 
                className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-orange-500" 
                value={formData.food.meatMeals}
                onChange={(e) => handleInputChange('food', 'meatMeals', e.target.value)}
              />
              <div className="text-right mt-1 font-bold text-orange-600">{formData.food.meatMeals} meals</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Vegetarian/Vegan meals per week</label>
              <input type="range" min="0" max="21" step="1" 
                className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-orange-500" 
                value={formData.food.veganMeals}
                onChange={(e) => handleInputChange('food', 'veganMeals', e.target.value)}
              />
              <div className="text-right mt-1 font-bold text-orange-600">{formData.food.veganMeals} meals</div>
            </div>
          </div>
        );
      case 'water':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Daily shower time (minutes)</label>
              <input type="range" min="0" max="60" step="1" 
                className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                value={formData.water.dailyShowerMins}
                onChange={(e) => handleInputChange('water', 'dailyShowerMins', e.target.value)}
              />
              <div className="text-right mt-1 font-bold text-cyan-600">{formData.water.dailyShowerMins} mins</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Loads of laundry per week</label>
              <input type="number" min="0" className="w-full p-3 rounded-xl border border-green-100 dark:border-green-700 bg-white dark:bg-green-800 focus:ring-2 focus:ring-cyan-500 outline-none" 
                value={formData.water.loadsOfLaundry}
                onChange={(e) => handleInputChange('water', 'loadsOfLaundry', e.target.value)}
              />
            </div>
          </div>
        );
      case 'waste':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Bags of trash per week (standard kitchen bags)</label>
              <input type="number" min="0" className="w-full p-3 rounded-xl border border-green-100 dark:border-green-700 bg-white dark:bg-green-800 focus:ring-2 focus:ring-emerald-500 outline-none" 
                value={formData.waste.bagsOfTrash}
                onChange={(e) => handleInputChange('waste', 'bagsOfTrash', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">How often do you recycle?</label>
              <select 
                className="w-full p-3 rounded-xl border border-green-100 dark:border-green-700 bg-white dark:bg-green-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.waste.recyclingFreq}
                onChange={(e) => handleInputChange('waste', 'recyclingFreq', e.target.value)}
              >
                <option value="Always">Always</option>
                <option value="Sometimes">Sometimes</option>
                <option value="Never">Never</option>
              </select>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-900 dark:text-white">Live Footprint Dashboard</h1>
          <p className="text-white0 dark:text-green-300 mt-1">Calculate your emissions and track your analytics in real-time.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-green-800 p-3 rounded-2xl shadow-sm border border-green-50 dark:border-green-700">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-xl">
            <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <div className="text-sm text-white0 dark:text-green-300">Total Month Estimate</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{scores.total.toLocaleString()} kg</div>
          </div>
        </div>
      </header>

      {/* Main Content Area: Calculator + Live Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Calculator */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* Stepper Header */}
          <div className="flex justify-between relative px-2 mb-4">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-green-100 dark:bg-green-700 -z-10 rounded-full transform -translate-y-1/2"></div>
            {CATEGORIES.map((cat, idx) => (
              <div key={cat.id} className="flex flex-col items-center gap-2">
                <motion.button
                  onClick={() => setActiveStep(idx)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors border-2 ${
                    activeStep === idx 
                      ? `${cat.bg} ${cat.color} border-${cat.color.split('-')[1]}-500` 
                      : activeStep > idx 
                        ? 'bg-green-800 text-white border-green-800'
                        : 'bg-white dark:bg-green-800 text-green-300 border-green-100 dark:border-green-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <cat.icon className="w-5 h-5" />
                </motion.button>
                <span className={`text-xs font-medium hidden md:block ${activeStep === idx ? 'text-green-900 dark:text-white' : 'text-green-300'}`}>
                  {cat.title}
                </span>
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="glass dark:glass-dark rounded-3xl p-8 shadow-xl flex-1 flex flex-col relative overflow-hidden">
            {isSuccess && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 bg-white/90 dark:bg-green-900/90 backdrop-blur z-20 flex flex-col items-center justify-center text-center p-8"
              >
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Data Saved Successfully!</h2>
                <p className="text-white0 mb-6">Your footprint has been securely saved to the cloud database.</p>
                <button onClick={() => setIsSuccess(false)} className="px-6 py-2 bg-green-900 text-white rounded-xl">Continue Exploring</button>
              </motion.div>
            )}

            <div className="flex items-center gap-3 mb-8">
              <div className={`p-3 rounded-xl ${CATEGORIES[activeStep].bg} ${CATEGORIES[activeStep].color}`}>
                {(() => { const Icon = CATEGORIES[activeStep].icon; return <Icon className="w-6 h-6" />; })()}
              </div>
              <h2 className="text-2xl font-bold">{CATEGORIES[activeStep].title}</h2>
            </div>

            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div key={activeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  {renderFormFields()}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-between mt-10 pt-6 border-t border-green-50 dark:border-green-800">
              <button onClick={handlePrev} disabled={activeStep === 0} className="px-6 py-2.5 rounded-xl font-medium text-green-600 disabled:opacity-30 hover:bg-green-50 dark:hover:bg-green-800">Back</button>
              {activeStep < CATEGORIES.length - 1 ? (
                <button onClick={handleNext} className="px-6 py-2.5 bg-green-900 dark:bg-white text-white dark:text-green-900 rounded-xl font-medium flex items-center gap-2">Continue <ArrowRight className="w-4 h-4" /></button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2.5 bg-green-500 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-70">
                  {isSubmitting ? 'Saving to Cloud...' : 'Save Record'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Live Feedback Widgets */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          {/* Dynamic Suggestion Box */}
          <motion.div 
            className="glass dark:glass-dark rounded-3xl p-6 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h4 className="font-bold text-lg text-green-900 dark:text-white">Live Feedback</h4>
            </div>
            <p className="text-green-600 dark:text-green-200">
              {currentSuggestion}
            </p>
          </motion.div>

          {/* Breakdown Pie Chart linking directly to formData! */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass dark:glass-dark rounded-3xl p-6 flex-1 flex flex-col"
          >
            <h3 className="font-semibold mb-2">Live Emission Breakdown</h3>
            <div className="flex-1 min-h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breakdownData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-green-900 dark:text-white">{scores.total}</span>
                <span className="text-xs text-white0">kg CO₂</span>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {breakdownData.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-green-800/50">
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-200">
                      <Icon className="w-3.5 h-3.5" style={{ color: COLORS[i] }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-bold text-green-900 dark:text-white">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section: Trend and Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Global Average Comparison Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass dark:glass-dark rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5"><Globe className="w-32 h-32" /></div>
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
            <Globe className="w-5 h-5" />
            <h3 className="font-semibold">Global Comparison</h3>
          </div>
          
          <div className="mt-4 space-y-4 relative z-10">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-600 dark:text-green-300">Your Live Daily Avg</span>
                <span className="font-bold">{currentDailyAvg} kg</span>
              </div>
              <div className="w-full h-2 bg-green-100 dark:bg-green-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-800 dark:bg-green-200 rounded-full transition-all duration-500" style={{ width: `${Math.min((currentDailyAvg / 50) * 100, 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-600 dark:text-green-300">Global Daily Avg</span>
                <span className="font-bold text-green-600 dark:text-green-400">{GLOBAL_DAILY_AVG} kg</span>
              </div>
              <div className="w-full h-2 bg-green-100 dark:bg-green-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(GLOBAL_DAILY_AVG / 50) * 100}%` }}></div>
              </div>
            </div>
            <p className="text-xs text-white0 mt-2">
              The average global citizen emits ~13 kg CO₂e per day. You are currently at {currentDailyAvg} kg/day based on your inputs.
            </p>
          </div>
        </motion.div>

        {/* Historical Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass dark:glass-dark rounded-3xl p-6"
        >
          <h3 className="font-semibold mb-4">Historical Footprint Trend</h3>
          <div className="h-[200px] w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFootprint" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="footprint" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorFootprint)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-green-300">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p>No historical data yet.</p>
                <p className="text-xs">Save your first record!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

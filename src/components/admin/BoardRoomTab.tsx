"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Activity, Users, ShoppingBag, X, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function DrilldownModal({ title, value, data, suffix, onClose }: { title: string, value: string, data: any[], suffix?: string, onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1a1a1a]">
            <div>
              <h2 className="text-white/60 text-sm font-bold uppercase tracking-widest">{title} Drill-down</h2>
              <div className="text-4xl font-bold text-white mt-1">{value}</div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white">
              <X size={24} />
            </button>
          </div>
          <div className="p-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#cfa15f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#cfa15f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="dailyRevenue" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v.toLocaleString()}`} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="dailyRevenue" stroke="#cfa15f" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function BoardRoomTab({ financials, overview }: { financials: any, overview: any }) {
  const [drilldown, setDrilldown] = useState<any | null>(null);

  if (!financials?.profitability) return <div className="animate-pulse flex gap-4">Loading Board Room...</div>;

  const prof = financials.profitability;
  const eco = financials.unitEconomics;

  const metrics = [
    { id: 'rev', title: 'Net Revenue', value: `₹${prof.netRevenue.toLocaleString('en-IN')}`, icon: DollarSign, trend: '+12.4%', metricKey: 'revenue' },
    { id: 'marg', title: 'Net Margin', value: `${prof.netMarginPercent}%`, icon: TrendingUp, trend: '+2.1%', metricKey: 'margin' },
    { id: 'ltv', title: 'Customer LTV', value: `₹${eco.ltv.toLocaleString('en-IN')}`, icon: Users, trend: '+5.0%', metricKey: 'ltv' },
    { id: 'cac', title: 'Blended CAC', value: `₹${eco.cac.toLocaleString('en-IN')}`, icon: Activity, trend: '-1.2%', metricKey: 'cac' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Hero Executive Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <motion.div
            key={m.id}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDrilldown(m)}
            className="cursor-pointer bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#cfa15f]/0 via-[#cfa15f]/5 to-[#cfa15f]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-[#cfa15f]/10 rounded-2xl">
                <m.icon size={24} className="text-[#cfa15f]" />
              </div>
              <span className={`text-sm font-bold ${m.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'} bg-white/5 px-2 py-1 rounded-lg`}>
                {m.trend}
              </span>
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-black text-white mb-1 tracking-tight">{m.value}</div>
              <div className="text-sm text-white/50 font-bold uppercase tracking-widest">{m.title}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {drilldown && (
        <DrilldownModal 
          title={drilldown.title} 
          value={drilldown.value} 
          data={financials.revenueTrend} // In a real app we would map this to the specific metric's trend
          onClose={() => setDrilldown(null)} 
        />
      )}

      {/* Secondary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl">
           <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Unit Economics Summary</h3>
           <div className="space-y-6">
             <div className="flex justify-between items-end">
               <div>
                 <div className="text-white/40 text-xs mb-1">Return on Ad Spend (ROAS)</div>
                 <div className="text-3xl font-light text-white">{eco.roas}x</div>
               </div>
               <div className="w-1/2 bg-white/5 h-2 rounded-full overflow-hidden">
                 <div style={{ width: `${Math.min(100, parseFloat(eco.roas) * 20)}%` }} className="bg-[#cfa15f] h-full" />
               </div>
             </div>
             
             <div className="flex justify-between items-end">
               <div>
                 <div className="text-white/40 text-xs mb-1">LTV : CAC Ratio</div>
                 <div className="text-3xl font-light text-[#cfa15f]">{eco.ltvCacRatio}</div>
               </div>
               <div className="w-1/2 bg-white/5 h-2 rounded-full overflow-hidden">
                 <div style={{ width: `${Math.min(100, (parseFloat(eco.ltvCacRatio) / 3) * 100)}%` }} className="bg-green-500 h-full" />
               </div>
             </div>
             
             <div className="text-[10px] text-white/30 uppercase tracking-widest text-right mt-4">(Ideal VC target LTV:CAC &gt; 3.0)</div>
           </div>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Cashflow Trajectory</h3>
          <div className="grid grid-cols-2 gap-4 h-full">
             <div className="bg-gradient-to-b from-[#1a1a1a] to-transparent p-5 rounded-2xl border border-white/5">
                <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Tokens Collected</div>
                <div className="text-2xl font-bold text-white mb-1">₹{financials.cashflow.tokensCollected.toLocaleString()}</div>
                <div className="text-xs text-green-400">In Bank</div>
             </div>
             <div className="bg-gradient-to-b from-[#1a1a1a] to-transparent p-5 rounded-2xl border border-white/5">
                <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Pending Balances</div>
                <div className="text-2xl font-bold text-[#cfa15f] mb-1">₹{financials.cashflow.balancePending.toLocaleString()}</div>
                <div className="text-xs text-yellow-400">At Dispatch / COD</div>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}

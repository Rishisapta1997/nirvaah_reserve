"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { RefreshCw, MapPin, Monitor, Smartphone, Globe, Target, Flame } from "lucide-react";

const COLORS = ["#cfa15f", "#b07c36", "#e8c88a", "#6b4e1e", "#f5e6c8", "#2563eb", "#9333ea"];

export function TrendsTab({ range }: { range: string }) {
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/marketing?range=${range}`);
        if (res.ok) setTrends(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [range]);

  if (loading || !trends) return <div className="flex items-center justify-center py-32 text-white/30"><RefreshCw size={24} className="animate-spin mr-3 text-[#cfa15f]" /> Syncing Marketing Intelligence…</div>;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Campaign ROI & Spend */}
        <div className="bg-[#111] border border-white/8 rounded-3xl p-6 shadow-xl shadow-black/40">
           <h3 className="text-sm font-bold text-white/60 mb-6 uppercase tracking-widest flex items-center gap-2">
             <Target size={18} className="text-[#cfa15f]" /> Platform Return on Spend
           </h3>
           <div className="space-y-6">
             {trends.platforms?.map((p: any, i: number) => (
               <div key={i} className="flex items-center justify-between group p-3 bg-white/5 rounded-xl border border-white/5 hover:border-[#cfa15f]/30 transition-all">
                 <div>
                   <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full \${p.platform === 'Google' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                     <span className="text-white font-bold">{p.platform} Ads</span>
                   </div>
                   <div className="text-xs text-white/40 mt-1">{p.clicks} clicks driving traffic</div>
                 </div>
                 <div className="text-right">
                   <div className="text-xl font-light text-white">₹{p.spend.toLocaleString()}</div>
                   <div className="text-xs text-[#cfa15f] font-mono">₹{p.cpc} / click</div>
                 </div>
               </div>
             ))}
             {(!trends.platforms || trends.platforms.length === 0) && (
               <div className="text-white/20 text-sm mt-8 text-center">No platform spend recorded</div>
             )}
           </div>
        </div>

        {/* UTM Campaigns Breakdown */}
        <div className="bg-[#111] border border-white/8 rounded-3xl p-6 shadow-xl shadow-black/40">
           <h3 className="text-sm font-bold text-white/60 mb-6 uppercase tracking-widest flex items-center gap-2">
             <Globe size={18} className="text-[#cfa15f]" /> UTM Campaign Performance 
           </h3>
           <div className="space-y-3">
             {trends.campaigns?.map((c: any, i: number) => (
                <div key={i} className="flex flex-col gap-2 p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-mono text-sm tracking-widest bg-black/50 px-2 py-0.5 rounded border border-white/10">{c.campaign}</span>
                    <span className="text-green-400 text-xs font-bold bg-green-500/10 px-2 py-1 rounded">{c.cvr} CVR</span>
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <div>
                      <div className="text-white/30 text-[10px] uppercase tracking-widest">Views</div>
                      <div className="text-white font-bold">{c.views.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-white/30 text-[10px] uppercase tracking-widest text-right">Conversions</div>
                      <div className="text-[#cfa15f] font-bold text-xl">{c.conversions.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
             ))}
             {(!trends.campaigns || trends.campaigns.length === 0) && (
               <div className="text-white/20 text-sm mt-8 text-center">No UTM tracking active</div>
             )}
           </div>
        </div>

        {/* Browser Funnel */}
        <div className="bg-[#111] border border-white/8 rounded-3xl p-6 shadow-xl shadow-black/40">
           <h3 className="text-sm font-bold text-white/60 mb-4 uppercase tracking-widest flex items-center gap-2">
             <Flame size={18} className="text-[#cfa15f]" /> Browser & OS Conversions
           </h3>
           {trends.browsers?.length > 0 ? (
             <ResponsiveContainer width="100%" height={250}>
               <BarChart data={trends.browsers}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                 <XAxis dataKey="browser" tick={{ fill: "#ffffff50", fontSize: 11 }} />
                 <YAxis tick={{ fill: "#ffffff50", fontSize: 11 }} />
                 <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff15", borderRadius: 12 }} cursor={{ fill: "#ffffff05" }} />
                 <Bar dataKey="views" fill="#cfa15f" radius={[4, 4, 0, 0]} name="Site Views" />
                 <Bar dataKey="conversions" fill="#22c55e" radius={[4, 4, 0, 0]} name="Orders" />
               </BarChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-48 flex items-center justify-center text-white/20 text-sm">No tracking data</div>
           )}
        </div>

      </div>
    </div>
  );
}

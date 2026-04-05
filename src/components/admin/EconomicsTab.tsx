"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#6366f1"];

export function EconomicsTab({ financials }: { financials: any }) {
  if (!financials) return <div className="animate-pulse">Loading Economics...</div>;

  const { profitability, unitEconomics, cancellations } = financials;

  const waterfallData = [
    { name: "Net Profit", value: Math.max(0, profitability.netProfit) },
    { name: "Cost of Goods (COGS)", value: profitability.totalCogs },
    { name: "Marketing Spend", value: profitability.totalSpend },
    { name: "Shipping Costs", value: profitability.totalShipping },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Waterfall / Cost Breakdown */}
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl lg:col-span-2">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest">Financial Cost Distribution</h3>
            <span className="bg-white/5 px-3 py-1 rounded-full text-xs text-white/50 border border-white/10">All Time</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={waterfallData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value">
                    {waterfallData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff15", borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)" }} itemStyle={{ color: "white" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full md:w-1/2 space-y-4">
              {waterfallData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-white/70 text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-white font-bold tracking-wider">₹{(item.value || 0).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#cfa15f]/10 border border-[#cfa15f]/30 mt-6">
                <span className="text-[#cfa15f] font-bold uppercase tracking-widest text-xs">Total Gross Revenue</span>
                <span className="text-[#cfa15f] font-black tracking-wider text-xl">₹{profitability.netRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* The VC Panel */}
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
           <div>
             <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">VC Risk Metrics</h3>
             
             <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-white/50 text-xs uppercase tracking-wider">Target AOV vs Actual</div>
                    <div className="text-xs text-green-400 font-bold">Healthy</div>
                  </div>
                  <div className="text-3xl font-light text-white mb-1">₹{unitEconomics.aov.toLocaleString()}</div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="w-4/5 bg-green-500 h-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-white/50 text-xs uppercase tracking-wider">Refund Velocity</div>
                    <div className="text-xs text-red-400 font-bold">{cancellations.count} Orders</div>
                  </div>
                  <div className="text-3xl font-light text-white mb-1">₹{cancellations.value.toLocaleString()}</div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="w-[15%] bg-red-500 h-full" />
                  </div>
                </div>
             </div>
           </div>

           <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20">
              <div className="text-red-400 mb-1">Marketing Cost Alert</div>
              <div className="text-xs text-white/50">Your blended CAC is ₹{unitEconomics.cac}. Monitor ad spend efficiency.</div>
           </div>
        </div>

      </div>
    </div>
  );
}

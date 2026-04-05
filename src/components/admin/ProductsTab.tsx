"use client";

import { useEffect, useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Label } from 'recharts';
import { Package, MapPin } from "lucide-react";

export function ProductsTab() {
  const [matrix, setMatrix] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatrix() {
      const res = await fetch("/api/analytics/products-matrix");
      if (res.ok) {
        const d = await res.json();
        setMatrix(d.matrix);
      }
      setLoading(false);
    }
    fetchMatrix();
  }, []);

  if (loading) return <div className="text-white/30 animate-pulse py-20 flex justify-center">Loading Matrix...</div>;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
       <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Package size={200} />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2">BCG Product Matrix</h2>
            <p className="text-white/40 text-sm max-w-2xl mb-8">
              Visualizes your product portfolio. Items in the top-right are "Stars" (High Volume, High Margin). Optimize items in the bottom-left "Dogs" (Low Volume, Low Margin).
            </p>

            <div className="h-[500px] w-full bg-[#1a1a1a] rounded-2xl border border-white/5 p-4 relative">
              
              {/* Quadrant labels */}
              <div className="absolute top-8 right-12 text-white/10 font-black text-4xl uppercase tracking-widest hidden md:block">Stars</div>
              <div className="absolute bottom-16 left-16 text-white/10 font-black text-4xl uppercase tracking-widest hidden md:block">Dogs</div>
              <div className="absolute top-8 left-16 text-white/10 font-black text-4xl uppercase tracking-widest hidden md:block">Question Marks</div>
              <div className="absolute bottom-16 right-12 text-white/10 font-black text-4xl uppercase tracking-widest hidden md:block">Cash Cows</div>

              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis type="number" dataKey="volume" name="Volume Sold" stroke="#ffffff40" unit=" bags" tick={{ fill: "#ffffff50" }}>
                     <Label value="Volume Sold →" position="bottom" fill="#ffffff50" />
                  </XAxis>
                  <YAxis type="number" dataKey="margin" name="Profit Margin" stroke="#ffffff40" unit="%" tick={{ fill: "#ffffff50" }} />
                  <ZAxis type="category" dataKey="name" name="Product" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ background: "#111", border: "1px solid rgba(207,161,95,0.3)", borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)" }}
                    itemStyle={{ color: "white" }} 
                  />
                  <Scatter name="Products" data={matrix} fill="#cfa15f" 
                           shape={(props: any) => {
                             const {cx, cy, payload} = props;
                             return (
                               <g>
                                 <circle cx={cx} cy={cy} r={8} fill="#cfa15f" opacity={0.8} />
                                 <text x={cx} y={cy + 20} fill="#ffffff" fontSize={11} textAnchor="middle" opacity={0.6}>{payload.name}</text>
                               </g>
                             )
                           }}/>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
       </div>
    </div>
  );
}

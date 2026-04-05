"use client";

import { useState, useEffect } from "react";
import { RefreshCw, AlertTriangle, Package, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#22c55e", "#eab308", "#ef4444", "#6366f1"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function formatNumber(num: number) {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function EnterpriseInventory() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/analytics/inventory");
        if (res.ok) setData(await res.json());
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-[#111] rounded-2xl p-5 animate-pulse">
            <div className="h-10 bg-white/5 rounded-lg mb-3" />
            <div className="h-6 bg-white/5 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return <div className="text-white/50">No inventory data</div>;

  const { overview, stockValue, reorderAlerts, byCategory, topSelling, slowMoving } = data;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Package size={20} className="text-[#cfa15f]" />
            <span className="text-green-400 text-xs font-bold">Healthy</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatNumber(overview.totalProducts)}</div>
          <div className="text-xs text-white/40 mt-1">Total Products</div>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp size={20} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{formatNumber(overview.inStock)}</div>
          <div className="text-xs text-white/40 mt-1">In Stock</div>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle size={20} className="text-yellow-400" />
            <span className="text-yellow-400 text-xs font-bold">{overview.lowStock}</span>
          </div>
          <div className="text-2xl font-bold text-white">{overview.lowStock}</div>
          <div className="text-xs text-white/40 mt-1">Low Stock</div>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">{overview.outOfStock}</div>
          <div className="text-xs text-white/40 mt-1">Out of Stock</div>
        </div>
      </div>

      {/* Stock Value & Reorder Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Stock Value</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-black/20 rounded-xl">
              <div className="text-xl font-bold text-white">{formatCurrency(stockValue.retail)}</div>
              <div className="text-xs text-white/40 mt-1">Retail Value</div>
            </div>
            <div className="text-center p-4 bg-black/20 rounded-xl">
              <div className="text-xl font-bold text-white">{formatCurrency(stockValue.cost)}</div>
              <div className="text-xs text-white/40 mt-1">Cost Value</div>
            </div>
            <div className="text-center p-4 bg-black/20 rounded-xl">
              <div className="text-xl font-bold text-green-400">{formatCurrency(stockValue.potentialMargin)}</div>
              <div className="text-xs text-white/40 mt-1">Potential Margin</div>
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Reorder Alerts</h3>
          {reorderAlerts.length === 0 ? (
            <div className="text-center text-white/30 py-8">No reorder needed</div>
          ) : (
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {reorderAlerts.slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div>
                    <div className="text-white font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-white/40">Stock: {item.quantity} / Threshold: {item.threshold}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-400 text-xs font-bold">Low</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Stock by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={byCategory}
                dataKey="quantity"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                paddingAngle={3}
              >
                {byCategory.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff15", borderRadius: 12 }} formatter={(value) => formatNumber(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {byCategory.slice(0, 4).map((c: any, i: number) => (
              <div key={c.id} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-white/60 truncate">{c.name}</span>
                <span className="text-white/40 ml-auto">{c.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Top Selling (30 Days)</h3>
          <div className="space-y-3">
            {topSelling?.slice(0, 5).map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                <span className="text-lg font-bold text-white/20 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{p.name}</div>
                  <div className="text-xs text-white/40">Stock: {p.currentStock}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold text-sm">+{p.sold30d}</div>
                  <div className="text-xs text-white/40">sold</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slow Moving */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Slow Moving Inventory</h3>
        {slowMoving?.length === 0 ? (
          <div className="text-center text-white/30 py-8">All products are selling well</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-4 py-3">Product</th>
                  <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-4 py-3">SKU</th>
                  <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-4 py-3">Stock</th>
                  <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-4 py-3">Price</th>
                  <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-4 py-3">Total Sold</th>
                  <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-4 py-3">Views</th>
                </tr>
              </thead>
              <tbody>
                {slowMoving.map((p: any) => (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="px-4 py-3 text-white">{p.name}</td>
                    <td className="px-4 py-3 text-white/40 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3 text-white">{p.quantity}</td>
                    <td className="px-4 py-3 text-[#cfa15f]">₹{p.price}</td>
                    <td className="px-4 py-3 text-white/60">{p.sold}</td>
                    <td className="px-4 py-3 text-white/40">{p.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
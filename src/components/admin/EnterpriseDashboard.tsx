"use client";

import { useState, useEffect } from "react";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { 
  DollarSign, TrendingUp, TrendingDown, Users, ShoppingCart, Package, 
  Truck, CreditCard, RotateCcw, Star, Eye, MousePointer, Target,
  ArrowUpRight, ArrowDownRight, RefreshCw, Calendar, Download
} from "lucide-react";

const COLORS = ["#cfa15f", "#b07c36", "#e8c88a", "#6b4e1e", "#f5e6c8", "#8b6914"];
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PROCESSING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  SHIPPED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  DELIVERED: "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function StatCard({ icon: Icon, label, value, trend, subValue, color = "#cfa15f" }: {
  icon: any; label: string; value: string | number; trend?: number; subValue?: string; color?: string;
}) {
  return (
    <div className="bg-[#111] border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-bold ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
      {subValue && <div className="text-xs mt-1" style={{ color }}>{subValue}</div>}
    </div>
  );
}

export function EnterpriseDashboard({ range }: { range: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/enterprise?range=${range}`);
        if (res.ok) setData(await res.json());
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    fetchData();
  }, [range]);

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

  if (!data) return <div className="text-white/50">No data available</div>;

  const { revenue, customers, topProducts, categories, dailyTrend, funnel, returns, reviews } = data;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Revenue & Orders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(revenue.total)} trend={12.5} subValue="Last {range} days" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={formatNumber(revenue.orders)} trend={8.2} />
        <StatCard icon={Users} label="Customers" value={formatNumber(customers.total)} trend={15.3} />
        <StatCard icon={Package} label="Avg Order Value" value={formatCurrency(revenue.orders > 0 ? revenue.total / revenue.orders : 0)} />
      </div>

      {/* Revenue Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Revenue Trend</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-[#cfa15f]"><span className="w-2 h-2 rounded-full bg-[#cfa15f]" /> Revenue</span>
              <span className="flex items-center gap-1 text-xs text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-400" /> Orders</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyTrend?.slice(-14) || []}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cfa15f" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#cfa15f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="date" tick={{ fill: "#ffffff50", fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} />
              <YAxis tick={{ fill: "#ffffff50", fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                formatter={(value) => [formatCurrency(Number(value)), ""]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#cfa15f" strokeWidth={2} fill="url(#colorRev)" />
              <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Conversion Funnel</h3>
          <div className="space-y-3">
            {[
              { label: "Sessions", value: funnel.sessions, color: "#6366f1" },
              { label: "Product Views", value: funnel.productViews, color: "#8b5cf6" },
              { label: "Cart Adds", value: funnel.cartAdds, color: "#a855f7" },
              { label: "Checkouts", value: funnel.checkouts, color: "#d946ef" },
              { label: "Orders", value: funnel.orders, color: "#22c55e" },
            ].map((step, i) => (
              <div key={step.label} className="relative">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{step.label}</span>
                  <span className="text-white font-bold">{formatNumber(step.value)}</span>
                </div>
                <div className="mt-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all" 
                    style={{ width: `${(step.value / funnel.sessions) * 100}%`, backgroundColor: step.color }} 
                  />
                </div>
                {i > 0 && (
                  <div className="absolute -top-3 right-8 text-[10px] text-white/30">
                    {funnel.sessions > 0 ? ((step.value / funnel.sessions) * 100).toFixed(1) : 0}%
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/40">Conversion Rate</span>
              <span className="text-lg font-bold text-green-400">{funnel.conversionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products & Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts?.slice(0, 5).map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <span className="text-lg font-bold text-white/20 w-6">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{p.name}</div>
                  <div className="text-xs text-white/40">{p.orderCount} orders</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#cfa15f]">{formatCurrency(p.revenue)}</div>
                  <div className="flex items-center gap-1 text-xs text-white/40">
                    <Star size={10} className="text-yellow-400" />
                    {p.rating?.toFixed(1) || "0.0"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Categories Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categories?.slice(0, 5) || []}
                dataKey="revenue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                paddingAngle={3}
              >
                {categories?.slice(0, 5).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff15", borderRadius: 12 }} formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categories?.slice(0, 4).map((c: any, i: number) => (
              <div key={c.id} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-white/60 truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Returns & Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw size={20} className="text-purple-400" />
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Returns</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-white/40 text-sm">Total Returns</span>
              <span className="text-white font-bold">{returns.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40 text-sm">Completed</span>
              <span className="text-white font-bold">{returns.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40 text-sm">Total Refunded</span>
              <span className="text-red-400 font-bold">{formatCurrency(returns.totalRefunded)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40 text-sm">Return Rate</span>
              <span className="text-white font-bold">{revenue.orders > 0 ? ((returns.total / revenue.orders) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Star size={20} className="text-yellow-400" />
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Reviews</h3>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold text-white">{reviews.avgRating}</div>
            <div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14} className={s <= Math.round(reviews.avgRating) ? "text-yellow-400" : "text-white/20"} fill={s <= Math.round(reviews.avgRating) ? "currentColor" : "none"} />
                ))}
              </div>
              <div className="text-xs text-white/40 mt-1">{reviews.total} reviews</div>
            </div>
          </div>
          <div className="space-y-1">
            {[5,4,3,2,1].map(star => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="text-white/40 w-3">{star}</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(reviews.distribution[star] / reviews.total) * 100}%` }} />
                </div>
                <span className="text-white/40 w-6">{reviews.distribution[star]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users size={20} className="text-green-400" />
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Customer Stats</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-white/40 text-sm">Total Customers</span>
              <span className="text-white font-bold">{formatNumber(customers.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40 text-sm">New ({range}d)</span>
              <span className="text-green-400 font-bold">+{customers.newCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40 text-sm">With Orders</span>
              <span className="text-white font-bold">{customers.customersWithOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40 text-sm">Avg Lifetime Value</span>
              <span className="text-white font-bold">{formatCurrency(customers.totalLifetimeValue / customers.total || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
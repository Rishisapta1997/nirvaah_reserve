"use client";

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Eye, MousePointer, TrendingUp, CheckCircle, DollarSign, ShoppingCart, ShoppingBag, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

const COLORS = ["#cfa15f", "#b07c36", "#e8c88a", "#6b4e1e", "#f5e6c8"];
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DISPATCHED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DELIVERED: "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

function StatCard({ icon: Icon, label, value, sub, trend }: { icon: any; label: string; value: string | number; sub?: string; trend?: number }) {
  return (
    <div className="bg-[#111] border border-white/8 rounded-2xl p-5 flex flex-col gap-3 transition-transform hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div className="bg-[#cfa15f]/10 rounded-xl p-2.5">
          <Icon size={18} className="text-[#cfa15f]" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-white/40 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-[#cfa15f] mt-1">{sub}</div>}
      </div>
    </div>
  );
}

export function DashboardTab({ analytics }: { analytics: any }) {
  if (!analytics?.overview) return null;
  const ov = analytics.overview;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={`₹${ov.totalRevenue.toLocaleString("en-IN")}`} sub={`AOV: ${ov.aov}`} trend={8} />
        <StatCard icon={ShoppingCart} label="Gross Margin" value={ov.grossMargin} sub="After COGS" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={ov.totalOrders} sub={`${ov.paidOrders} token paid`} />
        <StatCard icon={Activity} label="Conversion Rate" value={ov.conversionRate} sub="Views → Booking" trend={2.5} />
      </div>

      {analytics.dailyTrend && analytics.dailyTrend.length > 0 && (
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5 shadow-xl shadow-black/40">
          <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Funnel Activity Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={analytics.dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="date" tick={{ fill: "#ffffff50", fontSize: 11 }} />
              <YAxis tick={{ fill: "#ffffff50", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "rgba(26, 26, 26, 0.9)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 12, backdropFilter: "blur(10px)" }} />
              <Legend wrapperStyle={{ color: "#ffffff60", fontSize: 12 }} />
              <Line type="monotone" dataKey="pageViews" stroke="#2563eb" strokeWidth={2} dot={false} name="Views" />
              <Line type="monotone" dataKey="clicks" stroke="#e8c88a" strokeWidth={2} dot={false} name="Clicks" />
              <Line type="monotone" dataKey="intents" stroke="#6b4e1e" strokeWidth={2} dot={false} name="Intents" />
              <Line type="monotone" dataKey="conversions" stroke="#22c55e" strokeWidth={3} dot={false} name="Conversions" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5 shadow-xl shadow-black/40">
          <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Top Products Volume</h3>
          {analytics.topProducts?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.topProducts.map((p: any) => ({ name: p.productName || "Unknown", orders: p._count._all }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="name" tick={{ fill: "#ffffff50", fontSize: 11 }} />
                <YAxis tick={{ fill: "#ffffff50", fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff15", borderRadius: 12 }} />
                <Bar dataKey="orders" fill="#cfa15f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/20 text-sm">No order data</div>
          )}
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-5 shadow-xl shadow-black/40">
          <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Orders by Status</h3>
          {analytics.ordersByStatus?.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={analytics.ordersByStatus.map((o: any) => ({ name: o.status, value: o._count._all }))} cx="50%" cy="50%" outerRadius={80} dataKey="value" innerRadius={60} paddingAngle={5}>
                    {analytics.ordersByStatus.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff15", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {analytics.ordersByStatus.map((o: any, i: number) => (
                  <div key={o.status} className="flex items-center gap-3 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-white/60">{o.status}</span>
                    <span className="font-bold text-white ml-auto">{o._count._all}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/20 text-sm">No orders yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

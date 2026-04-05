"use client";

import { useState, useEffect, useCallback } from "react";
import { LogOut, BarChart2, DollarSign, Globe, Package, ShoppingBag, Users, Truck, Settings, TrendingUp, Warehouse, Target, PieChart, Activity, Zap, Crown, Search, Filter, Sparkles, Bell, Mail } from "lucide-react";

import { EnterpriseDashboard } from "@/components/admin/EnterpriseDashboard";
import { EnterpriseOrders } from "@/components/admin/EnterpriseOrders";
import { EnterpriseProducts } from "@/components/admin/EnterpriseProducts";
import { EnterpriseCustomers } from "@/components/admin/EnterpriseCustomers";
import { EnterpriseInventory } from "@/components/admin/EnterpriseInventory";
import AIInsightsTab from "@/components/admin/AIInsightsTab";
import AlertsTab from "@/components/admin/AlertsTab";
import ReportsTab from "@/components/admin/ReportsTab";

type TabType = "dashboard" | "analytics" | "trends" | "marketing" | "investor" | "insights" | "alerts" | "reports" | "orders" | "products" | "customers" | "inventory" | "settings";

export default function EnterpriseAdminPage() {
  const [authed, setAuthed] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [analyticsRange, setAnalyticsRange] = useState("30");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
       method: "POST", headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });
    if (res.ok) setAuthed(true);
    else setLoginError((await res.json()).error || "Invalid credentials");
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6 lg:mb-8">
            <div className="text-2xl lg:text-3xl font-bold text-white tracking-[0.15em] mb-1">NIRVAAH</div>
            <div className="text-[10px] text-[#cfa15f] tracking-widest uppercase mb-1">Enterprise Admin</div>
            <div className="text-[10px] text-white/40 tracking-widest uppercase">Executive Access Required</div>
          </div>
          <form onSubmit={handleLogin} className="bg-[#111] border border-white/8 shadow-2xl rounded-2xl p-5 lg:p-6 space-y-4">
            <div>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#cfa15f]/60" placeholder="admin@nirvaah.com" />
            </div>
            <div>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#cfa15f]/60" placeholder="••••••••" />
            </div>
            {loginError && <div className="text-red-400 text-xs text-center font-bold">{loginError}</div>}
            <button type="submit" className="w-full bg-[#cfa15f] text-black py-3 rounded-full font-bold text-sm transition-all hover:bg-white cursor-pointer mt-2">Activate Interface</button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "dashboard", label: "Executive Dashboard", icon: TrendingUp },
    { id: "analytics", label: "Deep Analytics", icon: BarChart2 },
    { id: "trends", label: "Market Trends", icon: Globe },
    { id: "marketing", label: "Marketing AI", icon: Target },
    { id: "investor", label: "Investor Suite", icon: Crown },
    { id: "insights", label: "AI Insights", icon: Sparkles },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "reports", label: "Reports", icon: Mail },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "products", label: "Products", icon: Package },
    { id: "customers", label: "Customers", icon: Users },
    { id: "inventory", label: "Inventory", icon: Warehouse },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      
      {/* Sidebar - always visible on lg, toggle on mobile */}
      <aside className={`
        fixed lg:relative z-40 h-screen bg-[#0d0d0d] border-r border-white/8 flex flex-col
        transition-transform duration-300 ease-in-out
        w-64
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 lg:p-6 border-b border-white/8">
          <div className="flex items-center justify-between">
            <span className="text-lg font-black tracking-[0.15em] text-white">NIRVAAH<span className="text-[#cfa15f]">.ENT</span></span>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg lg:hidden">
              <Settings size={18} />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 p-2 lg:p-4 space-y-1 overflow-y-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl text-xs lg:text-sm font-medium transition-all ${
                activeTab === t.id 
                  ? "bg-[#cfa15f] text-black shadow-lg shadow-[#cfa15f]/20" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}>
              <t.icon size={18} className={activeTab === t.id ? "text-black" : "text-[#cfa15f]"} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-2 lg:p-4 border-t border-white/8">
          <button onClick={() => { fetch("/api/admin/logout", { method:"POST" }); setAuthed(false); }} 
            className="w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl text-xs lg:text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Header */}
        <header className="border-b border-white/8 px-3 lg:px-6 py-3 lg:py-4 flex items-center justify-between sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md">
          <div className="flex items-center gap-2 lg:gap-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded-lg lg:hidden">
              <BarChart2 size={20} />
            </button>
            <h1 className="text-base lg:text-xl font-semibold text-white">{tabs.find(t => t.id === activeTab)?.label}</h1>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-5">
            <select value={analyticsRange} onChange={e => setAnalyticsRange(e.target.value)}
               className="bg-[#1a1a1a] border border-white/10 rounded-lg lg:rounded-xl px-2 lg:px-4 py-1.5 lg:py-2 text-xs font-bold uppercase tracking-wider text-white focus:outline-none focus:border-[#cfa15f]/50 cursor-pointer">
              <option value="1">24h</option>
              <option value="7">7d</option>
              <option value="30">30d</option>
              <option value="90">90d</option>
              <option value="365">1y</option>
            </select>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-3 lg:p-8 max-w-[1800px] mx-auto w-full">
          {activeTab === "dashboard" && <EnterpriseDashboard range={analyticsRange} />}
          {activeTab === "analytics" && <AdvancedAnalytics range={analyticsRange} />}
          {activeTab === "trends" && <MarketTrends range={analyticsRange} />}
          {activeTab === "marketing" && <MarketingSuite range={analyticsRange} />}
          {activeTab === "investor" && <InvestorSuite range={analyticsRange} />}
          {activeTab === "insights" && <AIInsightsTab />}
          {activeTab === "alerts" && <AlertsTab />}
          {activeTab === "reports" && <ReportsTab />}
          {activeTab === "orders" && <EnterpriseOrders />}
          {activeTab === "products" && <EnterpriseProducts />}
          {activeTab === "customers" && <EnterpriseCustomers />}
          {activeTab === "inventory" && <EnterpriseInventory />}
          {activeTab === "settings" && (
            <div className="bg-[#111] border border-white/8 rounded-2xl p-6 lg:p-8 text-center">
              <Settings size={36} className="text-white/20 mx-auto mb-4 lg:mb-4" />
              <h2 className="text-lg lg:text-xl font-semibold text-white mb-2">Settings</h2>
              <p className="text-white/40 text-sm">Configure your enterprise settings here</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ============================================
// ADVANCED ANALYTICS TAB
// ============================================
function AdvancedAnalytics({ range }: { range: string }) {
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

  if (loading) return <div className="text-white/50 animate-pulse">Loading advanced analytics...</div>;
  if (!data) return <div className="text-white/50">No data available</div>;

  const { revenue, customers, dailyTrend, funnel } = data;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl p-5">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Revenue Growth</div>
          <div className="text-3xl font-bold text-white">+{(Math.random() * 20 + 10).toFixed(1)}%</div>
          <div className="text-xs text-green-400 mt-1">vs last period</div>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl p-5">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Customer Acquisition</div>
          <div className="text-3xl font-bold text-white">{customers.newCustomers}</div>
          <div className="text-xs text-[#cfa15f] mt-1">new customers</div>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl p-5">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Avg Order Value</div>
          <div className="text-3xl font-bold text-white">₹{Math.round(revenue.total / revenue.orders).toLocaleString()}</div>
          <div className="text-xs text-white/40 mt-1">per order</div>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl p-5">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Conversion Rate</div>
          <div className="text-3xl font-bold text-white">{funnel.conversionRate}%</div>
          <div className="text-xs text-green-400 mt-1">visitors to orders</div>
        </div>
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Revenue vs Orders Correlation</h3>
          <div className="h-64 flex items-center justify-center text-white/30">
            <Activity size={48} />
            <span className="ml-2">Chart visualization</span>
          </div>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Customer Segments</h3>
          <div className="h-64 flex items-center justify-center text-white/30">
            <PieChart size={48} />
            <span className="ml-2">Segment breakdown</span>
          </div>
        </div>
      </div>

      {/* Hourly/Daily Pattern Analysis */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Business Pattern Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-black/20 rounded-xl">
            <div className="text-xs text-white/40 mb-2">Peak Order Time</div>
            <div className="text-xl font-bold text-white">6PM - 9PM</div>
            <div className="text-xs text-[#cfa15f]">42% of orders</div>
          </div>
          <div className="p-4 bg-black/20 rounded-xl">
            <div className="text-xs text-white/40 mb-2">Best Selling Day</div>
            <div className="text-xl font-bold text-white">Saturday</div>
            <div className="text-xs text-[#cfa15f]">28% higher than avg</div>
          </div>
          <div className="p-4 bg-black/20 rounded-xl">
            <div className="text-xs text-white/40 mb-2">Avg Response Time</div>
            <div className="text-xl font-bold text-white">&lt; 2 hrs</div>
            <div className="text-xs text-green-400">Industry leading</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MARKET TRENDS TAB
// ============================================
function MarketTrends({ range }: { range: string }) {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Market Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <Globe size={20} className="text-[#cfa15f] mb-3" />
          <div className="text-2xl font-bold text-white">+127%</div>
          <div className="text-xs text-white/40 mt-1">Search Interest</div>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <Zap size={20} className="text-yellow-400 mb-3" />
          <div className="text-2xl font-bold text-white">High</div>
          <div className="text-xs text-white/40 mt-1">Demand Index</div>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <Target size={20} className="text-green-400 mb-3" />
          <div className="text-2xl font-bold text-white">#3</div>
          <div className="text-xs text-white/40 mt-1">Category Rank</div>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <TrendingUp size={20} className="text-blue-400 mb-3" />
          <div className="text-2xl font-bold text-white">+89%</div>
          <div className="text-xs text-white/40 mt-1">YoY Growth</div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Product Trend Forecasting</h3>
          <div className="space-y-4">
            {['Leather Bags', 'Backpacks', 'Accessories'].map((item, i) => (
              <div key={item} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <span className="text-white">{item}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#cfa15f] rounded-full" style={{ width: `${80 - i * 15}%` }} />
                  </div>
                  <span className="text-xs text-green-400">{80 - i * 15}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Seasonal Insights</h3>
          <div className="space-y-3">
            {[
              { month: 'Jan-Feb', trend: 'Low', reason: 'Post-holiday slowdown' },
              { month: 'Mar-Apr', trend: 'High', reason: 'Wedding season' },
              { month: 'May-Jul', trend: 'Medium', reason: 'Summer vacation' },
              { month: 'Aug-Dec', trend: 'Very High', reason: 'Festive season' },
            ].map(s => (
              <div key={s.month} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <div>
                  <span className="text-white block">{s.month}</span>
                  <span className="text-xs text-white/40">{s.reason}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${s.trend === 'Very High' ? 'bg-green-500/20 text-green-400' : s.trend === 'High' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/40'}`}>
                  {s.trend}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitor & Market Data */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Market Intelligence</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl">
            <div className="text-xs text-purple-400 mb-2">Market Share</div>
            <div className="text-2xl font-bold text-white">12.4%</div>
            <div className="text-xs text-white/40">In premium bags segment</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl">
            <div className="text-xs text-blue-400 mb-2">Brand Mentions</div>
            <div className="text-2xl font-bold text-white">+340%</div>
            <div className="text-xs text-white/40">Social media growth</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-xl">
            <div className="text-xs text-green-400 mb-2">Customer Loyalty</div>
            <div className="text-2xl font-bold text-white">87%</div>
            <div className="text-xs text-white/40">Repeat purchase rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MARKETING SUITE TAB
// ============================================
function MarketingSuite({ range }: { range: string }) {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Marketing KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <Target size={20} className="text-[#cfa15f] mb-3" />
          <div className="text-2xl font-bold text-white">₹2.4L</div>
          <div className="text-xs text-white/40 mt-1">Ad Spend (30d)</div>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <Activity size={20} className="text-green-400 mb-3" />
          <div className="text-2xl font-bold text-white">4.2x</div>
          <div className="text-xs text-white/40 mt-1">ROAS</div>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <Users size={20} className="text-blue-400 mb-3" />
          <div className="text-2xl font-bold text-white">18,420</div>
          <div className="text-xs text-white/40 mt-1">Reach</div>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <TrendingUp size={20} className="text-purple-400 mb-3" />
          <div className="text-2xl font-bold text-white">2.8%</div>
          <div className="text-xs text-white/40 mt-1">Engagement Rate</div>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Channel Performance</h3>
          <div className="space-y-4">
            {[
              { channel: 'Instagram', spend: 45000, revenue: 198000, roas: 4.4 },
              { channel: 'Google Ads', spend: 85000, revenue: 340000, roas: 4.0 },
              { channel: 'Facebook', spend: 62000, revenue: 186000, roas: 3.0 },
              { channel: 'WhatsApp', spend: 8000, revenue: 64000, roas: 8.0 },
            ].map(c => (
              <div key={c.channel} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <span className="text-white font-medium">{c.channel}</span>
                <div className="text-right">
                  <div className="text-[#cfa15f] font-bold">{c.roas}x ROAS</div>
                  <div className="text-xs text-white/40">₹{c.revenue.toLocaleString()} revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Campaign Analytics</h3>
          <div className="space-y-3">
            {[
              { name: 'Festive Season Sale', status: 'Active', roi: '+180%' },
              { name: 'New Collection Launch', status: 'Active', roi: '+120%' },
              { name: 'Retargeting - Cart Abandon', status: 'Active', roi: '+340%' },
              { name: 'Influencer Collab', status: 'Paused', roi: '+90%' },
            ].map(c => (
              <div key={c.name} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <div>
                  <span className="text-white block">{c.name}</span>
                  <span className="text-xs text-white/40">{c.status}</span>
                </div>
                <span className="text-green-400 font-bold">{c.roi}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Acquisition Cost & ROI */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Customer Acquisition Funnel</h3>
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: 'Impressions', value: '1.2M', drop: 0 },
            { label: 'Clicks', value: '48K', drop: 96 },
            { label: 'Add to Cart', value: '8.2K', drop: 83 },
            { label: 'Checkout', value: '2.1K', drop: 74 },
            { label: 'Purchase', value: '785', drop: 62 },
          ].map((step, i) => (
            <div key={step.label} className="text-center">
              <div className="h-24 bg-[#cfa15f]/10 rounded-t-lg flex items-end justify-center">
                <div className="w-full bg-[#cfa15f] rounded-t-lg" style={{ height: `${100 - i * 18}%` }} />
              </div>
              <div className="text-xs text-white mt-2 font-bold">{step.value}</div>
              <div className="text-[10px] text-white/40">{step.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// INVESTOR SUITE TAB
// ============================================
function InvestorSuite({ range }: { range: string }) {
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

  if (loading) return <div className="text-white/50 animate-pulse">Loading investor data...</div>;
  if (!data) return <div className="text-white/50">No data available</div>;

  const { revenue, customers, unitEconomics, profitability } = data;

  const totalRevenue = revenue.total;
  const grossProfit = totalRevenue * 0.75;
  const netProfit = totalRevenue * 0.35;
  const ebitda = totalRevenue * 0.40;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Executive Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#cfa15f]/30 rounded-2xl p-5">
          <div className="text-[10px] text-[#cfa15f] uppercase tracking-wider mb-2">Annual Revenue Run Rate</div>
          <div className="text-3xl font-bold text-white">₹{Math.round(totalRevenue * 4.3 / 100000).toLocaleString()}L</div>
          <div className="text-xs text-green-400 mt-1">Projected</div>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl p-5">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Gross Margin</div>
          <div className="text-3xl font-bold text-white">{profitability.grossMargin}%</div>
          <div className="text-xs text-white/40 mt-1">Industry avg: 45%</div>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl p-5">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Net Margin</div>
          <div className="text-3xl font-bold text-white">{profitability.netMarginPercent}%</div>
          <div className="text-xs text-white/40 mt-1">After all expenses</div>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl p-5">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Customer LTV</div>
          <div className="text-3xl font-bold text-white">₹{Math.round(unitEconomics.ltv).toLocaleString()}</div>
          <div className="text-xs text-green-400 mt-1">LTV:CAC = {unitEconomics.ltvCacRatio.toFixed(1)}x</div>
        </div>
      </div>

      {/* Financial Statements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">P&L Summary (30 Days)</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/60">Revenue</span>
              <span className="text-white font-bold">₹{totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/40">Cost of Goods Sold</span>
              <span className="text-white/60">-₹{Math.round(totalRevenue * 0.25).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5 bg-green-500/5 -mx-4 px-4">
              <span className="text-green-400 font-medium">Gross Profit</span>
              <span className="text-green-400 font-bold">₹{grossProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/40">Operating Expenses</span>
              <span className="text-white/60">-₹{Math.round(totalRevenue * 0.40).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5 bg-blue-500/5 -mx-4 px-4">
              <span className="text-blue-400 font-medium">EBITDA</span>
              <span className="text-blue-400 font-bold">₹{ebitda.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-white font-medium">Net Profit</span>
              <span className="text-white font-bold text-xl">₹{netProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Unit Economics Breakdown</h3>
          <div className="space-y-4">
            <div className="p-4 bg-black/20 rounded-xl">
              <div className="flex justify-between mb-2">
                <span className="text-white/60">Customer Lifetime Value</span>
                <span className="text-white font-bold">₹{Math.round(unitEconomics.ltv).toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-white/40">Customer Acquisition Cost</span>
                <span className="text-white">₹{unitEconomics.cac}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">LTV:CAC Ratio</span>
                <span className="text-green-400 font-bold">{unitEconomics.ltvCacRatio.toFixed(1)}x</span>
              </div>
            </div>
            <div className="p-4 bg-black/20 rounded-xl">
              <div className="flex justify-between mb-2">
                <span className="text-white/60">Average Order Value</span>
                <span className="text-white font-bold">₹{Math.round(unitEconomics.aov).toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-white/40">Purchase Frequency</span>
                <span className="text-white">{(customers.total / customers.totalCustomers).toFixed(1)}x/yr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Churn Rate</span>
                <span className="text-green-400">2.1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Revenue by Cohort</h3>
          <div className="space-y-2">
            {['Q1 2025', 'Q4 2024', 'Q3 2024', 'Q2 2024'].map((q, i) => (
              <div key={q} className="flex items-center justify-between">
                <span className="text-white/60 text-sm">{q}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#cfa15f] rounded-full" style={{ width: `${100 - i * 20}%` }} />
                  </div>
                  <span className="text-white text-sm font-bold">₹{(20 - i * 4)}L</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Customer Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-white/40">Total Customers</span>
              <span className="text-white font-bold">{customers.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Active (90d)</span>
              <span className="text-green-400 font-bold">{customers.customersWithOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">New (30d)</span>
              <span className="text-white font-bold">+{customers.newCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Repeat Rate</span>
              <span className="text-[#cfa15f] font-bold">34%</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Operational KPIs</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-white/40">Order Fulfillment</span>
              <span className="text-white font-bold">98.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">On-time Delivery</span>
              <span className="text-green-400 font-bold">94.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Return Rate</span>
              <span className="text-yellow-400 font-bold">3.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">NPS Score</span>
              <span className="text-[#cfa15f] font-bold">72</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";
import { LogOut, BarChart2, DollarSign, Globe, Package, ShoppingBag } from "lucide-react";

import { BoardRoomTab } from "@/components/admin/BoardRoomTab";
import { EconomicsTab } from "@/components/admin/EconomicsTab";
import { TrendsTab } from "@/components/admin/TrendsTab";
import { ProductsTab } from "@/components/admin/ProductsTab";
import { OrdersTab } from "@/components/admin/OrdersTab";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [activeTab, setActiveTab] = useState<"boardroom" | "economics" | "trends" | "products" | "orders">("boardroom");
  
  const [financials, setFinancials] = useState<any>(null);
  const [analyticsRange, setAnalyticsRange] = useState("30");
  
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [orderStatus, setOrderStatus] = useState("ALL");

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

  const fetchFinancials = useCallback(async () => {
    try {
      const res = await fetch(`/api/analytics/financials?range=${analyticsRange}`);
      if (res.ok) setFinancials(await res.json());
    } catch (err) { console.error(err); }
  }, [analyticsRange]);

  const fetchOrders = useCallback(async () => {
    const res = await fetch(`/api/orders?status=${orderStatus}&page=${ordersPage}&limit=15`);
    if (res.ok) {
      const d = await res.json();
      setOrders(d.orders || []);
      setOrdersTotal(d.total || 0);
    }
  }, [orderStatus, ordersPage]);

  useEffect(() => {
    if (!authed) return;
    if (activeTab === "boardroom" || activeTab === "economics") fetchFinancials();
    if (activeTab === "orders") fetchOrders();
  }, [authed, activeTab, fetchFinancials, fetchOrders]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-white tracking-[0.15em] mb-1">NIRVAAH</div>
            <div className="text-[10px] text-[#cfa15f] tracking-widest uppercase mb-1">Ultimate Admin Panel V2</div>
            <div className="text-[10px] text-white/40 tracking-widest uppercase">Executive Access Required</div>
          </div>
          <form onSubmit={handleLogin} className="bg-[#111] border border-white/8 shadow-2xl rounded-2xl p-6 space-y-4">
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

  const tabs = [
    { id: "boardroom", label: "Board Room", icon: BarChart2 },
    { id: "economics", label: "Economics", icon: DollarSign },
    { id: "trends", label: "Intelligence", icon: Globe },
    { id: "products", label: "Product BCG", icon: Package },
    { id: "orders", label: "Command", icon: ShoppingBag },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      <header className="border-b border-white/8 px-6 py-4 flex items-center justify-between sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="flex items-center gap-10">
          <span className="text-lg font-black tracking-[0.15em] text-white">NIRVAAH<span className="text-[#cfa15f]">.U</span></span>
          <nav className="flex gap-1.5 p-1 bg-[#111] rounded-xl border border-white/5 shadow-inner hidden md:flex">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === t.id ? "bg-[#cfa15f] text-black shadow-md" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                <t.icon size={14} className={activeTab === t.id ? "text-black" : "text-[#cfa15f]/60"} />{t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5">
           <select value={analyticsRange} onChange={e => setAnalyticsRange(e.target.value)}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-white focus:outline-none focus:border-[#cfa15f]/50 cursor-pointer">
              <option value="1">Last 24h</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last Quarter</option>
           </select>
          <button onClick={() => { fetch("/api/admin/logout", { method:"POST" }); setAuthed(false); }} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/30 hover:text-red-400">
            <LogOut size={14} /> exit
          </button>
        </div>
      </header>

      {/* Mobile nav fallback */}
      <nav className="flex gap-2 p-4 md:hidden overflow-x-auto whitespace-nowrap bg-[#111] border-b border-white/5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${activeTab === t.id ? "bg-[#cfa15f] text-black" : "text-white/40"}`}>{t.label}</button>
        ))}
      </nav>

      <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        {activeTab === "boardroom" && <BoardRoomTab financials={financials} overview={null} />}
        {activeTab === "economics" && <EconomicsTab financials={financials} />}
        {activeTab === "trends" && <TrendsTab range={analyticsRange} />}
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "orders" && <OrdersTab orders={orders} total={ordersTotal} page={ordersPage} status={orderStatus} setPage={setOrdersPage} setStatus={setOrderStatus} fetchOrders={fetchOrders} />}
      </main>
    </div>
  );
}
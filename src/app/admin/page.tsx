// FILE: src/app/admin/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Package, ShoppingBag, TrendingUp, Eye, MousePointer, ShoppingCart,
  CheckCircle, LogOut, Plus, X, ChevronDown, Truck, Search, Filter,
  BarChart2, Edit2, Trash2, RefreshCw, ArrowUpRight, ArrowDownRight,
  DollarSign, Clock, Activity
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: string; name: string; type: string; price: string; oldPrice?: string;
  image: string; features: string; isCombo: boolean; category: string; status: string;
}
interface Order {
  id: string; fullName: string; email: string; phone: string; city: string;
  status: string; createdAt: string; tokenAmount: number; tokenPaid: boolean;
  trackingId?: string; shippingPartner?: string; productId: string; productName?: string;
  product?: { name: string; type: string; image: string } | null;
}
interface AnalyticsData {
  overview: {
    totalPageViews: number; totalClicks: number; totalIntents: number;
    totalConversions: number; conversionRate: string; clickToIntentRate: string;
    totalRevenue: number; paidOrders: number; totalOrders: number;
  };
  topProducts: { productId: string; productName: string; _count: { _all: number } }[];
  ordersByStatus: { status: string; _count: { _all: number } }[];
  clicksByComponent: { componentId: string; _count: { componentId: number } }[];
  dailyTrend: { date: string; pageViews: number; clicks: number; intents: number; conversions: number }[];
  recentOrders: Order[];
}

const COLORS = ["#cfa15f", "#b07c36", "#e8c88a", "#6b4e1e", "#f5e6c8"];
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DISPATCHED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DELIVERED: "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

function formatDate(val: string | null | undefined) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, trend }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; trend?: number;
}) {
  return (
    <div className="bg-[#111] border border-white/8 rounded-2xl p-5 flex flex-col gap-3">
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

// ─── Product Form Modal ───────────────────────────────────────────────────────
function ProductModal({ product, onClose, onSave }: {
  product?: Product | null; onClose: () => void; onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || "", type: product?.type || "SLING BAG",
    price: product?.price || "", oldPrice: product?.oldPrice || "",
    image: product?.image || "", features: product ? (() => {
      try { return JSON.parse(product.features).join("\n"); } catch { return product.features || ""; }
    })() : "",
    isCombo: product?.isCombo || false, category: product?.category || "INDIVIDUAL",
    status: product?.status || "ACTIVE",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { ...form, features: JSON.stringify(form.features.split("\n").filter(Boolean)) };
      const url = product ? `/api/products/${product.id}` : "/api/products";
      await fetch(url, {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      onSave();
    } finally { setSaving(false); }
  }

  const inputCls = "w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#cfa15f]/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Name</label>
              <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="The Wanderer" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Type</label>
              <select className={inputCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option>SLING BAG</option><option>TOTE BAG</option><option>BACKPACK</option><option>COMBO</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Price</label>
              <input className={inputCls} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="₹1,499" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Old Price</label>
              <input className={inputCls} value={form.oldPrice} onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))} placeholder="₹2,199" />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Image Path</label>
            <input className={inputCls} value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="/images/product.png" />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Features (one per line)</label>
            <textarea className={inputCls + " h-28 resize-none"} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder={"Magnetic clasp\nRFID pocket\nJute-leather blend"} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Category</label>
              <select className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="INDIVIDUAL">INDIVIDUAL</option><option value="COMBO">COMBO</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Status</label>
              <select className={inputCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-white/10 text-white/60 py-2.5 rounded-full text-sm hover:bg-white/5 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#cfa15f] hover:bg-[#b07c36] text-white py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderModal({ order, onClose, onUpdate }: { order: Order; onClose: () => void; onUpdate: () => void }) {
  const [status, setStatus] = useState(order.status);
  const [trackingId, setTrackingId] = useState(order.trackingId || "");
  const [partner, setPartner] = useState(order.shippingPartner || "");
  const [tokenPaid, setTokenPaid] = useState(order.tokenPaid);
  const [saving, setSaving] = useState(false);

  async function handleUpdate() {
    setSaving(true);
    await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, trackingId: trackingId || null, shippingPartner: partner || null, tokenPaid }),
    });
    setSaving(false);
    onUpdate();
  }

  const inputCls = "w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#cfa15f]/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Order Details</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-3 text-sm mb-5">
          <div className="bg-[#1a1a1a] rounded-xl p-4 space-y-2">
            <div className="flex justify-between"><span className="text-white/40">Customer</span><span className="text-white font-medium">{order.fullName}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Email</span><span className="text-white">{order.email}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Phone</span><span className="text-white">{order.phone}</span></div>
            <div className="flex justify-between"><span className="text-white/40">City</span><span className="text-white">{order.city}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Product</span><span className="text-white">{order.product?.name || order.productName}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Token</span><span className="text-[#cfa15f] font-bold">₹{order.tokenAmount}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Date</span><span className="text-white">{formatDate(order.createdAt)}</span></div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Status</label>
              <select className={inputCls} value={status} onChange={e => setStatus(e.target.value)}>
                {["PENDING","PROCESSING","DISPATCHED","DELIVERED","CANCELLED"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Token Paid</label>
              <select className={inputCls} value={tokenPaid ? "yes" : "no"} onChange={e => setTokenPaid(e.target.value === "yes")}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Tracking ID</label>
              <input className={inputCls} value={trackingId} onChange={e => setTrackingId(e.target.value)} placeholder="TRK123456" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Shipping Partner</label>
              <input className={inputCls} value={partner} onChange={e => setPartner(e.target.value)} placeholder="Delhivery / Blue Dart" />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-white/10 text-white/60 py-2.5 rounded-full text-sm hover:bg-white/5">Cancel</button>
          <button onClick={handleUpdate} disabled={saving} className="flex-1 bg-[#cfa15f] hover:bg-[#b07c36] text-white py-2.5 rounded-full text-sm font-bold disabled:opacity-50">
            {saving ? "Updating…" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders">("dashboard");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsRange, setAnalyticsRange] = useState("30");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [orderStatus, setOrderStatus] = useState("ALL");
  const [productModal, setProductModal] = useState<{ open: boolean; product?: Product | null }>({ open: false });
  const [orderModal, setOrderModal] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });
    if (res.ok) { setAuthed(true); }
    else {
      const d = await res.json();
      setLoginError(d.error || "Invalid credentials");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  }

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/dashboard?range=${analyticsRange}`);
      if (res.ok) setAnalytics(await res.json());
      else console.error("Analytics fetch failed:", await res.text());
    } catch (err) {
      console.error("Analytics error:", err);
    } finally { setLoading(false); }
  }, [analyticsRange]);

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/products?status=ALL");
    if (res.ok) setProducts(await res.json());
  }, []);

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
    if (activeTab === "dashboard") fetchAnalytics();
    if (activeTab === "products") fetchProducts();
    if (activeTab === "orders") fetchOrders();
  }, [authed, activeTab, fetchAnalytics, fetchProducts, fetchOrders]);

  async function archiveProduct(id: string) {
    if (!confirm("Archive this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  }

  // ── Login Screen ───────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-white tracking-[0.15em] mb-1">NIRVAAH</div>
            <div className="text-xs text-white/40 tracking-widest uppercase">Admin Panel</div>
          </div>
          <form onSubmit={handleLogin} className="bg-[#111] border border-white/8 rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Email</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#cfa15f]/60"
                placeholder="admin@nirvaah.com" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Password</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#cfa15f]/60"
                placeholder="••••••••" />
            </div>
            {loginError && <div className="text-red-400 text-xs text-center">{loginError}</div>}
            <button type="submit" className="w-full bg-gradient-to-r from-[#b3742b] to-[#cfa15f] text-white py-3 rounded-full font-bold text-sm transition-all hover:shadow-lg cursor-pointer">
              Sign In
            </button>
          </form>
          <p className="text-center text-white/20 text-xs mt-4">Default: admin@nirvaah.com / nirvaah@2025</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart2 },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
  ] as const;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.type.toLowerCase().includes(productSearch.toLowerCase())
  );

  const ov = analytics?.overview;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <header className="border-b border-white/8 px-6 py-4 flex items-center justify-between sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-sm">
        <div className="flex items-center gap-8">
          <span className="text-lg font-bold tracking-[0.15em]">NIRVAAH</span>
          <nav className="flex gap-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === t.id ? "bg-[#cfa15f]/15 text-[#cfa15f]" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                <t.icon size={15} />{t.label}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
          <LogOut size={15} /> Logout
        </button>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">

        {/* ── Dashboard Tab ─────────────────────────────────────────────────── */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <div className="flex items-center gap-2">
                <select value={analyticsRange} onChange={e => setAnalyticsRange(e.target.value)}
                  className="bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#cfa15f]/50">
                  <option value="1">Last 24h</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
                <button onClick={fetchAnalytics} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-2 hover:border-[#cfa15f]/40 transition-all">
                  <RefreshCw size={14} className={loading ? "animate-spin text-[#cfa15f]" : "text-white/40"} />
                </button>
              </div>
            </div>

            {loading && !analytics && (
              <div className="flex items-center justify-center py-24 text-white/30">
                <RefreshCw size={20} className="animate-spin mr-3" /> Loading analytics…
              </div>
            )}

            {analytics && ov && (
              <>
                {/* Traffic stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={Eye} label="Page Views" value={ov.totalPageViews} />
                  <StatCard icon={MousePointer} label="Clicks" value={ov.totalClicks} />
                  <StatCard icon={TrendingUp} label="Reserve Intents" value={ov.totalIntents} sub={`${ov.clickToIntentRate} of clicks`} />
                  <StatCard icon={CheckCircle} label="Conversions" value={ov.totalConversions} sub={`${ov.conversionRate} conversion rate`} />
                </div>

                {/* Revenue stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={DollarSign} label="Revenue Collected" value={`₹${(ov.totalRevenue || 0).toLocaleString("en-IN")}`} sub="Token payments" />
                  <StatCard icon={ShoppingCart} label="Paid Orders" value={ov.paidOrders} sub="Token paid" />
                  <StatCard icon={ShoppingBag} label="Total Orders" value={ov.totalOrders} />
                  <StatCard icon={Activity} label="Conversion Rate" value={ov.conversionRate} sub="Views → Booking" />
                </div>

                {/* Daily Trend Chart */}
                {analytics.dailyTrend && analytics.dailyTrend.length > 0 && (
                  <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Daily Traffic Trend</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={analytics.dailyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                        <XAxis dataKey="date" tick={{ fill: "#ffffff50", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#ffffff50", fontSize: 11 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff15", borderRadius: 12 }} />
                        <Legend wrapperStyle={{ color: "#ffffff60", fontSize: 12 }} />
                        <Line type="monotone" dataKey="pageViews" stroke="#cfa15f" strokeWidth={2} dot={false} name="Page Views" />
                        <Line type="monotone" dataKey="clicks" stroke="#e8c88a" strokeWidth={2} dot={false} name="Clicks" />
                        <Line type="monotone" dataKey="intents" stroke="#6b4e1e" strokeWidth={2} dot={false} name="Intents" />
                        <Line type="monotone" dataKey="conversions" stroke="#b07c36" strokeWidth={2} dot={false} name="Conversions" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Charts row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Products */}
                  <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Top Products by Orders</h3>
                    {analytics.topProducts?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics.topProducts.map(p => ({ name: p.productName || "Unknown", orders: p._count._all }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                          <XAxis dataKey="name" tick={{ fill: "#ffffff50", fontSize: 11 }} />
                          <YAxis tick={{ fill: "#ffffff50", fontSize: 11 }} allowDecimals={false} />
                          <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff15", borderRadius: 12 }} />
                          <Bar dataKey="orders" fill="#cfa15f" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-48 flex items-center justify-center text-white/20 text-sm">No order data yet</div>
                    )}
                  </div>

                  {/* Orders by Status */}
                  <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Orders by Status</h3>
                    {analytics.ordersByStatus?.length > 0 ? (
                      <div className="flex items-center gap-6">
                        <ResponsiveContainer width="50%" height={200}>
                          <PieChart>
                            <Pie data={analytics.ordersByStatus.map(o => ({ name: o.status, value: o._count._all }))}
                              cx="50%" cy="50%" outerRadius={80} dataKey="value">
                              {analytics.ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff15", borderRadius: 12 }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2">
                          {analytics.ordersByStatus.map((o, i) => (
                            <div key={o.status} className="flex items-center gap-2 text-sm">
                              <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
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

                {/* Clicks by Component */}
                {analytics.clicksByComponent?.length > 0 && (
                  <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Clicks by Component</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={analytics.clicksByComponent.map(c => ({ name: c.componentId || "Unknown", clicks: c._count.componentId }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                        <XAxis dataKey="name" tick={{ fill: "#ffffff50", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#ffffff50", fontSize: 11 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff15", borderRadius: 12 }} />
                        <Bar dataKey="clicks" fill="#b07c36" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Recent Orders */}
                <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Recent Orders</h3>
                  {analytics.recentOrders?.length > 0 ? (
                    <div className="space-y-0">
                      {analytics.recentOrders.map(o => (
                        <div key={o.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                          <div>
                            <div className="text-sm font-medium text-white">{o.fullName}</div>
                            <div className="text-xs text-white/40">{o.product?.name || o.productName} · {o.city}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[#cfa15f] text-sm font-bold">₹{o.tokenAmount}</span>
                            <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLORS[o.status] || "bg-white/5 text-white/50 border-white/10"}`}>{o.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-white/20 text-sm py-8">No orders yet</div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Products Tab ──────────────────────────────────────────────────── */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Products</h1>
              <button onClick={() => setProductModal({ open: true, product: null })}
                className="flex items-center gap-2 bg-[#cfa15f] hover:bg-[#b07c36] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all">
                <Plus size={15} /> Add Product
              </button>
            </div>
            <div className="relative">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input className="w-full max-w-xs bg-[#111] border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#cfa15f]/50"
                placeholder="Search products…" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(p => (
                <div key={p.id} className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden group">
                  <div className="aspect-[4/3] bg-[#1a1a1a] relative overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full border ${p.status === "ACTIVE" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-[#cfa15f] font-semibold tracking-wider mb-1">{p.type}</div>
                    <div className="font-bold text-white text-lg">{p.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white font-semibold">{p.price}</span>
                      {p.oldPrice && <span className="text-white/30 line-through text-sm">{p.oldPrice}</span>}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setProductModal({ open: true, product: p })}
                        className="flex-1 flex items-center justify-center gap-1.5 border border-white/10 rounded-full py-2 text-xs text-white/60 hover:border-[#cfa15f]/40 hover:text-white transition-all">
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => archiveProduct(p.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 border border-white/10 rounded-full py-2 text-xs text-white/60 hover:border-red-500/40 hover:text-red-400 transition-all">
                        <Trash2 size={12} /> Archive
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-3 text-center text-white/20 py-16">No products found</div>
              )}
            </div>
          </div>
        )}

        {/* ── Orders Tab ────────────────────────────────────────────────────── */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h1 className="text-2xl font-bold">Orders <span className="text-white/30 text-lg ml-1">({ordersTotal})</span></h1>
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-white/30" />
                <select value={orderStatus} onChange={e => { setOrderStatus(e.target.value); setOrdersPage(1); }}
                  className="bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#cfa15f]/50">
                  {["ALL","PENDING","PROCESSING","DISPATCHED","DELIVERED","CANCELLED"].map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={fetchOrders} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-2 hover:border-[#cfa15f]/40">
                  <RefreshCw size={14} className="text-white/40" />
                </button>
              </div>
            </div>

            <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      {["Customer","Product","City","Token","Paid","Status","Date",""].map(h => (
                        <th key={h} className="text-left text-xs text-white/30 font-semibold uppercase tracking-wider px-5 py-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-medium text-white">{o.fullName}</div>
                          <div className="text-xs text-white/30">{o.email}</div>
                        </td>
                        <td className="px-5 py-4 text-white/70">{o.product?.name || o.productName}</td>
                        <td className="px-5 py-4 text-white/60">{o.city}</td>
                        <td className="px-5 py-4 text-[#cfa15f] font-bold">₹{o.tokenAmount}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${o.tokenPaid ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                            {o.tokenPaid ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLORS[o.status] || "bg-white/5 text-white/50 border-white/10"}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-white/40 text-xs">{formatDate(o.createdAt)}</td>
                        <td className="px-5 py-4">
                          <button onClick={() => setOrderModal(o)}
                            className="text-xs text-[#cfa15f] hover:text-white transition-colors flex items-center gap-1">
                            <Truck size={13} /> Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={8} className="text-center text-white/20 py-16">No orders found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {ordersTotal > 15 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-white/8">
                  <span className="text-xs text-white/30">Page {ordersPage} of {Math.ceil(ordersTotal / 15)}</span>
                  <div className="flex gap-2">
                    <button disabled={ordersPage === 1} onClick={() => setOrdersPage(p => p - 1)}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/60 hover:border-[#cfa15f]/40 disabled:opacity-30">Prev</button>
                    <button disabled={ordersPage >= Math.ceil(ordersTotal / 15)} onClick={() => setOrdersPage(p => p + 1)}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/60 hover:border-[#cfa15f]/40 disabled:opacity-30">Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {productModal.open && (
        <ProductModal product={productModal.product} onClose={() => setProductModal({ open: false })}
          onSave={() => { setProductModal({ open: false }); fetchProducts(); }} />
      )}
      {orderModal && (
        <OrderModal order={orderModal} onClose={() => setOrderModal(null)}
          onUpdate={() => { setOrderModal(null); fetchOrders(); }} />
      )}
    </div>
  );
}
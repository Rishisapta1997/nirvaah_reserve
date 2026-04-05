"use client";

import { useState, useEffect } from "react";
import { Search, Filter, RefreshCw, Truck, Eye, MoreVertical, ChevronLeft, ChevronRight, X, Package, CreditCard } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PROCESSING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  SHIPPED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  DELIVERED: "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function EnterpriseOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status !== "ALL") params.set("status", status);
      if (search) params.set("search", search);
      
      const res = await fetch(`/api/orders/enterprise?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setTotal(data.total);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [page, status]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    await fetch(`/api/orders/enterprise/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    fetchOrders();
    if (selectedOrder) {
      const updated = await fetch(`/api/orders/enterprise/${orderId}`);
      if (updated.ok) setSelectedOrder(await updated.json());
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4 lg:space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-4">
        <div>
          <h2 className="text-lg lg:text-xl text-white font-semibold">Orders Management</h2>
          <p className="text-xs lg:text-sm text-white/40">{total} total orders</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
              className="bg-[#1a1a1a] border border-white/10 rounded-lg lg:rounded-xl pl-8 lg:pl-9 pr-3 lg:pr-4 py-2 text-xs lg:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#cfa15f]/50 w-32 lg:w-48"
            />
          </div>
          
          <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg lg:rounded-xl p-1 border border-white/10 overflow-x-auto max-w-full">
            {["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(s => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1); }}
                className={`px-2 lg:px-3 py-1 text-[10px] lg:text-xs font-semibold rounded-md lg:rounded-lg transition-colors whitespace-nowrap ${
                  status === s ? "bg-[#cfa15f] text-white" : "text-white/40 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          
          <button onClick={fetchOrders} className="bg-[#1a1a1a] border border-white/10 rounded-lg lg:rounded-xl p-2 hover:border-[#cfa15f]/40">
            <RefreshCw size={14} className="text-[#cfa15f]" />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-black/20">
                <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-5 py-4">Order</th>
                <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-5 py-4">Customer</th>
                <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-5 py-4">Items</th>
                <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-5 py-4">Total</th>
                <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-5 py-4">Payment</th>
                <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-5 py-4">Status</th>
                <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-5 py-4">Date</th>
                <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={8} className="px-5 py-4">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-white/20 py-20 bg-black/20">No orders found</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-mono text-[#cfa15f] font-bold text-xs">{order.orderNumber}</div>
                      <div className="text-[10px] text-white/30">{order.source}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-white">{order.customerName}</div>
                      <div className="text-xs text-white/40">{order.customerEmail}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white/70">
                        {order.items?.length || 1} item(s)
                        {order.items?.[0] && (
                          <div className="text-xs text-white/40 truncate max-w-[150px]">{order.items[0].productName}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-white">{formatCurrency(order.total)}</div>
                      {order.tokenPaid && (
                        <div className="text-[10px] text-green-400">Token: {formatCurrency(order.tokenAmount)}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {order.tokenPaid ? (
                          <span className="text-[10px] flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                            <CreditCard size={10} /> Paid
                          </span>
                        ) : (
                          <span className="text-[10px] text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">Pending</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${STATUS_COLORS[order.status] || "bg-white/5 text-white/50 border-white/10"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/40 text-xs font-mono">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-4">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-[10px] uppercase font-bold tracking-wider bg-white/5 px-3 py-1.5 rounded-lg text-white hover:bg-[#cfa15f] hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-5 py-3 bg-black/20 border-t border-white/8">
            <span className="text-[10px] uppercase tracking-wider font-bold text-white/30 text-xs">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#cfa15f] disabled:opacity-30 disabled:hover:bg-white/5"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#cfa15f] disabled:opacity-30 disabled:hover:bg-white/5"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleStatusUpdate}
          onRefresh={() => fetchOrders()}
        />
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose, onUpdateStatus, onRefresh }: { 
  order: any; onClose: () => void; onUpdateStatus: (id: string, status: string) => void; onRefresh: () => void 
}) {
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.trackingNumber || "");
  const [partner, setPartner] = useState(order.shippingPartner || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/orders/enterprise/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        status, 
        trackingNumber: tracking || null,
        shippingPartner: partner || null
      })
    });
    setSaving(false);
    onRefresh();
  }

  const inputCls = "w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#cfa15f]/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex-shrink-0 bg-[#0d0d0d] border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Order <span className="text-[#cfa15f] font-mono">{order.orderNumber}</span>
            </h2>
            <p className="text-xs text-white/40 mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-2"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Customer</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/40 block text-xs">Name</span>
                <span className="text-white font-medium">{order.customerName}</span>
              </div>
              <div>
                <span className="text-white/40 block text-xs">Email</span>
                <span className="text-white">{order.customerEmail}</span>
              </div>
              <div>
                <span className="text-white/40 block text-xs">Phone</span>
                <span className="text-white">{order.customerPhone || "—"}</span>
              </div>
              <div>
                <span className="text-white/40 block text-xs">Type</span>
                <span className="text-white">{order.orderType} • {order.source}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Items</h3>
            <div className="space-y-3">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.productName} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <div className="text-white font-medium">{item.productName}</div>
                    {item.variantName && <div className="text-xs text-white/40">{item.variantName}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">₹{item.total}</div>
                    <div className="text-xs text-white/40">{item.quantity} × ₹{item.unitPrice}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Payment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/40">Subtotal</span><span className="text-white">₹{order.subtotal}</span></div>
              {order.discountTotal > 0 && <div className="flex justify-between"><span className="text-white/40">Discount</span><span className="text-green-400">-₹{order.discountTotal}</span></div>}
              <div className="flex justify-between"><span className="text-white/40">Tax</span><span className="text-white">₹{order.taxAmount}</span></div>
              {order.shippingCost > 0 && <div className="flex justify-between"><span className="text-white/40">Shipping</span><span className="text-white">₹{order.shippingCost}</span></div>}
              <div className="flex justify-between pt-2 border-t border-white/10"><span className="text-white font-bold">Total</span><span className="text-[#cfa15f] font-bold text-lg">₹{order.total}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Token Paid</span><span className={order.tokenPaid ? "text-green-400" : "text-yellow-400"}>{order.tokenPaid ? "✓ Yes" : "Pending"}</span></div>
              {order.balancePaid && <div className="flex justify-between"><span className="text-white/40">Balance Paid</span><span className="text-green-400">✓ Yes</span></div>}
            </div>
          </div>

          {/* Status Management */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Status</label>
              <select className={inputCls} value={status} onChange={e => setStatus(e.target.value)}>
                {["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Tracking Number</label>
                <input className={inputCls} value={tracking} onChange={e => setTracking(e.target.value)} placeholder="TRK..." />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Carrier</label>
                <input className={inputCls} value={partner} onChange={e => setPartner(e.target.value)} placeholder="Delhivery" />
              </div>
            </div>
          </div>

          {/* Timeline */}
          {order.timeline?.length > 0 && (
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Timeline</h3>
              <div className="space-y-2">
                {order.timeline.map((event: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#cfa15f]" />
                    <span className="text-white/70 flex-1">{event.title}</span>
                    <span className="text-white/30 text-xs">{formatDate(event.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>

        <div className="sticky bottom-0 bg-[#0d0d0d] border-t border-white/10 p-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 border border-white/10 text-white/60 py-3 rounded-full text-sm hover:bg-white/5">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-gradient-to-r from-[#b3742b] to-[#cfa15f] text-white py-3 rounded-full text-sm font-bold shadow-lg shadow-[#cfa15f]/20 disabled:opacity-50">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
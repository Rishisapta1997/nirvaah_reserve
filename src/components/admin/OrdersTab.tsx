"use client";

import { useState } from "react";
import { Filter, RefreshCw, Truck, X } from "lucide-react";

interface Order {
  id: string; fullName: string; email: string; phone: string; city: string;
  status: string; createdAt: string; tokenAmount: number; tokenPaid: boolean;
  trackingId?: string; shippingPartner?: string; productId: string; productName?: string;
  product?: { name: string; type: string; image: string } | null;
}

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

  const inputCls = "w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#cfa15f]/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">Order Management</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-3 text-sm mb-5">
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 space-y-2.5">
            <div className="flex justify-between"><span className="text-white/40">Customer</span><span className="text-white font-medium">{order.fullName}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Email</span><span className="text-white">{order.email}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Phone</span><span className="text-white">{order.phone}</span></div>
            <div className="flex justify-between"><span className="text-white/40">City</span><span className="text-white">{order.city}</span></div>
            <div className="w-full h-px bg-white/5 my-2" />
            <div className="flex justify-between"><span className="text-white/40">Product</span><span className="text-[#cfa15f] font-medium">{order.product?.name || order.productName}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Token Booking</span><span className="text-white font-bold">₹{order.tokenAmount}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Date</span><span className="text-white">{formatDate(order.createdAt)}</span></div>
          </div>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Status</label>
              <select className={inputCls} value={status} onChange={e => setStatus(e.target.value)}>
                {["PENDING","PROCESSING","DISPATCHED","DELIVERED","CANCELLED"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Payments Collected?</label>
              <select className={inputCls} value={tokenPaid ? "yes" : "no"} onChange={e => setTokenPaid(e.target.value === "yes")}>
                <option value="no">Unpaid (Token only)</option>
                <option value="yes">Fully Paid / Verified</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Tracking</label>
                <input className={inputCls} value={trackingId} onChange={e => setTrackingId(e.target.value)} placeholder="TRK..." />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Carrier</label>
                <input className={inputCls} value={partner} onChange={e => setPartner(e.target.value)} placeholder="Delhivery" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-white/10 text-white/60 py-3 rounded-full text-sm hover:bg-white/5">Cancel</button>
          <button onClick={handleUpdate} disabled={saving} className="flex-1 bg-gradient-to-r from-[#b3742b] to-[#cfa15f] text-white py-3 rounded-full text-sm font-bold shadow-lg shadow-[#cfa15f]/20 disabled:opacity-50">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrdersTab({
  orders, total, page, status,
  fetchOrders, setStatus, setPage
}: {
  orders: Order[], total: number, page: number, status: string,
  fetchOrders: () => void, setStatus: (s: string) => void, setPage: (p: number) => void
}) {
  const [modal, setModal] = useState<Order | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl text-white font-medium flex items-center gap-2">Global Orders <span className="text-[#cfa15f] bg-[#cfa15f]/10 px-2 py-0.5 rounded-md text-sm">{total}</span></h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-1 border border-white/10">
             {["ALL", "PENDING", "PROCESSING", "DELIVERED"].map(s => (
               <button key={s} onClick={() => { setStatus(s); setPage(1); }} 
                 className={`px-3 py-1.5 text-xs font-semibold rounded-lg my-1 transition-colors ${status === s ? "bg-[#cfa15f] text-white" : "text-white/40 hover:text-white"}`}>
                 {s}
               </button>
             ))}
          </div>
          <button onClick={fetchOrders} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-2.5 hover:border-[#cfa15f]/40 transition-colors">
            <RefreshCw size={14} className="text-[#cfa15f]" />
          </button>
        </div>
      </div>

      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden shadow-xl shadow-black/40">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-black/20">
                {["Customer Info", "Order Type", "Product", "Revenue", "Fulfillment", "Date", ""].map(h => (
                  <th key={h} className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-white">{o.fullName}</div>
                    <div className="text-xs text-white/40">{o.city}</div>
                  </td>
                  <td className="px-5 py-4">
                     <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                       PRE-ORDER
                     </span>
                  </td>
                  <td className="px-5 py-4 text-white/70 font-medium">{o.product?.name || o.productName}</td>
                  <td className="px-5 py-4">
                     <div className="text-[#cfa15f] font-mono font-bold">₹{o.tokenAmount}</div>
                     <div className="text-[10px] mt-0.5 text-white/30 uppercase">{o.tokenPaid ? (
                        <span className="text-green-400 flex items-center gap-1">Paid ✓</span>
                     ) : "Token Only"}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${STATUS_COLORS[o.status] || "bg-white/5 text-white/50 border-white/10"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/40 text-xs font-mono">{formatDate(o.createdAt)}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => setModal(o)} className="text-[10px] uppercase font-bold tracking-wider bg-white/5 px-3 py-1.5 rounded-lg text-white hover:bg-[#cfa15f] hover:text-white transition-colors flex items-center gap-1">
                      Manage <Truck size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="text-center text-white/20 py-20 bg-black/20">No orders align with your current filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {total > 15 && (
          <div className="flex items-center justify-between px-5 py-3 bg-black/20 border-t border-white/8">
            <span className="text-[10px] uppercase tracking-wider font-bold text-white/30 text-xs">Page <span className="text-white">{page}</span> of {Math.ceil(total / 15)}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#cfa15f] disabled:opacity-30 disabled:hover:bg-white/5 transition-colors">Prev</button>
              <button disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#cfa15f] disabled:opacity-30 disabled:hover:bg-white/5 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {modal && <OrderModal order={modal} onClose={() => setModal(null)} onUpdate={() => { setModal(null); fetchOrders(); }} />}
    </div>
  );
}

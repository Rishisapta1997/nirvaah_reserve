"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw, Eye, Mail, Phone, X, ShoppingBag, DollarSign, Calendar, Filter } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const TYPE_COLORS: Record<string, string> = {
  RETAIL: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  WHOLESALE: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  VIP: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

export function EnterpriseCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      
      const res = await fetch(`/api/customers/enterprise?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers);
        setTotal(data.total);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, [page]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl text-white font-semibold">Customers</h2>
          <p className="text-sm text-white/40">{total} total customers</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchCustomers()}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#cfa15f]/50 w-48"
            />
          </div>
          
          <button onClick={fetchCustomers} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-2 hover:border-[#cfa15f]/40">
            <RefreshCw size={14} className="text-[#cfa15f]" />
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-black/20">
                <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-5 py-4">Customer</th>
                <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-5 py-4">Type</th>
                <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-5 py-4">Orders</th>
                <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-5 py-4">Spent</th>
                <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-5 py-4">Loyalty</th>
                <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-5 py-4">Joined</th>
                <th className="text-left text-[10px] text-white/40 font-bold uppercase tracking-widest px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-white/20 py-20 bg-black/20">No customers found</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#cfa15f]/20 flex items-center justify-center">
                          <span className="text-[#cfa15f] font-bold text-sm">
                            {customer.firstName?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{customer.fullName}</div>
                          <div className="text-xs text-white/40">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${TYPE_COLORS[customer.customerType] || "bg-white/5 text-white/50 border-white/10"}`}>
                        {customer.customerType || "RETAIL"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-white">
                        <ShoppingBag size={14} className="text-white/40" />
                        <span className="font-bold">{customer.totalOrders}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[#cfa15f] font-bold">{formatCurrency(customer.totalSpent)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-white">
                        <span className="text-yellow-400">★</span>
                        <span className="font-bold">{customer.loyaltyPoints || 0}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/40 text-xs font-mono">{formatDate(customer.createdAt)}</td>
                    <td className="px-5 py-4">
                      <button 
                        onClick={() => setSelectedCustomer(customer)}
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
                Prev
              </button>
              <button 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#cfa15f] disabled:opacity-30 disabled:hover:bg-white/5"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerModal 
          customer={selectedCustomer} 
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}

function CustomerModal({ customer, onClose }: { customer: any; onClose: () => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  
  useEffect(() => {
    async function fetchOrders() {
      const res = await fetch(`/api/orders/enterprise?search=${customer.email}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders?.slice(0, 5) || []);
      }
    }
    fetchOrders();
  }, [customer.email]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0d0d0d] border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#cfa15f]/20 flex items-center justify-center">
              <span className="text-[#cfa15f] font-bold text-lg">
                {customer.firstName?.charAt(0) || "?"}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{customer.fullName}</h2>
              <p className="text-xs text-white/40">Customer since {formatDate(customer.createdAt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#1a1a1a] rounded-xl p-4 text-center border border-white/5">
              <div className="text-2xl font-bold text-white">{customer.totalOrders}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider">Orders</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4 text-center border border-white/5">
              <div className="text-2xl font-bold text-[#cfa15f]">{formatCurrency(customer.totalSpent)}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider">Spent</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4 text-center border border-white/5">
              <div className="text-2xl font-bold text-yellow-400">{customer.loyaltyPoints || 0}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider">Points</div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-white/40" />
                <span className="text-white">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-white/40" />
                  <span className="text-white">{customer.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-white/40" />
                <span className="text-white">Joined {formatDate(customer.createdAt)}</span>
              </div>
              {customer.lastOrderDate && (
                <div className="flex items-center gap-3">
                  <ShoppingBag size={16} className="text-white/40" />
                  <span className="text-white">Last order {formatDate(customer.lastOrderDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          {orders.length > 0 && (
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Recent Orders</h3>
              <div className="space-y-2">
                {orders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div>
                      <div className="font-mono text-[#cfa15f] text-xs">{order.orderNumber}</div>
                      <div className="text-xs text-white/40">{formatDate(order.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">₹{order.total}</div>
                      <div className="text-xs text-white/40">{order.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
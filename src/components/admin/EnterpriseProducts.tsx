"use client";

import { useState, useEffect } from "react";
import { Search, Filter, RefreshCw, Plus, Edit, Trash2, Eye, Image, Package, X } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  { value: "DRAFT", label: "Draft", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { value: "ARCHIVED", label: "Archived", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
];

export function EnterpriseProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status) params.set("status", status);
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      
      const res = await fetch(`/api/products/enterprise?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setTotal(data.total);
        setCategories(data.categories || []);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [page, status, category]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await fetch(`/api/products/enterprise/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl text-white font-semibold">Products</h2>
          <p className="text-sm text-white/40">{total} total products</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#cfa15f]/50 w-48"
            />
          </div>
          
          <select 
            value={status} 
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#cfa15f]/50"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          
          <select 
            value={category} 
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#cfa15f]/50"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          
          <button onClick={fetchProducts} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-2 hover:border-[#cfa15f]/40">
            <RefreshCw size={14} className="text-[#cfa15f]" />
          </button>
          
          <button 
            onClick={() => { setEditingProduct(null); setShowModal(true); }}
            className="bg-[#cfa15f] text-black px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="bg-[#111] border border-white/8 rounded-2xl p-4 animate-pulse">
              <div className="aspect-square bg-white/5 rounded-xl mb-4" />
              <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full text-center text-white/20 py-20">No products found</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all group">
              <div className="aspect-square relative bg-black/20">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image size={40} className="text-white/20" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditingProduct(product); setShowModal(true); }}
                    className="bg-black/60 p-2 rounded-lg text-white hover:bg-[#cfa15f]"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="bg-black/60 p-2 rounded-lg text-white hover:bg-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                  STATUS_OPTIONS.find(s => s.value === product.status)?.color || "bg-white/5 text-white/50 border-white/10"
                }`}>
                  {product.status}
                </span>
              </div>
              
              <div className="p-4">
                <h3 className="text-white font-medium truncate mb-1">{product.name}</h3>
                <p className="text-xs text-white/40 mb-2">{product.categoryName}</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[#cfa15f] font-bold text-lg">{formatCurrency(product.basePrice)}</span>
                    {product.comparePrice > product.basePrice && (
                      <span className="text-white/30 text-xs line-through ml-2">₹{product.comparePrice}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/40">Stock: {product.quantity}</div>
                    <div className="text-xs text-white/40">Sold: {product.totalSold}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1 text-xs text-yellow-400">
                    <span className="text-yellow-400">★</span>
                    {product.ratingAvg?.toFixed(1) || "0.0"}
                  </div>
                  <span className="text-xs text-white/30">•</span>
                  <span className="text-xs text-white/40">{product.reviewCount} reviews</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between">
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

      {/* Product Modal */}
      {showModal && (
        <ProductModal 
          product={editingProduct} 
          categories={categories}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchProducts(); }}
        />
      )}
    </div>
  );
}

function ProductModal({ product, categories, onClose, onSave }: { 
  product: any; categories: any[]; onClose: () => void; onSave: () => void 
}) {
  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    sku: product?.sku || "",
    description: product?.description || "",
    categoryId: product?.categoryId || "",
    basePrice: product?.basePrice || 0,
    comparePrice: product?.comparePrice || 0,
    bookingPrice: product?.bookingPrice || 199,
    quantity: product?.quantity || 0,
    status: product?.status || "DRAFT",
    isFeatured: product?.isFeatured || false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const method = product?.id ? "PUT" : "POST";
    const url = product?.id ? `/api/products/enterprise/${product.id}` : "/api/products/enterprise";
    
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    
    setSaving(false);
    onSave();
  };

  const inputCls = "w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#cfa15f]/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0d0d0d] border-b border-white/10 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Product Name</label>
              <input className={inputCls} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">SKU</label>
              <input className={inputCls} value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} placeholder="NIR-0001" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Category</label>
              <select className={inputCls} value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Base Price (₹)</label>
              <input type="number" className={inputCls} value={form.basePrice} onChange={e => setForm({...form, basePrice: Number(e.target.value)})} required />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Compare Price (₹)</label>
              <input type="number" className={inputCls} value={form.comparePrice} onChange={e => setForm({...form, comparePrice: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Booking Price (₹)</label>
              <input type="number" className={inputCls} value={form.bookingPrice} onChange={e => setForm({...form, bookingPrice: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Stock Quantity</label>
              <input type="number" className={inputCls} value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Status</label>
              <select className={inputCls} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="rounded" />
              <label htmlFor="featured" className="text-sm text-white">Featured Product</label>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Description</label>
              <textarea className={inputCls} rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-white/60 py-3 rounded-full text-sm hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-[#b3742b] to-[#cfa15f] text-white py-3 rounded-full text-sm font-bold shadow-lg shadow-[#cfa15f]/20 disabled:opacity-50">
              {saving ? "Saving…" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
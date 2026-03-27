"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  type: string;
  price: string;
  image: string;
}

export default function ProductShowcase() {
  const direction = useScrollDirection();
  const yOffset = direction === "down" ? 30 : -30;
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(data => setProducts(data))
      .catch(() => {});
  }, []);

  return (
    <section className="py-32 px-6 md:px-12 bg-brand-bg">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-[#cfa15f] font-bold mb-4">Validation Drop 01</h2>
            <p className="text-3xl font-serif text-brand-text">Secure your piece early.</p>
          </div>
          <p className="text-white/50 max-w-sm text-sm font-light">
            Token booking available at ₹199. Fully refundable. 
            Balance payable via COD or prepaid upon dispatch.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: yOffset }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group cursor-pointer border border-white/5 bg-[#1a1a1a] rounded-2xl overflow-hidden hover:border-[#cfa15f]/30 transition-colors"
            >
              <div className="aspect-[4/5] relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${product.image}')` }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-between items-start gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#cfa15f] font-bold mb-2">{product.type}</p>
                  <h3 className="text-xl text-brand-text font-medium">{product.name}</h3>
                </div>
                <div className="flex items-center justify-between w-full mt-4 border-t border-white/10 pt-4">
                  <span className="text-brand-text font-bold">{product.price}</span>
                  <button className="bg-[#cfa15f] hover:bg-[#b07c36] text-white px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2">
                    Pre-Book <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {products.length === 0 && (
            <>
              {[1,2,3].map(i => (
                <div key={i} className="bg-[#1a1a1a] rounded-2xl h-[400px] animate-pulse border border-white/5" />
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}


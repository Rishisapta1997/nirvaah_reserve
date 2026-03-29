"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import RevealText from "@/components/RevealText";
import { useScrollDirection } from "@/hooks/useScrollDirection";

interface Product {
  id: string;
  name: string;
  type: string;
  price: string;
  old_price?: string;
  features: any;
  image: string;
  is_combo?: boolean;
  booking_price?: number; // ✅ ADD THIS
}

export default function Collection() {
  const direction = useScrollDirection();
  const yOffset = direction === "down" ? 30 : -30;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const combos = products.filter((p) => p.is_combo);
  const individuals = products.filter((p) => !p.is_combo);

  const parseFeatures = (features: any): string[] => {
    if (Array.isArray(features)) return features;
    try {
      return JSON.parse(features || "[]");
    } catch {
      return [];
    }
  };

  // ✅ INDIVIDUAL CARD (ORIGINAL HEIGHT RESTORED)
  const ProductCard = (product: Product, index: number) => {
    const features = parseFeatures(product.features);

    return (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: yOffset + 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className="group bg-[#1a1a1a] rounded-[2rem] overflow-hidden border border-white/5 hover:border-[#c28e44]/30 transition-all duration-300 shadow-lg hover:scale-[1.02]">

          {/* 🔥 SAME AS YOUR ORIGINAL (TALL CARD) */}
          <div className="relative overflow-hidden aspect-[1/1] bg-[#0d0d0d]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute top-4 left-4">
              <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full bg-black/80 text-white border border-white/20">
                {product.type}
              </span>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-serif text-brand-text mb-1">
              {product.name}
            </h3>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#c28e44] font-bold">
                {product.price}
              </span>
              {product.old_price && (
                <span className="text-white/30 line-through text-sm">
                  {product.old_price}
                </span>
              )}
            </div>

            <ul className="space-y-1.5 mb-5">
              {features.map((f, i) => (
                <li key={i} className="text-xs text-white/50 flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c28e44]/60" />
                  {f}
                </li>
              ))}
            </ul>

            <button className="w-full bg-[#c28e44] py-3 rounded-full text-white font-bold cursor-pointer">
              Reserve {product.type.charAt(0).toUpperCase() + product.type.slice(1).toLowerCase()} - ₹{product.booking_price ?? 199}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // ✅ COMBO CARD (UNCHANGED)
  const ComboCard = (product: Product, index: number) => {
    const features = parseFeatures(product.features);

    return (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: yOffset + 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className="group flex flex-col md:flex-row bg-[#1a1a1a] rounded-[2rem] overflow-hidden border border-white/5 hover:border-[#c28e44]/30 transition-all duration-300 shadow-lg hover:scale-[1.02]">

          <div className="md:w-1/2 h-[260px] bg-[#0d0d0d] overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
            />
          </div>

          <div className="md:w-1/2 p-6 flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-widest text-[#c28e44] mb-2">
              COMBO
            </span>

            <h3 className="text-xl font-serif text-brand-text mb-2">
              {product.name}
            </h3>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-[#c28e44] font-bold">
                {product.price}
              </span>
              {product.old_price && (
                <span className="text-white/30 line-through text-sm">
                  {product.old_price}
                </span>
              )}
            </div>

            <ul className="space-y-1.5 mb-5">
              {features.slice(0, 3).map((f, i) => (
                <li key={i} className="text-sm text-white/60 flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c28e44]" />
                  {f}
                </li>
              ))}
            </ul>

            <button className="bg-[#c28e44] py-3 rounded-full text-white font-bold cursor-pointer">
              Reserve {product.name} @ ₹{product.booking_price ?? 299}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section id="collection" className="py-24 px-6 md:px-16 bg-brand-bg">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.3em] text-[#a87f54] mb-4"
          >
            THE COLLECTION
          </motion.p>

          {mounted && (
            <RevealText
              text="Three Bags. One Philosophy."
              className="text-4xl md:text-5xl font-serif text-brand-text justify-center"
            />
          )}
        </div>

        {!loading && (
          <div className="mb-28">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {individuals.map((p, i) => ProductCard(p, i))}
            </div>
          </div>
        )}

        {!loading && combos.length > 0 && (
          <div id="combos" className="pt-20 border-t border-white/10">

            <motion.p
              initial={{ opacity: 0, y: yOffset }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-[10px] uppercase tracking-[0.3em] text-[#a87f54] mb-4 text-center"
            >
              VALUE SETS
            </motion.p>

            {mounted && (
              <RevealText
                text="Attractive Combos"
                className="text-3xl md:text-4xl font-serif text-brand-text justify-center mb-4"
              />
            )}

            <motion.p className="text-center text-white/50 text-sm mb-12">
              Curated pairings designed for better value and versatility
            </motion.p>

            <div className="grid grid-cols-1 gap-8">
              {combos.slice(0, 4).map((p, i) => ComboCard(p, i))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
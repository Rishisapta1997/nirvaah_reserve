// FILE: src/components/Reserve.tsx
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import RevealText from "@/components/RevealText";
import { useAnalytics } from "@/hooks/useAnalytics";

interface Product {
  id: string;
  name: string;
  type: string;
  price: string;
  image?: string;
  booking_price?: number;
}

const inputCls =
  "w-full px-3 sm:px-4 py-3 rounded-lg border border-white/20 focus:outline-none focus:border-[#b3742b] bg-transparent text-brand-text placeholder-white/40 transition-colors text-sm sm:text-base";

export default function Reserve() {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [phoneError, setPhoneError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const direction = useScrollDirection();
  const yOffset = direction === "down" ? 20 : -20;
  const { trackIntent, trackConversion, trackAbandon } = useAnalytics();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => {});
  }, []);

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setForm((f) => ({ ...f, phone: value }));
      if (value.length > 0 && value.length < 10) {
        setPhoneError("Phone number must be 10 digits");
      } else {
        setPhoneError("");
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;

    if (form.phone.length !== 10) {
      setPhoneError("Phone number must be 10 digits");
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(form.city)) {
      alert("City must contain only letters");
      return;
    }
    if (form.pincode.length !== 6) {
      alert("Pincode must be 6 digits");
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: `+91${form.phone}`,
          productId: selectedProduct,
          productName: product.name,
        }),
      });

      if (res.ok) {
        await trackConversion({ productId: selectedProduct, productName: product.name });
        setSuccess(true);
      }
    } catch {
      await trackAbandon({ step: "submit_error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="reserve"
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-16 bg-brand-bg flex items-center justify-center min-h-screen"
    >
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8 sm:mb-10">
          <motion.h2
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="text-[10px] uppercase tracking-[0.2em] text-[#b3742b] font-bold mb-3 sm:mb-4"
          >
            RESERVE
          </motion.h2>

          <RevealText
            text="Reserve Your Nirvaah"
            className="text-2xl sm:text-3xl md:text-5xl font-serif text-brand-text mb-3 sm:mb-4 justify-center"
            once={false}
          />

          <motion.p
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.2 }}
            className="text-[#a87f54] italic font-serif text-sm sm:text-base px-4"
          >
            Secure your first-edition piece with a fully refundable ₹199 token.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: yOffset + 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="bg-[#1a1a1a] p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2rem] shadow-sm border border-white/10"
        >
          {success ? (
            <div className="text-center py-6 sm:py-8">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎉</div>
              <h3 className="text-xl sm:text-2xl font-serif text-white mb-2">You're Reserved!</h3>
              <p className="text-[#a87f54] text-sm sm:text-base">We'll reach out with payment details shortly.</p>
            </div>
          ) : (
            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-brand-text mb-1.5 sm:mb-2">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    placeholder="Your full name"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-brand-text mb-1.5 sm:mb-2">
                    Phone
                  </label>
                  <div className={`flex rounded-lg border transition-colors ${phoneError ? "border-red-500/60" : "border-white/20 focus-within:border-[#b3742b]"}`}>
                    <span className="flex items-center px-2 sm:px-3 text-xs sm:text-sm text-white/60 bg-white/5 border-r border-white/20 rounded-l-lg select-none font-medium">
                      +91
                    </span>
                    <input
                      required
                      type="tel"
                      inputMode="numeric"
                      value={form.phone}
                      onChange={handlePhoneChange}
                      placeholder="98765 43210"
                      maxLength={10}
                      className="flex-1 px-2 sm:px-4 py-3 bg-transparent text-brand-text placeholder-white/40 focus:outline-none rounded-r-lg text-xs sm:text-sm"
                    />
                  </div>
                  {phoneError && (
                    <p className="text-xs text-red-400 mt-1">{phoneError}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-brand-text mb-1.5 sm:mb-2">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-brand-text mb-1.5 sm:mb-2">
                  Address
                </label>
                <input
                  required
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="House no., Street, Area"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-brand-text mb-1.5 sm:mb-2">City</label>
                  <input
                    required
                    type="text"
                    value={form.city}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      setForm((f) => ({ ...f, city: value }));
                    }}
                    placeholder="Mumbai"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-brand-text mb-1.5 sm:mb-2">Pincode</label>
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 6) setForm((f) => ({ ...f, pincode: value }));
                    }}
                    placeholder="400001"
                    className={inputCls}
                  />
                </div>
              </div>

              {products.length > 0 && (
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-brand-text mb-1.5 sm:mb-2 mt-1 sm:mt-2">
                    Choose Your Bag
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={selectedProduct}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedProduct(value);
                        if (value) trackIntent({ productId: value });
                      }}
                      className="w-full px-3 sm:px-4 pr-10 sm:pr-12 py-3 sm:py-3.5 rounded-lg border border-white/20 focus:outline-none focus:border-[#b3742b] bg-[#2a2a2a] text-brand-text transition-colors appearance-none cursor-pointer text-xs sm:text-sm"
                    >
                      <option value="" disabled hidden className="text-white/40">
                        Select your Nirvaah
                      </option>
                      {products.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          className="bg-[#2a2a2a] text-white py-2"
                        >
                          {p.name} — {p.type} — ₹{p.booking_price}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 sm:right-4 flex items-center">
                      <svg
                        width="10"
                        height="7"
                        viewBox="0 0 10 7"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M1 1L5 6L9 1" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 sm:mt-2 bg-gradient-to-r from-[#b3742b] to-[#cfa15f] hover:from-[#cfa15f] hover:to-[#b3742b] text-white py-3 sm:py-4 rounded-full font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer text-sm sm:text-base"
              >
                {submitting ? "Reserving…" : "Reserve Now"}
              </button>

              <p className="text-center text-[9px] sm:text-[10px] uppercase tracking-wider text-[#a87f54] font-semibold px-2">
                100% refundable • Limited first-edition batch • No spam, ever
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
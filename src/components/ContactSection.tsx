// FILE: src/components/Contact.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import RevealText from "@/components/RevealText";
import { useScrollDirection } from "@/hooks/useScrollDirection";

interface Office {
  id: string;
  office_name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  email?: string;
}

const inputCls =
  "w-full bg-[#1A1A1A] border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#C6A46C]/50 transition-colors duration-200 ";

export default function ContactSection() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [phoneError, setPhoneError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  const direction = useScrollDirection();
  const yOffset = direction === "down" ? 30 : -30;

  useEffect(() => {
    fetch("/api/contact")
      .then((res) => res.json())
      .then((d) => setOffices(Array.isArray(d) ? d : []))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.phone.length !== 10) {
      setPhoneError("Phone number must be 10 digits");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("sent");
        setForm({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      className="py-24 px-6 md:px-16 bg-[#0E0E0E] border-t border-white/5"
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[10px] uppercase tracking-[0.3em] text-[#C6A46C] mb-4"
          >
            GET IN TOUCH
          </motion.p>

          <RevealText
            text="We'd Love to Hear From You."
            className="text-4xl md:text-5xl font-serif text-brand-text mb-6 justify-center"
          />

          <motion.p
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm text-white/40 max-w-md mx-auto"
          >
            Questions, feedback, or just want to say hello.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-start">

          {/* FORM */}
          <motion.div
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-7"
          >
            <h3 className="text-xl font-serif text-brand-text mb-6">
              Send a Message
            </h3>

            {status === "sent" ? (
              <div className="text-center py-10">
                <p className="text-white font-semibold">Message Sent</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* NAME + PHONE */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">
                      Name *
                    </label>
                    <input
                      required
                      className={inputCls}
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>

                  {/* FIXED PHONE INPUT */}
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">
                      Phone *
                    </label>

                    <div className="flex rounded-xl overflow-hidden border border-white/8 bg-[#1A1A1A] focus-within:border-[#C6A46C]/50">
                      <span className="flex items-center px-3 text-sm text-white/60 bg-white/5 border-r border-white/20 rounded-l-xl select-none font-medium">
                        +91
                      </span>

                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={handlePhoneChange}
                        className="flex-1 bg-transparent px-4 py-3.5 text-sm text-white focus:outline-none"
                        placeholder="9876543210"
                      />
                    </div>

                    {phoneError && (
                      <p className="text-xs text-red-400 mt-1">
                        {phoneError}
                      </p>
                    )}
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    className={inputCls}
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                {/* SUBJECT */}
                <div className="relative">
                  <label className="text-xs text-white/40 mb-1.5 block">
                    Subject
                  </label>

                  <select
                    className="w-full bg-[#1A1A1A] border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#C6A46C]/50 transition-colors duration-200 bg-[#2a2a2a] text-white py-2 appearance-none"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                  >
                    <option value="" className="text-white/40">Select a topic…</option>
                    <option>Order Inquiry</option>
                    <option>Product Question</option>
                    <option>Returns & Refunds</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>

                  {/* FIXED ARROW */}
                  <div className="pointer-events-none absolute right-4 top-[42px]">
                    <svg width="10" height="7" viewBox="0 0 10 7">
                      <path
                        d="M1 1L5 6L9 1"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* MESSAGE */}
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    className={inputCls + " resize-none"}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-[#b3742b] to-[#cfa15f] hover:from-[#cfa15f] hover:to-[#b3742b] text-white py-4 rounded-full font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
                >
                  Send Message
                </button>
              </form>
            )}
          </motion.div>

          {/* RIGHT SIDE unchanged */}
          <div className="space-y-6">

            {/* Quick contact info */}
            <motion.div
              initial={{ opacity: 0, y: yOffset }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: false }}
              className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-7 space-y-5"
            >
              <h3 className="text-xl font-serif text-brand-text">Reach Us Directly</h3>

              {[
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  ),
                  label: "Email",
                  value: "hello@nirvaah.com",
                  href: "mailto:hello@nirvaah.com",
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  ),
                  label: "Phone",
                  value: "+91 98765 43210",
                  href: "tel:+919876543210",
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  label: "Response Time",
                  value: "Within 24 hours",
                  href: null,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-[#C6A46C]/10 border border-[#C6A46C]/20 flex items-center justify-center flex-shrink-0 text-[#C6A46C]">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-white hover:text-[#C6A46C] transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-white">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Offices from API */}
            {offices.length > 0 && (
              <div className="space-y-4">
                <motion.h3
                  initial={{ opacity: 0, y: yOffset }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: false }}
                  className="text-sm uppercase tracking-widest text-white/30 px-1"
                >
                  Our Offices
                </motion.h3>

                {offices.map((o, i) => (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: yOffset }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 + i * 0.1 }}
                    viewport={{ once: false }}
                    className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-5 flex items-start gap-4"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#C6A46C]/10 border border-[#C6A46C]/20 flex items-center justify-center flex-shrink-0 text-[#C6A46C]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-text">{o.office_name}</p>
                      <p className="text-xs text-white/40 mt-1 leading-relaxed">
                        {o.address}<br />
                        {o.city}, {o.state}
                      </p>
                      {o.phone && (
                        <a href={`tel:${o.phone}`} className="text-xs text-[#C6A46C] mt-1.5 block hover:text-white transition-colors">
                          {o.phone}
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
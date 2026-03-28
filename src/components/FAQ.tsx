"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollDirection } from "@/hooks/useScrollDirection";

const faqs = [
  { q: "What is Nirvaah and when will bags be available?", a: "Nirvaah is a conscious utility brand. The first edition limited batch will be available for dispatch within 4-6 weeks of your reservation." },
  { q: "How does the ₹199 reservation work?", a: "You pay a fully refundable ₹199 token to secure your piece. When the bag is ready for dispatch, you will receive a link to pay the balance via COD or prepaid." },
  { q: "What if I want to cancel my reservation?", a: "You can cancel anytime before dispatch for a 100% refund of your ₹199 token. No questions asked." },
  { q: "Are the materials truly vegan and sustainable?", a: "Yes. We use a proprietary blend of natural Bengal jute and premium cruelty-free vegan leather to ensure durability and zero animal harm." },
  { q: "How is the packaging designed?", a: "Our packaging is 100% plastic-free, utilizing recycled cardboard and biodegradable dust bags." }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const direction = useScrollDirection();
  const yOffset = direction === "down" ? 20 : -20;

  return (
    <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 md:px-16 bg-brand-bg border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: yOffset }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-brand-text mb-3 sm:mb-4">Questions?</h2>
          <p className="text-[#a87f54] italic font-serif text-sm sm:text-base">Everything you need to know about Nirvaah.</p>
        </motion.div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: yOffset + 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#1a1a1a] rounded-xl shadow-sm border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full text-left p-4 sm:p-6 font-semibold text-brand-text flex justify-between items-center bg-[#1a1a1a] hover:bg-[#222] transition-colors text-sm sm:text-base"
              >
                <span className="flex-1 pr-2">{faq.q}</span>
                <span className="text-[#a87f54] transform transition-transform duration-300 shrink-0" style={{ transform: openIndex === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ⌄
                </span>
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 sm:px-6 pb-4 sm:pb-6 text-white/70 text-xs sm:text-sm leading-relaxed"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

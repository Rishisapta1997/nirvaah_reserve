"use client";

import { motion } from "framer-motion";
import RevealText from "@/components/RevealText";
import { useScrollDirection } from "@/hooks/useScrollDirection";

export default function MaterialStory() {
  const direction = useScrollDirection();
  const yOffset = direction === "down" ? 20 : -20;

  return (
    <section className="py-32 px-6 md:px-12 bg-brand-bg text-[#f4f0ec]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <RevealText 
            text="THE MERGE" 
            className="text-[10px] uppercase tracking-[0.4em] text-[#cfa15f] font-bold mb-4 justify-center"
            delay={0.1}
          />
          <motion.p 
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-3xl md:text-5xl font-serif"
          >
            Natural meets Engineered.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 md:gap-8 lg:gap-24 items-center">
          {/* Jute Story */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 1 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-serif text-[#cfa15f]">Jute</h3>
            <p className="text-white/70 font-light leading-relaxed">
              Raw, renewable, and rooted in nature. One of the most sustainable fibers on earth, jute provides unmatched authenticity and carbon-absorbing eco-benefits, yet lacks structure on its own.
            </p>
          </motion.div>

          {/* Leather Story */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-6 md:text-right"
          >
            <h3 className="text-2xl font-serif text-[#8b5a2b]">Vegan Leather</h3>
            <p className="text-white/70 font-light leading-relaxed">
              Structured, modern, and functional. Cruelty-free vegan leather provides the necessary durability and premium finish to elevate the raw nature of jute into a daily carry essential.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: yOffset, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="mt-24 text-center max-w-3xl mx-auto p-12 border border-white/5 bg-[#1a1a1a] rounded-2xl shadow-2xl"
        >
          <p className="text-xl md:text-2xl font-serif italic text-[#cfa15f]">
            "You don’t have to choose between ethics and aesthetics. You can carry both."
          </p>
        </motion.div>
      </div>
    </section>
  );
}

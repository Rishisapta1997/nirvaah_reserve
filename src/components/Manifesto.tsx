"use client";

import { motion } from "framer-motion";
import RevealText from "@/components/RevealText";
import { useScrollDirection } from "@/hooks/useScrollDirection";

export default function Manifesto() {
  const direction = useScrollDirection();
  const yOffset = direction === "down" ? 20 : -20;

  return (
    <section id="manifesto" className="py-16 md:py-32 px-4 sm:px-6 md:px-12 bg-brand-bg text-[#f4f0ec] flex justify-center">
      <div className="max-w-3xl text-center space-y-8 md:space-y-12">
        <div>
          <RevealText 
            text="THE MANIFESTO" 
            className="text-[10px] uppercase tracking-[0.4em] text-[#cfa15f] font-bold mb-6 md:mb-8 justify-center"
            delay={0.1}
          />
          <motion.p
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-lg sm:text-xl md:text-4xl font-serif leading-relaxed px-2"
          >
            We don't believe sustainability should feel like sacrifice.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>And we don't believe design should come at the cost of the planet.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: yOffset + 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-sm sm:text-base md:text-xl font-light text-white/70 leading-relaxed max-w-2xl mx-auto px-2">
            We believe what you carry should reflect what you stand for.
            NIRVAAH is built on a simple idea: <strong>Carry with purpose.</strong>
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Every product is a balance — between responsibility and refinement,
            between natural and engineered, between impact and intention.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

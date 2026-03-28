"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import RevealText from "@/components/RevealText";
import { useScrollDirection } from "@/hooks/useScrollDirection";

export default function Craft() {
  const containerRef = useRef<HTMLDivElement>(null);
  const direction = useScrollDirection();
  const yOffset = direction === "down" ? 20 : -20;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section id="craft" ref={containerRef} className="py-16 md:py-24 px-4 sm:px-6 md:px-16 bg-brand-bg border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <RevealText 
            text="OUR CRAFT" 
            className="text-[10px] md:text-sm uppercase tracking-[0.4em] text-[#cfa15f] font-bold mb-4 justify-center"
            delay={0.1}
          />
          <motion.p 
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-2xl sm:text-3xl md:text-5xl font-serif text-brand-text mb-3 md:mb-4 px-2"
          >
            The Craft Behind Nirvaah
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-[#a87f54] italic font-serif text-sm sm:text-base"
          >
            Every stitch is intentional. Every material, chosen with care.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: yOffset + 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] bg-[#3a2d24] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg mb-10 md:mb-12 relative flex items-center justify-center"
        >
          <motion.div
            style={{ y: backgroundY, backgroundImage: "url('https://res.cloudinary.com/dvy6lnr3j/image/upload/v1774604158/file_00000000bea07206999095920bb5667c_fr9zyl.png')"}}
            className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-overlay scale-110"
          />
          <div className="z-10 text-center text-white/80 p-3 sm:p-6">
            <h3 className="text-lg sm:text-2xl font-serif tracking-widest uppercase mb-4 sm:mb-8 border-b border-white/20 pb-2 sm:pb-4 inline-block px-4 sm:px-12">Premium Details</h3>
            <div className="flex gap-3 sm:gap-6 md:gap-12 text-[9px] sm:text-[11px] font-medium tracking-widest uppercase justify-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-14 md:w-16 h-10 sm:h-14 md:h-16 rounded-lg sm:rounded-xl mb-2 sm:mb-3 border border-white/20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://res.cloudinary.com/dvy6lnr3j/image/upload/v1774606975/texture_jute_hhhs7j.png')" }} />
                <span className="hidden sm:block">Textured Jute</span>
                <span className="sm:hidden">Jute</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-14 md:w-16 h-10 sm:h-14 md:h-16 rounded-lg sm:rounded-xl mb-2 sm:mb-3 border border-white/20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://res.cloudinary.com/dvy6lnr3j/image/upload/v1774606974/smooth_leather_eccnki.png')" }} />
                <span className="hidden sm:block">Smooth Leather</span>
                <span className="sm:hidden">Leather</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-14 md:w-16 h-10 sm:h-14 md:h-16 rounded-lg sm:rounded-xl mb-2 sm:mb-3 border border-white/20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://res.cloudinary.com/dvy6lnr3j/image/upload/v1774606975/brass_hardware_qxfznr.png')" }} />
                <span className="hidden sm:block">Brass Hardware</span>
                <span className="sm:hidden">Brass</span>
              </div>
            </div>
            <p className="mt-4 sm:mt-8 italic font-serif text-base sm:text-xl md:text-2xl text-white">"Each detail whispers luxury."</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            { tag: "Premium Jute", desc: "Sustainably sourced natural jute with earthy texture and strength.", icon: "🍃" },
            { tag: "Vegan Leather", desc: "High-grade cruelty-free leather that ages beautifully over time.", icon: "⬡" },
            { tag: "Brass Hardware", desc: "Warm gold-finish brass zippers and clasps for lasting elegance.", icon: "◎" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: yOffset + 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
              whileHover={{ y: -5, borderColor: "rgba(207, 161, 95, 0.3)" }}
              className="bg-[#1a1a1a] p-4 sm:p-6 rounded-xl sm:rounded-2xl flex gap-3 sm:gap-4 items-start shadow-sm border border-white/10 transition-colors duration-300 group"
            >
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-[#222] flex items-center justify-center text-[#cfa15f] text-lg sm:text-xl shrink-0 border border-white/5 group-hover:bg-[#cfa15f]/10 transition-colors">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-brand-text mb-1 group-hover:text-[#cfa15f] transition-colors text-sm sm:text-base">{item.tag}</h4>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import RevealText from "@/components/RevealText";
import Magnetic from "@/components/Magnetic";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*\#/, "");
    const elem = document.getElementById(targetId);
    if (elem) {
      e.preventDefault();
      elem.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Story", href: "#story" },
    { name: "Craft", href: "#craft" },
    { name: "Collection", href: "#collection" },
    { name: "Combos", href: "#combos" },
    { name: "FAQ", href: "#faq" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Get in touch", href: "#contact" },
  ];

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full min-h-[100svh] flex flex-col pt-4 pb-10 overflow-hidden bg-[#241f17]"
    >
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 z-0 scale-110"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://res.cloudinary.com/dvy6lnr3j/image/upload/v1774448835/ChatGPT_Image_Mar_25_2026_07_56_47_PM_gimiz0.png')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
      </motion.div>

      <nav
        className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 sm:px-6 md:px-16 py-4 md:py-6 transition-all duration-300 ${isScrolled
            ? "bg-black/80 backdrop-blur-lg border-b border-white/10"
            : "bg-transparent"
          }`}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#d5a04a]" />
          <span className="text-white text-base sm:text-xl tracking-[0.2em] sm:tracking-[0.25em] font-light mt-0.5 sm:mt-1">
            NIRVAAH
          </span>
        </motion.div>

        <div className="hidden md:flex items-center gap-12">
          <div className="flex gap-8 text-white/90 text-[13px] tracking-widest font-light">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              >
                <Link
                  href={link.href}
                  onClick={handleScroll}
                  className="hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </div>

          <Magnetic>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link
                href="#reserve"
                onClick={handleScroll}
                className="border border-[#b7884d]/60 rounded-[30px] px-6 sm:px-8 py-2 sm:py-2.5 text-[#e2ba86] text-[12px] sm:text-[13px] tracking-widest hover:bg-[#b7884d]/20 transition-all duration-300"
              >
                Reserve
              </Link>
            </motion.div>
          </Magnetic>
        </div>

        <button 
          className="md:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span className={`w-full h-0.5 bg-white transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-full h-0.5 bg-white transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-full h-0.5 bg-white transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </nav>

      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 left-0 w-full z-40 bg-black/95 backdrop-blur-lg md:hidden"
        >
          <div className="flex flex-col py-4 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={handleScroll}
                className="py-3 text-white/90 text-sm tracking-widest border-b border-white/10"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="#reserve"
              onClick={handleScroll}
              className="mt-4 text-center border border-[#b7884d]/60 rounded-[30px] px-6 py-2.5 text-[#e2ba86] text-sm tracking-widest"
            >
              Reserve
            </Link>
          </div>
        </motion.div>
      )}

      <motion.div
        style={{ y: contentY }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-3 sm:px-4 mt-12 sm:mt-16"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="border border-[#b7884d]/40 rounded-[20px] sm:rounded-[30px] px-4 sm:px-6 py-1.5 sm:py-2 mb-6 sm:mb-10 backdrop-blur-sm bg-black/10"
        >
          <span className="text-[#d5a04a] text-[9px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase font-light">
            First Edition – Limited Batch
          </span>
        </motion.div>

        <RevealText
          text="Elevate Your Carry"
          className="text-white text-3xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-light tracking-wide leading-tight sm:leading-normal"
          delay={0.2}
        />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-white/95 text-base sm:text-lg md:text-[1.75rem] mb-5 sm:mb-7 font-light px-4"
        >
          Carry your purpose with identity
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="text-white/85 max-w-xl text-xs sm:text-[13px] md:text-[15px] mb-8 sm:mb-12 px-4"
        >
          Handcrafted from premium vegan leather and textured jute.
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>Built to complement your identity.
        </motion.p>

        <Magnetic>
          <Link
            href="#reserve"
            onClick={handleScroll}
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-[30px] px-6 sm:px-10 py-3 sm:py-3.5"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#b46f36] via-[#cf9d56] to-[#b46f36] group-hover:scale-110 transition-transform duration-500" />
            <span className="relative z-10 text-white text-xs sm:text-[15px] whitespace-nowrap">
              Starting @ ₹99 | Reserve yours now
            </span>
          </Link>
        </Magnetic>
      </motion.div>
    </section>
  );
}
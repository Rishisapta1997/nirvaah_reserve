// FILE: src/components/Testimonials.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import RevealText from "@/components/RevealText";
import { useScrollDirection } from "@/hooks/useScrollDirection";

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  image_url?: string;
  rating?: number;
}

function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? "text-[#C6A46C]" : "text-white/20"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const isVideo =
    testimonial.image_url &&
    (testimonial.image_url.endsWith(".mp4") ||
      testimonial.image_url.endsWith(".webm") ||
      testimonial.image_url.includes("video"));

  return (
    <div className="w-[280px] md:w-[320px] flex-shrink-0 bg-[#1A1A1A] border border-white/8 rounded-2xl overflow-hidden group hover:border-[#C6A46C]/30 transition-all duration-300">
      {/* Media area — tall ratio like product cards */}
      <div className="relative aspect-[0.5/0.5] bg-[#111] overflow-hidden">
        {testimonial.image_url ? (
          isVideo ? (
            <video
              src={testimonial.image_url}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={testimonial.image_url}
              alt={testimonial.name}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )
        ) : (
          /* Placeholder when no image */
          <div className="w-full h-full flex items-center justify-center bg-[#111]">
            <div className="w-20 h-20 rounded-full bg-[#C6A46C]/10 border border-[#C6A46C]/20 flex items-center justify-center">
              <span className="text-3xl font-serif text-[#C6A46C]">
                {testimonial.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
      </div>

      {/* Content below media */}
      <div className="p-5">
        {/* Rating */}
        <StarRating rating={testimonial.rating ?? 5} />

        {/* Quote */}
        <p className="mt-3 text-sm text-white/70 leading-relaxed line-clamp-3">
          "{testimonial.content}"
        </p>

        {/* Author */}
        <div className="mt-4 pt-4 border-t border-white/8">
          <p className="text-sm font-semibold text-brand-text">{testimonial.name}</p>
          {testimonial.role && (
            <p className="text-xs text-[#C6A46C] mt-0.5">{testimonial.role}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [data, setData] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const direction = useScrollDirection();
  const yOffset = direction === "down" ? 30 : -30;

  // Auto-scroll refs
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const pausedRef = useRef(false);
  const SPEED = 1.5; // px per frame

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((d) => {
        setData(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Infinite auto-scroll using framer-motion's useAnimationFrame
  useAnimationFrame(() => {
    const track = trackRef.current;
    if (!track || pausedRef.current) return;

    xRef.current -= SPEED;

    // Reset when first half scrolled — we duplicate items so it loops seamlessly
    const halfWidth = track.scrollWidth / 2;
    if (Math.abs(xRef.current) >= halfWidth) {
      xRef.current = 0;
    }

    track.style.transform = `translateX(${xRef.current}px)`;
  });

  // Fallback / loading skeleton
  const skeletons = Array.from({ length: 4 });

  // Duplicate items for seamless loop
  const items = [...data, ...data];

  return (
    <section id="testimonials" className="py-24 bg-[#0E0E0E] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-16">
        {/* Header — same animation pattern as other sections */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false }}
            className="text-[10px] uppercase tracking-[0.3em] text-[#C6A46C] mb-4"
          >
            WHAT THEY SAY
          </motion.p>

          <RevealText
            text="Loved by Early Believers."
            className="text-4xl md:text-5xl font-serif text-brand-text mb-6 justify-center"
          />

          <motion.p
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: false }}
            className="text-sm text-white/40 max-w-sm mx-auto"
          >
            Real people. Real stories. Real love for craft.
          </motion.p>
        </div>
      </div>

      {/* Carousel — full width, no padding constraint */}
      <div
        className="relative"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-[#0E0E0E] to-transparent" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-[#0E0E0E] to-transparent" />

        <div className="overflow-hidden">
          {loading ? (
            /* Skeleton */
            <div className="flex gap-5 px-6">
              {skeletons.map((_, i) => (
                <div
                  key={i}
                  className="w-[280px] md:w-[320px] flex-shrink-0 bg-[#1A1A1A] rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="aspect-[1/1] bg-[#252525]" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-[#252525] rounded w-20" />
                    <div className="h-3 bg-[#252525] rounded w-full" />
                    <div className="h-3 bg-[#252525] rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center text-white/20 py-16 text-sm">
              No testimonials yet
            </div>
          ) : (
            <div
              ref={trackRef}
              className="flex gap-5 pl-6"
              style={{ willChange: "transform" }}
            >
              {items.map((t, i) => (
                <TestimonialCard key={`${t.id}-${i}`} testimonial={t} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom entry animation trigger */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
        className="mt-12 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: yOffset }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: false }}
          className="text-xs text-white/20 tracking-widest uppercase"
        >
          Every bag. Every story. Handcrafted.
        </motion.p>
      </motion.div>
    </section>
  );
}
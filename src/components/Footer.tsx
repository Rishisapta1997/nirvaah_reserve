export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white pt-16 pb-8 px-6 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-[#d8a868]" />
            <div className="text-lg font-bold tracking-[0.2em] uppercase">
              NIRVAAH
            </div>
          </div>
          <p className="text-[#8c7f73] font-serif italic text-sm">Built to Uphold</p>
        </div>

        <div className="flex gap-8 text-sm font-medium tracking-wide text-white/80">
          <a href="#story" className="hover:text-white transition-colors">Story</a>
          <a href="#craft" className="hover:text-white transition-colors">Craft</a>
          <a href="#collection" className="hover:text-white transition-colors">Collection</a>
          <a href="#combos" className="hover:text-white transition-colors">Combos</a>
          <a href="#reserve" className="hover:text-white transition-colors">Reserve</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          <a href="#contact" className="hover:text-white transition-colors">Get in touch</a>
        </div>

        <div className="flex gap-4">
          <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-colors">
            in {/* Placeholder icon */}
          </a>
          <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-colors">
            tw {/* Placeholder icon */}
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between text-xs text-[#8c7f73]">
        <p>© {new Date().getFullYear()} Nirvaah. All rights reserved.</p>
        <p>Made in India with <span className="text-red-500">♥</span></p>
      </div>
    </footer>
  );
}

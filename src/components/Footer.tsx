export default function Footer() {
  const footerLinks = [
    { name: "Story", href: "#story" },
    { name: "Craft", href: "#craft" },
    { name: "Collection", href: "#collection" },
    { name: "Combos", href: "#combos" },
    { name: "Reserve", href: "#reserve" },
    { name: "FAQ", href: "#faq" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Get in touch", href: "#contact" },
  ];

  return (
    <footer className="bg-brand-dark text-white pt-12 sm:pt-16 pb-8 px-4 sm:px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 mb-12 md:mb-16">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#d8a868]" />
              <div className="text-base sm:text-lg font-bold tracking-[0.2em] uppercase">
                NIRVAAH
              </div>
            </div>
            <p className="text-[#8c7f73] font-serif italic text-xs sm:text-sm">Built to Uphold</p>
          </div>

          <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm font-medium tracking-wide text-white/80">
            {footerLinks.map((link) => (
              <a key={link.name} href={link.href} className="hover:text-white transition-colors">
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex gap-3 sm:gap-4">
            <a href="#" className="w-9 sm:w-10 h-9 sm:h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-colors text-xs sm:text-sm">
              in
            </a>
            <a href="#" className="w-9 sm:w-10 h-9 sm:h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-colors text-xs sm:text-sm">
              tw
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between text-[10px] sm:text-xs text-[#8c7f73] gap-2 sm:gap-0">
          <p>© {new Date().getFullYear()} Nirvaah. All rights reserved.</p>
          <p>Made in India with <span className="text-red-500">♥</span></p>
        </div>
      </div>
    </footer>
  );
}

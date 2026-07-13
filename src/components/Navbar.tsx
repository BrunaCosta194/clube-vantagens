import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

const links = [
  { href: "#parceiros", label: "Parceiros" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#indique", label: "Indique & ganhe" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-6">
      <nav
        className={`flex items-center gap-2 rounded-full border transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled
            ? "border-grafite/10 bg-creme/80 py-2 pl-3 pr-2 shadow-lux-sm backdrop-blur-xl"
            : "border-white/10 bg-grafite/5 py-2.5 pl-4 pr-2.5 backdrop-blur-md"
        }`}
      >
        <a href="#top" className="flex items-center gap-2.5 pr-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-grafite font-display text-base font-semibold text-creme">
            S
          </span>
          <span className="hidden font-display text-[15px] font-semibold leading-none text-grafite sm:block">
            Comunidade Sanchez
          </span>
        </a>

        <div className="mx-1 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-grafite-soft transition-colors duration-300 hover:bg-grafite/5 hover:text-grafite"
            >
              {l.label}
            </a>
          ))}
        </div>

        <a
          href="#cadastro"
          className="group inline-flex items-center gap-2 rounded-full bg-grafite py-2 pl-4 pr-2 text-sm font-medium text-creme transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-terracota active:scale-[0.98]"
        >
          Fazer parte
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </span>
        </a>
      </nav>
    </header>
  );
}

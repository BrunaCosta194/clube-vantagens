import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/marca/logo-cs.png";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-wash px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <img src={logo} alt="Comunidade Sanchez" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-display text-[15px] font-semibold text-grafite">
            Comunidade Sanchez
          </span>
        </Link>

        <div className="bezel">
          <div className="bezel-core bg-white/70 px-7 py-9 backdrop-blur-sm sm:px-10 sm:py-11">
            <h1 className="h-display text-[clamp(1.6rem,4vw,2.1rem)]">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-grafite-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-grafite-soft">{footer}</div>
      </div>
    </div>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-grafite/15 bg-white px-4 py-3 text-sm text-grafite placeholder:text-grafite-muted/60 transition-colors focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20";

export const labelClass = "mb-1.5 block text-sm font-medium text-grafite-soft";

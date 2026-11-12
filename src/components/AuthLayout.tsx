import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/marca/logo-cs.png";
import yruena from "@/assets/marca/yruena-hero.jpg";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

// Entrar / criar conta: formulário à esquerda, foto da Yruena à direita no
// computador (no celular, só o formulário). Mesmo visual do site da Sanchez.
export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen bg-creme lg:grid-cols-2">
      <div className="flex flex-col px-5 py-8 sm:px-10 lg:px-16 xl:px-24">
        <Link to="/" className="flex items-center gap-3 self-start">
          <img src={logo} alt="" className="h-10 w-10 object-contain" />
          <span className="font-display text-[22px] leading-none text-grafite">Clube Sanchez</span>
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14">
          <h1 className="h-display text-[clamp(2.5rem,5vw,3.75rem)]">{title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-grafite">{subtitle}</p>
          <div className="mt-10">{children}</div>
          <div className="mt-8 text-base text-grafite">{footer}</div>
        </div>
      </div>

      <div className="relative hidden bg-creme-200 lg:block">
        <img
          src={yruena}
          alt="Yruena, à frente do Clube Sanchez"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      </div>
    </div>
  );
}

export const inputClass =
  "min-h-[3.25rem] w-full rounded-md border border-grafite/20 bg-white px-4 text-base text-grafite placeholder:text-grafite-muted transition-colors focus:border-cobre-deep focus:outline-none focus:ring-2 focus:ring-cobre/20";

export const labelClass = "mb-2 block text-[15px] font-semibold text-grafite";

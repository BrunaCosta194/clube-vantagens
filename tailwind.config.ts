import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Identidade oficial Sanchez (marketing) ──
        creme: {
          DEFAULT: "hsl(0, 0%, 92%)", // #eaeaea — fundo oficial
          100: "hsl(0, 0%, 96%)",
          200: "hsl(0, 0%, 87%)", // hairline / linhas
        },
        grafite: {
          DEFAULT: "hsl(0, 0%, 15%)", // #272727 — oficial
          soft: "hsl(0, 0%, 30%)",
          muted: "hsl(0, 0%, 47%)",
        },
        // ── Acentos oficiais ──
        terracota: {
          DEFAULT: "hsl(19, 73%, 45%)", // #c6531f — oficial
          50: "hsl(19, 73%, 96%)",
          100: "hsl(19, 73%, 90%)",
          200: "hsl(19, 73%, 80%)",
          300: "hsl(19, 73%, 68%)",
          400: "hsl(19, 73%, 56%)",
          500: "hsl(19, 73%, 45%)",
          600: "hsl(19, 73%, 38%)",
          700: "hsl(19, 73%, 31%)",
          800: "hsl(19, 73%, 24%)",
          900: "hsl(19, 73%, 18%)",
        },
        dourado: {
          DEFAULT: "hsl(36, 47%, 51%)", // #bd8e48 — oficial
          soft: "hsl(36, 47%, 65%)",
          deep: "hsl(36, 47%, 38%)",
        },
      },
      fontFamily: {
        display: ['"Merriweather"', "serif"],
        sans: ['"Poppins"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        // sombras difusas, ambiente — nada de shadow-md duro
        lux: "0 40px 80px -40px hsl(19 30% 14% / 0.30), 0 12px 28px -18px hsl(19 30% 14% / 0.14)",
        "lux-sm": "0 20px 44px -28px hsl(19 30% 14% / 0.22)",
        inset: "inset 0 1px 1px hsl(0 0% 100% / 0.6)",
      },
      transitionTimingFunction: {
        lux: "cubic-bezier(0.22, 1, 0.36, 1)",
        spring: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      backgroundImage: {
        "warm-glow":
          "radial-gradient(120% 90% at 100% 0%, hsl(36 60% 90%) 0%, transparent 55%), radial-gradient(90% 80% at 0% 100%, hsl(19 60% 92%) 0%, transparent 50%)",
        // Splash do carrossel (tela cheia) — terracota profundo com brilho âmbar/dourado
        "club-splash":
          "radial-gradient(130% 100% at 50% -10%, hsl(35 92% 62%) 0%, hsl(27 90% 54%) 32%, hsl(19 86% 46%) 62%, hsl(22 82% 34%) 100%)",
        // Hero (Yruena + Clube) — degradê terracota quente, texto escuro legível
        "club-hero":
          "radial-gradient(120% 120% at 85% 8%, hsl(37 94% 78%) 0%, transparent 46%), linear-gradient(135deg, hsl(37 92% 86%) 0%, hsl(25 90% 78%) 48%, hsl(19 84% 70%) 100%)",
        // Painel forte (Indique & ganhe) — terracota → âmbar → dourado
        "club-panel":
          "linear-gradient(130deg, hsl(21 84% 44%) 0%, hsl(27 88% 52%) 50%, hsl(32 90% 52%) 100%)",
        // Lavagem quente sutil para seções claras (menos creme puro)
        "warm-wash":
          "linear-gradient(180deg, hsl(31 60% 95%) 0%, hsl(33 66% 92%) 100%)",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "float-slow": "float-slow 7s ease-in-out infinite",
        marquee: "marquee 32s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

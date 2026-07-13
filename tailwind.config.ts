import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Editorial Luxury — base creme quente + tinta espresso ──
        creme: {
          DEFAULT: "hsl(37, 44%, 97%)", // papel
          100: "hsl(34, 34%, 93%)",
          200: "hsl(30, 26%, 88%)", // hairline / linhas
        },
        grafite: {
          DEFAULT: "hsl(19, 22%, 11%)", // tinta espresso (quase preto quente)
          soft: "hsl(19, 12%, 28%)",
          muted: "hsl(22, 9%, 47%)",
        },
        // ── Acentos (usados com parcimônia) ──
        terracota: {
          DEFAULT: "hsl(12, 84%, 52%)",
          50: "hsl(12, 84%, 96%)",
          100: "hsl(12, 82%, 90%)",
          200: "hsl(12, 82%, 80%)",
          300: "hsl(12, 82%, 68%)",
          400: "hsl(12, 84%, 60%)",
          500: "hsl(12, 84%, 52%)",
          600: "hsl(12, 82%, 44%)",
          700: "hsl(14, 80%, 36%)",
          800: "hsl(15, 74%, 28%)",
          900: "hsl(16, 68%, 20%)",
        },
        dourado: {
          DEFAULT: "hsl(39, 74%, 46%)",
          soft: "hsl(41, 68%, 60%)",
          deep: "hsl(34, 72%, 38%)",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
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
          "radial-gradient(120% 90% at 100% 0%, hsl(39 60% 90%) 0%, transparent 55%), radial-gradient(90% 80% at 0% 100%, hsl(12 60% 92%) 0%, transparent 50%)",
        // Splash do carrossel (tela cheia) — laranja profundo com brilho âmbar/dourado
        "club-splash":
          "radial-gradient(130% 100% at 50% -10%, hsl(38 92% 62%) 0%, hsl(20 90% 54%) 32%, hsl(12 86% 46%) 62%, hsl(15 82% 34%) 100%)",
        // Hero (Yruena + Clube) — degradê laranja quente, texto escuro legível
        "club-hero":
          "radial-gradient(120% 120% at 85% 8%, hsl(40 94% 78%) 0%, transparent 46%), linear-gradient(135deg, hsl(30 92% 86%) 0%, hsl(18 90% 78%) 48%, hsl(12 84% 70%) 100%)",
        // Painel forte (Indique & ganhe) — terracota → âmbar → dourado
        "club-panel":
          "linear-gradient(130deg, hsl(14 84% 44%) 0%, hsl(20 88% 52%) 50%, hsl(35 90% 52%) 100%)",
        // Lavagem quente sutil para seções claras (menos creme puro)
        "warm-wash":
          "linear-gradient(180deg, hsl(34 60% 95%) 0%, hsl(26 66% 92%) 100%)",
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

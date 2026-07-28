import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Nível Clube — guia de identidade (cobre sobre terracota claro) ──
        // Fundo padrão de todas as páginas do Nível Clube.
        creme: {
          DEFAULT: "#EFE0D3", // terracota claro — fundo de página
          100: "#F5EBE0", // um tom acima (cards claros)
          200: "#E3D4C5", // hairline / linhas / botão desabilitado
        },
        // Texto de corpo e títulos sobre fundo claro (marrom quente, não cinza).
        grafite: {
          DEFAULT: "#4A2B1C", // marrom texto principal
          soft: "#6B4A38",
          muted: "#8F7263",
        },
        // ── Cobre (identidade da logo — nunca migrar para dourado) ──
        cobre: {
          DEFAULT: "#B66F4E", // CTA principal, links ativos, ícones de destaque
          light: "#CD8F6C", // só sobre fundo escuro (contraste baixo no claro)
          deep: "#894C36", // hover de botão, texto de preço, títulos secundários
          line: "#BF7959", // bordas de badge, contornos, divisores
          // alias legado (antigo `dourado-soft`) — aponta para cobre claro
          soft: "#CD8F6C",
        },
        // Texto sobre fundo escuro (navbar, cards escuros).
        perola: "#F5F1EC",
        // Laranja-gatilho — SÓ tático (selo desconto, campanha). Nunca estrutural.
        gatilho: {
          DEFAULT: "#C2551F",
          text: "#FFF6EE",
        },
        // Badge "via Shopee" e canais externos — neutro, fora da família cobre.
        shopee: "#888780",
        // ── Terracota (acento avermelhado, ::selection) ──
        terracota: {
          DEFAULT: "hsl(19, 73%, 45%)",
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
        // ── Nível Premium (paleta própria escura — só a página /premium) ──
        premium: {
          DEFAULT: "#2D1A0F",
          soft: "#4A2B1C",
        },
        // ── Papo de Aluguel (planeta próprio do ecossistema) ──
        papo: {
          azul: "#011F41",
          ciano: "#286786",
          laranja: "#FF8437",
          reflexo: "#59D0F0",
          texto: "#F2F5F7",
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
        // Brilho quente sutil (cobre) para seções claras
        "warm-glow":
          "radial-gradient(120% 90% at 100% 0%, #F3E4D6 0%, transparent 55%), radial-gradient(90% 80% at 0% 100%, #EFE0D3 0%, transparent 50%)",
        // Splash do carrossel — cobre profundo (sem gold)
        "club-splash":
          "radial-gradient(130% 100% at 50% -10%, #CD8F6C 0%, #B66F4E 45%, #894C36 100%)",
        // Hero — terracota claro quente, texto marrom legível
        "club-hero":
          "radial-gradient(120% 120% at 85% 8%, #F7EADD 0%, transparent 46%), linear-gradient(135deg, #F3E4D6 0%, #EFE0D3 52%, #E7CDB8 100%)",
        // Painel forte (Indique & ganhe) — cobre
        "club-panel":
          "linear-gradient(130deg, #894C36 0%, #B66F4E 55%, #CD8F6C 100%)",
        // Lavagem quente sutil para seções claras
        "warm-wash":
          "linear-gradient(180deg, #F3E7DB 0%, #EFE0D3 100%)",
        // ── Banners do carrossel (coded) ──
        "banner-clube": "linear-gradient(135deg, #CD8F6C 0%, #B66F4E 100%)",
        "banner-papo":
          "linear-gradient(160deg, #000000 0%, #011F41 55%, #286786 100%)",
        "banner-premium":
          "linear-gradient(135deg, #2D1A0F 0%, #4A2B1C 100%)",
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

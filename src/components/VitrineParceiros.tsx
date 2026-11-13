import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { parceiros, type Parceiro } from "@/data/parceiros";
import ParceiroModal from "./ParceiroModal";
import { track } from "@/lib/track";

const ease = [0.22, 1, 0.36, 1] as const;

export default function VitrineParceiros() {
  const [aberto, setAberto] = useState<Parceiro | null>(null);
  const [lista, setLista] = useState<Parceiro[]>(parceiros);

  // Páginas publicadas pelo Portal do Parceiro entram depois das do arquivo. Se o
  // mesmo parceiro estiver nos dois, vale a do banco (o do arquivo sai da lista).
  useEffect(() => {
    let vivo = true;
    // Import sob demanda: as regras da página não entram no pacote inicial da home.
    void Promise.all([
      import("@/lib/paginasParceiros"),
      import("../../supabase/functions/_shared/parceiro-pagina.ts"),
    ]).then(async ([{ paginasPublicadas, urlPublica }, { tituloBeneficio }]) => {
      const paginas = await paginasPublicadas();
      if (!vivo || !paginas.length) return;
      const doBanco: Parceiro[] = paginas.map(({ slug, perfil }) => ({
        slug,
        nome: perfil.nome,
        categoria: perfil.categoria,
        descricaoCurta: perfil.frase,
        descricao: perfil.sobre,
        voucher: tituloBeneficio(perfil) || undefined,
        imagem: urlPublica(perfil.logo) ?? "",
        cor: "hsl(20, 25%, 22%)",
        tags: perfil.tags,
        pagina: `/parceiro/${slug}`,
      }));
      const slugs = new Set(doBanco.map((p) => p.slug));
      setLista([...parceiros.filter((p) => !slugs.has(p.slug)), ...doBanco]);
    });
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <section id="parceiros" className="section-y bg-creme-100">
      <div className="container-club">
        {/* cabeçalho: título à esquerda, instrução à direita na mesma linha de base */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="grid gap-6 lg:grid-cols-12 lg:items-end"
        >
          <h2 className="h-display text-[clamp(2.5rem,5.2vw,4.5rem)] lg:col-span-8">
            Vantagens de quem <span className="italic text-cobre-deep">a Sanchez confia</span>
          </h2>
          <p className="max-w-sm text-lg leading-relaxed text-grafite lg:col-span-4 lg:justify-self-end">
            Escolha um parceiro para conhecer o benefício, as condições e os
            canais de atendimento.
          </p>
        </motion.div>

        {/* celular: carrossel com o próximo aparecendo; sm+: grade */}
        <div className="mt-12 grid gap-y-8 sm:mt-16 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-3 lg:gap-x-8">
          {lista.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: (i % 4) * 0.07, ease }}
              className="group min-w-0"
            >
              {(() => {
                const inner = (
                  <div className="grid h-full grid-cols-[7.5rem_1fr] items-start gap-x-5 sm:flex sm:flex-col">
                    {/* placa do logo: tom acima do fundo, logo inteiro (object-contain) */}
                    <div className="relative row-span-4 aspect-square overflow-hidden rounded-[10px] bg-[#FBF7F2] transition-colors duration-500 group-hover:bg-white sm:aspect-[16/11] sm:w-full">
                      <img
                        src={p.imagem}
                        alt={p.nome}
                        loading="lazy"
                        className="h-full w-full object-contain p-3 transition sm:p-8-transform duration-[1.2s] ease-lux group-hover:scale-[1.05]"
                      />
                      <span className="absolute bottom-3 right-3 hidden h-10 w-10 place-items-center rounded-full bg-creme-100 text-grafite sm:grid transition-colors duration-300 group-hover:bg-cobre-deep group-hover:text-perola">
                        <ArrowUpRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      </span>
                    </div>

                    <p className="text-[15px] text-grafite-soft sm:mt-5">{p.categoria}</p>
                    <h3 className="mt-1 font-display text-[22px] leading-tight sm:text-[26px] text-grafite transition-colors duration-300 group-hover:text-cobre-deep">
                      {p.nome}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-base leading-relaxed text-grafite">
                      {p.descricaoCurta}
                    </p>
                    {p.voucher && (
                      <p className="mt-3 text-base font-semibold text-cobre-deep">{p.voucher}</p>
                    )}
                  </div>
                );
                return p.pagina ? (
                  <Link
                    to={p.pagina}
                    onClick={() => track("partner_open", { slug: p.slug })}
                    className="block h-full w-full text-left"
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      track("partner_open", { slug: p.slug });
                      setAberto(p);
                    }}
                    className="block h-full w-full text-left"
                  >
                    {inner}
                  </button>
                );
              })()}
            </motion.div>
          ))}
        </div>
      </div>

      <ParceiroModal parceiro={aberto} onClose={() => setAberto(null)} />
    </section>
  );
}

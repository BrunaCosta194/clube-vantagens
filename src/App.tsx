import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import BotaoWhatsApp from "./components/BotaoWhatsApp";
import { SessaoProvider } from "./lib/sessao";

// Só a home vai no pacote inicial; as outras páginas baixam quando abertas
// (deixa o primeiro carregamento no celular bem mais leve).
const Admin = lazy(() => import("./pages/Admin"));
const Cadastro = lazy(() => import("./pages/Cadastro"));
const Login = lazy(() => import("./pages/Login"));
const AreaMembro = lazy(() => import("./pages/AreaMembro"));
const Loja = lazy(() => import("./pages/Loja"));
const PapoDeAluguel = lazy(() => import("./pages/PapoDeAluguel"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const ParceiroBioreluz = lazy(() => import("./pages/ParceiroBioreluz"));
const ParceiroInsurance = lazy(() => import("./pages/ParceiroInsurance"));

export default function App() {
  return (
    <SessaoProvider>
      <Suspense fallback={<div className="min-h-screen bg-creme" />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/area" element={<AreaMembro />} />
          <Route path="/loja" element={<Loja />} />
          <Route path="/papodealuguel" element={<PapoDeAluguel />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/parceiro/bioreluz" element={<ParceiroBioreluz />} />
          <Route path="/parceiro/insurance-sante" element={<ParceiroInsurance />} />
          <Route path="/admin" element={<Admin />} />
          {/* Rota desconhecida (ex: /premium, que foi removida) volta pra home
              em vez de renderizar tela branca. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <BotaoWhatsApp />
    </SessaoProvider>
  );
}

import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import AreaMembro from "./pages/AreaMembro";
import Loja from "./pages/Loja";
import PapoDeAluguel from "./pages/PapoDeAluguel";
import ParceiroBioreluz from "./pages/ParceiroBioreluz";
import ParceiroInsurance from "./pages/ParceiroInsurance";
import BotaoWhatsApp from "./components/BotaoWhatsApp";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/area" element={<AreaMembro />} />
        <Route path="/loja" element={<Loja />} />
        <Route path="/papodealuguel" element={<PapoDeAluguel />} />
        <Route path="/parceiro/bioreluz" element={<ParceiroBioreluz />} />
        <Route path="/parceiro/insurance-sante" element={<ParceiroInsurance />} />
        {/* Rota desconhecida (ex: /premium, que foi removida) volta pra home
            em vez de renderizar tela branca. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BotaoWhatsApp />
    </>
  );
}

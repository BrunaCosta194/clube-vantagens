import { Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import AreaMembro from "./pages/AreaMembro";
import Loja from "./pages/Loja";
import PapoDeAluguel from "./pages/PapoDeAluguel";
import Premium from "./pages/Premium";
import ParceiroBioreluz from "./pages/ParceiroBioreluz";
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
        <Route path="/premium" element={<Premium />} />
        <Route path="/parceiro/bioreluz" element={<ParceiroBioreluz />} />
      </Routes>
      <BotaoWhatsApp />
    </>
  );
}

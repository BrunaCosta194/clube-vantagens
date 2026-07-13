import { Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import AreaMembro from "./pages/AreaMembro";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/area" element={<AreaMembro />} />
    </Routes>
  );
}

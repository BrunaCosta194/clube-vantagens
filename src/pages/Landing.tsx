import Navbar from "../components/Navbar";
import BannerCarousel from "../components/BannerCarousel";
import Hero from "../components/Hero";
import VitrineParceiros from "../components/VitrineParceiros";
import SobreSanchez from "../components/SobreSanchez";
import ComoFunciona from "../components/ComoFunciona";
import IndiqueGanhe from "../components/IndiqueGanhe";
import CtaCadastro from "../components/CtaCadastro";
import Footer from "../components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-creme">
      <Navbar />
      <main>
        <BannerCarousel />
        <Hero />
        <VitrineParceiros />
        <SobreSanchez />
        <ComoFunciona />
        <IndiqueGanhe />
        <CtaCadastro />
      </main>
      <Footer />
    </div>
  );
}

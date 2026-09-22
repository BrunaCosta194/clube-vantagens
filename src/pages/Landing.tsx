import Navbar from "../components/Navbar";
import BannerCarousel from "../components/BannerCarousel";
import Hero from "../components/Hero";
import VitrineParceiros from "../components/VitrineParceiros";
import LojaSecao from "../components/LojaSecao";
import ComoFunciona from "../components/ComoFunciona";
import Footer from "../components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-creme">
      <Navbar />
      <main>
        <BannerCarousel />
        <Hero />
        <VitrineParceiros />
        <LojaSecao />
        <ComoFunciona />
      </main>
      <Footer />
    </div>
  );
}

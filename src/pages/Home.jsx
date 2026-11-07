import { useState, useCallback } from "react";
import LoadingScreen from "../components/LoadingScreen";
import CapsuleNavbar from "../components/CapsuleNavbar";
import HeroSection from "../components/HeroSection";
import EssenceSection from "../components/EssenceSection";
import CatalogSection from "../components/CatalogSection";
import PortionGuide from "../components/PortionGuide";
import PersonalizadasSection from "../components/PersonalizadasSection";
import HowToOrder from "../components/HowToOrder";
import VideoRevealSection from "../components/VideoRevealSection";
import AboutSection from "../components/AboutSection";
import ContactSection from "../components/ContactSection";
import FooterSection from "../components/FooterSection";
import Marquee from "../components/Marquee";
import { ScrollProgress, WhatsAppFab } from "../components/ScrollExtras";
import useSmoothScroll from "../hooks/useSmoothScroll";

// Orden: qué hacen → el catálogo → lo personalizado → el tamaño → cómo pedir → quiénes son → contacto
export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  useSmoothScroll({ ease: 0.075 });

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip font-inter">
      <LoadingScreen onComplete={handleLoadComplete} />

      <div style={{ visibility: isLoading ? "hidden" : "visible" }}>
        <ScrollProgress />
        <CapsuleNavbar />
        <WhatsAppFab />
        <main className="relative z-10">
          <HeroSection ready={!isLoading} />
          <Marquee />
          <CatalogSection />
          <PersonalizadasSection />
          <PortionGuide />
          <HowToOrder />
          <VideoRevealSection />
          <AboutSection />
          <EssenceSection />
          <ContactSection />
        </main>
        <FooterSection />
      </div>
    </div>
  );
}

import { useState, useCallback } from "react";
import LoadingScreen from "../components/LoadingScreen";
import CapsuleNavbar from "../components/CapsuleNavbar";
import ParallaxHearts from "../components/ParallaxHearts";
import OrganicBackground from "../components/OrganicBackground";
import HeroSection from "../components/HeroSection";
import EssenceSection from "../components/EssenceSection";
import CatalogSection from "../components/CatalogSection";
import PortionGuide from "../components/PortionGuide";
import PersonalizadasSection from "../components/PersonalizadasSection";
import VideoRevealSection from "../components/VideoRevealSection";
import AboutSection from "../components/AboutSection";
import ContactSection from "../components/ContactSection";
import FooterSection from "../components/FooterSection";
import useSmoothScroll from "../hooks/useSmoothScroll";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  useSmoothScroll({ ease: 0.075 });

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden font-inter">
      <LoadingScreen onComplete={handleLoadComplete} />

      <div style={{ visibility: isLoading ? "hidden" : "visible" }}>
        <OrganicBackground />
        <ParallaxHearts />
        <CapsuleNavbar />
        <main className="relative z-10">
          <HeroSection />
          <CatalogSection />
          <PortionGuide />
          <PersonalizadasSection />
          <VideoRevealSection />
          <EssenceSection />
          <AboutSection />
          <ContactSection />
          <FooterSection />
        </main>
      </div>
    </div>
  );
}
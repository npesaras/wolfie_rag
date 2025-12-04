import { HeroHeader } from "@/components/HomePage/HomePageHeader";
import HomePageHeroSection from "@/components/HomePage/HomePageHeroSection";
import dynamic from "next/dynamic";

// Lazy load components that are below the fold
const FooterSection = dynamic(() => import("@/components/HomePage/HomePageFooter"));

// Cache this page for 1 hour (ISR)
export const revalidate = 3600;

/**
 * Homepage
 * TODO: Add more details and sections
 * TODO: Add details to my features section
 */

export default async function Homepage() {
  return (
    <div className="relative w-full bg-white">
      {/* Improved Dreamy Sky Gradient - Fixed to cover entire page */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.25), transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.3), transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(240, 240, 255, 0.4), transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <HeroHeader />

        {/* Hero Section */}
        <HomePageHeroSection />

        {/* Footer Section - Lazy Loaded */}
        <FooterSection />
      </div>
    </div>
  );
}

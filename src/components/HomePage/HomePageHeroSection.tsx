import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePageHeroSection() {
  return (
    <main
      id="home"
      className="relative min-h-screen flex items-center justify-center px-4 pt-24"
    >
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
          <span className="text-gray-900">Intelligent Search, Built for </span>
          <span className="text-gray-700">MSU-IIT CCS Students</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-medium">
          A sophisticated web application powered by Retrieval-Augmented
          Generation (RAG).
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild size="lg" className="px-8 text-base">
            <Link href="/login">Get Started</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="px-8 text-base"
          >
            <Link href="#services">Learn More</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

import { Hero } from "@/components/home/Hero";
import SpecialtiesSection from "@/components/home/SpecialtiesSection";
import { PromosSection } from "@/components/home/PromosSection";

export const revalidate = 60;

export default function HomePage() {
  return (
    <main>
      <Hero />
      <SpecialtiesSection />
      <PromosSection />
    </main>
  );
}

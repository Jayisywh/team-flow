import { HeroHeader } from "@/app/(marketing)/_components/header";
import HeroSection from "@/app/(marketing)/_components/hero-section";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <HeroHeader />
      <HeroSection />
    </main>
  );
}

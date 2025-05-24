import LanguageSupport from "@/components/Lang";
import { CallToAction } from "@/sections/CallToAction";
import { Features } from "@/sections/Features";
import { Footer } from "@/sections/Footer";
import { Header } from "@/sections/Header";
import { Hero } from "@/sections/Hero";
import { LogoTicker } from "@/sections/LogoTicker";


export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <LogoTicker />
      <Features />
      <LanguageSupport />
      {/* <Testimonials /> */}
      <CallToAction />
      <Footer />
    </main>
  );
}

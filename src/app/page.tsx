import { Crew } from "@/components/Crew";
import { Cursor } from "@/components/Cursor";
import { Drop } from "@/components/Drop";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Marquee } from "@/components/Marquee";
import { Nav } from "@/components/Nav";
import { Problem } from "@/components/Problem";
import { Receipts } from "@/components/Receipts";
import { RequestForm } from "@/components/RequestForm";
import { Tracks } from "@/components/Tracks";

export default function Home() {
  return (
    <>
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Problem />
        <HowItWorks />
        <Tracks />
        <Receipts />
        <Drop />
        <Crew />
        <Faq />
        <RequestForm />
      </main>
      <Footer />
    </>
  );
}

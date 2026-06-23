import HeroSection from "@/components/home/HeroSection";
import ServicesPreview from "@/components/home/ServicesPreview";
import HowItWorks from "@/components/home/HowItWorks";
import FAQSection from "@/components/home/FAQSection";
import CTASection from "@/components/home/CTASection";

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff8f0 0%, #fef3c7 100%)' }}>
      <HeroSection />
      <ServicesPreview />
      <HowItWorks />
      <FAQSection />
      <CTASection />
    </div>
  );
}
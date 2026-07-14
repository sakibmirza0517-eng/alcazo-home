import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIHelpChatbot from "@/components/AIHelpChatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alcazo | Expert Carpentry & Home Services in Karnal",
  description: "Professional carpenters, plumbers, electricians and skilled workers at your doorstep in Karnal. Quality craftsmanship guaranteed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        {/* ✅ AI HELP CHATBOT - Har page par dikhega */}
        <AIHelpChatbot />
      </body>
    </html>
  );
}
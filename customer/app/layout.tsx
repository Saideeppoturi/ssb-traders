import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";

export const metadata: Metadata = {
  title: "SSB Traders Sangareddy | Best Cement & Building Materials Retailer",
  description: "Leading retail trader for Bharathi Cement and high-quality construction materials in Sangareddy. Reliable delivery and competitive pricing for all building needs.",
  keywords: ["Cement Sangareddy", "Building Materials Sangareddy", "SSB Traders", "Bharathi Cement", "Construction Materials"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main style={{ minHeight: '80vh', paddingTop: '6rem' }}>
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

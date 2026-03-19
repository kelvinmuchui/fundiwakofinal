import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Providers } from "../lib/providers";

export const metadata: Metadata = {
  title: "FundiWako — Find Trusted Fundis Near You | Kenya's #1 Artisan Marketplace",
  description:
    "Connect with verified plumbers, electricians, carpenters, painters and more. FundiWako is Kenya's trusted marketplace for finding skilled artisans near you.",
  keywords: [
    "fundi",
    "artisan",
    "Kenya",
    "marketplace",
    "plumber",
    "electrician",
    "carpenter",
    "painter",
    "handyman",
    "skilled worker",
  ],
  openGraph: {
    title: "FundiWako — Find Trusted Fundis Near You",
    description:
      "Kenya's trusted marketplace for finding skilled artisans near you.",
    type: "website",
    locale: "en_KE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="font-body antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

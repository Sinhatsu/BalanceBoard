import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "BalanceBoard",
  description: "Track and manage your money with AI-powered insights and budgets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${outfit.variable} font-sans antialiased selection:bg-primary/20 selection:text-primary`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
          <Header />
            <main className="min-h-screen bg-background">{children}</main>
          <Toaster richColors/>
          <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

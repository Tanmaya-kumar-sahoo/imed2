import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import NextAuthProvider from "@/components/auth/session-provider";
import { FirebaseAuthProvider } from "@/lib/contexts/firebase-auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IMED - AI Medicine Recommendations",
  description: "Get personalized medicine recommendations for your symptoms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <FirebaseAuthProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <nav className="flex gap-4">
                <a href="/" className="hover:underline">Home</a>
                <a href="/about" className="hover:underline">About</a>
                <a href="/hono" className="hover:underline">Hono API</a>
                <a href="/contact" className="hover:underline">Contact</a>
                <a href="/history" className="hover:underline">History</a>
              </nav>
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </FirebaseAuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}

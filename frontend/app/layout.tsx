import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata: Metadata = {
  title: "RSS Necromancy - Intelligent Feed Analysis",
  description: "AI-powered RSS intelligence with pattern detection and synthesis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <div className="relative z-10">
            <Header />
            <main className="container mx-auto px-6 py-8">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/components/query-provider";
import { PixelTracker } from "@/components/layout/PixelTracker";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { SystemMonitor } from "@/components/layout/SystemMonitor";
import { InstallPWA } from "@/components/layout/InstallPWA";
import { RealTimeListener } from "@/components/layout/RealTimeListener";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: "O-229 Marketplace | Le leader de l'achat/vente au Bénin",
  description: "Marketplace locale pour acheter et vendre directement via WhatsApp à Cotonou, Porto-Novo et partout au Bénin.",
  keywords: ["Bénin", "Marketplace", "Achat", "Vente", "WhatsApp", "Cotonou"],
  openGraph: {
    title: "O-229 Marketplace",
    description: "Trouvez tout ce dont vous avez besoin autour de vous et contactez le vendeur directement sur WhatsApp.",
    url: "https://o-229.com",
    siteName: "O-229 Marketplace",
    locale: "fr_BJ",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "O-229",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${jakarta.variable} font-jakarta min-h-screen bg-background antialiased text-foreground`}>
        <QueryProvider>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
          >
            <Toaster position="top-right" richColors closeButton />
            <SystemMonitor />
            <RealTimeListener />
            <InstallPWA />
            <div className="relative flex min-h-screen flex-col">
              <Suspense fallback={null}>
                <PixelTracker />
              </Suspense>
              {children}
            </div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

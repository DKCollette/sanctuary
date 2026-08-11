import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import GalaxyBackground from "@/components/galaxy-background";
import AmbientMusic from "@/components/ambient-music";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sanctuary — Ask what is on your heart.",
  description:
    "Enter a space of stillness, truth, compassion, and reflection. AI-powered guidance for life, relationships, and spiritual growth.",
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-background text-foreground antialiased ${cormorant.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <GalaxyBackground />
          <AmbientMusic />
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Gabai UP Mindanao",
  description: "The official campus navigation website of UP Mindanao!",
};

// Montserrat for Headings (Display)
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat', // This matches the tailwind config later
});

// Inter for Paragraphs (Body)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter', // This matches the tailwind config later
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${montserrat.variable} ${inter.variable}`}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

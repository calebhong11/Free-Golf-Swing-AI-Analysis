import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Golf Swing Analyzer",
  description: "Get instant AI-powered feedback on your golf swing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        {children}
      </body>
    </html>
  );
}

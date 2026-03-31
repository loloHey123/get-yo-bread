import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Get Yo Bread",
  description: "Tap in. Earn your dough. Treat yourself.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-warm-white text-chocolate">
        {children}
      </body>
    </html>
  );
}

// src/app/embed/layout.tsx
import type { Metadata } from "next";
import "../globals.css"; // We still need the global styles for components

export const metadata: Metadata = {
  title: "Purchase Ticket",
  // Prevent search engines from indexing this embeddable page
  robots: {
    index: false,
    follow: false,
  },
};

// This layout is intentionally minimal. It has no header, footer, or sidebars.
// It's just a clean slate for the embedded component.
export default function EmbedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-transparent">{children}</body>
    </html>
  );
}
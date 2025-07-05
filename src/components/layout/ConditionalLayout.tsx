// src/components/layout/ConditionalLayout.tsx
"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Don't show header/footer for admin pages, embed pages, API routes, or ticket render pages
  const shouldShowLayout = !pathname.startsWith('/admin') && 
                          !pathname.startsWith('/embed') && 
                          !pathname.startsWith('/api') &&
                          !pathname.startsWith('/tickets/render');

  // Always show the eventful background on all pages
  if (!shouldShowLayout) {
    return (
      <div className="eventful-bg min-h-screen">
        <div className="geometric-shapes">
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
        </div>
        <div className="mini-shapes"></div>
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen eventful-bg">
      <div className="geometric-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      <div className="mini-shapes"></div>
      <Header />
      <main className="flex-1 relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}

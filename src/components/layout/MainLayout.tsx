// src/components/layout/MainLayout.tsx
import { Header } from "./Header";
import { FooterWithContact } from "./FooterWithContact";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <FooterWithContact />
    </div>
  );
}

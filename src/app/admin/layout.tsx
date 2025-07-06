import { getSession } from "@/lib/auth";
//import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import Image from "next/image";
import type { AdminPayload } from "@/lib/auth";

// Admin Header Component
function AdminHeader({ session }: { session: AdminPayload }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 pl-16 md:pl-4">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-2 min-w-0 flex-shrink">
          <Image 
            src="/Logo.png" 
            alt="FISH'N FRESH Logo" 
            width={24} 
            height={24} 
            className="h-6 w-6 flex-shrink-0"
          />
          <span className="font-semibold text-sm sm:text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent truncate">
            Admin Dashboard
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* User Profile */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-muted">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium truncate max-w-[120px]">{session.email || 'Admin'}</span>
            </div>
          </div>

          {/* Mobile User Icon */}
          <div className="sm:hidden flex items-center">
            <div className="flex items-center px-2 py-1 rounded-md bg-muted">
              <User className="h-4 w-4" />
            </div>
          </div>

          {/* Back to Site */}
          <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
            <Link href="/">
              <span className="hidden sm:inline">View Site</span>
              <span className="sm:hidden">Site</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

// Admin Footer Component
function AdminFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="flex h-12 items-center justify-between px-4">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Fish&apos;n Fresh Admin</span>
          <span>•</span>
          <Link href="/admin/help" className="hover:text-foreground transition-colors">
            Help
          </Link>
          <span>•</span>
          <Link href="/admin/docs" className="hover:text-foreground transition-colors">
            Documentation
          </Link>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If there is no session, we know we are on the login page.
  // In this case, we don't want to render the sidebar.
  // We just render the children, which will be the login page itself.
  if (!session) {
    // The middleware already redirects, but this is a final check.
    // More importantly, it prevents the sidebar from rendering and causing a crash.
    return <>{children}</>;
  }

  // If a session EXISTS, render the full dashboard layout with the sidebar.
  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Admin Header */}
      <AdminHeader session={session} />
      
      <div className="flex flex-1">
        <AdminSidebar permissions={session.permissions} />
        {/* Main content area with fixed left margin for permanent sidebar */}
        <div className="flex flex-1 flex-col ml-0 md:ml-64 min-w-0">
          <main className="flex-1 overflow-auto p-2 sm:p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
          
          {/* Admin Footer */}
          <AdminFooter />
        </div>
      </div>
    </div>
  );
}
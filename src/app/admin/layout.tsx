import { getSession } from "@/lib/auth";
//import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Fish, User } from "lucide-react";
import type { AdminPayload } from "@/lib/auth";

// Admin Header Component
function AdminHeader({ session }: { session: AdminPayload }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-4 pl-16 md:pl-4">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-2">
          <Fish className="h-6 w-6 text-purple-600" />
          <span className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Admin Dashboard
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-muted">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{session.email || 'Admin'}</span>
            </div>
          </div>

          {/* Back to Site */}
          <Button variant="outline" size="sm" asChild>
            <Link href="/">View Site</Link>
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
        {/* Main content area with left margin only on desktop to account for expanded sidebar */}
        <div className="flex flex-1 flex-col md:ml-64">
          <main className="flex-1 overflow-auto p-4 sm:px-6 sm:py-4 md:p-8">
            {children}
          </main>
          
          {/* Admin Footer */}
          <AdminFooter />
        </div>
      </div>
    </div>
  );
}
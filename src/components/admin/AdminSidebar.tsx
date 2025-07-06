// src/components/admin/AdminSidebar.tsx
'use client';

import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, Users, Palette, Settings, LogOut, QrCode, Menu } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useEffect } from 'react';

// More comprehensive link structure
const PRIMARY_LINKS = [
  { href: '/admin/dashboard', icon: Home, label: 'Dashboard', permission: 'VIEW_DASHBOARD' },
  { href: '/admin/events', icon: Package, label: 'Events', permission: 'MANAGE_EVENTS' },
  { href: '/admin/payments', icon: ShoppingCart, label: 'Payments', permission: 'VIEW_PAYMENTS' },
  { href: '/admin/design', icon: Palette, label: 'Homepage Designer', permission: 'VIEW_DESIGN_TOOLS' },
  // A direct link to a generic scanner page can be useful. 
  // This could list scannable events or be a universal scanner.
  { href: '/admin/scan', icon: QrCode, label: 'Universal Scanner', permission: 'SCAN_TICKETS' },
];

const SETTINGS_LINKS = [
  { href: '/admin/manage-admins', icon: Users, label: 'Manage Admins', permission: 'MANAGE_ADMINS' },
  // Future settings link can go here
  { href: '/admin/settings', icon: Settings, label: 'Global Settings', permission: 'MANAGE_SETTINGS' },
];

export function AdminSidebar({ permissions }: { permissions: string[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('admin-sidebar');
      const toggle = document.getElementById('mobile-sidebar-toggle');
      
      if (isMobileOpen && sidebar && !sidebar.contains(event.target as Node) && 
          toggle && !toggle.contains(event.target as Node)) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen]);

  const filteredPrimaryLinks = PRIMARY_LINKS.filter(link => permissions.includes(link.permission));
  const filteredSettingsLinks = SETTINGS_LINKS.filter(link => permissions.includes(link.permission));

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' // Ensure cookies are included
      });
      
      if (response.ok) {
        toast.success('Logout successful!');
        router.push('/admin/login');
        router.refresh(); // Ensure all client-side state is cleared
      } else {
        toast.error('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={cn(
      "flex h-full flex-col",
      isMobile ? "w-64" : "w-64" // Always full width on desktop
    )}>
      {/* Header */}
      <div className="flex items-center border-b px-4 py-4">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
        </div>
      </div>

      {/* Navigation */}
      <TooltipProvider>
        <nav className="flex flex-col gap-2 p-4">
          {filteredPrimaryLinks.map(({ href, icon: Icon, label }) => {
            const isActive = pathname.startsWith(href);
            const LinkContent = (
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{label}</span>
              </Link>
            );

            return <div key={href}>{LinkContent}</div>;
          })}

          {filteredSettingsLinks.length > 0 && (
            <>
              <Separator className="my-2" />
              {filteredSettingsLinks.map(({ href, icon: Icon, label }) => {
                const isActive = pathname.startsWith(href);
                const LinkContent = (
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{label}</span>
                  </Link>
                );

                return <div key={href}>{LinkContent}</div>;
              })}
            </>
          )}
        </nav>

        {/* Footer with logout */}
        <div className="mt-auto border-t p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </TooltipProvider>
    </div>
  );
  
  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <Button
        id="mobile-sidebar-toggle"
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden h-8 w-8 p-0"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-background border-r transition-transform duration-300 md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent isMobile />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 z-30 hidden bg-background border-r md:flex w-64",
          "top-14 bottom-0" // Start below header (h-14 = 56px)
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
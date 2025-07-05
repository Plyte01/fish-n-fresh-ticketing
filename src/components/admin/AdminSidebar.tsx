// src/components/admin/AdminSidebar.tsx
'use client';

import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, Users, Palette, Settings, LogOut, QrCode } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator'; // Import Separator
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          {filteredPrimaryLinks.map(({ href, icon: Icon, label }) => (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    { "bg-accent text-accent-foreground": pathname.startsWith(href) }
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          ))}
          {(filteredSettingsLinks.length > 0) && (
             <Separator className="my-2" /> // Add a separator if settings links are present
          )}
           {filteredSettingsLinks.map(({ href, icon: Icon, label }) => (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    { "bg-accent text-accent-foreground": pathname.startsWith(href) }
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
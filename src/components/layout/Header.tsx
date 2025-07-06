// src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300">
            <div className="relative w-8 h-8">
              <Image 
                src="/Logo.png" 
                alt="FISH'N FRESH Logo" 
                fill
                style={{ objectFit: 'contain' }}
                className="rounded"
                priority
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">FISH&apos;N FRESH</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">
              Home
            </Link>
            <Link href="/events" className="text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">
              Events
            </Link>
            <Link href="/lookup" className="text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">
              Find Tickets
            </Link>
            <Link href="/about" className="text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">
              Contact
            </Link>
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 eventful-pulse">
              <Link href="/admin/login">Admin Login</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-purple-600 dark:text-purple-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70">
            <nav className="py-4 space-y-2">
              <Link 
                href="/" 
                className="block py-2 text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/events" 
                className="block py-2 text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link 
                href="/lookup" 
                className="block py-2 text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Tickets
              </Link>
              <Link 
                href="/about" 
                className="block py-2 text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="block py-2 text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-4">
                <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0">
                  <Link href="/admin/login">Admin Login</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

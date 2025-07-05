// src/components/layout/FooterWithContact.tsx
import Link from "next/link";
import { Fish, Mail, Phone, MapPin, Clock, Facebook, Twitter, Instagram } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getContactInfo() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'singleton' },
      select: {
        contactEmail: true,
        contactPhone: true,
        contactAddress: true,
        contactHours: true,
      },
    });
    return settings;
  } catch (error) {
    console.error('Failed to fetch contact info for footer:', error);
    return null;
  }
}

export async function FooterWithContact() {
  const contactInfo = await getContactInfo();

  return (
    <footer className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-t border-white/20 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300">
                <Fish className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">FISH&apos;N FRESH</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Your premier destination for discovering and purchasing tickets to the most exciting events. 
                Experience the best in entertainment, food, and culture.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors hover:scale-110 transform duration-200">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 transition-colors hover:scale-110 transform duration-200">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors hover:scale-110 transform duration-200">
                  <Instagram className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    All Events
                  </Link>
                </li>
                <li>
                  <Link href="/lookup" className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    Find My Tickets
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Contact Info</h3>
              <div className="space-y-3">
                {contactInfo?.contactPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-muted-foreground">{contactInfo.contactPhone}</span>
                  </div>
                )}
                {contactInfo?.contactEmail && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-muted-foreground">{contactInfo.contactEmail}</span>
                  </div>
                )}
                {contactInfo?.contactAddress && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                    <span className="text-sm text-muted-foreground whitespace-pre-line">
                      {contactInfo.contactAddress}
                    </span>
                  </div>
                )}
                {contactInfo?.contactHours && (
                  <div className="flex items-start space-x-2">
                    <Clock className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                    <span className="text-sm text-muted-foreground whitespace-pre-line">
                      {contactInfo.contactHours}
                    </span>
                  </div>
                )}

                {/* Fallback contact info if no settings are available */}
                {!contactInfo && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-muted-foreground">+254 700 123 456</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-muted-foreground">info@fishnfresh.com</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        123 Event Street<br />
                        Nairobi, Kenya
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Clock className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                        Saturday: 10:00 AM - 4:00 PM<br />
                        Sunday: Closed
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold">FISH&apos;N FRESH</span>. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

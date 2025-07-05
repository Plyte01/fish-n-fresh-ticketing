// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FISH'N FRESH Ticketing",
  description: "Modern ticketing platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0e7490" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FishNFresh" />
        <link rel="apple-touch-icon" href="/file.svg" />
        <meta name="msapplication-TileColor" content="#0e7490" />
        <meta name="msapplication-TileImage" content="/file.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                      
                      // Check for updates
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              // Show update available notification
                              if (confirm('New version available! Reload to update?')) {
                                window.location.reload();
                              }
                            }
                          });
                        }
                      });
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }

              // PWA Install Prompt
              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                
                // Show install button/banner
                const installButton = document.createElement('div');
                installButton.innerHTML = \`
                  <div id="pwa-install-banner" style="
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #0e7490;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 9999;
                    cursor: pointer;
                    font-family: system-ui, -apple-system, sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                  ">
                    <span>📱</span>
                    <span>Install App</span>
                    <span onclick="event.stopPropagation(); document.getElementById('pwa-install-banner').remove();" style="
                      margin-left: 8px;
                      cursor: pointer;
                      opacity: 0.7;
                      font-weight: bold;
                    ">×</span>
                  </div>
                \`;
                
                installButton.addEventListener('click', async () => {
                  if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(\`User response to the install prompt: \${outcome}\`);
                    deferredPrompt = null;
                    installButton.remove();
                  }
                });
                
                document.body.appendChild(installButton);
                
                // Auto-hide after 10 seconds
                setTimeout(() => {
                  const banner = document.getElementById('pwa-install-banner');
                  if (banner) {
                    banner.style.opacity = '0';
                    banner.style.transform = 'translateY(100%)';
                    setTimeout(() => banner.remove(), 300);
                  }
                }, 10000);
              });

              // Handle app installed event
              window.addEventListener('appinstalled', (evt) => {
                console.log('PWA was installed');
                // Hide any install prompts
                const banner = document.getElementById('pwa-install-banner');
                if (banner) banner.remove();
              });

              // Handle online/offline status
              function updateOnlineStatus() {
                const status = navigator.onLine ? 'online' : 'offline';
                document.documentElement.setAttribute('data-connection', status);
                
                if (!navigator.onLine) {
                  // Show offline notification
                  const offlineMsg = document.createElement('div');
                  offlineMsg.id = 'offline-notification';
                  offlineMsg.innerHTML = \`
                    <div style="
                      position: fixed;
                      top: 0;
                      left: 0;
                      right: 0;
                      background: #fbbf24;
                      color: #92400e;
                      padding: 8px;
                      text-align: center;
                      font-size: 14px;
                      font-weight: 500;
                      z-index: 9999;
                      font-family: system-ui, -apple-system, sans-serif;
                    ">
                      📡 You're offline. Some features may be limited.
                    </div>
                  \`;
                  document.body.appendChild(offlineMsg);
                } else {
                  // Remove offline notification
                  const offlineMsg = document.getElementById('offline-notification');
                  if (offlineMsg) offlineMsg.remove();
                }
              }

              window.addEventListener('online', updateOnlineStatus);
              window.addEventListener('offline', updateOnlineStatus);
              updateOnlineStatus();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        {/* Use the sonner Toaster, richColors adds default styling for success/error */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
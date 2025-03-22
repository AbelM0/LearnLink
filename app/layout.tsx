import type { Metadata } from "next";
import localFont from "next/font/local";
import { Comfortaa, Roboto } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const comfortaa = Comfortaa({
  subsets: ['latin'],
  weight:['300', '400', '500', '600', '700'],
  variable: "--font-comfortaa",
});

const roboto = Roboto({
  subsets: ['latin'],
  weight:['100', '300', '500'],
  variable: "--font-roboto",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Learnlink",
  description: "Learnlink",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${comfortaa.className} ${roboto.variable} antialiased w-full min-h-screen flex`}
      >
        <SessionProvider>
          <Providers>
            <SidebarProvider defaultOpen={false}>
              
              <div className="flex w-full">
                {/* Sidebar */}
                <AppSidebar/>

                {/* Main Content */}
                <main className="flex-grow">
                  <NavBar />
                  <div className="p-2">{children}</div>
                  <Toaster />
                </main>
              </div>
              
            </SidebarProvider>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}

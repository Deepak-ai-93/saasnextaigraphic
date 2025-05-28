
import type {Metadata} from 'next';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button'; // Added for Nav link styling
import { Home, CalendarDays } from 'lucide-react'; // Added icons

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AetherPost - AI Social Media Assistant',
  description: 'Generate captivating social media posts with AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" passHref>
              <Button variant="ghost" className="text-lg font-semibold text-primary hover:text-primary/90">
                AetherPost
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Link href="/" passHref>
                <Button variant="ghost" className="flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  Single Post
                </Button>
              </Link>
              <Link href="/weekly-planner" passHref>
                <Button variant="ghost" className="flex items-center">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Weekly Planner
                </Button>
              </Link>
            </div>
          </nav>
        </header>
        <div className="pt-4"> {/* Add some padding below the sticky header */}
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}

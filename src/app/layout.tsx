import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { TradesProvider } from '@/context/trade-provider';

export const metadata: Metadata = {
  title: 'TradeVision Journal',
  description: 'Intuitive, data-driven trading journal.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased">
        <TradesProvider>
          {children}
        </TradesProvider>
        <Toaster />
      </body>
    </html>
  );
}

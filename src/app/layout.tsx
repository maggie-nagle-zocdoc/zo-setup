import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sharpSans = localFont({
  src: [
    { path: "../fonts/SharpSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/SharpSans-Semibold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/SharpSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sharp-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zo set up",
  description: "Guided setup for Zo — Zocdoc's AI phonebot",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@16..40,100..700,0..1,-25..200&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={sharpSans.variable + " antialiased"}>{children}</body>
    </html>
  );
}

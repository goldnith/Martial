import type { Metadata, Viewport } from "next";
import PwaRegister from "./pwa-register";
// import "./globals.css";

export const metadata: Metadata = {
  title: "MartialTrack | Traditional Martial Arts Academy",
  description: "Attendance, student and fee management for Traditional Martial Arts And Sports Academy",
  applicationName: "MartialTrack",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "MartialTrack",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/academy-logo.jpg",
    apple: "/academy-logo.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07152f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}

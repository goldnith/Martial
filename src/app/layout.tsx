import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MartialTrack | Traditional Martial Arts Academy",
  description: "Attendance, student and fee management for Traditional Martial Arts And Sports Academy",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

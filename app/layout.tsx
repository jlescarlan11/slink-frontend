import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import NavigationBar from "./_navigation_bar/NavigationBar";
import Footer from "./Footer";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";

// Configure Noto Sans font - matches the CSS variable used in globals.css
const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"], // Added font-light (300) used in your CSS
});

// App metadata configuration
export const metadata: Metadata = {
  title: "Slink",
  description: "Slit your link",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSans.variable} antialiased min-h-screen flex flex-col`}
      >
        <Toaster />
        <AuthProvider>
          <NavigationBar />
          <main className="flex-1 web-layout">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

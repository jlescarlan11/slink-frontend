import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import NavigationBar from "./_navigation_bar/NavigationBar";
import Footer from "./Footer";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

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
        <NavigationBar />
        <main className="flex-1 web-layout">{children}</main>
        <Footer></Footer>
      </body>
    </html>
  );
}

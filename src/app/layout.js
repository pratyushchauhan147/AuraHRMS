// in src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar"; // <-- IMPORT

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Project Aura",
  description: "The Future of HR Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar /> {/* <-- ADD THE NAVBAR */}
          <main className="p-8">{children}</main> {/* Optional: Wrap children in main for padding */}
        </AuthProvider>
      </body>
    </html>
  );
}
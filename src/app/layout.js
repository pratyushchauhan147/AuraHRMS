// in src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider"; // <-- IMPORT IT

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Project Aura",
  description: "The Future of HR Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* WRAP THE CHILDREN WITH THE PROVIDER */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
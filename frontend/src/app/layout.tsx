"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Provider } from "react-redux";
import { store } from "@/store";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Make store globally accessible
if (typeof window !== 'undefined') {
  (window as any).__REDUX_STORE__ = store;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={inter.className}>
        <Provider store={store}>
          {children}
          <Toaster richColors theme="dark" />
        </Provider>
      </body>
    </html>
  );
}

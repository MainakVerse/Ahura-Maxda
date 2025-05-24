// app/layout.tsx

import React from "react";
import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import { twMerge } from "tailwind-merge";
import "@/styles/globals.css";
import { MouseProvider } from "../../context/MouseContext";
import { SoundProvider } from "@/context/SoundContext";
// Make sure this path is correct and the file exists
import SoundButton from "../components/SoundButton";
import NeonCursor from "@/components/NeonCursor";

const orbitron = Orbitron({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ahura Maxda | AI Content Creator",
  description: "World's Best AI Content Creation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={twMerge(orbitron.className, "bg-black text-white antialiased")}
        suppressHydrationWarning
      >
        <MouseProvider>
          <SoundProvider>
            <NeonCursor />
            <SoundButton />
            {children}
          </SoundProvider>
        </MouseProvider>
      </body>
    </html>
  );
}

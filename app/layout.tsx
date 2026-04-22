import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";

import { PwaRegister } from "@/components/pwa-register";
import { getAppearanceBootstrapScript } from "@/lib/appearance";
import {
  isClerkConfigured,
  isClerkDevelopmentInstance,
  isProductionDeployment,
} from "@/lib/platform";

import "./globals.css";

export const metadata: Metadata = {
  title: "Guiding Light | Autism Support and Resource Community",
  description:
    "Guiding Light helps autistic people, parents, caregivers, and trusted professionals find support, resources, and community at every stage of life.",
  applicationName: "Guiding Light",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Guiding Light",
  },
};

export const runtime = "nodejs";

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="guiding-light-appearance" strategy="beforeInteractive">
          {getAppearanceBootstrapScript()}
        </Script>
        <PwaRegister />
        {isClerkConfigured ? (
          <ClerkProvider
            unsafe_disableDevelopmentModeConsoleWarning={
              isClerkDevelopmentInstance && !isProductionDeployment
            }
          >
            {children}
          </ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}

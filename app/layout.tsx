import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "AdjustLog | Parts adjustment register";
  const description = "Clean inventory adjustment tracking, automatically grouped by part number.";
  return {
    metadataBase: new URL(origin), title, description, icons: { icon: "/favicon.svg" },
    openGraph: { title, description, images: [{ url: `${origin}/og-adjustlog-theme.png`, width: 1200, height: 630, alt: "AdjustLog part-number tracking in light and dark modes" }] },
    twitter: { card: "summary_large_image", title, description, images: [`${origin}/og-adjustlog-theme.png`] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

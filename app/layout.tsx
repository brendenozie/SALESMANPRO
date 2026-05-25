// app/layout.tsx
// @ts-ignore
import "./globals.css";

import Providers from "./providers";
import siteMetadata from "@/data/siteMetadata";
import { Metadata } from "next";
import { getAuthSession } from "@/lib/auth";
import TokenSignIn from "@/components/TokenSignIn";
import ThemeProvider from "./theme-provider";
import Script from "next/script";



export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: "./",
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "./",
    types: {
      "application/rss+xml": `${siteMetadata.siteUrl}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: siteMetadata.title,
    card: "summary_large_image",
    images: [siteMetadata.socialBanner],
  },
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const basePath = process.env.BASE_PATH || "";

  const session = await getAuthSession();

  return (
    <html
      lang={siteMetadata.language}
      suppressHydrationWarning
      className="dark"
    >
      <head>
        {/* Prevent light flash */}
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            document.documentElement.classList.add('dark');
          `}
        </Script>

        {/* Favicons */}
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href={`${basePath}/favicons/apple-touch-icon.png`}
        />

        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`${basePath}/favicons/favicon-32x32.png`}
        />

        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={`${basePath}/favicons/favicon-16x16.png`}
        />

        <link
          rel="manifest"
          href={`${basePath}/favicons/site.webmanifest`}
        />

        <link
          rel="mask-icon"
          href={`${basePath}/favicons/safari-pinned-tab.svg`}
          color="#5bbad5"
        />

        <meta name="msapplication-TileColor" content="#000000" />

        <meta name="theme-color" content="#000000" />

        <link
          rel="alternate"
          type="application/rss+xml"
          href={`${basePath}/feed.xml`}
        />
      </head>

      <body>
        <ThemeProvider>
          <Providers session={session}>
            <TokenSignIn />
            <main>{children}</main>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
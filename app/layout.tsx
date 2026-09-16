// app/layout.tsx
import "leaflet/dist/leaflet.css";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./globals.css";

import { Suspense } from "react";
import Providers from "./providers";
import siteMetadata from "@/data/siteMetadata";
import { Metadata } from "next";
import { getAuthSession } from "@/lib/auth";
import TokenSignIn from "@/components/TokenSignIn";
import ThemeProvider from "./theme-provider";
import ClientSecurityGuard from "@/components/security/ClientSecurityGuard";
import NavigationProgressBar from "@/components/site/NavigationProgressBar";

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | SalesmanPro`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: "SalesmanPro",
    images: [
      {
        url: siteMetadata.socialBanner,
        width: 1200,
        height: 630,
        alt: siteMetadata.title,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: siteMetadata.siteUrl,
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
    description: siteMetadata.description,
    card: "summary_large_image",
    images: [siteMetadata.socialBanner],
  },
};

const rootPlatformJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SalesmanPro",
    url: siteMetadata.siteUrl,
    logo: `${siteMetadata.siteUrl}/static/images/logo.png`,
    description: siteMetadata.description,
    sameAs: [
      siteMetadata.facebook,
      siteMetadata.youtube,
      siteMetadata.linkedin,
      siteMetadata.x,
    ].filter(Boolean),
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SalesmanPro",
    url: siteMetadata.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteMetadata.siteUrl}/help-center?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
];

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
    >
      <head>
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

        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#fff"
        />

        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#000"
        />

        <link
          rel="alternate"
          type="application/rss+xml"
          href={`${basePath}/feed.xml`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootPlatformJsonLd) }}
        />
      </head>

      <body>
        <ThemeProvider>
          <ClientSecurityGuard />
          <Providers session={session}>
            <Suspense fallback={null}>
              <NavigationProgressBar />
            </Suspense>
            <TokenSignIn />
            <main>{children}</main>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
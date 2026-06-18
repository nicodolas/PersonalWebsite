import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://personalwebsite-4eb.pages.dev";

export const metadata: Metadata = {
  title: "Nguyễn Văn Hiếu | Web Developer",
  description: "Portfolio of Nguyen Van Hieu (nicodolas/nicoleon) - A Web Developer specializing in MERN stack, performance optimization and scalable web applications. See my projects and CV.",
  keywords: [
    "nekovibecoder",
    "Nguyen Van Hieu",
    "Nguyễn Văn Hiếu",
    "nicodolas",
    "nicoleon",
    "Web Developer",
    "Software Engineer",
    "MERN Stack",
    "Portfolio",
    "CV",
    "Vietnam"
  ],
  authors: [{ name: "Nguyen Van Hieu" }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/`,
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/`,
    title: "Nguyễn Văn Hiếu | Web Developer",
    description: "Portfolio of Nguyen Van Hieu - Turning caffeine into clean code. Check out my projects!",
    images: [
      {
        url: `${siteUrl}/assets/avatar.png`,
        width: 1200,
        height: 630,
        alt: "Nguyen Van Hieu Avatar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nguyễn Văn Hiếu | Web Developer",
    description: "Portfolio of Nguyen Van Hieu - Turning caffeine into clean code. Check out my projects!",
    images: [`${siteUrl}/assets/avatar.png`],
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Nguyen Van Hieu",
    "alternateName": ["Nguyễn Văn Hiếu", "nekovibecoder", "nicodolas", "nicoleon"],
    "url": `${siteUrl}/`,
    "image": `${siteUrl}/assets/avatar.png`,
    "jobTitle": "Web Developer",
    "worksFor": {
      "@type": "Organization",
      "name": "Freelance"
    },
    "alumniOf": {
      "@type": "CollegeOrUniversity",
      "name": "Ho Chi Minh City University of Industry and Trade"
    },
    "sameAs": [
      "https://github.com/nicodolas",
      "https://www.linkedin.com/in/nguyenvanhieu-nicodolas"
    ]
  };

  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}


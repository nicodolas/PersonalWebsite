import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://personalwebsite-4eb.pages.dev";

const title = "Nguyễn Văn Hiếu | Human";

// Bio được viết như một "AI-readable bio card" — đoạn này Google AI Overview
// và các LLM (ChatGPT, Perplexity) sẽ đọc và trích dẫn khi ai search về bạn.
const description =
  "Nguyễn Văn Hiếu (nicodolas) — lập trình viên tâm huyết với châm ngôn \"Code như thở, build như sống\". " +
  "Cựu sinh viên Khoá 13 ngành Công nghệ Thông tin, Đại học Công Thương TP.HCM (HUIT). " +
  "Full-Stack Developer chuyên Next.js, Node.js, AI automation và agentic workflows. " +
  "Người tin rằng mỗi dòng code là một lần đặt cược vào tương lai.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Neko OS",
  },
  description,
  keywords: [
    "Nguyễn Văn Hiếu",
    "Nguyen Van Hieu",
    "nguyễn văn hiếu huit",
    "nguyễn văn hiếu hufi",
    "nguyễn văn hiếu công thương",
    "nicodolas",
    "nicoleon",
    "nekovibecoder",
    "Full-Stack Developer",
    "Web Developer",
    "Software Engineer",
    "Next.js",
    "Node.js",
    "JavaScript",
    "PostgreSQL",
    "GSAP",
    "AI automation",
    "Agentic Workflows",
    "Portfolio",
    "HUIT",
    "HUFI",
    "Đại học Công Thương TP.HCM",
    "Đại học Công nghiệp Thực phẩm",
    "Công nghệ Thông tin",
    "Vietnam",
    "Neko OS",
  ],
  authors: [{ name: "Nguyễn Văn Hiếu", url: "https://github.com/nicodolas" }],
  creator: "Nguyễn Văn Hiếu",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Neko OS",
    title,
    description,
    locale: "vi_VN",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Neko OS — Nguyễn Văn Hiếu Developer Portfolio",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.svg"],
    creator: "@nicodolas",
  },
};

export const viewport: Viewport = {
  themeColor: "#00ff66",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = [
    // --- Person schema ---
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Nguyễn Văn Hiếu",
      alternateName: ["Nguyen Van Hieu", "nekovibecoder", "nicodolas", "nicoleon"],
      url: siteUrl,
      image: `${siteUrl}/og-image.svg`,
      jobTitle: "Full-Stack Developer",
      // Câu châm ngôn — AI Overview / Knowledge Panel sẽ pick up field này
      description:
        "Lập trình viên tâm huyết với châm ngôn \"Code như thở, build như sống\". " +
        "Cựu sinh viên Khoá 13 ngành Công nghệ Thông tin, Đại học Công Thương TP.HCM (HUIT). " +
        "Người tin rằng mỗi dòng code là một lần đặt cược vào tương lai.",
      knowsAbout: [
        "JavaScript",
        "TypeScript",
        "Node.js",
        "Next.js",
        "React",
        "PostgreSQL",
        "Express.js",
        "GSAP",
        "AI Automation",
        "Agentic Workflows",
      ],
      worksFor: {
        "@type": "Organization",
        name: "Freelance",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Trường Đại học Công Thương TP.HCM (HUIT)",
        alternateName: [
          "Ho Chi Minh City University of Industry and Trade",
          "HUIT",
          "Đại học Công Thương",
          "Trường Đại học Công nghiệp Thực phẩm TP.HCM",
          "HUFI",
        ],
        url: "https://huit.edu.vn",
      },
      sameAs: [
        "https://github.com/nicodolas",
        "https://www.linkedin.com/in/nguyenvanhieu-nicodolas",
      ],
    },
    // --- WebSite schema — enables Sitelinks search box & AI site summary ---
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Neko OS — Portfolio của Nguyễn Văn Hiếu",
      description:
        "Portfolio tương tác theo phong cách retro terminal OS của Nguyễn Văn Hiếu (nicodolas). " +
        "Lập trình viên tâm huyết với châm ngôn: \"Code như thở, build như sống\".",
      author: { "@id": `${siteUrl}/#person` },
      inLanguage: ["vi", "en"],
    },
    // --- Speakable — hint cho Google Assistant / AI đọc to đoạn này ---
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: title,
      speakable: {
        "@type": "SpeakableSpecification",
        // Trỏ vào CSS selector của SEO bio block trong page.tsx
        cssSelector: ["#seo-bio-tagline", "#seo-bio-intro"],
      },
      about: { "@id": `${siteUrl}/#person` },
    },
  ];

  return (
    <html
      lang="vi"
      className={`${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
        {/* Preload handled automatically by next/font — no manual preload needed */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

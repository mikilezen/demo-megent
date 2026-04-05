import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo",
  description:
    "Experience Megent's AI agent governance platform live. See real-time interception, policy enforcement, PII masking, and threat detection in action with our interactive demo.",
  alternates: {
    canonical: "/demo",
  },
  keywords: [
    "Megent demo",
    "AI agent dashboard",
    "live interception",
    "policy enforcement demo",
    "AI governance demo",
    "agent monitoring",
  ],
  openGraph: {
    title: "Megent Demo - Live Agent Governance",
    description:
      "Experience Megent's AI agent governance platform live. See real-time interception, policy enforcement, and threat detection.",
    url: "https://megent.dev/demo",
    siteName: "Megent",
    type: "website",
    images: [
      {
        url: "/freepik__adjust__68767.png",
        width: 1200,
        height: 630,
        alt: "Megent Demo Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Megent Demo - Live Agent Governance",
    description:
      "Experience Megent's AI agent governance platform live. See real-time interception, policy enforcement, and threat detection.",
    images: ["/freepik__adjust__68767.png"],
  },
};

export default function DemoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

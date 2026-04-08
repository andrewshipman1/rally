import type { Metadata } from "next";
import { Geist, Geist_Mono, Shrikhand, Caveat, DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

// Geist stays for legacy surfaces (dashboard, editor, etc.) until Sessions 2/3
// migrate them to the chassis fonts.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Chassis kernel fonts. Source: rally-phase-1-directions.html line 9 +
// rally-phase-2-theme-system.html line 9. Same four families.
//   --font-display → Shrikhand (wordmark, title, countdown number)
//   --font-hand    → Caveat (stickers, taglines, flag, going-label)
//   --font-body    → DM Sans (everything else)
//   --font-serif   → Instrument Serif (auth headlines, error states)
const shrikhand = Shrikhand({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
const caveat = Caveat({
  variable: "--font-hand",
  weight: ["500", "700"],
  subsets: ["latin"],
  display: "swap",
});
const dmSans = DM_Sans({
  variable: "--font-body",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});
const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rally — Group Trip Planning",
  description: "Plan group trips with friends. Build themed, shareable trip pages. RSVP in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${shrikhand.variable} ${caveat.variable} ${dmSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

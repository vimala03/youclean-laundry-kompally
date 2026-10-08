import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YouClean — Premium Laundry & Dry Cleaning, Kompally",
  description:
    "Wash & Fold, Dry Clean, Steam & Iron. Doorstep pickup, 12–48 hour delivery. Serving Kompally, Hyderabad.",
  openGraph: {
    title: "YouClean — Premium Laundry & Dry Cleaning",
    description: "Doorstep pickup. Expert care. 12–48 hr delivery.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}

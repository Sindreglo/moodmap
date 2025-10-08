import type { Metadata } from "next";
import "../styles/globals.scss";

export const metadata: Metadata = {
  title: "MoodMap",
  description: "Track and visualize moods around the world",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

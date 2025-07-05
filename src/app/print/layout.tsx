import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Print Receipt",
};

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

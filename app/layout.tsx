import "./globals.css";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always enable dark mode for demonstration

  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}

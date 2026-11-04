
import "./globals.css";

export const metadata = {
  title: "The Daily Riddle",
  description: "One day. One riddle. One champion.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

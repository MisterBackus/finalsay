import "./globals.css";
export const metadata = {
  title: "finalsay.lol",
  description: "One sentence. Pay to replace it. Until someone replaces you.",
  metadataBase: new URL(process.env.SITE_URL || "https://finalsay.lol"),
  openGraph: { title: "finalsay.lol", description: "One sentence. Pay to replace it. Until someone replaces you." },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({ children }) {
  return (<html lang="en"><body>{children}</body></html>);
}

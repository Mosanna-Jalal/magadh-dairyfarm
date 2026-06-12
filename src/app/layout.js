import "./globals.css";

export const metadata = {
  title: "Magadh Dairy Farm — Pure & Fresh, Straight from the Village",
  description:
    "Family-run dairy farm in the Magadh region. Fresh cow & buffalo milk, paneer, ghee, khowa and dahi delivered daily. Check live availability and your account online.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

export const metadata = {
  title: "Guiding Light",
  description: "Temporary recovery mode",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Marcas",
    default: "Marcas | Dashboard",
  },
  description: "Gerenciamento de marcas do sistema",
};

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

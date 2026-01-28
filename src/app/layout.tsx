import type { Metadata } from "next";
import "./globals.css";
import UploadButton from "@/components/UploadButton";

export const metadata: Metadata = {
  title: "AI-Tag-Gallery",
  description: "AI Generated Image Storage with Auto Tagging",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <header className="border-b border-white/10 p-4 sticky top-0 bg-indigo-900 backdrop-blur-md z-50">
          <div className="mx-auto flex justify-between items-center max-w-7xl">
            <h1 className="text-xl font-bold tracking-tighter text-white italic">GALLERY.AI</h1>
            <div className="flex gap-4">
              <UploadButton />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
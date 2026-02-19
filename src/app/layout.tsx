import type { Metadata } from "next";
import "./globals.css";
import UploadButton from "@/components/UploadButton";
import MobileLinkButton from "@/components/MobileLinkButton";
import SettingsButton from "@/components/SettingsButton";
import ThemeInit from "@/components/ThemeInit";
import { THEME_KEY, THEME_IDS, DEFAULT_THEME } from "@/constants/themes";

export const metadata: Metadata = {
  title: "AI-Tag-Gallery",
  description: "AI Generated Image Storage with Auto Tagging",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeScript = `(function(){var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});var v=${JSON.stringify([...THEME_IDS])};var ok=v.indexOf(t)!==-1;document.documentElement.setAttribute('data-theme',ok?t:${JSON.stringify(DEFAULT_THEME)});})();`;

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeInit />
        <header
          className="border-b p-4 sticky top-0 backdrop-blur-md z-50"
          style={{ backgroundColor: "var(--header-bg)", borderColor: "var(--header-border)" }}
        >
          <div className="mx-auto flex justify-between items-center max-w-7xl">
            <h1 className="text-xl font-bold tracking-tighter italic" style={{ color: "var(--foreground)" }}>
              GALLERY.AI
            </h1>
            <div className="flex gap-4">
              <UploadButton />
            </div>
          </div>
        </header>

        <main className="w-full p-6">
          {children}
        </main>
        <SettingsButton />
        <MobileLinkButton />
      </body>
    </html>
  );
}
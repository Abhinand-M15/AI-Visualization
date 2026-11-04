import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { AppChrome } from "@/components/AppChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Story Site Generator", template: "%s · Story Site Generator" },
  description: "Turn a document into a narrated story website.",
};

// Runs before paint so the theme is correct on first render, no flash.
// Dark unless the user picked light (the app's original default).
const THEME_INIT_SCRIPT = `(function(){var d=document.documentElement;try{d.classList.toggle('dark',localStorage.getItem('theme')!=='light');}catch(e){d.classList.add('dark');}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AppChrome>
            <UserMenu />
            <ThemeToggle />
          </AppChrome>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

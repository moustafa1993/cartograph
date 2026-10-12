import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SIGN_IN_PATH, SIGN_UP_PATH, WORKSPACE_PATH } from "@/lib/routes";
import { THEME_SCRIPT } from "./theme-script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cartograph",
  description: "A dependency map of a public repository, parsed from its code.",
};

// Clerk's components read the same tokens as the app, so they follow the
// theme control without a second theme system.
const clerkAppearance = {
  variables: {
    colorPrimary: "var(--accent)",
    colorBackground: "var(--surface)",
    colorForeground: "var(--fg)",
    colorMutedForeground: "var(--muted)",
    colorNeutral: "var(--fg)",
    colorInput: "var(--bg)",
    colorInputForeground: "var(--fg)",
    colorBorder: "var(--border)",
    fontFamily: "var(--font-geist-sans)",
    fontSize: "13px",
    borderRadius: "4px",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The head script sets data-theme before hydration, so the server's <html>
    // legitimately differs from the client's.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans text-[13px]">
        {/* Fallback, not force: a redirect back to the page someone was
            bounced from still wins, but every method otherwise lands in the
            same place. */}
        <ClerkProvider
          signInUrl={SIGN_IN_PATH}
          signUpUrl={SIGN_UP_PATH}
          signInFallbackRedirectUrl={WORKSPACE_PATH}
          signUpFallbackRedirectUrl={WORKSPACE_PATH}
          appearance={clerkAppearance}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}

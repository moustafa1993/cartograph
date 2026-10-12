import { clerkMiddleware } from "@clerk/nextjs/server";
import { SIGN_IN_PATH, SIGN_UP_PATH } from "@/lib/routes";

const PUBLIC_PREFIXES = [SIGN_IN_PATH, SIGN_UP_PATH, "/__clerk"];

// Protection lives here rather than in pages: pages are partially prerendered,
// so a page-level check would still send the static shell's HTML. Default is
// protected; only the prefixes above are reachable signed out.
export default clerkMiddleware(
  async (auth, req) => {
    const path = req.nextUrl.pathname;
    const isPublic = PUBLIC_PREFIXES.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    );
    if (!isPublic) await auth.protect();
  },
  { signInUrl: SIGN_IN_PATH, signUpUrl: SIGN_UP_PATH },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};

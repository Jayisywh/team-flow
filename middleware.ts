/* eslint-disable @typescript-eslint/no-explicit-any */
import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextMiddleware, NextRequest, NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:WEBHOOK",
        "CATEGORY:MONITOR",
        "CATEGORY:PREVIEW",
      ],
    }),
  ],
});

async function existingMiddleware(req: NextRequest) {
  const anyReq = req as any;
  const url = req.nextUrl;

  // Since this is wrapped in withAuth, this logic ONLY runs
  // if the user IS authenticated. Kinde handles the "unauthenticated"
  // redirect to the login page automatically.

  const orgCode =
    anyReq.kindeAuth?.token?.org_code || anyReq.kindeAuth?.user?.org_code;

  if (url.pathname.startsWith("/workspace")) {
    // If they are logged in but don't have an orgCode, send them to home
    if (!orgCode) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Redirect to the correct org-specific workspace if it's missing from the URL
    if (!url.pathname.includes(orgCode)) {
      url.pathname = `/workspace/${orgCode}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export default createMiddleware(
  aj,
  withAuth(existingMiddleware, {
    // Kinde automatically redirects any non-public path to your login page
    publicPaths: ["/", "/api/uploadthing"],
  }) as NextMiddleware,
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|rpc).*)"],
};

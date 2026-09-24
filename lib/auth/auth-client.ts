import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // In the browser, omitting baseURL or setting it to undefined allows better-auth to use relative paths (/api/auth),
  // ensuring fetch requests inherit the page's scheme (https:// in production, http:// in local dev).
  baseURL: typeof window !== "undefined"
    ? undefined
    : (process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL.replace(/^http:\/\//i, "https://") : undefined),
});

export const { signIn, signUp, useSession, signOut } = authClient;


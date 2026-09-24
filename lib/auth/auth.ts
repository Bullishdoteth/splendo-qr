import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db/db";
import * as schema from "@/lib/db/schema";

const getAuthBaseUrl = () => {
  let url = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (!url && process.env.VERCEL_URL) {
    url = `https://${process.env.VERCEL_URL}`;
  }
  if (!url) {
    url = "http://localhost:3000";
  }
  // If not localhost or 127.0.0.1, enforce https protocol
  if (!url.includes("localhost") && !url.includes("127.0.0.1") && url.startsWith("http://")) {
    url = url.replace(/^http:\/\//i, "https://");
  }
  return url;
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET || "splendo-secret-key-change-in-production",
  baseURL: getAuthBaseUrl(),
});


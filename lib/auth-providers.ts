/**
 * Conditional Auth.js v5 providers.
 *
 * Each provider is included ONLY when its required env vars are present.
 * This lets the project build green without any OAuth credentials —
 * critical for keeping deploys unblocked while we configure providers.
 */
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Apple from "next-auth/providers/apple";
import Resend from "next-auth/providers/resend";

export function buildProviders(): Provider[] {
  const providers: Provider[] = [];

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      })
    );
  }

  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
      })
    );
  }

  if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) {
    providers.push(
      Apple({
        clientId: process.env.AUTH_APPLE_ID,
        clientSecret: process.env.AUTH_APPLE_SECRET,
      })
    );
  }

  if (process.env.AUTH_RESEND_KEY && process.env.AUTH_EMAIL_FROM) {
    providers.push(
      Resend({
        apiKey: process.env.AUTH_RESEND_KEY,
        from: process.env.AUTH_EMAIL_FROM,
      })
    );
  }

  return providers;
}

/** Names of providers that are currently enabled (for the sign-in modal). */
export function enabledProviderIds(): string[] {
  const ids: string[] = [];
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) ids.push("google");
  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) ids.push("github");
  if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) ids.push("apple");
  if (process.env.AUTH_RESEND_KEY && process.env.AUTH_EMAIL_FROM) ids.push("resend");
  return ids;
}

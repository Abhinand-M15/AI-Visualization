/**
 * The app's own base URL for server-side fetches of its public assets
 * (SEC-19). APP_BASE_URL is required in production: falling back to the
 * request's Host header would let a crafted Host make the server fetch (and
 * publish) bytes from anywhere. Local development may use the request origin.
 */
import { isProductionRuntime } from "@/lib/auth/mode";
import { notConfigured } from "@/lib/server/errors";

export function appBaseUrl(requestOrigin: string): string {
  const configured = process.env.APP_BASE_URL?.trim();
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "https:" || url.protocol === "http:") return url.origin;
    } catch {
      // fall through
    }
    throw notConfigured("The app's own address");
  }
  if (isProductionRuntime()) throw notConfigured("The app's own address");
  return requestOrigin.replace(/\/+$/, "");
}

import { Resend } from "resend";

let client: Resend | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM?.trim());
}

export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  if (!client) {
    client = new Resend(apiKey);
  }
  return client;
}

export function getEmailFrom(): string {
  const from = process.env.RESEND_FROM?.trim();
  if (!from) {
    throw new Error("RESEND_FROM is not configured");
  }
  return from;
}

export function getAppUrl(): string {
  const url =
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}

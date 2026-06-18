import { getEmailFrom, getResendClient, isEmailConfigured } from "@/lib/email/client";

export interface EmailRecipient {
  email: string;
  name: string;
}

export async function sendEmail(
  to: EmailRecipient,
  subject: string,
  html: string,
): Promise<void> {
  if (!isEmailConfigured()) {
    return;
  }

  const resend = getResendClient();
  const from = getEmailFrom();

  const { error } = await resend.emails.send({
    from,
    to: [to.email],
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendBulkEmails(
  recipients: EmailRecipient[],
  build: (recipient: EmailRecipient) => { subject: string; html: string },
): Promise<void> {
  if (!isEmailConfigured() || recipients.length === 0) {
    return;
  }

  await Promise.all(
    recipients.map(async (recipient) => {
      const { subject, html } = build(recipient);
      await sendEmail(recipient, subject, html);
    }),
  );
}

export function runEmailJob(job: () => Promise<void>): void {
  if (!isEmailConfigured()) {
    return;
  }

  void job().catch((err) => {
    console.error("Email notification failed:", err);
  });
}

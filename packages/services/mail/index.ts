import { env } from "../env";

interface SendVerificationEmailInput {
  to: string;
  name: string;
  userId: string;
  token: string;
}

interface MailMessage {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

interface MailTransport {
  sendMail(message: MailMessage): Promise<unknown>;
}

interface NodemailerModule {
  createTransport(options: {
    host: string;
    port: number;
    secure: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  }): MailTransport;
}

function createVerificationLink(userId: string, token: string) {
  const verificationUrl = new URL(env.EMAIL_VERIFICATION_URL);
  verificationUrl.searchParams.set("id", userId);
  verificationUrl.searchParams.set("token", token);
  return verificationUrl.toString();
}

function createMailTransport() {
  if (!env.SMTP_HOST || !env.SMTP_FROM) {
    throw new Error("SMTP_HOST and SMTP_FROM must be configured to send email");
  }

  const nodemailer = require("nodemailer") as NodemailerModule;
  const auth =
    env.SMTP_USER && env.SMTP_PASSWORD
      ? {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        }
      : undefined;

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth,
  });
}

export async function sendVerificationEmail(input: SendVerificationEmailInput) {
  const verificationLink = createVerificationLink(input.userId, input.token);
  const transport = createMailTransport();

  await transport.sendMail({
    from: env.SMTP_FROM!,
    to: input.to,
    subject: "Verify your Formizo email",
    text: `Hi ${input.name}, verify your Formizo email using this link: ${verificationLink}`,
    html: `
      <p>Hi ${input.name},</p>
      <p>Verify your Formizo email using the link below:</p>
      <p><a href="${verificationLink}">Verify email</a></p>
    `,
  });
}

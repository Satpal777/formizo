import fs from "node:fs";
import path from "node:path";

import { env } from "../env";

interface SendVerificationEmailInput {
  to: string;
  name: string;
  userId: string;
  token: string;
}

interface SendOnboardingEmailInput {
  to: string;
  name: string;
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

  let templatePath = "";
  try {
    // Resolve absolute path using package name (robust for pnpm workspaces/symlinks)
    templatePath = require.resolve("@repo/services/mail/templates/verification-email.html");
  } catch {
    // Fallback to relative file resolution
    templatePath = path.join(__dirname, "templates", "verification-email.html");
  }

  let htmlContent = "";
  try {
    htmlContent = fs.readFileSync(templatePath, "utf8")
      .replace(/{{name}}/g, escapeHtml(input.name))
      .replace(/{{verificationLink}}/g, verificationLink);
  } catch (error) {
    // Fallback minimal template if file is not found/readable
    htmlContent = `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>Verify your Formizo email using the link below:</p>
      <p><a href="${verificationLink}">Verify email</a></p>
    `;
  }

  await transport.sendMail({
    from: env.SMTP_FROM!,
    to: input.to,
    subject: "Verify your Formizo email",
    text: `Hi ${input.name}, verify your Formizo email using this link: ${verificationLink}`,
    html: htmlContent,
  });
}

export async function sendOnboardingEmail(input: SendOnboardingEmailInput) {
  const transport = createMailTransport();
  const firstName = input.name.trim() || "there";
  const escapedName = escapeHtml(firstName);
  const createFormUrl = env.ONBOARDING_CTA_URL;

  let templatePath = "";
  try {
    templatePath = require.resolve("@repo/services/mail/templates/onboarding-email.html");
  } catch {
    templatePath = path.join(__dirname, "templates", "onboarding-email.html");
  }

  let htmlContent = "";
  try {
    htmlContent = fs.readFileSync(templatePath, "utf8")
      .replace(/{{name}}/g, escapedName)
      .replace(/{{createFormUrl}}/g, createFormUrl);
  } catch (error) {
    // Fallback minimal template if file is not found/readable
    htmlContent = `
      <p>Hi ${escapedName},</p>
      <p>Welcome to Formizo.</p>
      <p>
        Formizo helps you build polished forms and surveys, publish them instantly,
        collect responses, and review results from one focused workspace.
      </p>
      <p>
        <a href="${createFormUrl}" style="display:inline-block;background:#0e639c;color:#ffffff;padding:10px 14px;text-decoration:none;border-radius:5px;">
          Create your first form
        </a>
      </p>
    `;
  }

  await transport.sendMail({
    from: env.SMTP_FROM!,
    to: input.to,
    subject: "Welcome to Formizo",
    text: [
      `Hi ${firstName},`,
      "",
      "Welcome to Formizo. You can build polished forms and surveys, publish them instantly, collect responses, and review results from one focused workspace.",
      "",
      "Create your first form:",
      createFormUrl,
    ].join("\n"),
    html: htmlContent,
  });
}

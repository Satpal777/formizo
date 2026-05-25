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

interface SendFormResponseEmailInput {
  to: string;
  respondentName: string;
  formTitle: string;
  submittedAt: Date;
  answers: Array<{
    question: string;
    answer: string;
  }>;
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

function resolveTemplatePath(templateName: string) {
  try {
    return require.resolve(`@repo/services/mail/templates/${templateName}`);
  } catch {
    return path.join(__dirname, "templates", templateName);
  }
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

  const templatePath = resolveTemplatePath("verification-email.html");

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

  const templatePath = resolveTemplatePath("onboarding-email.html");

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

export async function sendFormResponseEmail(input: SendFormResponseEmailInput) {
  const transport = createMailTransport();
  const respondentName = input.respondentName.trim() || "there";
  const submittedAt = input.submittedAt.toLocaleString("en", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const answersHtml = input.answers
    .map(
      (answer) => `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #eef2f6;">
            <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #181818;">
              ${escapeHtml(answer.question)}
            </p>
            <p style="margin: 0; font-size: 14px; line-height: 22px; color: #5a5a5a; white-space: pre-wrap;">
              ${escapeHtml(answer.answer)}
            </p>
          </td>
        </tr>
      `,
    )
    .join("");
  const answersText = input.answers
    .map((answer) => `${answer.question}\n${answer.answer}`)
    .join("\n\n");
  const templatePath = resolveTemplatePath("form-response-email.html");

  let htmlContent = "";
  try {
    htmlContent = fs.readFileSync(templatePath, "utf8")
      .replace(/{{name}}/g, escapeHtml(respondentName))
      .replace(/{{formTitle}}/g, escapeHtml(input.formTitle))
      .replace(/{{submittedAt}}/g, escapeHtml(submittedAt))
      .replace(/{{answers}}/g, answersHtml);
  } catch {
    htmlContent = `
      <p>Hi ${escapeHtml(respondentName)},</p>
      <p>Here is a copy of your response to ${escapeHtml(input.formTitle)}.</p>
      <p>Submitted: ${escapeHtml(submittedAt)}</p>
      <table>${answersHtml}</table>
    `;
  }

  await transport.sendMail({
    from: env.SMTP_FROM!,
    to: input.to,
    subject: `Your response to ${input.formTitle}`,
    text: [
      `Hi ${respondentName},`,
      "",
      `Here is a copy of your response to ${input.formTitle}.`,
      `Submitted: ${submittedAt}`,
      "",
      answersText,
    ].join("\n"),
    html: htmlContent,
  });
}

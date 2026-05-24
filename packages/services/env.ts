import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().describe("The URL of the database to connect to"),
  JWT_SECRET: z.string().describe("The secret key used for signing JWT tokens"),
  JWT_EXPIRES_IN: z.string().describe("The expiration time for JWT tokens (e.g., '1h', '30m')"),
  REFRESH_TOKEN_SECRET: z.string().describe("The secret key used for signing refresh tokens"),
  REFRESH_TOKEN_EXPIRES_IN: z
    .string()
    .describe("The expiration time for refresh tokens (e.g., '7d', '30d')"),
  SMTP_HOST: z.string().optional().describe("SMTP server host"),
  SMTP_PORT: z.coerce.number().int().positive().default(587).describe("SMTP server port"),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true")
    .describe("Whether to use TLS for SMTP"),
  SMTP_USER: z.string().optional().describe("SMTP username"),
  SMTP_PASSWORD: z.string().optional().describe("SMTP password"),
  SMTP_FROM: z.string().optional().describe("Default sender email address"),
  EMAIL_VERIFICATION_URL: z
    .string()
    .url()
    .default("http://localhost:3000/verify-email")
    .describe("Base URL used to build email verification links"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);

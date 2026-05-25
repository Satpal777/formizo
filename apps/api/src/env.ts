import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().optional(),
  NODE_ENV: z.enum(["development", "prod", "production"]).default("development"),
  BASE_URL: z.string().default("http://localhost:8000"),
  ONBOARDING_CTA_URL: z.string().default("http://localhost:3000"),
  RATE_LIMIT_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  TRUST_PROXY: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);

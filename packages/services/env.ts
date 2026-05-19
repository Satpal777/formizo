import { JWT } from "google-auth-library";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().describe("The URL of the database to connect to"),
  JWT_SECRET: z.string().describe("The secret key used for signing JWT tokens"),
  JWT_EXPIRES_IN: z.string().describe("The expiration time for JWT tokens (e.g., '1h', '30m')"),
  REFRESH_TOKEN_SECRET: z.string().describe("The secret key used for signing refresh tokens"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().describe("The expiration time for refresh tokens (e.g., '7d', '30d')"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);

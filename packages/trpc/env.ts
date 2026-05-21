import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "prod", "production"]).default("development"),
  JWT_SECRET: z.string().describe("The secret key used for signing JWT tokens"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);

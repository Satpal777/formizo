import { pgTable, uuid, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";

/**
 * Users table definition for authentication and user management.
 * This table includes fields for storing user information, email verification,
 * and refresh token management.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),

  passwordSalt: text("password_salt"),
  passwordHash: text("password_hash"),

  emailVerified: boolean("email_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  verificationTokenExpiresAt: timestamp("verification_token_expires_at", { withTimezone: true }),

  forgotPasswordToken: text("forgot_password_token"),
  forgotPasswordTokenExpiresAt: timestamp("forgot_password_token_expires_at", {
    withTimezone: true,
  }),

  refreshToken: text("refresh_token"),
  refreshTokenSalt: text("refresh_token_salt"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

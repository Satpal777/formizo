import { z } from "zod";

export const createUserWithEmailAndPasswordInput = z.object({
    name: z.string().max(255).describe("The name of the user to create"),
    email: z.email().max(255).describe("The email of the user to create"),
    password: z.string().min(8).max(100).describe("The password of the user to create"),
})

export const createUserWithEmailAndPasswordOutput = z.object({
    id: z.string().describe("The id of the created user"),
    emailVerificationToken: z.string().describe("The email verification token of the created user"),
})


export const verifyEmailInput = z.object({
    id: z.string().describe("The id of the user to verify"),
    token: z.string().describe("The email verification token to verify"),
})

export const verifyEmailOutput = z.object({
    success: z.boolean().describe("Whether the email verification was successful"),
})


export const signInWithEmailAndPasswordInput = z.object({
    email: z.email().max(255).describe("The email of the user to sign in"),
    password: z.string().min(8).max(100).describe("The password of the user to sign in"),
});

export const signInWithEmailAndPasswordOutput = z.object({
    token: z.string().describe("The authentication token for the signed-in user"),
    refreshToken: z.string().describe("The refresh token for the signed-in user"),
});

export const forgotPasswordInput = z.object({
    email: z.email().max(255).describe("The email of the user requesting a password reset"),
});

export const forgotPasswordOutput = z.object({
    id: z.string().describe("The id of the user requesting a password reset"),
    forgotPasswordToken: z.string().describe("The password reset token for the user"),
});

export const resetPasswordInput = z.object({
    id: z.string().describe("The id of the user resetting their password"),
    token: z.string().describe("The password reset token"),
    password: z.string().min(8).max(100).describe("The new password for the user"),
});

export const resetPasswordOutput = z.object({
    success: z.boolean().describe("Whether the password reset was successful"),
});

export type CreateUserWithEmailAndPasswordInputT = z.infer<typeof createUserWithEmailAndPasswordInput>;
export type CreateUserWithEmailAndPasswordOutputT = z.infer<typeof createUserWithEmailAndPasswordOutput>;

export type VerifyEmailInputT = z.infer<typeof verifyEmailInput>;
export type VerifyEmailOutputT = z.infer<typeof verifyEmailOutput>;

export type signInWithEmailAndPasswordInputT = z.infer<typeof signInWithEmailAndPasswordInput>;
export type signInWithEmailAndPasswordOutputT = z.infer<typeof signInWithEmailAndPasswordOutput>;

export type ForgotPasswordInputT = z.infer<typeof forgotPasswordInput>;
export type ForgotPasswordOutputT = z.infer<typeof forgotPasswordOutput>;

export type ResetPasswordInputT = z.infer<typeof resetPasswordInput>;
export type ResetPasswordOutputT = z.infer<typeof resetPasswordOutput>;

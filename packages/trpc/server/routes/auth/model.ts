import { z } from "zod";

export const createUserWithEmailAndPasswordInput = z.object({
    name: z.string().max(255).describe("The name of the user to create"),
    email: z.email().max(255).describe("The email of the user to create"),
    password: z.string().min(8).max(100).describe("The password of the user to create"),
});

export const createUserWithEmailAndPasswordOutput = z.object({
    id: z.string().describe("The id of the created user"),
    emailVerificationToken: z.string().describe("The email verification token of the created user"),
});

export const verifyEmailInput = z.object({
    id: z.string().describe("The id of the user to verify"),
    token: z.string().describe("The email verification token to verify"),
});

export const verifyEmailOutput = z.object({
    success: z.boolean().describe("Whether the email verification was successful"),
});

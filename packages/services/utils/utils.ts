import crypto from "node:crypto";
import JWT from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

/**
 * Generates a random salt for password hashing.
 * @returns 
 */
export function generateSalt() {
    return crypto.randomBytes(16).toString("hex");
}

/**
 * Generates a token and its hashed version.
 * @returns 
 */
export function tokenGenerator() {
    const rawToken = generateSalt();
    const hashedToken = crypto.createHmac("sha256", rawToken).update(rawToken).digest("hex");
    return [rawToken, hashedToken] as const;
}

/**
 * Generates a JWT token.
 * @param payload 
 * @param secret 
 * @param expiresIn 
 * @returns 
 */
export function generateJWTToken(payload: object, secret: string, expiresIn: SignOptions["expiresIn"]) {
    return JWT.sign(payload, secret, { expiresIn });
}

/**
 * Verifies a JWT token and returns the decoded payload if valid, or null if invalid.
 * @param token 
 * @param secret 
 * @returns 
 */
export function verifyJWTToken(token: string, secret: string) {
    try {
        return JWT.verify(token, secret);
    } catch (error) {
        return null;
    }
}

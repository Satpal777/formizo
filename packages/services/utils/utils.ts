import crypto from "node:crypto";
import JWT from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";

/**
 * Generates a random salt for password hashing.
 * @returns
 */
export function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Creates a SHA-256 HMAC digest.
 * @param value
 * @param secret
 * @returns
 */
function createSha256Hmac(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

/**
 * Hashes a token before storing or comparing it.
 * @param token
 * @returns
 */
export function hashToken(token: string) {
  return createSha256Hmac(token, token);
}

/**
 * Hashes a token using a provided salt.
 * @param token
 * @param salt
 * @returns
 */
export function hashTokenWithSalt(token: string, salt: string) {
  return createSha256Hmac(token, salt);
}

/**
 * Hashes a password using the provided salt.
 * @param password
 * @param salt
 * @returns
 */
export function hashPassword(password: string, salt: string) {
  return createSha256Hmac(password, salt);
}

/**
 * Generates a salt and password hash pair.
 * @param password
 * @returns
 */
export function generatePasswordHash(password: string) {
  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  return { salt, passwordHash };
}

/**
 * Generates a token and its hashed version.
 * @returns
 */
export function tokenGenerator() {
  const rawToken = generateSalt();
  const hashedToken = hashToken(rawToken);
  return [rawToken, hashedToken] as const;
}

/**
 * Generates a JWT token.
 * @param payload
 * @param secret
 * @param expiresIn
 * @returns
 */
export function generateJWTToken(
  payload: object,
  secret: string,
  expiresIn: SignOptions["expiresIn"],
) {
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

/**
 * Gets a JWT expiration date from a token.
 * @param token
 * @param secret
 * @returns
 */
export function getJWTExpiresAt(token: string, secret: string) {
  const decodedToken = verifyJWTToken(token, secret);

  if (!decodedToken || typeof decodedToken === "string") {
    return null;
  }

  const { exp } = decodedToken as JwtPayload;

  return exp ? new Date(exp * 1000) : null;
}

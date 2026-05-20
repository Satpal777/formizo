import { CreateUserWithEmailAndPasswordInputT, CreateUserWithEmailAndPasswordOutputT, ForgotPasswordInputT, ForgotPasswordOutputT, RefreshTokenInputT, RefreshTokenOutputT, ResetPasswordInputT, ResetPasswordOutputT, signInWithEmailAndPasswordInputT, signInWithEmailAndPasswordOutputT, VerifyEmailInputT } from "./model";
import { and, db, eq } from "@repo/database";
import { User, users } from "@repo/database/models/user";
import { generateJWTToken, generatePasswordHash, getJWTExpiresAt, hashPassword, hashToken, tokenGenerator, verifyJWTToken } from "../utils/utils";
import { env } from "../env";
import type { JwtPayload, SignOptions } from "jsonwebtoken";

/**
 * UserService class provides methods for user management, including creating users with email and password,
 * and handling authentication-related operations. It interacts with the database to perform necessary
 * queries and updates related to user data.
 */
export class UserService {

    /**
     * Retrieves a user by their email address.
     * @param email 
     * @returns 
     */
    private getUserByEmail(email: string): Promise<User | undefined> {
        return db.select().from(users).where(eq(users.email, email)).limit(1).then(result => result[0]);
    }

    /**
     * Retrieves a user by their id.
     * @param id
     * @returns
     */
    private getUserById(id: string): Promise<User | undefined> {
        return db.select().from(users).where(eq(users.id, id)).limit(1).then(result => result[0]);
    }

    /**
     * Creates access and refresh tokens for a user.
     * @param userId
     * @returns
     */
    private generateAuthTokens(userId: string) {
        const token = generateJWTToken({ userId }, env.JWT_SECRET!, (env.JWT_EXPIRES_IN as SignOptions["expiresIn"])!);
        const refreshToken = generateJWTToken({ userId }, env.REFRESH_TOKEN_SECRET!, (env.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"])!);

        return { token, refreshToken };
    }

    /**
     * Stores a hashed refresh token and its expiry for a user.
     * @param userId
     * @param refreshToken
     */
    private async saveRefreshToken(userId: string, refreshToken: string) {
        await db.update(users).set({
            refreshToken: hashToken(refreshToken),
            refreshTokenExpiresAt: getJWTExpiresAt(refreshToken, env.REFRESH_TOKEN_SECRET!),
        }).where(eq(users.id, userId));
    }

    /**
     * Validates a user's password against the stored password hash.
     * @param user
     * @param password
     * @param error
     */
    private validatePassword(user: User, password: string, error: string) {
        if (!user.passwordSalt || !user.passwordHash) {
            throw new Error(error);
        }

        const passwordHash = hashPassword(password, user.passwordSalt);

        if (passwordHash !== user.passwordHash) {
            throw new Error(error);
        }
    }

    /**
     * Resolves a user from a valid stored refresh token.
     * @param refreshToken
     * @param error
     * @returns
     */
    private async getUserByValidRefreshToken(refreshToken: string, error: string) {
        const decoded = verifyJWTToken(refreshToken, env.REFRESH_TOKEN_SECRET!);

        if (!decoded || typeof decoded === "string") {
            throw new Error(error);
        }

        const { userId } = decoded as JwtPayload & { userId?: string };

        if (!userId) {
            throw new Error(error);
        }

        const user = await this.getUserById(userId);
        const hashedRefreshToken = hashToken(refreshToken);

        if (!user || user.refreshToken !== hashedRefreshToken || !user.refreshTokenExpiresAt) {
            throw new Error(error);
        }

        if (user.refreshTokenExpiresAt <= new Date()) {
            throw new Error(error);
        }

        return user;
    }

    /**
     * Creates a new user with the provided email and password.
     * @param input 
     * @returns 
     */
    public async createUserWithEmailAndPassword(input: CreateUserWithEmailAndPasswordInputT): Promise<CreateUserWithEmailAndPasswordOutputT> {
        const { email, name, password } = input;

        const existingUser = await this.getUserByEmail(email);
        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        const { salt, passwordHash } = generatePasswordHash(password);

        const [rawToken, hashedToken] = tokenGenerator();

        const [newUser] = await db.insert(users).values({
            email,
            name,
            passwordSalt: salt,
            passwordHash,
            verificationToken: hashedToken
        }).returning({ id: users.id });


        if (!newUser) {
            throw new Error("Failed to create user");
        }

        return {
            id: newUser.id,
            emailVerificationToken: rawToken
        };
    }

    /**
     * Verifies a user's email address using the provided verification token.
     * @param input 
     * @returns 
     */
    public async verifyEmail(input: VerifyEmailInputT) {
        const { id, token } = input;

        const hashedToken = hashToken(token);

        const user = await db.select().from(users).where(and(eq(users.verificationToken, hashedToken), eq(users.id, id))).limit(1).then(result => result[0]);

        if (!user) {
            throw new Error("Invalid token");
        }

        await db.update(users).set({ emailVerified: true }).where(eq(users.id, id));

        return { success: true };
    }

    /**
     * Creates a password reset token for a user with the provided email.
     * @param input
     * @returns
     */
    public async forgotPassword(input: ForgotPasswordInputT): Promise<ForgotPasswordOutputT> {
        const { email } = input;

        const user = await this.getUserByEmail(email);

        if (!user) {
            throw new Error("User with this email does not exist");
        }

        const [rawToken, hashedToken] = tokenGenerator();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await db.update(users).set({
            forgotPasswordToken: hashedToken,
            forgotPasswordTokenExpiresAt: expiresAt
        }).where(eq(users.id, user.id));

        return {
            id: user.id,
            forgotPasswordToken: rawToken
        };
    }

    /**
     * Resets a user's password using a valid forgot password token.
     * @param input
     * @returns
     */
    public async resetPassword(input: ResetPasswordInputT): Promise<ResetPasswordOutputT> {
        const { id, token, password } = input;

        const hashedToken = hashToken(token);

        const user = await db.select().from(users).where(and(eq(users.id, id), eq(users.forgotPasswordToken, hashedToken))).limit(1).then(result => result[0]);

        if (!user || !user.forgotPasswordTokenExpiresAt) {
            throw new Error("Invalid or expired password reset token");
        }

        if (user.forgotPasswordTokenExpiresAt <= new Date()) {
            throw new Error("Invalid or expired password reset token");
        }

        const { salt, passwordHash } = generatePasswordHash(password);

        await db.update(users).set({
            passwordSalt: salt,
            passwordHash,
            forgotPasswordToken: null,
            forgotPasswordTokenExpiresAt: null,
        }).where(eq(users.id, id));

        return { success: true };
    }

    /**
     * Refreshes authentication tokens using a valid refresh token.
     * @param input
     * @returns
     */
    public async refreshToken(input: RefreshTokenInputT): Promise<RefreshTokenOutputT> {
        const { refreshToken } = input;
        const error = "Invalid or expired refresh token";

        const user = await this.getUserByValidRefreshToken(refreshToken, error);
        const { token, refreshToken: newRefreshToken } = this.generateAuthTokens(user.id);

        await this.saveRefreshToken(user.id, newRefreshToken);

        return {
            token,
            refreshToken: newRefreshToken
        };
    }

    /**
     * Signs in a user with the provided email and password.
     * @param input 
     * @returns 
     */
    public async signInWithEmailAndPassword(input: signInWithEmailAndPasswordInputT): Promise<signInWithEmailAndPasswordOutputT> {
        const { email, password } = input;

        const user = await this.getUserByEmail(email);

        const error = "Invalid email or password";

        if (!user) {
            throw new Error(error);
        }

        this.validatePassword(user, password, error);

        const { token, refreshToken } = this.generateAuthTokens(user.id);

        await this.saveRefreshToken(user.id, refreshToken);

        return {
            token,
            refreshToken,
            id: user.id,
        };
    }
}

import { CreateUserWithEmailAndPasswordInputT, CreateUserWithEmailAndPasswordOutputT, signInWithEmailAndPasswordInputT, signInWithEmailAndPasswordOutputT, VerifyEmailInputT } from "./model";
import { and, db, eq } from "@repo/database";
import { User, users } from "@repo/database/models/user";
import { generateJWTToken, generateSalt, tokenGenerator } from "../utils/utils";
import crypto from "node:crypto";
import { env } from "../env";
import { SignOptions } from "jsonwebtoken";

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

        const salt = generateSalt();
        const passwordHash = crypto.createHmac('sha256', salt).update(password).digest('hex');

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

        const hashedToken = crypto.createHmac('sha256', token).update(token).digest('hex');

        const user = await db.select().from(users).where(and(eq(users.verificationToken, hashedToken), eq(users.id, id))).limit(1).then(result => result[0]);

        if (!user) {
            throw new Error("Invalid token");
        }

        await db.update(users).set({ emailVerified: true }).where(eq(users.id, id));

        return { success: true };
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

        if (!user.passwordSalt || !user.passwordHash) {
            throw new Error(error);
        }

        const passwordHash = crypto.createHmac('sha256', user.passwordSalt).update(password).digest('hex');

        if (passwordHash !== user.passwordHash) {
            throw new Error(error);
        }

        const jwtToken = generateJWTToken({ userId: user.id }, env.JWT_SECRET!, (env.JWT_EXPIRES_IN as SignOptions["expiresIn"])!);
        const refreshToken = generateJWTToken({ userId: user.id }, env.REFRESH_TOKEN_SECRET!, (env.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"])!);

        return {
            token: jwtToken,
            refreshToken
        };
    }
}

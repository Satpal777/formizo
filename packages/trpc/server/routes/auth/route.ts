import { userService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { setAuthCookie } from "./cookie";
import {
  createUserWithEmailAndPasswordInput,
  createUserWithEmailAndPasswordOutput,
  forgotPasswordInput,
  forgotPasswordOutput,
  refreshTokenInput,
  refreshTokenOutput,
  resetPasswordInput,
  resetPasswordOutput,
  signInWithEmailAndPasswordInput,
  signInWithEmailAndPasswordOutput,
  verifyEmailInput,
  verifyEmailOutput
} from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({

  createUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createUserWithEmailAndPassword"),
        tags: TAGS,
        summary: "Create a new user with email and password",
        description: "This endpoint allows you to create a new user account using an email address and password. It returns an email verification token that can be used to verify the user's email address.",
      }
    })
    .input(createUserWithEmailAndPasswordInput)
    .output(createUserWithEmailAndPasswordOutput)
    .mutation(async ({ input }) => {
      const { email, name, password } = input;
      const result = await userService.createUserWithEmailAndPassword({ email, name, password });
      return result;
    }),

  verifyEmail: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/verifyEmail"),
        tags: TAGS,
        summary: "Verify a user's email address",
        description: "This endpoint verifies a user's email address using the user id and email verification token.",
      }
    })
    .input(verifyEmailInput)
    .output(verifyEmailOutput)
    .mutation(async ({ input }) => {
      const { id, token } = input;
      const result = await userService.verifyEmail({ id, token });
      return result;
    }),

  signInWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/signInWithEmailAndPassword"),
        tags: TAGS,
        summary: "Sign in with email and password",
        description: "This endpoint signs in a user using an email address and password. It returns an authentication token and refresh token.",
      }
    })
    .input(signInWithEmailAndPasswordInput)
    .output(signInWithEmailAndPasswordOutput)
    .mutation(async ({ input,ctx }) => {
      const { email, password } = input;
      const {token,refreshToken,id} = await userService.signInWithEmailAndPassword({ email, password });
      setAuthCookie(ctx, token, refreshToken);
      return { success:true, id };
    }),

  forgotPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/forgotPassword"),
        tags: TAGS,
        summary: "Request a password reset",
        description: "This endpoint creates a password reset token for a user using their email address.",
      }
    })
    .input(forgotPasswordInput)
    .output(forgotPasswordOutput)
    .mutation(async ({ input }) => {
      const { email } = input;
      const result = await userService.forgotPassword({ email });
      return result;
    }),

  resetPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/resetPassword"),
        tags: TAGS,
        summary: "Reset a user's password",
        description: "This endpoint resets a user's password using the password reset token created by the forgot password flow.",
      }
    })
    .input(resetPasswordInput)
    .output(resetPasswordOutput)
    .mutation(async ({ input }) => {
      const { id, token, password } = input;
      const result = await userService.resetPassword({ id, token, password });
      return result;
    }),

  refreshToken: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/refreshToken"),
        tags: TAGS,
        summary: "Refresh authentication tokens",
        description: "This endpoint exchanges a valid refresh token for a new authentication token and refresh token.",
      }
    })
    .input(refreshTokenInput)
    .output(refreshTokenOutput)
    .mutation(async ({ input }) => {
      const { refreshToken } = input;
      const result = await userService.refreshToken({ refreshToken });
      return result;
    })

});

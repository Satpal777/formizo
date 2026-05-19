import { userService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createUserWithEmailAndPasswordInput,
  createUserWithEmailAndPasswordOutput,
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
    })

});

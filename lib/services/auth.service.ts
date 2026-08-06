import { BaseService } from "./base.service";
import type { User } from "@/types";
import type { SigninInput } from "@/types/input/SigninInput";
import type { SignupInput } from "@/types/input/SignupInput";
import type { UpdateProfileInput } from "@/types/input/UpdateProfileInput";
import type { UpdatePasswordInput } from "@/types/input/UpdatePasswordInput";

export class AuthService extends BaseService<User, SignupInput, UpdateProfileInput> {
  protected BASE_PATH = "auth";

  async signIn(input: SigninInput) {
    return this.sendPost<{ accessToken: string }>("/signin", input);
  }

  async signUp(input: SignupInput) {
    return this.sendPost<User>("/signup", input);
  }

  async me() {
    return this.sendGet<User>("/me");
  }

  async updateProfile(input: UpdateProfileInput) {
    return this.sendPut<User>("/me", input);
  }

  async updatePassword(input: UpdatePasswordInput) {
    return this.sendPost<never>("/update-password", input);
  }
}

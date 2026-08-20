import { BaseService } from './base.service';
import type { AccessToken, User } from '@/types';
import type { SigninInput } from '@/types/input/SigninInput';
import type { SignupInput } from '@/types/input/SignupInput';
import type { UpdateProfileInput } from '@/types/input/UpdateProfileInput';
import type { UpdatePasswordInput } from '@/types/input/UpdatePasswordInput';
import type { ForgotPasswordInput } from '@/types/input/ForgotPasswordInput';
import type { ResetPasswordInput } from '@/types/input/ResetPasswordInput';
import type { PasswordStrengthInput } from '@/types/input/PasswordStrengthInput';


export class AuthService extends BaseService<User, SignupInput, UpdateProfileInput> {
  protected BASE_PATH = 'auth';

  async signIn(input: SigninInput) {
    return this.sendPost<AccessToken>('/signin', input);
  }

  async signUp(input: SignupInput) {
    return this.sendPost<AccessToken>('/signup', input);
  }

  async signOut() {
    return this.sendPost<never>('/logout', {});
  }

  async me() {
    return this.sendGet<User>('/me');
  }

  async updateProfile(input: UpdateProfileInput) {
    return this.sendPut<User>('/me', input);
  }

  async updatePassword(input: UpdatePasswordInput) {
    return this.sendPost<never>('/update-password', input);
  }

  async forgotPassword(input: ForgotPasswordInput) {
    return this.sendPost<never>('/forgot-password', input);
  }

  async resetPassword(input: ResetPasswordInput) {
    return this.sendPost<never>('/reset-password', input);
  }

  async passwordStrength(input: PasswordStrengthInput) {
    return this.sendPost<{ score: 0 | 1 | 2 | 3 | 4 }>('/password-strength', input);
  }

  async sendVerification() {
    return this.sendPost<never>('/send-verification', {});
  }

  async verifyEmail(token: string) {
    return this.sendPost<never>(`/verify-email/${encodeURIComponent(token)}`, {});
  }
}

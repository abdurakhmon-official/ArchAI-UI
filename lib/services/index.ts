export * from '@/lib/services/project.service';
export * from '@/lib/services/generation.service';
export * from '@/lib/services/estimate.service';
export * from '@/lib/services/catalog.service';
export * from '@/lib/services/content.service';
export * from '@/lib/services/billing.service';
export * from '@/lib/services/admin.service';
export * from '@/lib/services/media.service';
export * from '@/lib/services/storage.service';

import { AuthService } from '@/lib/services/auth.service';
import { UserService } from '@/lib/services/user.service';

export const authService = new AuthService();
export const userService = new UserService();

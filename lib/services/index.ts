export * from '@/lib/services/archai.service';
export * from '@/lib/services/storage.service';

// Mavjud servislar klass sifatida eksport qilinadi — bir marta yaratib,
// tayyor nusxa sifatida beramiz, shunda chaqirish joyi bir xil bo'ladi.
import { AuthService } from '@/lib/services/auth.service';
import { UserService } from '@/lib/services/user.service';

export const authService = new AuthService();
export const userService = new UserService();

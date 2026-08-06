import { BaseService } from "./base.service";
import type { User } from "@/types";
import type { CreateUserInput } from "@/types/input/CreateUserInput";
import type { UpdateUserRoleInput } from "@/types/input/UpdateUserRoleInput";

export class UserService extends BaseService<User, CreateUserInput> {
  protected BASE_PATH = "users";

  async updateRole(id: string, input: UpdateUserRoleInput) {
    return this.sendPut<User>(`/${id}/role`, input);
  }
}

import { BaseService } from "./base.service";
import type { DashboardStats } from "@/types";

export class DashboardService extends BaseService<DashboardStats> {
  protected BASE_PATH = "dashboard";

  async stats() {
    return this.sendGet<DashboardStats>("/stats");
  }
}

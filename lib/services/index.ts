import { AuthService } from "./auth.service";
import { TestService } from "./test.service";
import { ResultService } from "./result.service";
import { DashboardService } from "./dashboard.service";
import { SubjectService } from "./subject.service";
import { UserService } from "./user.service";

export const services = {
  auth: new AuthService(),
  test: new TestService(),
  result: new ResultService(),
  dashboard: new DashboardService(),
  subject: new SubjectService(),
  user: new UserService(),
};

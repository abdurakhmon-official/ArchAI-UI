import { BaseService } from "./base.service";
import type { Subject } from "@/types";
import type { CreateSubjectInput } from "@/types/input/CreateSubjectInput";

export class SubjectService extends BaseService<Subject, CreateSubjectInput> {
  protected BASE_PATH = "subjects";

  async list() {
    return this.sendGet<Subject[]>("");
  }
}

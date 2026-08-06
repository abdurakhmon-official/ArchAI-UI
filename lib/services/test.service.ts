import { BaseService } from "./base.service";
import type { TestListItem, TestDetail } from "@/types";
import type { BasicSearch } from "@/types/input/BasicSearch";
import type { CreateTestInput } from "@/types/input/CreateTestInput";
import type { UpdateTestInput } from "@/types/input/UpdateTestInput";
import type { SubmitTestInput } from "@/types/input/SubmitTestInput";

export class TestService extends BaseService<TestListItem | TestDetail, CreateTestInput, UpdateTestInput> {
  protected BASE_PATH = "tests";

  async listBySubject(query: BasicSearch = {}, subject?: string | null) {
    return this.sendGet<{ items: TestListItem[]; count: number }>("", { ...query, subject });
  }

  async submit(id: string, input: SubmitTestInput) {
    return this.sendPost<{ id: string }>(`/${id}/submit`, input);
  }
}

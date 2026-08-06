import { BaseService } from "./base.service";
import type { ResultListItem, ResultDetail } from "@/types";

export class ResultService extends BaseService<ResultListItem | ResultDetail> {
  protected BASE_PATH = "results";
}

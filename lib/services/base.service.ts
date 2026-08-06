import api from "@/lib/axios";
import type { BasicSearch } from "@/types/input/BasicSearch";

export abstract class BaseService<T, TCreateInput = unknown, TUpdateInput = unknown> {
  protected abstract BASE_PATH: string;

  async get(id: string) {
    return this.sendGet<T>(`/${id}`);
  }

  async listPaged(query: BasicSearch = {}) {
    return this.sendGet<{ items: T[]; count: number }>("", query);
  }

  async create(data: TCreateInput) {
    return this.sendPost<T>("", data);
  }

  async update(id: string, data: TUpdateInput) {
    return this.sendPut<T>(`/${id}`, data);
  }

  async delete(id: string) {
    return this.sendDelete(`/${id}`);
  }

  protected async sendGet<R>(path: string, query: Record<string, unknown> = {}) {
    const { data } = await api.get<{ success: boolean; data: R }>(
      `/${this.BASE_PATH}${path}`,
      { params: query }
    );
    return data;
  }

  protected async sendPost<R, I = unknown>(path: string, input: I) {
    const { data } = await api.post<{ success: boolean; data: R }>(
      `/${this.BASE_PATH}${path}`,
      input
    );
    return data;
  }

  protected async sendPut<R, I = unknown>(path: string, input: I) {
    const { data } = await api.put<{ success: boolean; data: R }>(
      `/${this.BASE_PATH}${path}`,
      input
    );
    return data;
  }

  protected async sendDelete(path: string) {
    const { data } = await api.delete<{ success: boolean }>(
      `/${this.BASE_PATH}${path}`
    );
    return data;
  }
}

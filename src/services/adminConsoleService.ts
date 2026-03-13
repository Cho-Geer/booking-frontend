import api from './api';
import { Service } from '@/types';

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  userType: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersListResponse {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  name?: string;
  phone?: string;
  status?: string;
}

const resolvePayload = <T>(response: unknown): T => {
  if (typeof response !== 'object' || response === null) {
    return undefined as T;
  }
  const wrapper = response as { data?: unknown };
  const firstLayer = wrapper.data;
  if (typeof firstLayer === 'object' && firstLayer !== null && 'data' in firstLayer) {
    return (firstLayer as { data?: T }).data as T;
  }
  return firstLayer as T;
};

export const adminConsoleService = {
  async getUsers(query: AdminUsersQuery = {}): Promise<AdminUsersListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const response = await api.get('/users', {
      params: {
        ...query,
        page,
        limit,
      },
    });
    const payload = resolvePayload<Record<string, unknown>>(response);
    const rawItems = payload.items;
    const items: AdminUser[] = Array.isArray(rawItems) ? (rawItems as AdminUser[]) : [];
    const total = typeof payload.total === 'number' ? payload.total : items.length;
    const currentPage = typeof payload.page === 'number' ? payload.page : page;
    const currentLimit = typeof payload.limit === 'number' ? payload.limit : limit;
    const totalPages = Math.max(1, Math.ceil(total / currentLimit));
    return {
      items,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages,
    };
  },

  async getServices(): Promise<Service[]> {
    const response = await api.get('/services');
    const payload = resolvePayload<unknown>(response);
    return Array.isArray(payload) ? payload : [];
  },
};

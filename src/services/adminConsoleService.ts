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

export interface CreateAdminServicePayload {
  name: string;
  description?: string;
  durationMinutes: number;
  price?: number;
  imageUrl: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateAdminServicePayload {
  name?: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
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
    const response = await api.get('/services/admin/all');
    const payload = resolvePayload<unknown>(response);
    return Array.isArray(payload) ? payload : [];
  },

  async createService(payload: CreateAdminServicePayload): Promise<Service> {
    const response = await api.post('/services/admin', payload);
    return resolvePayload<Service>(response);
  },

  async updateService(id: string, payload: UpdateAdminServicePayload): Promise<Service> {
    const response = await api.patch(`/services/admin/${id}`, payload);
    return resolvePayload<Service>(response);
  },

  async toggleServiceStatus(id: string, isActive: boolean): Promise<Service> {
    const response = await api.patch(`/services/admin/${id}/status`, { isActive });
    const payload = resolvePayload<unknown>(response);
    return payload as Service;
  },
};

import api from './api';
import { Service } from '@/types';

/**
 * 管理员用户接口
 */
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

/**
 * 管理员用户列表响应接口
 */
export interface AdminUsersListResponse {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 管理员用户查询参数接口
 */
export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  name?: string;
  phone?: string;
  status?: string;
}

/**
 * 创建服务请求参数接口
 */
export interface CreateAdminServicePayload {
  name: string;
  description?: string;
  durationMinutes: number;
  price?: number;
  imageUrl: string;
  isActive?: boolean;
  displayOrder?: number;
}

/**
 * 更新服务请求参数接口
 */
export interface UpdateAdminServicePayload {
  name?: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
}

/**
 * 检查数据是否为有效的 AdminUser 数组
 * @param data 待检查的数据
 * @returns 是否为有效的 AdminUser 数组
 */
const isAdminUserArray = (data: unknown): data is AdminUser[] => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && 
    item !== null &&
    'id' in item &&
    'name' in item &&
    'phone' in item &&
    'userType' in item
  );
};

/**
 * 检查数据是否为有效的 Service 对象
 * @param data 待检查的数据
 * @returns 是否为有效的 Service 对象
 */
const isService = (data: unknown): data is Service => {
  return typeof data === 'object' && 
    data !== null &&
    'id' in data &&
    'name' in data;
};

/**
 * 解析 API 响应载荷
 * @param response API 响应对象
 * @returns 解析后的数据
 */
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

/**
 * 管理控制台服务
 * 提供管理员后台所需的 API 调用功能
 */
export const adminConsoleService = {
  /**
   * 获取用户列表
   * @param query 查询参数
   * @returns 用户列表响应
   */
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
    
    const items: AdminUser[] = isAdminUserArray(rawItems) ? rawItems : [];
    const total = typeof payload.total === 'number' ? payload.total : items.length;
    const currentPage = typeof payload.page === 'number' ? payload.page : page;
    const currentLimit = typeof payload.limit === 'number' ? payload.limit : limit;
    const totalPages = Math.max(1, Math.ceil(total / currentLimit));
    
    if (rawItems && !isAdminUserArray(rawItems)) {
      console.error('Invalid users data format:', rawItems);
    }
    
    return {
      items,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages,
    };
  },

  /**
   * 获取服务列表
   * @returns 服务列表
   */
  async getServices(): Promise<Service[]> {
    const response = await api.get('/services/admin/all');
    const payload = resolvePayload<unknown>(response);
    return Array.isArray(payload) ? payload : [];
  },

  /**
   * 创建服务
   * @param payload 创建服务的参数
   * @returns 创建的服务
   */
  async createService(payload: CreateAdminServicePayload): Promise<Service> {
    const response = await api.post('/services/admin', payload);
    return resolvePayload<Service>(response);
  },

  /**
   * 更新服务
   * @param id 服务 ID
   * @param payload 更新服务的参数
   * @returns 更新后的服务
   */
  async updateService(id: string, payload: UpdateAdminServicePayload): Promise<Service> {
    const response = await api.patch(`/services/admin/${id}`, payload);
    return resolvePayload<Service>(response);
  },

  /**
   * 切换服务启用状态
   * @param id 服务 ID
   * @param isActive 是否启用
   * @returns 更新后的服务
   */
  async toggleServiceStatus(id: string, isActive: boolean): Promise<Service> {
    const response = await api.patch(`/services/admin/${id}/status`, { isActive });
    const payload = resolvePayload<unknown>(response);
    
    if (!isService(payload)) {
      console.error('Invalid service data format:', payload);
      throw new Error('Invalid service response format');
    }
    
    return payload;
  },
};

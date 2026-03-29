/**
 * Service API - 服务管理接口
 * 对应 serviceSlice.ts
 */
import api from './api';
import { Service, ServiceQuery, ServiceListResponse } from '../types';

const resolvePayload = <T>(response: { data: unknown }): T => {
  const payload = response.data as { data?: T };
  return payload as T;
};

const isService = (data: unknown): data is Service => {
  if (data === null || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return 'id' in obj && 'name' in obj && 'isActive' in obj;
};

export interface CreateServicePayload {
  name: string;
  description?: string;
  durationMinutes: number;
  price?: number;
  imageUrl: string;
  isActive?: boolean;
}

export interface UpdateServicePayload {
  name?: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  imageUrl?: string;
  isActive?: boolean;
}

export const serviceApi = {
    /**
   * 获取服务列表
   * @returns 服务列表
   */
  async getServicesForCustomers(query: ServiceQuery = {}): Promise<Service[]> {
    const response = await api.get('/services', { params: query });
    return resolvePayload<Service[]>(response);
  },

  /**
   * 获取服务列表
   * @returns 服务列表
   */
  async getServices(query: ServiceQuery = {}): Promise<ServiceListResponse> {
    const response = await api.get('/services/all', { params: query });
    return resolvePayload<ServiceListResponse>(response);
  },

  /**
   * 创建服务
   * @param payload 创建服务的参数
   * @returns 创建的服务
   */
  async createService(payload: CreateServicePayload): Promise<Service> {
    const response = await api.post('/services/admin', payload);
    return resolvePayload<Service>(response);
  },

  /**
   * 更新服务
   * @param id 服务 ID
   * @param payload 更新服务的参数
   * @returns 更新后的服务
   */
  async updateService(id: string, payload: UpdateServicePayload): Promise<Service> {
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
    const payload = resolvePayload<Service>(response);
    
    if (!isService(payload)) {
      console.error('Invalid service data format:', payload);
      throw new Error('Invalid service response format');
    }
    
    return payload;
  },
};

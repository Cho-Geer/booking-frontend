/**
 * Service API - 服务管理接口
 * 对应 serviceSlice.ts
 */
import api from './api';
import { Service, ServiceQuery, ServiceListResponse } from '../types';

const resolvePayload = <T>(response: { data: unknown }): T => {
  const payload = response.data as { data?: T };
  return payload.data as T;
};

const isService = (data: unknown): data is Service => {
  return data !== null && typeof data === 'object' && 'id' in data && 'name' in data;
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
  async getServices(query: ServiceQuery = {}): Promise<ServiceListResponse> {
    const response = await api.get('/services/all', { params: query });
    const data = (response.data.data || response.data) as ServiceListResponse;
    return data;
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
    const payload = resolvePayload<unknown>(response);
    
    if (!isService(payload)) {
      console.error('Invalid service data format:', payload);
      throw new Error('Invalid service response format');
    }
    
    return payload;
  },
};

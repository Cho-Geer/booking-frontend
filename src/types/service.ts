/**
 * Service相关类型定义
 * 集中管理所有与Service业务相关的类型
 */

/**
 * 服务实体接口
 */
export interface Service {
  /** 服务ID */
  id: string;
  /** 服务名称 */
  name: string;
  /** 服务描述 */
  description?: string;
  /** 服务时长（分钟） */
  durationMinutes: number;
  /** 价格 */
  price?: number;
  /** 是否可用 */
  isActive: boolean;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

export interface ServiceQuery {
  page?: number;
  limit?: number;
  name?: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  categoryId?: string;
  isActive?: string;
  displayOrder?: number;
}

export interface ServiceListResponse {
  items: Service[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
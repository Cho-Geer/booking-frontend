import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminConsoleService,
  CreateAdminServicePayload,
  UpdateAdminServicePayload,
  AdminUsersQuery,
  AdminUsersListResponse,
} from './adminConsoleService';
import { Service } from '@/types';

/**
 * 管理控制台查询键定义
 * 用于统一管理查询缓存键
 */
export const adminQueryKeys = {
  services: ['admin', 'services'] as const,
  users: ['admin', 'users'] as const,
};

/**
 * 获取服务列表的 Query Hook
 * @returns React Query 查询结果
 */
export function useAdminServices() {
  return useQuery({
    queryKey: adminQueryKeys.services,
    queryFn: () => adminConsoleService.getServices(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * 获取用户列表的 Query Hook
 * @param query 查询参数
 * @returns React Query 查询结果
 */
export function useAdminUsers(query?: AdminUsersQuery) {
  return useQuery({
    queryKey: [...adminQueryKeys.users, query] as const,
    queryFn: () => adminConsoleService.getUsers(query),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * 创建服务的 Mutation Hook
 * @returns React Query 变更操作
 */
export function useCreateAdminService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminServicePayload) => 
      adminConsoleService.createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.services });
    },
  });
}

/**
 * 更新服务的 Mutation Hook
 * @returns React Query 变更操作
 */
export function useUpdateAdminService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAdminServicePayload }) => 
      adminConsoleService.updateService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.services });
    },
  });
}

/**
 * 切换服务状态的 Mutation Hook
 * @returns React Query 变更操作
 */
export function useToggleServiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      adminConsoleService.toggleServiceStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.services });
    },
  });
}

// 显式导出模块
export type {
  CreateAdminServicePayload,
  UpdateAdminServicePayload,
  AdminUsersQuery,
  AdminUsersListResponse,
};

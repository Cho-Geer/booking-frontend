/**
 * TanStack Query 配置和工具函数
 * 提供查询客户端配置和常用查询操作
 */
import { QueryClient, QueryClientConfig, QueryKey, MutationOptions, MutationFunctionContext } from '@tanstack/react-query';
import { AxiosError } from 'axios';

/**
 * 确保queryKey始终为数组类型
 * @param key 查询键
 * @returns 数组形式的查询键
 */
const ensureArrayKey = (key: QueryKey): readonly unknown[] => {
  if (Array.isArray(key)) {
    return key;
  }
  return [key];
};

/**
 * 自定义错误处理函数
 * @param error 错误对象
 * @param defaultMessage 默认错误消息
 */
const handleError = (error: Error | AxiosError, defaultMessage: string): void => {
  // 如果是Axios错误，尝试获取更具体的错误信息
  if (error instanceof AxiosError) {
    if (error.response?.data?.message) {
      console.error(error.response.data.message as string);
    } else if (error.response?.status) {
      console.error(`请求失败 (${error.response.status}): ${error.message}`);
    } else {
      console.error(defaultMessage);
    }
  } else {
    // 其他类型的错误
    console.error(defaultMessage);
  }
};

/**
 * 创建查询客户端
 * @param config 额外的查询客户端配置
 * @returns 配置好的查询客户端实例
 */
export const createQueryClient = (config?: Partial<QueryClientConfig>): QueryClient => {
  const defaultConfig: QueryClientConfig = {
    defaultOptions: {
      queries: {
        // 缓存时间（默认10分钟）
        staleTime: 10 * 60 * 1000,
        // 重试次数
        retry: 3,
        // 重试延迟
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // 在窗口重新获得焦点时刷新
        refetchOnWindowFocus: true,
        // 在网络重新连接时刷新
        refetchOnReconnect: true,
      },
      mutations: {
        // 错误处理
        onError: (error: Error) => {
          handleError(error, '操作失败');
        },
      },
    },
  };

  return new QueryClient({
    ...defaultConfig,
    ...config,
  });
};

/**
 * 默认查询客户端实例
 */
export const queryClient = createQueryClient();

/**
 * 创建查询配置的Hook
 * @param key 查询键
 * @param options 额外的查询选项
 * @returns 完整的查询配置对象
 */
export const useQueryConfig = (
  key: QueryKey,
  options?: Partial<Record<string, unknown>>
): Record<string, unknown> => {
  return {
    queryKey: ensureArrayKey(key),
    ...options,
  };
};

/**
 * 创建变更配置的Hook
 * @param key 查询键（用于失效）
 * @param options 额外的变更选项
 * @returns 完整的变更配置对象
 */
export const useMutationConfig = <T, U>(
  key: QueryKey | null = null,
  options?: Partial<MutationOptions<T, Error, U>>
): MutationOptions<T, Error, U> => {
  const defaultOptions: MutationOptions<T, Error, U> = {
    onSuccess: (data, variables, context) => {
      if (key) {
        invalidateQueries(key);
      }
      // 安全地调用用户提供的onSuccess函数，确保参数正确传递
      if (options?.onSuccess) {
        // 使用安全调用，避免undefined调用错误
        try {
          // 传递所有必要的参数，包括undefined的onMutateResult
          options.onSuccess(data, variables, undefined, context as MutationFunctionContext);
        } catch (error) {
          console.error('用户提供的onSuccess处理函数执行失败:', error);
        }
      }
    },
  };

  return {
    ...defaultOptions,
    ...options,
  } as MutationOptions<T, Error, U>;
};

/**
 * 使查询失效
 * @param key 查询键
 * @param options 失效选项
 */
export const invalidateQueries = (key: QueryKey, options?: Partial<Record<string, unknown>>): void => {
  try {
    queryClient.invalidateQueries({
      queryKey: ensureArrayKey(key),
      ...options,
    });
  } catch (error) {
    console.error('使查询失效失败:', error);
  }
};

/**
 * 设置查询数据
 * @param key 查询键
 * @param data 要设置的数据
 * @param options 设置选项
 */
export const setQueryData = <T>(key: QueryKey, data: T, options?: Partial<Record<string, unknown>>): void => {
  try {
    queryClient.setQueryData(ensureArrayKey(key), data, options);
  } catch (error) {
    console.error('设置查询数据失败:', error);
  }
};

/**
 * 获取查询数据
 * @param key 查询键
 * @returns 查询数据或undefined
 */
export const getQueryData = <T>(key: QueryKey): T | undefined => {
  try {
    return queryClient.getQueryData(ensureArrayKey(key)) as T;
  } catch (error) {
    console.error('获取查询数据失败:', error);
    return undefined;
  }
};

/**
 * 移除查询
 * @param key 查询键
 * @param options 移除选项
 */
export const removeQueries = (key: QueryKey, options?: Partial<Record<string, unknown>>): void => {
  try {
    queryClient.removeQueries({
      queryKey: ensureArrayKey(key),
      ...options,
    });
  } catch (error) {
    console.error('移除查询失败:', error);
  }
};

/**
 * 取消所有查询
 */
export const cancelAllQueries = (): void => {
  try {
    queryClient.cancelQueries();
  } catch (error) {
    console.error('取消所有查询失败:', error);
  }
};

/**
 * 重置查询客户端
 */
export const resetQueryClient = (): void => {
  try {
    queryClient.clear();
  } catch (error) {
    console.error('重置查询客户端失败:', error);
  }
};

/**
 * React Query 工具函数集
 */
export const queryUtils = {
  ensureArrayKey,
  handleError,
  invalidateQueries,
  setQueryData,
  getQueryData,
  removeQueries,
  cancelAllQueries,
  resetQueryClient,
};
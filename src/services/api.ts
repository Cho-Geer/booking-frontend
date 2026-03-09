import axios from 'axios';

/**
 * API基础配置
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

/**
 * Axios实例
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 响应拦截器 - 处理认证错误
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 统一处理后端返回的错误信息
    // 优先使用后端返回的 error.response.data.message
    const errorMessage = error.response?.data?.message || error.message || '未知错误';
    
    // 将处理后的错误信息包装成一个新的 Error 对象抛出
    // 这样上层调用者（如 Thunk）捕获到的 error.message 就是具体的业务错误信息了
    const customError = new Error(errorMessage);
    // 保留原始响应对象，以便上层需要判断状态码
    (customError as any).response = error.response;
    (customError as any).status = error.response?.status;

    if ((customError as any)?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(customError);
  }
);

export default api;

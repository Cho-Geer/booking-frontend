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

// ===================== 核心：并发刷新控制变量 =====================
let isRefreshing = false; // 刷新锁：是否正在刷新 Token
let failedQueue: ((promise: Promise<any>) => void)[] = []; // 等待队列：存储待重试的请求

/**
 * 处理等待队列
 * @param error 刷新失败时的错误对象，如果刷新成功则为 null
 */
const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom(Promise.reject(error));
    } else {
      prom(Promise.resolve());
    }
  });

  failedQueue = [];
};

/**
 * 响应拦截器 - 处理认证错误
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 1. 统一处理后端返回的错误信息
    // 优先使用后端返回的 error.response.data.message
    const errorMessage = error.response?.data?.message || error.message || '未知错误';
    
    // 将处理后的错误信息包装成一个新的 Error 对象抛出
    // 这样上层调用者（如 Thunk）捕获到的 error.message 就是具体的业务错误信息了
    const customError = new Error(errorMessage);
    // 保留原始响应对象，以便上层需要判断状态码
    (customError as any).response = error.response;
    (customError as any).status = error.response?.status;

    // 2. 如果是刷新token请求本身失败，直接跳转登录，避免死循环
    if (originalRequest.url?.includes('/auth/refresh')) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(customError);
    }

    // 3. 登录、注册、发送验证码等认证接口如果返回401，说明认证失败（如验证码错误），
    // 不应该触发刷新Token逻辑，直接返回错误即可
    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/send-verification-code')
    ) {
      return Promise.reject(customError);
    }

    const skipAuthRedirect = originalRequest.headers?.['X-Skip-Auth-Redirect'] === 'true';

    // 4. 处理401错误：尝试刷新Token
    if ((customError as any).status === 401 && !originalRequest._retry && !skipAuthRedirect) {
      if (isRefreshing) {
        // 如果正在刷新，将请求加入队列等待
        return new Promise((resolve, reject) => {
          failedQueue.push((promise: Promise<any>) => {
            promise
              .then(() => {
                resolve(api(originalRequest));
              })
              .catch((err) => {
                reject(err);
              });
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 尝试刷新Token
        // 注意：refresh_token存储在HttpOnly Cookie中，会自动随请求发送
        await api.post('/auth/refresh', {});
        
        // 刷新成功，处理队列中的请求
        processQueue(null);
        
        // 重试当前请求
        return api(originalRequest);
      } catch (refreshError) {
        // 刷新失败，处理队列中的请求（全部失败）
        processQueue(refreshError);
        
        // 跳转登录页
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 5. 对于非401错误或已重试过的401错误，如果需要跳转登录
    if ((customError as any)?.status === 401 && !skipAuthRedirect && originalRequest._retry) {
       if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(customError);
  }
);

export default api;

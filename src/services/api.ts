import axios, {AxiosRequestHeaders} from 'axios';

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

const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const value = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`))
    ?.split('=')[1];
  return value ? decodeURIComponent(value) : null;
};

// ===================== 核心：并发刷新控制变量 =====================
let isRefreshing = false; // 刷新锁：是否正在刷新 Token
let failedQueue: ((promise: Promise<unknown>) => void)[] = []; // 等待队列：存储待重试的请求

/**
 * 处理等待队列
 * @param error 刷新失败时的错误对象，如果刷新成功则为 null
 */
const processQueue = (error: unknown = null) => {
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
 * 清除所有认证相关的 Cookie 和存储
 * 用于 INACTIVE/BLOCKED 用户被强制登出时
 * 注意：HttpOnly cookies (access_token, refresh_token) 无法通过 JavaScript 清除，
 * 需要后端在 logout 接口中清除，或等待其自动过期
 */
const clearAuthData = (): void => {
  if (typeof window !== 'undefined') {
    // 清除所有可通过 JavaScript 访问的 Cookie
    // 注意：HttpOnly cookies 不会被这个方法清除
    document.cookie.split('; ').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });

    // 清除 sessionStorage - 包括 CSRF token、redirect flags 等
    sessionStorage.clear();

    // 清除 localStorage 中的认证相关数据（如果有）
    // 注意：系统使用 HttpOnly cookies，所以 localStorage 中不应该有 tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
  }
};

api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCookieValue('csrf_token');
    if (csrfToken) {
      if (config.headers && typeof (config.headers as any).set === 'function') {
        (config.headers as AxiosRequestHeaders).set('X-CSRF-Token', csrfToken);
      } else {
        config.headers = {
          ...(config.headers || {}),
          'X-CSRF-Token': csrfToken,
        } as any;
      }
    }
  }
  return config;
});

/**
 * 响应拦截器 - 处理认证错误
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 1. 统一处理后端返回的错误信息
    // 优先使用后端返回的 error.response.data.message
    const errorMessage = error.response?.data?.message || error.message || '未知错误';
    
    // 将处理后的错误信息包装成一个新的 Error 对象抛出
    // 这样上层调用者（如 Thunk）捕获到的 error.message 就是具体的业务错误信息了
    const customError = new Error(errorMessage);
    // 保留原始响应对象，以便上层需要判断状态码
    (customError as any).response = error.response;
    (customError as any).status = error.response?.status;

    // 0. 处理 CSRF token 验证失败 - 这表示会话已过期，需要重新登录
    if ((customError as any).status === 403 && customError.message === 'CSRF token 验证失败') {
        // 清除所有认证数据（非 HttpOnly cookies 和 storage）
        clearAuthData();
        
        // 直接跳转到登录页面
        if (typeof window !== 'undefined') {
            // 设置标志，防止登录后立即重新初始化认证
            sessionStorage.setItem('csrfValidationFailed', 'true');
            // 添加 csrf_error 参数，用于 middleware 识别并允许访问登录页
            window.location.href = '/login?csrf_error=true';
            throw new Error('CSRF validation failed, redirecting to login');
        }
        return Promise.reject(customError);
    }

    // 1. 如果是 user is not active 错误，检查是否为 INACTIVE/BLOCKED 状态
    // 后端返回 "用户账户已被禁用" 时，说明用户状态不是 ACTIVE
    if (customError.message === '用户账户已被禁用') {
        // 清除所有认证数据（包括 Cookie、sessionStorage、localStorage）
        clearAuthData();
        
        // 跳转到账户禁用错误页面，而不是登录页
        if (typeof window !== 'undefined') {
            // 尝试从响应头或错误信息中获取具体原因（如果有）
            const userStatus = error.response?.data?.userStatus || 
                              error.response?.headers['x-user-status'] || 
                              'INACTIVE';
            
            // 存储到 sessionStorage 以便错误页面使用
            sessionStorage.setItem('accountDisabledReason', userStatus);
            
            // 跳转到专门的错误页面
            window.location.href = '/account-disabled';
            
            // 抛出错误以终止后续处理
            throw new Error(`Account disabled: ${userStatus}`);
        }
        return Promise.reject(customError);
    }

    // 1.2. 处理角色降权（ADMIN → 普通用户）
    // 后端检测到 JWT 中角色与数据库角色不一致（降权）时返回此消息
    if (customError.message === '用户角色已降级，请重新登录') {
        clearAuthData();
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('accountDisabledReason', 'ROLE_CHANGED_FROM_ADMIN');
            window.location.href = '/account-disabled?reason=ROLE_CHANGED_FROM_ADMIN';
            throw new Error('Role downgraded: redirecting to account-disabled');
        }
        return Promise.reject(customError);
    }

    // 1.3. 处理角色升权（普通用户 → ADMIN）
    // 后端检测到 JWT 中角色与数据库角色不一致（升权）时返回此消息
    if (customError.message === '用户角色已升级，请重新登录') {
        clearAuthData();
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('accountDisabledReason', 'ROLE_UPGRADED_TO_ADMIN');
            window.location.href = '/account-disabled?reason=ROLE_UPGRADED_TO_ADMIN';
            throw new Error('Role upgraded: redirecting to account-disabled');
        }
        return Promise.reject(customError);
    }
    
    // 1.5. 处理 403 权限不足错误 - 当用户角色从 ADMIN 被降级为普通用户时
    // 后端返回 "仅管理员可操作" 时，说明用户已无管理员权限
    if ((customError as any).status === 403 && customError.message === '仅管理员可操作') {
        // 清除所有认证数据
        clearAuthData();
        
        // 存储标志，表示是因为权限不足被重定向
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('accountDisabledReason', 'ROLE_CHANGED_FROM_ADMIN');
            
            // 跳转到账户禁用页面
            window.location.href = '/account-disabled?reason=ROLE_CHANGED_FROM_ADMIN';
            
            // 抛出错误以终止后续处理
            throw new Error('Access denied: Admin privileges required');
        }
        return Promise.reject(customError);
    }
    
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
      originalRequest.url?.includes('/auth/send-verification-code') ||
      originalRequest.url?.includes('/auth/logout')
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

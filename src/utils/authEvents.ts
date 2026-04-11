// 定义认证事件类型
export type AuthEventType =
  | 'UNAUTHORIZED'
  | 'ACCOUNT_DISABLED'
  | 'ROLE_CHANGED_FROM_ADMIN'
  | 'ROLE_UPGRADED_TO_ADMIN'
  | 'CSRF_VALIDATION_FAILED'
  | 'FORCE_LOGOUT';

type AuthEventHandler = (type: AuthEventType, payload?: Record<string, any>) => void;

let handler: AuthEventHandler | null = null;

export const setAuthEventHandler = (fn: AuthEventHandler) => {
  handler = fn;
};

export const emitAuthEvent = (type: AuthEventType, payload?: Record<string, any>) => {
  if (handler) {
    handler(type, payload);
  } else {
    console.warn(`[AuthEvents] Unhandled event: ${type}`);
  }
};
type NavigateFn = (url: string) => void;

let navigateFn: NavigateFn | null = null;

export const setNavigate = (fn: NavigateFn) => {
  navigateFn = fn;
};

export const navigate = (url: string) => {
  if (navigateFn) {
    navigateFn(url);
  } else {
    // 降级：仅在开发环境或守卫未挂载时使用
    window.location.href = url;
  }
};
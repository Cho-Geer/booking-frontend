# 修复注册表单邮箱验证问题

- **ID**: fix_register_email_validation
- **执行时间戳**: 2026-03-09 13:00:00 (Approximate)
- **执行内容**: 修复注册表单在邮箱为空时仍提示验证错误并阻止提交的问题。
- **修改的代码路径**:
  - `booking-frontend/src/components/molecules/RegisterForm.tsx`
- **生成的代码路径**: 无
- **实现的内容**:
  1. 优化 `emailSchema` 定义，确保空字符串被明确接受为有效值，而不会触发邮箱格式验证。
  2. 在 `useForm` 中添加 `defaultValues`，确保表单字段有初始值，避免受控/非受控组件切换问题和潜在的验证逻辑异常。
- **配置方式**: 无需额外配置，重新构建前端即可生效。
- **注意事项**: 
  - `emailSchema` 现明确允许空字符串 `""`。
  - `defaultValues` 被设置为所有字段的空字符串。

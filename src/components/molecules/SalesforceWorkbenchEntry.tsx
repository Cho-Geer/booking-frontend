import React from 'react';

/**
 * Salesforce 管理工作台入口（P0-4・RULE-16/RULE-18）
 *
 * 显示条件（MV-01 判据・F-21 §4.5）：
 * - userType !== 'admin'（role !== 'ADMIN'）→ 不渲染
 * - ADMIN 且 mappingActive === true → 有效链接（新标签页・固定 URL・无凭据）
 * - ADMIN 且 mappingActive !== true → 禁用表示（无 href・无错误消息）
 */
interface SalesforceWorkbenchEntryProps {
  /** 当前用户类型（'admin' | 'customer'・由 role === 'ADMIN' 派生） */
  userType?: string;
  /** 是否启用 Salesforce 静态操作员映射（来自 /v1/auth/profile 的 mappingActive） */
  mappingActive?: boolean;
}

const SalesforceWorkbenchEntry: React.FC<SalesforceWorkbenchEntryProps> = ({
  userType,
  mappingActive,
}) => {
  // MV-01：非管理员不渲染
  if (userType !== 'admin') {
    return null;
  }

  // 公开 URL（无凭据・RULE-18）・固定 URL・操作者特定はサーバ側のみ（RULE-12）
  const sfSiteUrl = process.env.NEXT_PUBLIC_SF_SITE_URL;
  const isEnabled = mappingActive === true && !!sfSiteUrl;

  if (isEnabled) {
    return (
      <a
        id="salesforce-workbench-link"
        href={sfSiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2 text-sm bg-primary text-white hover:bg-primary/90 focus:ring-primary"
      >
        Salesforce 管理ワークベンチ
      </a>
    );
  }

  // F-21 §4.5：禁用表示（无错误消息）
  return (
    <span
      id="salesforce-workbench-disabled"
      aria-disabled="true"
      className="inline-flex items-center justify-center font-medium rounded-md px-4 py-2 text-sm bg-gray-300 text-gray-500 cursor-not-allowed"
    >
      Salesforce 管理ワークベンチ
    </span>
  );
};

export default SalesforceWorkbenchEntry;

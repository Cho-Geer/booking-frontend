import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SalesforceWorkbenchEntry from '../SalesforceWorkbenchEntry';

const SF_SITE_URL = 'https://softcode-dev-ed.develop.my.site.com/02/login';

describe('SalesforceWorkbenchEntry', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SF_SITE_URL = SF_SITE_URL;
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SF_SITE_URL;
  });

  it('非 ADMIN（userType !== admin）时完全不渲染', () => {
    const { container } = render(
      <SalesforceWorkbenchEntry userType="customer" mappingActive />
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('Salesforce 管理ワークベンチ')).not.toBeInTheDocument();
  });

  it('ADMIN 且 mappingActive=true 时渲染有效链接（新标签页・固定 URL・无凭据）', () => {
    render(<SalesforceWorkbenchEntry userType="admin" mappingActive />);

    const link = screen.getByRole('link', { name: /Salesforce 管理ワークベンチ/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', SF_SITE_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.queryByRole('button', { name: /Salesforce 管理ワークベンチ/i })).not.toBeInTheDocument();
  });

  it('ADMIN 且 mappingActive=false 时渲染禁用表示（无链接・无错误消息）', () => {
    render(<SalesforceWorkbenchEntry userType="admin" mappingActive={false} />);

    const disabled = screen.getByText('Salesforce 管理ワークベンチ');
    expect(disabled).toBeInTheDocument();
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('link', { name: /Salesforce 管理ワークベンチ/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ADMIN 但 mappingActive 未定义（登录响应无此字段）时按禁用处理', () => {
    render(<SalesforceWorkbenchEntry userType="admin" />);

    expect(screen.queryByRole('link', { name: /Salesforce 管理ワークベンチ/i })).not.toBeInTheDocument();
    expect(screen.getByText('Salesforce 管理ワークベンチ')).toHaveAttribute('aria-disabled', 'true');
  });

  it('mappingActive=true 但 env 未配置时安全降级为禁用（不渲染破损链接）', () => {
    delete process.env.NEXT_PUBLIC_SF_SITE_URL;
    render(<SalesforceWorkbenchEntry userType="admin" mappingActive />);

    expect(screen.queryByRole('link', { name: /Salesforce 管理ワークベンチ/i })).not.toBeInTheDocument();
    expect(screen.getByText('Salesforce 管理ワークベンチ')).toHaveAttribute('aria-disabled', 'true');
  });
});

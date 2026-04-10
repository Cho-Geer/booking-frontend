import { expect, Page } from '@playwright/test';
import Redis from 'ioredis';

export interface TestUser {
  name: string;
  phoneNumber: string;
  email: string;
}

const redis = new Redis(process.env.E2E_REDIS_URL || 'redis://127.0.0.1:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createTestUser(label: string): TestUser {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`
    .slice(-8)
    .padStart(8, '0');

  return {
    name: `E2E${label.slice(0, 8)}`,
    phoneNumber: `139${suffix}`,
    email: `e2e-${label}-${suffix}@example.com`,
  };
}

export function createFutureDate(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export async function fetchVerificationCode(phoneNumber: string): Promise<string> {
  if (redis.status !== 'ready') {
    await redis.connect();
  }

  const key = `verification_code:${phoneNumber}`;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = await redis.get(key);
    if (code) {
      return code;
    }
    await sleep(500);
  }

  throw new Error(`Timed out waiting for verification code for ${phoneNumber}`);
}

export async function clearBrowserSession(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.goto('/login');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export async function registerUser(page: Page, user: TestUser): Promise<void> {
  // 在 registerUser 函数开头添加
  page.on('response', response => {
    if (response.url().includes('/auth/send-verification-code')) {
      console.log(`[API Response] ${response.status()} ${response.url()}`);
      response.text().then(body => console.log(`[API Body] ${body}`));
    }
  });
  await page.goto('/register');
  await page.getByLabel('姓名').fill(user.name);
  await page.getByLabel('手机号').fill(user.phoneNumber);
  await page.getByLabel('邮箱（选填）').fill(user.email);
  await page.getByRole('button', { name: '获取验证码' }).click();

  await expect(page.locator('#verification-code-container')).toBeVisible();

  const verificationCode = await fetchVerificationCode(user.phoneNumber);
  await page.getByLabel('验证码').fill(verificationCode);
  await page.getByRole('button', { name: '注册' }).click();

  await expect(page).toHaveURL(/\/bookings$/);
  await expect(page.locator('#booking-page-container')).toBeVisible();
}

export async function loginUser(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('手机号').fill(user.phoneNumber);
  await page.getByRole('button', { name: '获取验证码' }).click();

  await expect(page.locator('#code-input-container')).toBeVisible();

  const verificationCode = await fetchVerificationCode(user.phoneNumber);
  await page.getByLabel('验证码').fill(verificationCode);
  await page.getByRole('button', { name: '登录' }).click();

  await expect(page).toHaveURL(/\/bookings$/);
  await expect(page.locator('#booking-page-container')).toBeVisible();
}

export async function selectBookingDateAndService(
  page: Page,
  bookingDate: string,
  serviceName = '咨询服务',
): Promise<void> {
  await page.getByTestId('booking-date-input').fill(bookingDate);
  await page.getByTestId('booking-service-selector').click();
  await page.getByRole('button', { name: serviceName }).click();

  await expect
    .poll(async () => await page.getByTestId('time-slot-grid').locator('button:not([disabled])').count())
    .toBeGreaterThan(0);
}

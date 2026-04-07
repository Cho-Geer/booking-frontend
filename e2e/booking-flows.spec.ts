import { expect, test } from '@playwright/test';
import {
  clearBrowserSession,
  createFutureDate,
  createTestUser,
  loginUser,
  registerUser,
  selectBookingDateAndService,
} from './helpers/booking-e2e';

test.describe('Booking Frontend E2E', () => {
  test('user can log in with verification code', async ({ page }) => {
    const user = createTestUser('login');

    await registerUser(page, user);
    await clearBrowserSession(page);
    await loginUser(page, user);

    await expect(page.getByText('预约服务')).toBeVisible();
    await expect(page.getByTestId('booking-list')).toContainText('暂无预约记录');
  });

  test('user can query available slots for a future date', async ({ page }) => {
    const user = createTestUser('slots');
    const bookingDate = createFutureDate(2);

    await registerUser(page, user);
    await selectBookingDateAndService(page, bookingDate);

    const availableSlotButtons = page.getByTestId('time-slot-grid').locator('button:not([disabled])');
    await expect(availableSlotButtons.first()).toBeVisible();
    await expect(availableSlotButtons.first()).toContainText(/\d{2}:\d{2} - \d{2}:\d{2}/);
  });

  test('user can create a booking from the booking page', async ({ page }) => {
    const user = createTestUser('create');
    const bookingDate = createFutureDate(3);

    await registerUser(page, user);
    await selectBookingDateAndService(page, bookingDate);

    const slotButton = page.getByTestId('time-slot-grid').locator('button:not([disabled])').first();
    const slotText = (await slotButton.innerText()).split('\n')[0].trim();
    await slotButton.click();

    await expect(page.getByText('预约时间：')).toBeVisible();
    await page.getByLabel('姓名（必填）').fill(user.name);
    await page.getByLabel('手机号（必填）').fill(user.phoneNumber);
    await page.getByLabel('邮箱（选填）').fill(user.email);
    await page.getByLabel('微信（选填）').fill('booking-e2e');

    await page.getByTestId('submit-booking-button').click();
    await page.getByTestId('confirm-booking-button').click();

    await expect(page.getByTestId('booking-list')).toContainText(slotText);
    await expect(page.getByTestId('booking-list')).toContainText('待确认');
  });
});

/**
 * Regression test for the inverted-theme-ternary bug family.
 *
 * The bug: LoginPage/RegisterPage `innerClassName` applied the DARK text token
 * (`text-text-dark-primary`, #F8FAFC) in LIGHT theme, producing a ~1.00 contrast
 * ratio for the phone-number text. The existing page-level tests mocked the
 * organism away, so the inversion was invisible. These tests render the REAL
 * organisms and assert the resolved className on the card element.
 *
 * Guard design: each theme case asserts BOTH that the correct token is present
 * AND that the inverted token is absent. A swapped ternary fails the second
 * assertion even if the first one happened to pass.
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '@/components/organisms/LoginPage';
import RegisterPage from '@/components/organisms/RegisterPage';

// Mutable, mock-prefixed so the hoisted jest.mock factories may close over it.
let mockIsDark = false;

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: mockIsDark,
    theme: mockIsDark ? 'dark' : 'light',
    toggleTheme: jest.fn(),
    isMobile: false,
    viewportWidth: 1920,
  }),
}));

jest.mock('@/contexts/UIContext', () => ({
  useUI: () => ({
    uiState: {
      theme: mockIsDark ? 'dark' : 'light',
      isMobile: false,
      viewportWidth: 1920,
    },
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
  }),
}));

const DARK_TOKEN = 'text-text-dark-primary';
const LIGHT_TOKEN = 'text-gray-900';

const renderLoginPage = () =>
  render(
    <LoginPage
      onSendCode={jest.fn()}
      onVerifyCode={jest.fn()}
      loading={false}
      showCodeInput={false}
    />
  );

const renderRegisterPage = () =>
  render(
    <RegisterPage
      onSubmit={jest.fn()}
      onSendCode={jest.fn()}
      loading={false}
      showCodeInput={false}
    />
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockIsDark = false;
});

describe('LoginPage inner card theme text color (regression: inverted ternary)', () => {
  it('light theme applies the dark text token and NOT the dark-theme token', () => {
    mockIsDark = false;
    const { container } = renderLoginPage();

    const card = container.querySelector('#login-page-card');
    expect(card).not.toBeNull();

    const className = card?.className ?? '';
    expect(className).toContain(LIGHT_TOKEN);
    expect(className).not.toContain(DARK_TOKEN);
  });

  it('dark theme applies the dark-theme text token and NOT the light text token', () => {
    mockIsDark = true;
    const { container } = renderLoginPage();

    const card = container.querySelector('#login-page-card');
    expect(card).not.toBeNull();

    const className = card?.className ?? '';
    expect(className).toContain(DARK_TOKEN);
    expect(className).not.toContain(LIGHT_TOKEN);
  });
});

describe('RegisterPage inner card theme text color (regression: inverted ternary)', () => {
  it('light theme applies the dark text token and NOT the dark-theme token', () => {
    mockIsDark = false;
    const { container } = renderRegisterPage();

    const card = container.querySelector('#register-form-card');
    expect(card).not.toBeNull();

    const className = card?.className ?? '';
    expect(className).toContain(LIGHT_TOKEN);
    expect(className).not.toContain(DARK_TOKEN);
  });

  it('dark theme applies the dark-theme text token and NOT the light text token', () => {
    mockIsDark = true;
    const { container } = renderRegisterPage();

    const card = container.querySelector('#register-form-card');
    expect(card).not.toBeNull();

    const className = card?.className ?? '';
    expect(className).toContain(DARK_TOKEN);
    expect(className).not.toContain(LIGHT_TOKEN);
  });
});

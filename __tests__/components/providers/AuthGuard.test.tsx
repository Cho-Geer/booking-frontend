import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthGuard } from '@/components/providers/AuthGuard';

const mockRouterState = {
  pathname: '/login',
  replace: jest.fn(),
  push: jest.fn(),
  events: { on: jest.fn(), off: jest.fn() },
};

type MockUserState = {
  currentUser: null | { userType: 'customer' | 'admin'; status: 'ACTIVE' };
  authInitialized: boolean;
};

let mockUserState: MockUserState = { currentUser: null, authInitialized: true };

jest.mock('next/compat/router', () => ({
  useRouter: () => mockRouterState,
}));

// Keep FullScreenLoading real (so we assert its real DOM) but stub the theme
// dependency, which would otherwise require a full UIProvider + matchMedia.
jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false, theme: 'light', toggleTheme: jest.fn() }),
}));

jest.mock('react-redux', () => ({
  useSelector: (selector: (state: { user: MockUserState }) => unknown) =>
    selector({ user: mockUserState }),
  useDispatch: () => jest.fn(),
}));

const renderGuard = () =>
  render(
    <AuthGuard>
      <div data-testid="child-sentinel">CHILD</div>
    </AuthGuard>
  );

describe('AuthGuard full-screen loading branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouterState.pathname = '/login';
    mockUserState = { currentUser: null, authInitialized: true };
  });

  it('renders FullScreenLoading and not children when currentUser is set on a public path', () => {
    mockRouterState.pathname = '/login';
    mockUserState = {
      currentUser: { userType: 'customer', status: 'ACTIVE' },
      authInitialized: true,
    };

    renderGuard();

    expect(screen.getByText('正在进入系统...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('child-sentinel')).not.toBeInTheDocument();
  });

  it('covers the same redirect-pending path for /register and redirects to a non-public destination', () => {
    mockRouterState.pathname = '/register';
    mockUserState = {
      currentUser: { userType: 'customer', status: 'ACTIVE' },
      authInitialized: true,
    };

    renderGuard();

    expect(screen.getByText('正在进入系统...')).toBeInTheDocument();
    expect(screen.queryByTestId('child-sentinel')).not.toBeInTheDocument();
    // The initial-route-protection effect must push a logged-in user off the
    // public path onto a non-public destination.
    expect(mockRouterState.replace).toHaveBeenCalledWith('/bookings');
  });

  it('renders FullScreenLoading and not children when auth is not yet initialized on a protected path', () => {
    mockRouterState.pathname = '/bookings';
    mockUserState = { currentUser: null, authInitialized: false };

    renderGuard();

    expect(screen.getByText('初始化中...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('child-sentinel')).not.toBeInTheDocument();
  });

  it('renders nothing when there is no currentUser on a protected path', () => {
    mockRouterState.pathname = '/bookings';
    mockUserState = { currentUser: null, authInitialized: true };

    const { container } = renderGuard();

    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId('child-sentinel')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('redirects a logged-in customer off "/" instead of spinning forever', () => {
    mockRouterState.pathname = '/';
    mockUserState = {
      currentUser: { userType: 'customer', status: 'ACTIVE' },
      authInitialized: true,
    };

    renderGuard();

    // The loading state that precedes the redirect.
    expect(screen.getByText('正在验证身份...')).toBeInTheDocument();
    expect(screen.queryByTestId('child-sentinel')).not.toBeInTheDocument();
    expect(mockRouterState.replace).toHaveBeenCalledWith('/bookings');
    expect(mockRouterState.replace).toHaveBeenCalledTimes(1);
  });

  it('redirects a logged-in admin off "/" to the admin destination', () => {
    mockRouterState.pathname = '/';
    mockUserState = {
      currentUser: { userType: 'admin', status: 'ACTIVE' },
      authInitialized: true,
    };

    renderGuard();

    expect(mockRouterState.replace).toHaveBeenCalledWith('/admin/bookings');
    expect(mockRouterState.replace).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('child-sentinel')).not.toBeInTheDocument();
  });
});

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/store';
import { initializeAuth } from '@/store/userSlice';
import { RootState } from '@/store';

/**
 * Custom hook for handling authentication initialization
 * Provides enhanced handling for the scenario where refreshToken exists but accessToken is missing
 */
export const useAuthInitialization = () => {
  const dispatch = useAppDispatch();
  const { authInitialized, isAuthenticated, currentUser } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Log current authentication state for debugging
    console.log('Auth Initialization Check:', {
      hasUserData: currentUser !== null,
      isAuthenticated,
      authInitialized
    });

    // Dispatch initializeAuth which handles authentication properly
    dispatch(initializeAuth());
  }, []);

  return {
    authInitialized,
    isAuthenticated,
    currentUser,
    isInitializing: !authInitialized
  };
};
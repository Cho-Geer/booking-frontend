import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/store';
import { initializeAuth } from '@/store/userSlice';
import { RootState } from '@/store';

/**
 * Custom hook for handling authentication initialization
 * Provides enhanced handling for the scenario where refreshToken exists but accessToken is missing
 * @param shouldInitialize - Whether to actually perform the initialization (default: true)
 */
export const useAuthInitialization = (shouldInitialize: boolean = true) => {
  const dispatch = useAppDispatch();
  const { authInitialized, isAuthenticated, currentUser } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Only initialize if shouldInitialize is true and we're on the client side
    if (!shouldInitialize || typeof window === 'undefined') {
      return;
    }

    // Dispatch initializeAuth which handles authentication properly
    dispatch(initializeAuth());
  }, [shouldInitialize, dispatch]);

  return {
    authInitialized,
    isAuthenticated,
    currentUser,
    isInitializing: !authInitialized
  };
};
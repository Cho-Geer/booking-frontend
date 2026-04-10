import React from 'react';

interface AuthLoadingProps {
  message?: string;
}

/**
 * Loading component displayed during authentication initialization
 * Handles the scenario where refreshToken exists but accessToken is missing
 */
export const AuthLoading: React.FC<AuthLoadingProps> = ({ 
  message = 'Initializing authentication...' 
}) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Checking authentication status...
        </p>
      </div>
    </div>
  );
};
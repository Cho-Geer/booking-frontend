import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Spinner from '@/components/atoms/Spinner';

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const { currentUser, authInitialized } = useSelector((state: RootState) => state.user);

    if (!authInitialized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Spinner text="正在验证身份..." size="md" />
        </div>
      );
    }

    if (!currentUser) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

export default withAuth;
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Spinner from '@/components/atoms/Spinner';

export function withAdmin<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAdminComponent(props: P) {
    const { currentUser, authInitialized } = useSelector((state: RootState) => state.user);

    if (!authInitialized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Spinner text="正在验证权限..." size="md" />
        </div>
      );
    }

    if (!currentUser || currentUser.userType !== 'admin') {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

export default withAdmin;
import { useEffect, useState } from 'react';
import Router from 'next/router';

export const useRouteChangeLoading = (): boolean => {
  const [isNavigating, setIsNavigating] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const start = () => setIsNavigating(true);
    const done = () => setIsNavigating(false);
    Router.events.on('routeChangeStart', start);
    Router.events.on('routeChangeComplete', done);
    Router.events.on('routeChangeError', done);
    return () => {
      Router.events.off('routeChangeStart', start);
      Router.events.off('routeChangeComplete', done);
      Router.events.off('routeChangeError', done);
    };
  }, []);
  return isNavigating;
};

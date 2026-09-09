import React from 'react';
import FullScreenLoading from '@/components/atoms/FullScreenLoading';
import { useRouteChangeLoading } from '@/hooks/useRouteChangeLoading';

export const RouteChangeOverlay: React.FC = () => {
  const isNavigating = useRouteChangeLoading();
  if (!isNavigating) return null;
  return <FullScreenLoading message="加载中..." />;
};
export default RouteChangeOverlay;

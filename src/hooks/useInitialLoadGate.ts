import { useEffect, useRef, useState } from 'react';

export const useInitialLoadGate = (loadingFlags: boolean[]): boolean => {
  const [settled, setSettled] = useState(false);
  const settledRef = useRef(false);
  const observedLoadingRef = useRef(false);

  useEffect(() => {
    if (settledRef.current) return;
    if (loadingFlags.some(Boolean)) {
      observedLoadingRef.current = true;
      return;
    }
    if (observedLoadingRef.current) {
      settledRef.current = true;
      setSettled(true);
      return;
    }
    // No loading observed yet. Sibling effects dispatch thunks in the same commit,
    // so this render's closure may still hold the pre-dispatch values.
    // Re-check on the next macrotask before deciding there is nothing to wait for.
    const timer = setTimeout(() => {
      if (!settledRef.current && !observedLoadingRef.current) {
        settledRef.current = true;
        setSettled(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [loadingFlags]);

  return !settled;
};

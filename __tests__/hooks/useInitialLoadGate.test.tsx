import { renderHook, act } from '@testing-library/react';
import { useInitialLoadGate } from '@/hooks/useInitialLoadGate';

const flushMacrotask = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

describe('useInitialLoadGate', () => {
  it('starts true when a flag is already true, then flips to false after all flags go false', async () => {
    const { result, rerender } = renderHook(
      ({ flags }: { flags: boolean[] }) => useInitialLoadGate(flags),
      { initialProps: { flags: [true, false] } }
    );

    expect(result.current).toBe(true);

    rerender({ flags: [false, false] });
    await flushMacrotask();

    expect(result.current).toBe(false);
  });

  it('settles to false after the macrotask when mounted with all flags false', async () => {
    const { result } = renderHook(() => useInitialLoadGate([false, false]));

    // Before the macrotask it still reports loading, giving sibling effects
    // (which dispatch thunks in the same commit) a chance to flip a flag.
    expect(result.current).toBe(true);

    await flushMacrotask();

    expect(result.current).toBe(false);
  });

  it('does not flip back to true on a later loading cycle after settling', async () => {
    const { result, rerender } = renderHook(
      ({ flags }: { flags: boolean[] }) => useInitialLoadGate(flags),
      { initialProps: { flags: [false] } }
    );

    await flushMacrotask();
    expect(result.current).toBe(false);

    // A later load (e.g. date change / tab switch) must not re-trigger the gate.
    rerender({ flags: [true] });
    expect(result.current).toBe(false);

    rerender({ flags: [false] });
    await flushMacrotask();
    expect(result.current).toBe(false);
  });
});

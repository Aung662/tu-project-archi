import { Spinner } from '@/components/ui';

/**
 * Root route-level loading UI, shown by Next.js during navigation/suspense for
 * any segment that doesn't define its own loading.tsx.
 */
export default function Loading() {
  return <Spinner />;
}

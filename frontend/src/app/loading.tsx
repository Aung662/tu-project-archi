import { Skeleton, SkeletonList } from '@/components/ui';

/**
 * Root route-level loading UI, shown by Next.js during navigation/suspense for
 * any segment that doesn't define its own loading.tsx. A lightweight page-shaped
 * skeleton (heading + card grid) reads as more polished than a bare spinner and
 * hints at the content that's arriving.
 */
export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <SkeletonList count={6} />
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useBookmarks } from '@/context/BookmarksContext';

/**
 * Heart toggle to save/unsave a project. When signed out it routes to login.
 * `stopPropagation` so it works inside a clickable project card.
 */
export function BookmarkButton({
  projectId,
  className = '',
  showLabel = false,
}: {
  projectId: string;
  className?: string;
  showLabel?: boolean;
}) {
  const { user } = useAuth();
  const { isBookmarked, toggle } = useBookmarks();
  const router = useRouter();
  const saved = isBookmarked(projectId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          router.push(`/login?next=/projects/${projectId}`);
          return;
        }
        void toggle(projectId);
      }}
      aria-pressed={saved}
      aria-label={saved ? 'Remove bookmark' : 'Save project'}
      title={saved ? 'Saved — click to remove' : 'Save to My Library'}
      className={`inline-flex items-center gap-1.5 rounded-full transition ${
        saved ? 'text-rose-400' : 'text-slate-400 hover:text-rose-300'
      } ${className}`}
    >
      <span className="text-lg leading-none">{saved ? '♥' : '♡'}</span>
      {showLabel && <span className="text-sm font-medium">{saved ? 'Saved' : 'Save'}</span>}
    </button>
  );
}

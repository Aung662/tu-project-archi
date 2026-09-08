'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

interface BookmarksState {
  ids: Set<string>;
  isBookmarked: (projectId: string) => boolean;
  toggle: (projectId: string) => Promise<void>;
  ready: boolean;
}

const BookmarksContext = createContext<BookmarksState | undefined>(undefined);

/**
 * Tracks the signed-in user's bookmarked project ids app-wide so any card can
 * render the correct saved/unsaved state without refetching. Loads on login,
 * clears on logout.
 */
export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      setReady(true);
      return;
    }
    api
      .get<string[]>('/bookmarks/ids')
      .then((list) => setIds(new Set(list)))
      .catch(() => setIds(new Set()))
      .finally(() => setReady(true));
  }, [user]);

  const isBookmarked = useCallback((projectId: string) => ids.has(projectId), [ids]);

  const toggle = useCallback(
    async (projectId: string) => {
      const has = ids.has(projectId);
      // Optimistic update, revert on error.
      setIds((prev) => {
        const next = new Set(prev);
        has ? next.delete(projectId) : next.add(projectId);
        return next;
      });
      try {
        if (has) await api.del(`/bookmarks/${projectId}`);
        else await api.post(`/bookmarks/${projectId}`);
      } catch {
        setIds((prev) => {
          const next = new Set(prev);
          has ? next.add(projectId) : next.delete(projectId);
          return next;
        });
      }
    },
    [ids],
  );

  return (
    <BookmarksContext.Provider value={{ ids, isBookmarked, toggle, ready }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarks must be used within BookmarksProvider');
  return ctx;
}

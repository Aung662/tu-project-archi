'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

/**
 * A one-per-session animated welcome. Two 3D-style cartoon greeters float in,
 * wave, and sparkle — then the user can dismiss it (or it auto-hides).
 *
 * Design notes:
 * - Shown ONCE per browser session (sessionStorage) so it delights on arrival
 *   without nagging on every navigation.
 * - Randomly picks one of two character renders each session.
 * - Uses framer-motion only (no heavy 3D engine / external assets), so it works
 *   inside the sandboxed preview and stays lightweight for a thesis project.
 * - Fully dismissible + Esc to close + respects the backdrop click.
 */
const SESSION_KEY = 'tu-welcomed';
const IMAGES = ['/welcome-couple-1.png', '/welcome-couple-2.png'];

export function WelcomeOverlay() {
  const [show, setShow] = useState(false);
  const { user } = useAuth();

  // Choose a character render once per mount.
  const img = useMemo(() => IMAGES[Math.floor(Math.random() * IMAGES.length)], []);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        setShow(true);
        sessionStorage.setItem(SESSION_KEY, '1');
      }
    } catch {
      // sessionStorage blocked (private mode) — just skip the greeting.
    }
  }, []);

  // Auto-dismiss after a while + allow Esc.
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShow(false);
    window.addEventListener('keydown', onKey);
    const timer = setTimeout(() => setShow(false), 9000);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(timer);
    };
  }, [show]);

  const greeting = user ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Welcome to TU Archive!';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShow(false)}
          aria-modal="true"
          role="dialog"
          aria-label="Welcome"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-ink-800/90 to-ink-900/95 p-6 text-center shadow-2xl"
            initial={{ scale: 0.8, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sparkles */}
            {SPARKLES.map((s, i) => (
              <motion.span
                key={i}
                className="pointer-events-none absolute text-lg"
                style={{ left: s.left, top: s.top }}
                initial={{ scale: 0, opacity: 0, rotate: 0 }}
                animate={{ scale: [0, 1, 0.6, 1], opacity: [0, 1, 0.7, 1], rotate: 360 }}
                transition={{ duration: 2.4, delay: 0.4 + i * 0.18, repeat: Infinity, repeatDelay: 1.2 }}
                aria-hidden
              >
                ✨
              </motion.span>
            ))}

            {/* Character render — gentle float + entrance */}
            <motion.div
              className="mx-auto mb-2 w-full"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 120, damping: 14 }}
            >
              <motion.img
                src={img}
                alt="Two students waving hello"
                className="mx-auto h-56 w-auto object-contain drop-shadow-[0_10px_30px_rgba(99,102,241,0.35)]"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            <motion.h2
              className="text-2xl font-extrabold text-gradient"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {greeting}
            </motion.h2>
            <motion.p
              className="mt-2 text-sm leading-relaxed text-slate-300"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.65 }}
            >
              Search past projects, check your title for duplicates, and explore the archive.
              Let’s find something great together!
            </motion.p>

            <motion.button
              type="button"
              onClick={() => setShow(false)}
              className="btn-primary mt-5 w-full py-3"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Let’s go →
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const SPARKLES = [
  { left: '8%', top: '12%' },
  { left: '86%', top: '18%' },
  { left: '14%', top: '46%' },
  { left: '90%', top: '52%' },
  { left: '50%', top: '6%' },
];

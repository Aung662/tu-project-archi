'use client';

/**
 * Global error boundary — the last line of defense. It replaces the root layout
 * when an error is thrown in the layout itself, so it must render its own
 * <html>/<body>. Kept dependency-free and inline-styled (globals.css may not be
 * present in this fallback tree).
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, sans-serif',
          background: '#f8fafc',
          color: '#1e293b',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: 420 }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>An unexpected error occurred</p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#1a5be0',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

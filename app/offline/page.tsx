'use client';

export default function OfflinePage() {
  return (
    <html>
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'IranYekan, system-ui, sans-serif',
          direction: 'rtl',
          gap: '16px',
          padding: '24px',
          textAlign: 'center',
          background: '#fff',
          color: '#111',
        }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='64'
          height='64'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          style={{ opacity: 0.4 }}
        >
          <line x1='2' y1='2' x2='22' y2='22' />
          <path d='M8.5 16.5a5 5 0 0 1 7 0' />
          <path d='M2 8.82a15 15 0 0 1 4.17-2.65' />
          <path d='M10.66 5c4.01-.36 8.14.9 11.34 3.76' />
          <path d='M16.85 11.25a10 10 0 0 1 2.22 1.68' />
          <path d='M5 12.03a10 10 0 0 1 5.17-2.8' />
          <line x1='12' y1='20' x2='12.01' y2='20' />
        </svg>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
          اتصال اینترنت برقرار نیست
        </h1>
        <p style={{ fontSize: '1rem', opacity: 0.6, margin: 0, maxWidth: '360px' }}>
          لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '8px',
            padding: '10px 28px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            background: '#111',
            color: '#fff',
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          تلاش مجدد
        </button>
      </body>
    </html>
  );
}

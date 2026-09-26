import { SentryNotFoundReporter } from '@/components/sentry-not-found-reporter';

export default function RootNotFound() {
  return (
    <html>
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '50vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}
        >
          <SentryNotFoundReporter />
          <h1>404</h1>
          <p>Page not found</p>
          <a href='/'>Home</a>
        </div>
      </body>
    </html>
  );
}

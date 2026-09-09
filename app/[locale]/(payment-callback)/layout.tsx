/** Payment gateway return route — no dashboard auth (installment recipients may be cookieless). */
export default function PaymentCallbackLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-dvh flex-col items-center justify-center bg-background p-6'>
      {children}
    </div>
  );
}

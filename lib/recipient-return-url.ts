/** Merchant `returnUrl` from /recipient — survives the payment-gateway round-trip. */
export const RECIPIENT_RETURN_URL_KEY = 'recipientReturnUrl';

export function getRecipientReturnUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(RECIPIENT_RETURN_URL_KEY);
  } catch {
    return null;
  }
}

export function setRecipientReturnUrl(returnUrl: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RECIPIENT_RETURN_URL_KEY, returnUrl);
  } catch {
    // ignore quota / private-mode failures
  }
}

export function clearRecipientReturnUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECIPIENT_RETURN_URL_KEY);
  } catch {
    // ignore
  }
}

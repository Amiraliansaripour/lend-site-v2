import {
  MerchantSignupBanner,
  MerchantSignupForm,
  MerchantSignupProcess,
} from '@/components/page/merchant-signup';

export default function MerchantSignupPage() {
  return (
    <>
      <MerchantSignupBanner />
      <MerchantSignupProcess />
      <MerchantSignupForm />
    </>
  );
}

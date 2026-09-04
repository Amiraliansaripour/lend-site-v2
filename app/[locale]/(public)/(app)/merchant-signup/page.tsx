import {
  MerchantSignupBanner,
  MerchantSignupForm,
  MerchantSignupProcess,
} from '@/components/page/merchant-signup';

export default function MerchantSignupPage() {
  return (
    <div className='bg-boom-surface'>
      <MerchantSignupBanner />
      <MerchantSignupProcess />
      <MerchantSignupForm />
    </div>
  );
}

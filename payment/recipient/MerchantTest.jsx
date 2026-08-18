import { useState, useEffect } from 'react';
import MerchantLogin from '../../components/newui/recipient/MerchantLogin';
import MerchantCreateOrder from '../../components/newui/recipient/MerchantCreateOrder';

const MerchantTest = () => {
  const [userLogged, setUserLogged] = useState(false);
  const merchantToken = localStorage.getItem('merchantToken');

  useEffect(() => {
    if (merchantToken) {
      setUserLogged(true);
    }
  }, [merchantToken]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6'>
      <div className='max-w-2xl mx-auto px-4'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>پنل تست فروشنده</h1>
          <p className='text-gray-600'>ایجاد و مدیریت سفارشات پرداخت</p>
        </div>

        {!userLogged ? (
          <MerchantLogin setUserLogged={setUserLogged} />
        ) : (
          <div className='space-y-6'>
            <MerchantCreateOrder setUserLogged={setUserLogged} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantTest;

import axios from 'axios';
import React, { use, useState } from 'react';
import toast from 'react-hot-toast';
import { FaMoneyBill } from 'react-icons/fa';
import { FaPerson } from 'react-icons/fa6';

const MerchantCreateOrder = ({ setUserLogged }) => {
  const [loading, setLoading] = useState();
  const [error, setError] = useState();
  const [link, setLink] = useState(null);
  const [formData, setFormData] = useState({
    nationalcode: '',
    amount: '',
  });

  const CreateOrder = async e => {
    e.preventDefault();
    try {
      const merchantToken = localStorage.getItem('merchantToken');
      const payload = {
        nationalcode: formData.nationalcode,
        amount: formData.amount,
        IsOnline: true,
      };
      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_API}/api/v1/WalletReport/GetOrderId`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${merchantToken}`,
          },
        },
      );
      toast.success('سفارش ساخته شد');
      let merchantId = data.data.id;
      let orderId = data.data.orderId;
      let baseUrl = window.location.origin; // Use current domain
      let redirectAddress = `${baseUrl}/payment/verify`;

      setLink(
        `${baseUrl}/recipient?amount=${formData.amount}&merchantId=${merchantId}&orderId=${orderId}&description=خریدکالا&returnUrl=${redirectAddress}`,
      );
    } catch (err) {
      console.log(err);
      if (err.status === 401) {
        localStorage.removeItem('merchantToken');
        setUserLogged(false);
      }
    }
  };
  const formatNumber = num => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleInputChange = e => {
    const { name, value } = e.target;

    if (name === 'amount') {
      // Remove all non-numeric characters except commas for processing
      const numericValue = value.replace(/[^\d]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    setError('');
  };
  return (
    <div className=' flex items-center justify-center px-2 sm:px-4 py-6 sm:py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
      <div className='max-w-md w-full space-y-6 sm:space-y-8 mx-2 sm:mx-0'>
        <form className='mt-8 space-y-6 animate-fadeInUp' onSubmit={CreateOrder}>
          <div className='bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-white/30'>
            <div className='space-y-6'>
              <div>
                <label
                  htmlFor='nationalcode'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  کدملی
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <FaPerson className='h-5 w-5 text-gray-400 z-10' />
                  </div>
                  <input
                    id='nationalcode'
                    name='nationalcode'
                    type='text'
                    dir='ltr'
                    required
                    value={formData.nationalcode}
                    onChange={handleInputChange}
                    className='appearance-none relative block w-full px-4 py-3 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg'
                  />
                </div>
              </div>
              <div>
                <label htmlFor='amount' className='block text-sm font-medium text-gray-700 mb-2'>
                  قیمت (ریال)
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <FaMoneyBill className='h-5 w-5 text-gray-400 z-10' />
                  </div>
                  <input
                    id='amount'
                    name='amount'
                    type='text'
                    dir='ltr'
                    required
                    value={formData.amount ? formatNumber(formData.amount) : ''}
                    onChange={handleInputChange}
                    className='appearance-none relative block w-full px-4 py-3 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg'
                  />
                </div>
              </div>
              {/* <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  آدرس کالبک
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaAddressBook className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="address" name="address" type="text" dir="ltr" required value={formData.address || ""} onChange={handleInputChange} className="appearance-none relative block w-full px-4 py-3 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg" />
                </div>
              </div> */}

              {/* Captcha Field */}

              {error && (
                <div className='bg-red-50 border border-red-200 rounded-xl p-4 animate-shake'>
                  <p className='text-red-700 text-sm font-medium'>{error}</p>
                </div>
              )}
              {link && (
                <div className='bg-red-50 border border-red-200 rounded-xl p-4 animate-shake'>
                  <a className='text-red-700 text-sm font-medium' href={link}>
                    {link}
                  </a>
                </div>
              )}

              <button
                type={link ? 'button' : 'submit'}
                disabled={loading}
                onClick={link ? () => window.open(link, '_blank') : undefined}
                className='
                        group relative w-full overflow-hidden
                        bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 
                        hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600
                        text-white font-bold py-4 px-6 rounded-xl 
                        shadow-2xl hover:shadow-3xl
                        transform hover:scale-[1.02] active:scale-[0.98]
                        transition-all duration-300
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                      '
              >
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>

                {loading ? (
                  <div className='flex items-center justify-center relative z-10'>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3'></div>
                    <span>در حال ارسال...</span>
                  </div>
                ) : (
                  <div className='flex items-center justify-center relative z-10'>
                    <span>{link ? 'برو به صفحه پرداخت' : 'ساخت سفارش'}</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantCreateOrder;

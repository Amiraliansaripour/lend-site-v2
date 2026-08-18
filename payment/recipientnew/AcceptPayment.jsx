import { useState, useEffect } from 'react';
import {
  FaArrowLeft,
  FaShieldAlt,
  FaStore,
  FaReceipt,
  FaWallet,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import axiosInstance from '../../../api/axiosInstance';

const AcceptPayment = ({ paymentData, onBack }) => {
  const [merchantInfo, setMerchantInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (paymentData?.merchantId) {
      fetchMerchantInfo();
    }
  }, [paymentData]);

  const fetchMerchantInfo = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(`api/v1/Merchant/Get/${paymentData.merchantId}`);

      if (response.data) {
        const merchantData = response.data.data;
        setMerchantInfo({
          id: merchantData.id,
          name: merchantData.name || 'نام فروشگاه',
          enName: merchantData.enName,
          description: merchantData.pgMs?.[0]?.productCategoryName || 'فروشگاه آنلاین',
          logo:
            merchantData.logo ||
            (merchantData.logoPath && merchantData.logoPath !== 'string'
              ? merchantData.logoPath
              : '/img/shop.png'),
          website: merchantData.url || merchantData.callbackUrl,
          verified: merchantData.isActive || false,
          status: merchantData.status,
          address: merchantData.merchantDetail?.address,
          landline: merchantData.merchantDetail?.landline,
          category: merchantData.pgMs?.[0]?.productCategoryName,
          username: merchantData.username,
          priority: merchantData.priority,
          rating: 0, // Not provided in API
          totalTransactions: 0, // Not provided in API
        });
      } else {
        // Fallback if API response structure is different
        setMerchantInfo({
          id: paymentData.merchantId,
          name: 'فروشنده',
          verified: false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch merchant info:', error);
      setMerchantInfo({
        id: paymentData.merchantId,
        name: 'فروشنده',
        verified: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError('');
      const paymentRequest = {
        IsOnline: true,
        orderId: paymentData.orderId,
        freezAmount: Number(paymentData.amount),
      };
      const { data } = await axiosInstance.post(`api/v1/WalletReport/FreezRequest`, paymentRequest);
      // console.log(data);
      if (data.resultMessage === 'OK') {
        setSuccess(true);
        if (paymentData.returnUrl) {
          setTimeout(() => {
            window.location.href = `${paymentData.returnUrl}?status=success&orderId=${data.orderId}`;
          }, 3000);
        }
      } else {
        setError(data.resultMessage || 'پرداخت ناموفق بود');
      }
    } catch (error) {
      setError(error?.response?.data?.message || 'تراکنش مورد نظر پرداخت شده است یا وجود ندارد.');
      console.error('Payment failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-2 sm:px-4'>
        <div className='max-w-md w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-8 text-center border border-white/20 animate-fadeIn mx-2'>
          <div className='mx-auto h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mb-4 sm:mb-6 animate-bounce'>
            <FaCheckCircle className='h-8 w-8 sm:h-10 sm:w-10 text-white animate-pulse' />
          </div>
          <h2 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2 sm:mb-3'>
            پرداخت موفق
          </h2>
          <p className='text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg'>
            پرداخت شما با موفقیت انجام شد
          </p>

          <div className='bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200/50'>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 space-y-1 sm:space-y-0'>
              <span className='text-gray-600 font-medium text-sm sm:text-base'>مبلغ:</span>
              <span className='font-bold text-lg sm:text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'>
                {Number(paymentData?.amount).toLocaleString()} ریال
              </span>
            </div>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0'>
              <span className='text-gray-600 font-medium text-sm sm:text-base'>فروشنده:</span>
              <span className='font-medium text-gray-800 text-sm sm:text-base'>
                {merchantInfo?.name}
              </span>
            </div>
          </div>

          <div className='flex items-center justify-center space-x-2 space-x-reverse'>
            <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
            <p className='text-xs sm:text-sm text-gray-500 text-center'>
              {paymentData.returnUrl
                ? 'در حال انتقال به فروشگاه...'
                : 'می‌توانید این صفحه را ببندید'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 sm:py-8 lg:py-12 px-2 sm:px-4'>
      <div className='max-w-2xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6 sm:mb-8 animate-fadeInDown'>
          <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'>
            تأیید پرداخت
          </h1>
          <button
            onClick={onBack}
            className='flex items-center text-gray-600 hover:text-gray-900 mr-2 sm:mr-4 bg-white/70 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'
          >
            <FaArrowLeft className='h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2' />
            <span className='text-sm sm:text-base'>بازگشت</span>
          </button>
        </div>

        <div className='grid gap-4 sm:gap-6 animate-fadeInUp'>
          <div className='bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]'>
            <div className='flex items-center mb-4 sm:mb-6'>
              <div className='p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg'>
                <FaStore className='h-5 w-5 sm:h-6 sm:w-6 text-white' />
              </div>
              <h2 className='text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mr-3 sm:mr-4'>
                اطلاعات فروشنده
              </h2>
            </div>

            {loading ? (
              <div className='flex items-center justify-center py-8 sm:py-12'>
                <div className='relative'>
                  <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-blue-200 animate-spin border-t-blue-600'></div>
                  <div className='absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-transparent border-t-purple-600 animate-ping'></div>
                </div>
              </div>
            ) : (
              <div className='flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6 sm:space-x-reverse'>
                <div className='relative group flex-shrink-0'>
                  <img
                    src={merchantInfo?.logo || '/img/shop.png'}
                    alt='فروشنده'
                    className='w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-lg group-hover:scale-110 transition-transform duration-300'
                  />
                  <div className='absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex flex-col sm:flex-row sm:items-center mb-2'>
                    <h3 className='text-lg sm:text-xl font-bold text-gray-900 truncate'>
                      {merchantInfo?.name || 'در حال بارگذاری...'}
                    </h3>
                    {merchantInfo?.verified && (
                      <div className='mt-1 sm:mt-0 sm:mr-3 p-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse self-start sm:self-auto'>
                        <FaShieldAlt
                          className='h-3 w-3 sm:h-4 sm:w-4 text-white'
                          title='تأیید شده'
                        />
                      </div>
                    )}
                  </div>
                  {merchantInfo?.description && (
                    <p className='text-gray-600 mb-3 leading-relaxed text-sm sm:text-base'>
                      {merchantInfo.description}
                    </p>
                  )}
                  {/* {merchantInfo?.rating && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
                      <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 px-2 sm:px-3 py-1 rounded-full">
                        <span className="text-white font-bold text-xs sm:text-sm">⭐ {merchantInfo.rating}/5</span>
                      </div>
                      <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-2 sm:px-3 py-1 rounded-full">
                        <span className="text-blue-800 font-medium text-xs sm:text-sm">{merchantInfo.totalTransactions?.toLocaleString("fa")} تراکنش</span>
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className='bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]'>
            <div className='flex items-center mb-4 sm:mb-6'>
              <div className='p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg'>
                <FaReceipt className='h-5 w-5 sm:h-6 sm:w-6 text-white' />
              </div>
              <h2 className='text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mr-3 sm:mr-4'>
                جزئیات پرداخت
              </h2>
            </div>

            <div className='space-y-4 sm:space-y-6'>
              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50 space-y-2 sm:space-y-0'>
                <span className='text-gray-700 font-medium text-base sm:text-lg'>
                  مبلغ قابل پرداخت:
                </span>
                <span className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent animate-pulse'>
                  {Number(paymentData?.amount).toLocaleString('fa')} ریال
                </span>
              </div>

              {paymentData?.orderId && (
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50 space-y-1 sm:space-y-0'>
                  <span className='text-gray-700 font-medium text-sm sm:text-base'>
                    شماره سفارش:
                  </span>
                  <span className='font-mono bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold text-sm sm:text-base break-all'>
                    {paymentData?.orderId}
                  </span>
                </div>
              )}

              {paymentData?.description && (
                <div className='p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200/50'>
                  <span className='text-gray-700 font-medium block mb-2 text-sm sm:text-base'>
                    توضیحات:
                  </span>
                  <p className='text-gray-800 leading-relaxed text-sm sm:text-base'>
                    {paymentData?.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Wallet */}
          {/* <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <FaWallet className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mr-3 sm:mr-4">
                <span>{selectedWallet?.displayLabel || (selectedWallet?.cachId ? "کیف پول نقدی" : "کیف پول اعتباری")}</span>
            
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-xl border border-purple-200/50 hover:shadow-lg transition-all duration-300 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <FaWallet className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{selectedWallet?.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-mono truncate">{selectedWallet?.accountNumber}</p>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-bold text-lg sm:text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{selectedWallet?.displayBalance ? selectedWallet.displayBalance.toLocaleString("fa") : selectedWallet?.cachId ? selectedWallet?.cach?.toLocaleString("fa") : selectedWallet?.credit?.toLocaleString("fa")} ریال</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">موجودی فعلی</p>
              </div>
            </div>
          </div> */}

          {/* Error Message */}
          {error && (
            <div className='bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4 sm:p-6 flex items-center shadow-lg animate-shake'>
              <div className='p-2 bg-gradient-to-r from-red-400 to-pink-400 rounded-full mr-3 sm:mr-4 flex-shrink-0'>
                <FaExclamationTriangle className='h-4 w-4 sm:h-5 sm:w-5 text-white' />
              </div>
              <p className='text-red-700 font-medium text-sm sm:text-base'>{error}</p>
            </div>
          )}

          {/* Payment Button */}
          <div className='bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20'>
            <button
              onClick={handlePayment}
              disabled={processing}
              className='
                w-full relative overflow-hidden
                bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 
                hover:from-green-600 hover:via-emerald-600 hover:to-teal-600
                text-white font-bold py-4 sm:py-5 lg:py-6 px-6 sm:px-8 rounded-2xl 
                shadow-2xl hover:shadow-3xl
                transform hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                group
              '
            >
              {/* Button Background Animation */}
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>

              {processing ? (
                <div className='flex items-center justify-center relative z-10'>
                  <div className='w-5 h-5 sm:w-6 sm:h-6 border-3 border-white/30 border-t-white rounded-full animate-spin ml-2 sm:ml-3'></div>
                  <span className='text-base sm:text-lg'>در حال پردازش...</span>
                </div>
              ) : (
                <span className='text-lg sm:text-xl font-bold relative z-10'>
                  💳 پرداخت {Number(paymentData.amount).toLocaleString()} ریال
                </span>
              )}
            </button>

            <div className='mt-4 sm:mt-6 text-center'>
              <p className='text-xs sm:text-sm text-gray-500 leading-relaxed px-2 sm:px-0'>
                🔒 با کلیک روی دکمه پرداخت، شرایط و قوانین را می‌پذیرید
              </p>
              <div className='flex items-center justify-center mt-2 sm:mt-3 space-x-2 space-x-reverse'>
                <div className='w-2 h-2 bg-green-400 rounded-full animate-ping'></div>
                <span className='text-xs text-gray-400'>ارتباط امن SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptPayment;

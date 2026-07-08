import React, { useEffect, useRef, useState } from 'react';

const CollateralOtp = ({
  loginModal,
  otp,
  setOtp,
  setLoginModal,
  loginUser,
  loading,
  setLoading,
}) => {
  const firstInputRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(120);

  // مدیریت تغییرات ورودی OTP
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // فقط اعداد مجاز است
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // اگر مقدار وارد شده موجود بود، فوکوس به کادر بعدی منتقل شود
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  useEffect(() => {
    setTimeLeft(120);
    const intervalId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      setLoginModal(false);
    }
  }, [timeLeft]);

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  // تابع فرمت زمان برای نمایش شمارش معکوس
  const formatTime = seconds => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? `0${s}` : s}`;
  };

  return (
    <>
      {loginModal && (
        <div
          className={`w-full h-[100vh] bg-[#a19f9f56] backdrop-blur-md flex items-center justify-center fixed top-0 left-0 transition-opacity duration-500`}
        >
          <div
            dir='rtl'
            className='relative bg-white rounded-lg shadow min-w-[350px] transition-transform duration-500 transform scale-100'
          >
            {/* Header مدال */}
            <div className='flex items-center justify-between p-4 md:p-5 border-b rounded-t'>
              <h3 className='text-xl font-semibold text-gray-900 text-center'>کد اعتبار سنجی</h3>
              <button
                onClick={() => setLoginModal(false)}
                type='button'
                className='text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg text-sm w-8 h-8'
              >
                <span className='sr-only'>بستن فرم</span>✕
              </button>
            </div>

            {/* بدنه مدال */}
            <div className='p-4 md:p-5'>
              <form
                className='space-y-4'
                onSubmit={e => {
                  e.preventDefault();
                  loginUser();
                }}
              >
                <div>
                  <label
                    htmlFor='otp'
                    className='block mb-2 text-sm font-medium text-gray-900 text-center'
                  >
                    کد اعتبار سنجی به شماره شما ارسال شد
                  </label>
                  <div dir='ltr' className='flex justify-center gap-2'>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        ref={index === 0 ? firstInputRef : null}
                        type='text'
                        maxLength='1'
                        value={digit}
                        onChange={e => handleChange(index, e.target.value)}
                        onKeyDown={e => handleKeyDown(e, index)}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-center text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-10 h-10'
                      />
                    ))}
                  </div>
                  {timeLeft > 0 && (
                    <div className='mt-2 text-center text-sm text-gray-700'>
                      زمان باقی مانده: {formatTime(timeLeft)}
                    </div>
                  )}
                </div>

                <button
                  type='submit'
                  disabled={otp.some(digit => digit === '')}
                  className={`w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center ${otp.some(digit => digit === '') ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-creame-primary to-creame-primary-900 hover:bg-creame-primary/50 focus:ring-4 focus:outline-none focus:ring-blue-300'}`}
                >
                  {loading ? 'در حال دریافت...' : 'استعلام'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CollateralOtp;

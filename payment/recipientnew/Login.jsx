import { useEffect, useState } from 'react';
import { FaPhone, FaKey, FaShieldAlt, FaPaperPlane } from 'react-icons/fa';
import { IoMdRefresh } from 'react-icons/io';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../../redux/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
const Login = ({ onLoginSuccess, paymentData }) => {
  const [step, setStep] = useState(1); // 1: phone, 2: otp
  const [captchaImage, setCaptchaImage] = useState(null);
  const [captchaId, setCaptchaId] = useState(null);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    otp: '',
    captcha: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleInputChange = e => {
    const { name, value } = e.target;

    // For OTP, only allow numbers and limit to 4 digits
    if (name === 'otp') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 4);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue,
      }));
    }
    // For phone number, only allow numbers and limit to 11 digits
    else if (name === 'phoneNumber') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 11);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue,
      }));
    }
    // For captcha, allow alphanumeric characters only
    else if (name === 'captcha') {
      const alphanumericValue = value.replace(/[^A-Za-z0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: alphanumericValue,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    setError('');
  };
  const refreshCaptcha = async () => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BASE_API}/api/v1/Captcha/GenerateCaptcha`,
      );
      setCaptchaImage(response.data?.data.captchaImage);
      setCaptchaId(response.data?.data.id);
    } catch (error) {
      console.log(error);
    }
  };
  const getUserInfo = async userId => {
    if (!userId) return;
    const token = localStorage.getItem('aToken');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BASE_API}/api/v1/User/Get/${userId}`,
        config,
      );
      if (response?.data?.isSuccess) {
        dispatch(loginSuccess(response?.data?.data));
        // Call the success callback instead of navigating
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          // Fallback to navigation if no callback provided
          setTimeout(() => {
            navigate('/dash');
          }, 100);
        }
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('aToken');
        localStorage.removeItem('requestId');
        localStorage.removeItem('planId');
        navigate('/login');
      }
    }
  };
  const loginUser = async () => {
    setLoading(true);
    if (formData.otp.length === 4) {
      try {
        // 1. Get token with POST method and required body
        const tokenResponse = await axiosInstance.post(
          `${import.meta.env.VITE_BASE_API}/api/v1/User/Token`,
          {
            grant_type: 'otp',
            otp: formData.otp,
            phonenumber: formData.phoneNumber,
          },
        );

        const fetchedToken = tokenResponse.data.data.access_token;
        localStorage.setItem('aToken', fetchedToken);

        const loginFormData = {
          captchaId: '',
          captchaCode: '',
          phoneNumber: formData.phoneNumber,
          otp: formData.otp,
        };

        const loginResponse = await axiosInstance.post(
          `${import.meta.env.VITE_BASE_API}/api/v1/User/Login`,
          loginFormData,
          {
            headers: {
              Authorization: `Bearer ${fetchedToken}`,
            },
          },
        );

        setLoading(false);
        if (loginResponse.data.isSuccess === true) {
          refreshCaptcha();
          toast.success('با موفقیت وارد شدید');
          getUserInfo(loginResponse.data.data.id);
        } else {
          toast.error(loginResponse.data.message);
        }
      } catch (error) {
        refreshCaptcha();
        setLoading(false);
        toast.error(error.response?.data?.message || 'خطایی رخ داده است');
      }
    }
  };
  const sendOtp = async e => {
    e.preventDefault();
    if (!formData.phoneNumber) {
      setError('شماره موبایل را وارد کنید');
      return;
    }

    if (!/^09\d{9}$/.test(formData.phoneNumber)) {
      setError('شماره موبایل معتبر وارد کنید (09xxxxxxxxx)');
      return;
    }

    if (!formData.captcha) {
      setError('کد امنیتی را وارد کنید');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const replaceMobile = formData.phoneNumber.replace(/^0/, '+98');

      const otpFormData = {
        phoneNumber: replaceMobile,
        isActive: true,
        nationalCode: '',
        captchaId: '',
        captchaCode: '',
        otp: '',
        X_CaptchaId: captchaId,
        X_CaptchaCode: formData.captcha,
      };

      const config = {
        headers: {
          'X-CaptchaCode': formData.captcha,
          'X-CaptchaId': captchaId,
        },
      };

      const response = await axiosInstance.post(
        `${import.meta.env.VITE_BASE_API}/api/v1/Register/UserRegister`,
        otpFormData,
        config,
      );

      if (response.data.isSuccess) {
        setFormData(prev => ({ ...prev, phoneNumber: replaceMobile }));
        setStep(2);
        setCountdown(120); // 2 minutes countdown
        toast.success('کد تایید ارسال شد');

        // Start countdown timer
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(response.data.message || 'خطا در ارسال کد تایید');
        refreshCaptcha();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'خطا در ارسال کد تایید');
      refreshCaptcha();
      console.error('Send OTP failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async e => {
    e.preventDefault();
    if (!formData.otp) {
      setError('کد تایید را وارد کنید');
      return;
    }

    if (formData.otp.length !== 4) {
      setError('کد تایید باید 4 رقم باشد');
      return;
    }

    setError('');
    await loginUser();
  };

  const formatCountdown = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  useEffect(() => {
    const token = localStorage.getItem('aToken');
    if (token) return;
    refreshCaptcha();
  }, []);
  return (
    <div className='min-h-screen flex items-center justify-center px-2 sm:px-4 py-6 sm:py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
      <div className='max-w-md w-full space-y-6 sm:space-y-8 mx-2 sm:mx-0'>
        {/* Header */}
        <div className='text-center animate-fadeInDown'>
          <div className='mx-auto h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-xl'>
            <FaShieldAlt className='h-8 w-8 sm:h-10 sm:w-10 text-white' />
          </div>
          <h2 className='mt-6 text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'>
            {step === 1 ? 'ورود با شماره موبایل' : 'تایید کد'}
          </h2>
          <p className='mt-3 text-gray-600 px-4 sm:px-0 leading-relaxed'>
            {step === 1
              ? 'برای پرداخت، شماره موبایل خود را وارد کنید'
              : `کد تایید ارسال شده به ${formData.phoneNumber} را وارد کنید`}
          </p>

          {/* Payment Info Preview */}
          {paymentData && (
            <div className='mt-6 p-4 sm:p-6 bg-white/70 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl animate-fadeIn mx-2 sm:mx-0'>
              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0'>
                <span className='text-gray-700 font-medium'>مبلغ قابل پرداخت:</span>
                <span className='font-bold text-xl sm:text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'>
                  {Number(paymentData.amount).toLocaleString()} ریال
                </span>
              </div>
              {paymentData.description && (
                <p className='text-sm text-gray-600 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200/50'>
                  {paymentData.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Step 1: Phone Number */}
        {step === 1 && (
          <form className='mt-8 space-y-6 animate-fadeInUp' onSubmit={sendOtp}>
            <div className='bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-white/30'>
              <div className='space-y-6'>
                <div>
                  <label
                    htmlFor='phoneNumber'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    شماره موبایل
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <FaPhone className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                      id='phoneNumber'
                      name='phoneNumber'
                      type='tel'
                      dir='ltr'
                      required
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className='appearance-none relative block w-full px-4 py-3 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg'
                      placeholder='09123456789'
                    />
                  </div>
                </div>

                {/* Captcha Field */}
                <div>
                  <label htmlFor='captcha' className='block text-sm font-medium text-gray-700 mb-2'>
                    کد امنیتی
                  </label>
                  <div className='flex items-center gap-3'>
                    <div className='flex-1'>
                      <input
                        id='captcha'
                        name='captcha'
                        type='text'
                        required
                        value={formData.captcha}
                        onChange={handleInputChange}
                        className='appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center'
                        placeholder='کد امنیتی را وارد کنید'
                      />
                    </div>
                    <div className='flex items-center gap-2'>
                      {captchaImage ? (
                        <img
                          src={`data:image/jpeg;base64,${captchaImage}`}
                          alt='Captcha'
                          className='h-12 w-32 object-cover border rounded-xl shadow-sm'
                          width='128'
                          height='48'
                        />
                      ) : (
                        <div className='h-12 w-32 bg-gray-200 animate-pulse border rounded-xl' />
                      )}
                      <button
                        type='button'
                        onClick={refreshCaptcha}
                        className='p-3 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300'
                        title='تازه‌سازی کد امنیتی'
                      >
                        <IoMdRefresh className='h-5 w-5' />
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className='bg-red-50 border border-red-200 rounded-xl p-4 animate-shake'>
                    <p className='text-red-700 text-sm font-medium'>{error}</p>
                  </div>
                )}

                <button
                  type='submit'
                  disabled={loading}
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
                      <FaPaperPlane className='h-5 w-5 mr-3 group-hover:translate-x-1 transition-transform duration-300' />
                      <span>ارسال کد تایید</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form className='mt-8 space-y-6 animate-fadeInUp' onSubmit={verifyOtp}>
            <div className='bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-white/30'>
              <div className='space-y-6'>
                <div>
                  <label htmlFor='otp' className='block text-sm font-medium text-gray-700 mb-2'>
                    کد تایید (OTP)
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <FaKey className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                      id='otp'
                      name='otp'
                      type='text'
                      dir='ltr'
                      required
                      maxLength='4'
                      value={formData.otp}
                      onChange={handleInputChange}
                      className='appearance-none relative block w-full px-4 py-3 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center tracking-widest'
                      placeholder='1234'
                    />
                  </div>
                </div>

                {countdown > 0 && (
                  <div className='text-center'>
                    <p className='text-sm text-gray-600'>
                      ارسال مجدد کد تا:{' '}
                      <span className='font-mono font-bold text-blue-600'>
                        {formatCountdown(countdown)}
                      </span>
                    </p>
                  </div>
                )}

                {countdown === 0 && (
                  <div className='text-center'>
                    <button
                      type='button'
                      onClick={() => {
                        setStep(1);
                        setFormData(prev => ({ ...prev, otp: '', captcha: '' }));
                        setCountdown(0);
                        refreshCaptcha();
                      }}
                      className='text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300'
                    >
                      ارسال مجدد کد تایید
                    </button>
                  </div>
                )}

                {error && (
                  <div className='bg-red-50 border border-red-200 rounded-xl p-4 animate-shake'>
                    <p className='text-red-700 text-sm font-medium'>{error}</p>
                  </div>
                )}

                <div className='space-y-3'>
                  <button
                    type='submit'
                    disabled={loading}
                    className='
                      group relative w-full overflow-hidden
                      bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 
                      hover:from-green-600 hover:via-emerald-600 hover:to-teal-600
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
                        <span>در حال تایید...</span>
                      </div>
                    ) : (
                      <div className='flex items-center justify-center relative z-10'>
                        <FaShieldAlt className='h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300' />
                        <span>تایید و ورود</span>
                      </div>
                    )}
                  </button>

                  <button
                    type='button'
                    onClick={() => {
                      setStep(1);
                      setFormData({ phoneNumber: '', otp: '', captcha: '' });
                      setCountdown(0);
                      setError('');
                      refreshCaptcha();
                    }}
                    className='w-full py-3 px-4 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 font-medium transition-all duration-300 hover:border-gray-400'
                  >
                    تغییر شماره موبایل
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className='text-center text-sm text-gray-500 animate-fadeIn'>
          <p>🔒 اطلاعات شما محفوظ و امن نگهداری می‌شود</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

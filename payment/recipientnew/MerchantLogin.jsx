import { useEffect, useState } from 'react';
import { FaPhone, FaKey, FaShieldAlt } from 'react-icons/fa';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
const MerchantLogin = ({ setUserLogged, paymentData }) => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    otp: '',
    captcha: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleInputChange = e => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    } else if (name === 'password') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    setError('');
  };

  const loginUser = async e => {
    e.preventDefault();
    setLoading(true);
    let formData2 = {
      username: formData.phoneNumber,
      password: formData.password,
      grant_type: 'password',
    };
    await axiosInstance
      .post(`/api/v1/User/MerchantToken`, formData2)
      .then(
        response => {
          console.log('Login response:', response.data);
          if (response?.data?.isSuccess) {
            toast.success(response?.data.message);
            localStorage.setItem('merchantToken', response?.data?.data?.access_token);
          } else {
            toast.error(response?.data?.message);
          }
        },
        error => {
          toast.error(error.response.data.message);
          console.log(error);
        },
      )
      .finally(() => {
        setUserLogged(true);
        setLoading(false);
      });
  };

  return (
    <div className='min-h-screen flex items-center justify-center px-2 sm:px-4 py-6 sm:py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
      <div className='max-w-md w-full space-y-6 sm:space-y-8 mx-2 sm:mx-0'>
        {/* Header */}
        <div className='text-center animate-fadeInDown'>
          <div className='mx-auto h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-xl'>
            <FaShieldAlt className='h-8 w-8 sm:h-10 sm:w-10 text-white' />
          </div>
          <h2 className='mt-6 text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'>
            ورود با شماره موبایل
          </h2>
          <p className='mt-3 text-gray-600 px-4 sm:px-0 leading-relaxed'>
            برای پرداخت، شماره موبایل خود را وارد کنید
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

        <form className='mt-8 space-y-6 animate-fadeInUp' onSubmit={loginUser}>
          <div className='bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-white/30'>
            <div className='space-y-6'>
              <div>
                <label
                  htmlFor='phoneNumber'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  نام کاربری
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <FaPhone className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    id='phoneNumber'
                    name='phoneNumber'
                    type='text'
                    dir='ltr'
                    required
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className='appearance-none relative block w-full px-4 py-3 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg'
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor='phoneNumber'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  کلمه عبور
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <FaKey className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    id='phoneNumber'
                    autoComplete='off'
                    name='password'
                    type='password'
                    dir='ltr'
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className='appearance-none relative block w-full px-4 py-3 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg'
                  />
                </div>
              </div>

              {/* Captcha Field */}

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
                    <span>ورود</span>
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

export default MerchantLogin;

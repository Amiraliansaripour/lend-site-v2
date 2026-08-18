import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Login from '../../components/newui/recipient/Login';
import AcceptPayment from '../../components/newui/recipient/AcceptPayment';
import { FaClock, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Recipient = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('login');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  useEffect(() => {
    const amount = searchParams.get('amount');
    const merchantId = searchParams.get('merchantId');
    const orderId = searchParams.get('orderId');
    const description = searchParams.get('description');
    const returnUrl = searchParams.get('returnUrl');

    if (amount && merchantId) {
      setPaymentData({
        amount,
        merchantId,
        orderId,
        description,
        returnUrl,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem('aToken');
    if (token) {
      setCurrentStep('payment');
    }
  }, []);
  useEffect(() => {
    let interval = null;

    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          if (newTime === 60 && !showTimeoutWarning) {
            setShowTimeoutWarning(true);
            toast.error('تنها ۱ دقیقه تا منقضی شدن درگاه پرداخت باقی مانده است!', {
              duration: 4000,
              icon: '⚠️',
            });
          }

          if (newTime <= 0) {
            setIsTimerActive(false);
            toast.error('درگاه پرداخت منقضی شد. درحال بازگشت', {
              duration: 3000,
              icon: '⏰',
            });
            setTimeout(() => {
              if (paymentData?.returnUrl) {
                window.location.href = paymentData.returnUrl;
              } else {
                navigate('/');
              }
            }, 3000);

            return 0;
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerActive, timeLeft, showTimeoutWarning, paymentData, navigate]);
  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  const getTimerColor = () => {
    if (timeLeft <= 60) return 'text-red-500';
    if (timeLeft <= 120) return 'text-yellow-500';
    return 'text-green-500';
  };

  const handleLoginSuccess = () => {
    setCurrentStep('payment');
  };

  // const handleWalletSelect = (wallet) => {
  //   setSelectedWallet(wallet);
  //   setCurrentStep("payment");
  // };

  const handleBackToWallets = () => {
    setSelectedWallet(null);
    setCurrentStep('wallets');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} paymentData={paymentData} />;
      case 'payment':
        return (
          <AcceptPayment
            selectedWallet={selectedWallet}
            paymentData={paymentData}
            onBack={handleBackToWallets}
          />
        );
      default:
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 relative'>
      {/* Global Timer */}
      <div className='fixed top-4 right-4 z-50'>
        <div
          className={`
          bg-white rounded-2xl shadow-xl border border-gray-200 px-4 py-3 
          flex items-center gap-3 transition-all duration-300 hover:shadow-2xl
          ${timeLeft <= 60 ? 'animate-pulse border-red-300 bg-red-50' : ''}
        `}
        >
          <div className={`${getTimerColor()} transition-colors duration-300`}>
            {timeLeft <= 60 ? (
              <FaExclamationTriangle className='w-5 h-5 animate-bounce' />
            ) : (
              <FaClock className='w-5 h-5' />
            )}
          </div>
          <div className='flex flex-col'>
            <span className='text-xs text-gray-500 font-medium'>زمان باقی‌مانده</span>
            <span className={`text-lg font-bold ${getTimerColor()} font-mono`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Timeout Warning Modal */}
      {timeLeft <= 0 && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-scaleIn'>
            <div className='text-red-500 mb-4'>
              <FaExclamationTriangle className='w-16 h-16 mx-auto' />
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-4'>زمان جلسه به پایان رسید</h3>
            <p className='text-gray-600 mb-6'>به دلیل طولانی شدن زمان تراکنش، جلسه شما منقضی شد.</p>
            <div className='flex items-center justify-center text-blue-500'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3'></div>
              <span>در حال بازگشت...</span>
            </div>
          </div>
        </div>
      )}

      {renderCurrentStep()}
    </div>
  );
};

export default Recipient;

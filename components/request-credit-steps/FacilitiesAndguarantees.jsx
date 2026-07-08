import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import SvgSpinner from '../loading/SvgSpinner';
import axios from 'axios';
import { useForm, useWatch } from 'react-hook-form';
import { numberComma } from '../../utils/SpliteNumber';
import { PriceDisplayWithOutLabel } from '../../utils/formatTomanReadable';

const FacilitiesAndguarantees = ({ onBack, onNext, user, requestId }) => {
  // const [sayadId, setSayadId] = useState();
  // const {sayadId} = useWatch("sayadId")
  // console.log(sayadId)
  const [shake, setShake] = useState(false);

  const [attachmentId, setAttachmentId] = useState();
  const userId = user?.id;
  const navigate = useNavigate();
  const reqId = requestId;
  const [mandatoryFiles, setMandatoryFiles] = useState({
    idCardBack: null,
    idCardFront: null,
    signature: null,
  });
  const [uploadProgress, setUploadProgress] = useState({});
  const token = localStorage.getItem('aToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  // test
  useEffect(() => {
    console.log(attachmentId);
  }, [attachmentId]);

  // ارسال فرم
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();
  const sayadId = watch('sayadId') || '';

  const handleSayadIdChange = e => {
    const value = e.target.value;
    setSayadId(value); // آپدیت state
  };
  // Upload a file to the server
  const uploadFileToServer = async fileData => {
    try {
      const formData = new FormData();
      formData.append('requestId', reqId);
      formData.append('isActive', true);
      formData.append('name', fileData.name);
      formData.append('file', fileData.file); // اینجا باید یک Blob یا File باشه
      formData.append('format', fileData.format);
      formData.append('attachmentType', 100);
      formData.append('userId', userId);

      const response = await axiosInstance.post(
        `${import.meta.env.VITE_BASE_API}/api/v1/Attachment/Create1`,
        formData,
        {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.status === 200) {
        console.log(response.data.data.id);
        setAttachmentId(response.data.data.id);
        setUploadProgress(prev => ({ ...prev, [fileData.name]: 'success' }));
      } else {
        setUploadProgress(prev => ({ ...prev, [fileData.name]: 'error' }));
      }
    } catch (error) {
      console.log(error);
      setUploadProgress(prev => ({ ...prev, [fileData.name]: 'error' }));
      if (error.response?.status === 401) {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('aToken');
        localStorage.removeItem('requestId');
        localStorage.removeItem('planId');
        navigate('/login');
      }
    }
  };

  // test
  useEffect(() => {
    console.log(uploadProgress);
  }, [uploadProgress]);
  // تابع مشترک برای آپلود فایل اجباری از طریق انتخاب یا درگ اند دراپ
  const processMandatoryFile = (file, key) => {
    if (file && file.size <= 3 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileData = {
          name: key,
          file: reader.result.split(',')[1], // محتوای Base64
          format: file.type,
        };
        setMandatoryFiles(prev => ({ ...prev, [key]: fileData }));
        setUploadProgress(prev => ({ ...prev, [key]: 'uploading' }));
        uploadFileToServer(fileData);
      };
      reader.readAsDataURL(file);
    } else {
      alert('File size must be less than 3MB.');
    }
  };

  // مدیریت آپلود از طریق انتخاب فایل
  const handleMandatoryUpload = (event, key) => {
    const file = event.target.files[0];
    processMandatoryFile(file, key);
  };

  // مدیریت آپلود از طریق درگ اند دراپ
  const handleDrop = (event, key) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    processMandatoryFile(file, key);
  };

  // همان منطق آپلود اختیاری قبلی باقی می‌ماند
  const handleOptionalUpload = (event, index) => {
    const file = event.target.files[0];
    if (file && file.size <= 3 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileData = {
          name: `optional_${index + 1}`,
          file: reader.result.split(',')[1],
          format: file.type,
        };
        setOptionalFiles(prev => {
          const updated = [...prev];
          updated[index] = fileData;
          return updated;
        });
        setUploadProgress(prev => ({
          ...prev,
          [`optional_${index + 1}`]: 'uploading',
        }));
        uploadFileToServer(fileData);
      };
      reader.readAsDataURL(file);
    } else {
      alert('File size must be less than 3MB.');
    }
  };

  // افزودن فیلد اختیاری (تا ۳ فایل)
  const handleAddOptionalField = () => {
    if (optionalFiles.length < 3) {
      setOptionalFiles([...optionalFiles, null]);
    } else {
      alert('You can only upload up to 3 optional files.');
    }
  };

  // رندر فیلدهای اختیاری
  const renderOptionalFields = () => {
    return optionalFiles.map((file, index) => (
      <div key={index} className='mt-4'>
        <input
          type='file'
          accept='image/png, image/jpeg'
          className='border border-gray-300 rounded p-2 w-full'
          onChange={e => handleOptionalUpload(e, index)}
        />
        {uploadProgress[`optional_${index + 1}`] && (
          <div className='mt-2'>
            {uploadProgress[`optional_${index + 1}`] === 'uploading' && (
              <div role='status'>
                <svg
                  aria-hidden='true'
                  className='w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600'
                  viewBox='0 0 100 101'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                    fill='currentColor'
                  />
                  <path
                    d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                    fill='currentFill'
                  />
                </svg>
                <span className='sr-only'>Loading...</span>
              </div>
            )}
            {uploadProgress[`optional_${index + 1}`] === 'success' && (
              <p className='text-green-500'>با موفقیت آپلود شد !</p>
            )}
            {uploadProgress[`optional_${index + 1}`] === 'error' && (
              <p className='text-red-500'>مشکلی پیش آمد مجددا تلاش کنید.</p>
            )}
          </div>
        )}
      </div>
    ));
  };

  const onSubmit = data => {
    onNext();
  };

  // اعتبار سنجی اینپوت
  const handleInputChange = e => {
    let input = e.target.value.replace(/\D/g, ''); // فقط عدد مجاز

    if (input.length > 16) {
      input = input.slice(0, 16);
      setShake(true);
      setTimeout(() => setShake(false), 500); // مدت زمان لرزش
    }

    setValue('sayadId', input, { shouldValidate: true });
  };
  const onError = errors => {
    if (errors.sayadId?.type === 'required') {
      setShake(true); // اینجا لرزش فعال میشه اگر فیلد خالی باشه
      setTimeout(() => setShake(false), 500); // بعد ۵۰۰ میلی‌ثانیه خاموش بشه
    }
  };
  return (
    <div className='w-full bg-white rounded-2xl gap-4 p-4'>
      <div className='grid'>
        <div className='w-full flex flex-col items-start justify-start'>
          <div>
            <h2 className='font-bold text-xl'>تسهیلات و تضامین بانکی</h2>
          </div>
          <br />
          <div className='w-full flex flex-col items-start justify-start gap-10'>
            <div className='w-full flex justify-center'>
              <div
                className={`rounded-2xl w-full sm:w-3/4 lg:ml-20 lg:p-8 lg:pt-6 p-3 border-2 ${'border-green-600 bg-green-100'}`}
              >
                <p className='font-bold text-xl mb-8'>تسهیلات</p>
                <div className='font-bold flex flex-col gap-5 mx-16'>
                  <span className='md:grid grid-cols-2 border-b border-b-black/20 pb-3'>
                    <h3 className='whitespace-nowrap py-4'>کل بدهی به بانک :</h3>
                    <p className='w-full py-4 text-start md:text-center text-black/60'>
                      {'دارای چک برگشتی'}
                    </p>
                  </span>
                  <span className='md:grid grid-cols-2 border-b border-b-black/20 pb-3'>
                    <h3 className='whitespace-nowrap py-4'>معوق :</h3>
                    <p className='w-full py-4 text-start md:text-center text-black/60'>
                      {'دارای چک برگشتی'}
                    </p>
                  </span>
                  <span className='md:grid grid-cols-2 '>
                    <h3 className='whitespace-nowrap py-4'>مشکوک الوصول :</h3>
                    <p className='w-full py-4 text-start md:text-center text-black/60'>
                      {'دارای چک برگشتی'}
                    </p>
                  </span>
                </div>
              </div>
            </div>
            <div className='w-full flex justify-center'>
              <div
                className={`rounded-2xl w-full sm:w-3/4 lg:ml-20 lg:p-8 lg:pt-6 p-3 border-2 ${'border-gray-600 bg-gray-100'}`}
              >
                <p className='font-bold text-xl mb-8'>تضامین بانکی</p>
                <div className='font-bold flex flex-col gap-5 mx-16'>
                  <span className='md:grid grid-cols-2 border-b border-b-black/20 pb-3'>
                    <h3 className='whitespace-nowrap py-4'>مقدار ضمانت :</h3>
                    <p className='w-full py-4 text-start md:text-center text-black/60'>
                      {PriceDisplayWithOutLabel('1000000000')} ریال
                    </p>
                  </span>
                  <span className='md:grid grid-cols-2'>
                    <h3 className='whitespace-nowrap py-4'>معوق ؟ </h3>
                    <p className='w-full py-4 text-start md:text-center text-black/60'>{'دارد'}</p>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* دکمه‌های مرحله بعد و انصراف */}
      <div className='flex justify-between mt-24'>
        <button type='button' className='bg-gray-600 text-white px-4 py-2 rounded' onClick={onBack}>
          انصراف
        </button>
        <button
          onClick={handleSubmit(onSubmit)}
          type='button'
          className='bg-gold-primary-900 text-white px-4 py-2 rounded'
        >
          مرحله بعد
        </button>
      </div>
    </div>
  );
};
export default FacilitiesAndguarantees;

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import SvgSpinner from '../loading/SvgSpinner';
import axios from 'axios';
import { FiHelpCircle } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NavigationButton from '../buttons/NavigationButton';

const ProformaInvoice = ({ onNext, onBack, isEditMode }) => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [mandatoryFiles, setMandatoryFiles] = useState({
    proformaInvoice: null,
  });
  const [attachmentId, setAttachmentId] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchParams] = useSearchParams();
  const paramsId = searchParams.get('id');
  const navigate = useNavigate();
  const {
    handleSubmit,
    formState: { errors },
  } = useForm();
  const token = localStorage.getItem('aToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const uploadFileToServer = async (file, key) => {
    setUploadProgress(prev => ({
      ...prev,
      [key]: { status: 'uploading', message: 'در حال آپلود...', progress: 0 },
    }));

    try {
      const formData = new FormData();
      formData.append('Name', file.name);
      formData.append('attachmentType', 106);
      formData.append('file', file);

      const response = await axiosInstance.post(
        `${import.meta.env.VITE_BASE_API}/api/v1/Attachment/create1`,
        formData,
        {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: progressEvent => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({
              ...prev,
              [key]: {
                status: 'uploading',
                message: `در حال آپلود: ${percentCompleted}%`,
                progress: percentCompleted,
              },
            }));
          },
        },
      );

      if (response.status === 200 && response.data.isSuccess) {
        setUploadProgress(prev => ({
          ...prev,
          [key]: { status: 'success', message: 'با موفقیت آپلود شد!' },
        }));
        setAttachmentId(response?.data?.data?.id);
      } else {
        const errorMessage = response.data.message || 'خطایی نامشخص در سرور رخ داد.';
        setUploadProgress(prev => ({
          ...prev,
          [key]: { status: 'error', message: errorMessage },
        }));
      }
    } catch (error) {
      let errorMessage = 'مشکلی در ارتباط با سرور پیش آمد، لطفاً دوباره تلاش کنید.';

      if (axios.isAxiosError(error) && error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors).join(', ');
        }
      }
      setUploadProgress(prev => ({
        ...prev,
        [key]: { status: 'error', message: errorMessage },
      }));
      toast.error(errorMessage, { className: 'rtl-toast-message' });
    }
  };

  const processMandatoryFile = (file, key) => {
    if (file && file.size <= 3 * 1024 * 1024) {
      const previewUrl = URL.createObjectURL(file);

      setMandatoryFiles(prev => ({
        ...prev,
        [key]: {
          file: file,
          preview: previewUrl,
          format: file.type,
        },
      }));
      uploadFileToServer(file, key);
    } else {
      setUploadProgress(prev => ({
        ...prev,
        [key]: {
          status: 'error',
          message: 'حجم فایل باید کمتر از 3 مگابایت باشد.',
        },
      }));
      toast.error('حجم فایل باید کمتر از 3 مگابایت باشد.', {
        className: 'rtl-toast-message',
      });
    }
  };

  const handleMandatoryUpload = (event, key) => {
    const file = event.target.files[0];
    if (file) {
      processMandatoryFile(file, key);
    } else {
      clearFile(key);
    }
  };

  const handleDrop = (event, key) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      processMandatoryFile(file, key);
    }
  };

  const clearFile = key => {
    setMandatoryFiles(prev => {
      const currentFile = prev[key];
      if (currentFile && currentFile.preview) {
        URL.revokeObjectURL(currentFile.preview);
      }
      return {
        ...prev,
        [key]: null,
      };
    });
    setUploadProgress(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
    setAttachmentId(null);

    const inputElement = document.getElementById(`file-input-${key}`);
    if (inputElement) {
      inputElement.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (mandatoryFiles.proformaInvoice && mandatoryFiles.proformaInvoice.preview) {
        URL.revokeObjectURL(mandatoryFiles.proformaInvoice.preview);
      }
    };
  }, [mandatoryFiles.proformaInvoice]);

  const onSubmit = async data => {
    if (!mandatoryFiles.proformaInvoice || uploadProgress.proformaInvoice?.status !== 'success') {
      toast.error('لطفاً تصویر پیش‌فاکتور را آپلود کرده و از موفقیت آن اطمینان حاصل کنید.', {
        className: 'rtl-toast-message',
      });
      return;
    }

    if (!paramsId) {
      toast.error('شناسه درخواست یافت نشد. لطفا ابتدا درخواست را ثبت کنید.', {
        className: 'rtl-toast-message',
      });
      return;
    }

    if (!attachmentId) {
      toast.error('شناسه فایل پیوست یافت نشد. لطفاً منتظر آپلود کامل فایل باشید.', {
        className: 'rtl-toast-message',
      });
      return;
    }

    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_BASE_API}/api/v1/Invoice/Create`,
        {
          requestId: paramsId,
          attachmentId: attachmentId,
        },
        {
          headers: {
            ...headers,
          },
        },
      );

      if (response.status === 200 && response.data.isSuccess) {
        axiosInstance
          .post(
            `/api/v1/Request/ChangeRequestState`,
            {
              id: paramsId,
              requestState: 6,
            },
            {
              headers: {
                ...headers,
              },
            },
          )
          .then(
            response => {
              if (isEditMode === true) {
                navigate('/dash');
              }
              onNext();
            },
            error => {
              console.log(error);
            },
          );
      } else {
        const errorMessage = response.data.message || 'خطا در ارسال اطلاعات پیش‌فاکتور رخ داد.';
        toast.error(errorMessage, { className: 'rtl-toast-message' });
      }
    } catch (error) {
      let errorMessage = 'مشکلی در ارتباط با سرور پیش آمد، لطفاً دوباره تلاش کنید.';
      console.log(error);

      if (axios.isAxiosError(error) && error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors).join(', ');
        }
      }
      toast.error(errorMessage, { className: 'rtl-toast-message' });
    }
  };
  // لغو درخواست
  const handleActualCancellation = async () => {
    try {
      const res = await axiosInstance.get(`/api/v1/Request/OptOut/${paramsId}`, {
        headers: {
          ...headers,
        },
      });
      console.log('res data', res?.status);

      if (res.status === 200 || res?.data?.isSuccess) {
        toast.success('درخواست شما با موفقیت لغو شد');
        navigate('/dash');
      }
    } catch (error) {
      // console.log(error)
      toast.error(error?.response.data.message);
    }
  };

  // Image modal handlers
  const openImageModal = imageSrc => {
    setSelectedImage(imageSrc);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className='w-full gap-4'>
        <div className='max-lg:grid-cols-1 bg-white custom-shadow rounded-2xl gap-4 p-6'>
          <h2 className='text-lg font-bold mb-4'>پیش فاکتور</h2>
          <div dir='rtl' className='grid grid-cols-1 gap-10'>
            <div className='md:flex gap-6'>
              <div className='w-full'>
                <label className='text-lg font-medium text-gray-700 flex items-center gap-2 mb-4'>
                  پیش فاکتور خود را بارگذاری کنید.
                  <div className='relative group flex items-center gap-2'>
                    {/* <FiHelpCircle
                      className="text-blue-500 cursor-pointer"
                      onClick={() => setShowHelpText(!showHelpText)}
                    /> */}
                    {/* {showHelpText && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                      </div>
                      )} */}
                  </div>
                </label>
                <div
                  className='border mt-2 border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300 relative'
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDrop(e, 'proformaInvoice')}
                >
                  {mandatoryFiles.proformaInvoice?.preview ? (
                    <>
                      <img
                        src={mandatoryFiles.proformaInvoice.preview}
                        alt='پیش فاکتور'
                        width='60'
                        height='60'
                        className='mx-auto mb-2 rounded object-contain cursor-pointer hover:opacity-80 transition-opacity'
                        onClick={() => openImageModal(mandatoryFiles.proformaInvoice.preview)}
                      />
                      <p className='text-sm text-gray-600'>
                        {mandatoryFiles.proformaInvoice.file?.name}
                      </p>
                    </>
                  ) : (
                    <span className='block text-sm text-gray-500 mb-2'>
                      فایل را بکشید و رها کنید یا کلیک کنید
                    </span>
                  )}

                  <input
                    type='file'
                    accept='image/png, image/jpeg'
                    id='file-input-proformaInvoice'
                    className='mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100'
                    onChange={e => handleMandatoryUpload(e, 'proformaInvoice')}
                  />

                  {/* Display upload status */}
                  {uploadProgress.proformaInvoice?.status && (
                    <div className='mt-2 text-center'>
                      {uploadProgress.proformaInvoice.status === 'uploading' && (
                        <div role='status' className='flex items-center justify-center'>
                          <SvgSpinner />
                          <span className='text-blue-500 text-sm ml-2'>
                            {uploadProgress.proformaInvoice.message}
                          </span>
                        </div>
                      )}
                      {uploadProgress.proformaInvoice.status === 'success' && (
                        <p className='text-green-500 text-sm'>
                          {uploadProgress.proformaInvoice.message}
                        </p>
                      )}
                      {uploadProgress.proformaInvoice.status === 'error' && (
                        <p className='text-red-500 text-sm'>
                          {uploadProgress.proformaInvoice.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <p className='mt-6 text-gray-500'>
                  فاکتور بارگذاری شده میبایست سربرگ دار و دارای مهر رسمی فروشگاه باشد. همچنین درج
                  نام و نام خانوادگی خریدار، کد ملی خریدار، تاریخ صدور فاکتور، شماره فاکتور و مبلغ
                  دقیق خرید به صورت کاملا واضح و خوانا ضروری میباشد.{' '}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- End Checkbox Section --- */}

        {/* <div className="flex justify-center gap-6 mt-10 md:mt-12">
          <button
            type="button"
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            onClick={onBack}
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            type="submit"
            className={`px-8 py-3 rounded-lg shadow-md transition-all duration-300 transform ${
              uploadProgress.proformaInvoice?.status === "uploading"
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-gold-primary-900 hover:bg-gold-primary-800 text-white hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gold-primary-700 focus:ring-opacity-50"
            }`}
            disabled={uploadProgress.proformaInvoice?.status === "uploading"}
          >
            تایید و مرحله بعد
          </button>
        </div> */}
        {/* <div className="flex justify-center gap-6">
          <div className="flex justify-center gap-6 mt-10 md:mt-12">
            <button
              type="button"
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              onClick={onBack}
            >
              مرحله قبل
            </button>
          </div> */}

        {isEditMode ? (
          <NavigationButton
            onNext={onSubmit}
            nextLabel='ویرایش'
            // onCancel={handleActualCancellation}
            isFirstStep={false}
          />
        ) : (
          <NavigationButton
            onNext={onSubmit}
            onCancel={handleActualCancellation}
            isFirstStep={false}
          />
        )}
      </form>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
          onClick={closeImageModal}
        >
          <div className='relative max-w-4xl max-h-screen p-5 bg-white rounded-xl'>
            <button
              onClick={closeImageModal}
              className='absolute  top-1 right-1 text-black text-3xl font-bold hover:text-gray-800 z-10'
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt='پیش فاکتور بزرگ شده'
              className='max-w-full max-h-full object-contain rounded-lg'
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProformaInvoice;

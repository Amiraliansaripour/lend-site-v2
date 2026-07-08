import { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { DateConvert } from '../../utils/ConvertDate';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import NavigationButton from '../buttons/NavigationButton';
import axios from 'axios';
import { MdClose } from 'react-icons/md';
const SvgSpinner = () => (
  <svg
    className='animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500'
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
  >
    <circle
      className='opacity-25'
      cx='12'
      cy='12'
      r='10'
      stroke='currentColor'
      strokeWidth='4'
    ></circle>
    <path
      className='opacity-75'
      fill='currentColor'
      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
    ></path>
  </svg>
);

const UserInformation = ({ onNext, onCancellation, user, requestId, isEditMode }) => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const paramsId = searchParams.get('id');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [attachemnts, setAttachemnts] = useState(null);

  const [mandatoryFiles, setMandatoryFiles] = useState({
    birthCertificate: null,
    nationalCardFront: null,
    nationalCardBack: null,
  });

  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedAttachmentIds, setUploadedAttachmentIds] = useState({});
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      birthDate: user?.personInfo?.birthDate ? DateConvert(user.personInfo.birthDate) : '',
      nationalCode: user?.nationalCode || '',
      phoneNumber: user?.personInfo?.phoneNumber || '',
      branchCityName: user?.personInfo?.cityProvinceName || '',
      branchName: user?.personInfo?.cityName || '',
      address: user?.personInfo?.address || '',
      postalCode: user?.personInfo?.postalCode || '',
      telephone: user?.personInfo?.telephone || '',
    },
  });

  const attachmentTypes = {
    nationalCardFront: 100,
    nationalCardBack: 101,
    birthCertificate: 102,
  };

  const token = localStorage.getItem('aToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const removePhoto = async () => {
    try {
      for (let index = 0; index < attachemnts.length; index++) {
        const element = attachemnts[index];
        const formData = new FormData();
        formData.append('oldId', element.id);
        await axiosInstance.post(`/api/v1/Attachment/create1`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      setAttachemnts([]);
    } catch (err) {
      console.log(err);
    }
  };
  const removePhotoSingle = async id => {
    try {
      const formData = new FormData();
      formData.append('oldId', id);
      await axiosInstance.post(`/api/v1/Attachment/create1`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Update the attachments state by removing the deleted attachment
      setAttachemnts(prev => prev.filter(attachment => attachment.id !== id));
      toast.success('تصویر با موفقیت حذف شد', { className: 'rtl-toast-message' });
    } catch (err) {
      console.log(err);
      toast.error('خطا در حذف تصویر', { className: 'rtl-toast-message' });
    }
  };
  const uploadFileToServer = useCallback(
    async (file, key) => {
      setUploadProgress(prev => ({
        ...prev,
        [key]: { status: 'uploading', message: 'در حال آپلود...', progress: 0 },
      }));
      try {
        const formData = new FormData();
        formData.append('Name', file.name);
        formData.append('attachmentType', attachmentTypes[key]);
        formData.append('file', file);

        const response = await axiosInstance.post(`/api/v1/Attachment/create1`, formData, {
          headers: {
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
        });

        if (response.status === 200 && response.data.isSuccess) {
          setUploadProgress(prev => ({
            ...prev,
            [key]: { status: 'success', message: 'با موفقیت آپلود شد!' },
          }));

          const attachmentId = response?.data?.data?.id;
          setUploadedAttachmentIds(prev => ({
            ...prev,
            [key]: attachmentId,
          }));
        } else {
          const errorMessage = response.data.message || 'خطایی نامشخص در سرور رخ داد.';
          setUploadProgress(prev => ({
            ...prev,
            [key]: { status: 'error', message: errorMessage },
          }));
          toast.error(errorMessage, { className: 'rtl-toast-message' });
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
    },
    [attachmentTypes],
  );

  const fileInputRefs = {
    birthCertificate: useRef(null),
    nationalCardFront: useRef(null),
    nationalCardBack: useRef(null),
  };

  const clearFile = useCallback(
    key => {
      setMandatoryFiles(prev => {
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
      setUploadedAttachmentIds(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });

      if (fileInputRefs[key] && fileInputRefs[key].current) {
        fileInputRefs[key].current.value = '';
      }
    },
    [fileInputRefs],
  );

  const processFile = useCallback(
    (file, key) => {
      if (!file) {
        clearFile(key);
        return;
      }

      if (file.size > 3 * 1024 * 1024) {
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
        clearFile(key);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        setMandatoryFiles(prev => {
          return {
            ...prev,
            [key]: {
              file: file,
              preview: base64data,
              format: file.type,
            },
          };
        });
        uploadFileToServer(file, key);
      };
      reader.readAsDataURL(file);
    },
    [uploadFileToServer, clearFile],
  );

  const handleFileUpload = useCallback(
    (event, key) => {
      const file = event.target.files[0];
      processFile(file, key);
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (event, key) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      processFile(file, key);
    },
    [processFile],
  );

  useEffect(() => {
    if (attachemnts && attachemnts.length > 0 && !showUploadSection) {
      setIsButtonDisabled(false);
    } else if (showUploadSection || !attachemnts || attachemnts.length === 0) {
      const allFilesUploadedSuccessfully =
        mandatoryFiles.birthCertificate &&
        mandatoryFiles.nationalCardFront &&
        uploadProgress.birthCertificate?.status === 'success' &&
        uploadProgress.nationalCardFront?.status === 'success';

      setIsButtonDisabled(!allFilesUploadedSuccessfully);
    }
  }, [mandatoryFiles, uploadProgress, attachemnts, showUploadSection]);

  // const requestId = localStorage.getItem("requestId");
  const userId = user?.id;

  const onSubmit = async data => {
    // Validate user data first

    if (!paramsId) {
      toast.error('شناسه درخواست یافت نشد. لطفا ابتدا درخواست را ثبت کنید.', {
        className: 'rtl-toast-message',
      });
      return;
    }

    if (!userId) {
      toast.error('شناسه کاربری برای به‌روزرسانی اطلاعات یافت نشد.', {
        className: 'rtl-toast-message',
      });
      return;
    }

    const shouldUploadNewFiles =
      !attachemnts ||
      attachemnts.length === 0 ||
      (showUploadSection && Object.keys(uploadedAttachmentIds).length > 0);

    if (shouldUploadNewFiles) {
      const requiredFileKeys = ['birthCertificate', 'nationalCardFront', 'nationalCardBack'];

      const attachmentIdsToSend = [];
      let allFilesPresentAndSuccessful = true;

      for (const key of requiredFileKeys) {
        setIsLoading(true);
        if (
          key !== 'nationalCardBack' &&
          (!mandatoryFiles[key] ||
            uploadProgress[key]?.status !== 'success' ||
            !uploadedAttachmentIds[key])
        ) {
          let fileName;
          switch (key) {
            case 'birthCertificate':
              fileName = 'شناسنامه';
              break;
            case 'nationalCardFront':
              fileName = 'روی کارت ملی';
              break;
            case 'nationalCardBack':
              fileName = 'گواهی کسر از حقوق';
              break;
            default:
              fileName = 'فایل';
          }
          toast.error(`لطفاً تصویر ${fileName} را بارگذاری کنید یا منتظر تکمیل آپلود باشید.`, {
            className: 'rtl-toast-message',
          });
          allFilesPresentAndSuccessful = false;
          break;
        }
        if (uploadedAttachmentIds[key]) {
          attachmentIdsToSend.push(uploadedAttachmentIds[key]);
        }
      }

      if (!allFilesPresentAndSuccessful) {
        return;
      }

      try {
        // If uploading new files and user has existing images, delete old ones first
        if (showUploadSection && attachemnts && attachemnts.length > 0) {
          try {
            const deleteResponse = await axiosInstance.delete(
              `/api/v1/User/DeleteUserAttachments/${userId}`,
            );

            if (deleteResponse.status === 200 && deleteResponse.data.isSuccess) {
              console.log('Old documents deleted successfully');

              setAttachemnts([]);
            } else {
              console.warn('Failed to delete old documents, but continuing with upload');
            }
          } catch (deleteError) {
            console.warn('Error deleting old documents:', deleteError);
            // Continue with upload even if deletion fails
          }
        }

        const updateResponse = await axiosInstance.put(`/api/v1/User/Upload/${userId}`, {
          attachmentIdsToSend,
        });

        if (updateResponse.status === 200 && updateResponse.data.isSuccess) {
          setIsLoading(false);
          const validationResponse = await axiosInstance.get(
            `/api/v1/Request/UserIdentityInfo/${requestId}`,
            {
              headers: {
                accept: 'text/plain',
              },
            },
          );

          if (validationResponse.data.isSuccess === true) {
            await axiosInstance.post(`/api/v1/Request/ChangeRequestState`, {
              id: requestId,
              requestState: 2,
            });
            toast.success('اطلاعات هویتی با موفقیت تایید و مرحله بعد فعال شد.', {
              className: 'rtl-toast-message',
            });
            onNext({ generalInfo: data, attachments: uploadedAttachmentIds });
          } else {
            toast.error(validationResponse.data.message || 'خطا در تایید اطلاعات هویتی.', {
              className: 'rtl-toast-message',
            });
          }
        } else {
          const errorMessage = updateResponse.data.message || 'خطایی در به‌روزرسانی مدارک رخ داد.';
          toast.error(errorMessage, { className: 'rtl-toast-message' });
        }
      } catch (error) {
        let errorMessage = 'مشکلی در ارسال اطلاعات پیش آمد، لطفاً دوباره تلاش کنید.';
        if (axios.isAxiosError(error) && error.response && error.response.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.errors) {
            errorMessage = Object.values(error.response.data.errors).join(', ');
          }
        }
        // toast.error(errorMessage, { className: "rtl-toast-message" });
      }
    } else {
      try {
        const validationResponse = await axiosInstance.get(
          `/api/v1/Request/UserIdentityInfo/${requestId}`,
          {
            headers: {
              ...headers,
              accept: 'text/plain',
            },
          },
        );

        if (validationResponse.data.isSuccess === true) {
          await axiosInstance
            .post(`/api/v1/Request/ChangeRequestState`, {
              id: requestId,
              requestState: 2,
            })
            .then(
              response => {
                if (isEditMode === true) {
                  navigate('/dash');
                } else {
                  onNext();
                }
              },
              error => {
                console.log(error);
              },
            );
        } else {
          toast.error(validationResponse.data.message || 'اطلاعات هویتی تایید نشد.', {
            className: 'rtl-toast-message',
          });
        }
      } catch (error) {
        let errorMessage = 'خطا در بررسی اطلاعات هویتی.';
        if (axios.isAxiosError(error) && error.response && error.response.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.errors) {
            errorMessage = Object.values(error.response.data.errors).join(', ');
          }
        }
      }
    }
  };

  const convertToLocalNumber = phone => {
    return phone?.toString().replace(/^\+98/, '0');
  };

  const openImageModal = imageSrc => {
    setSelectedImage(imageSrc);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const handleUploadNewDocuments = () => {
    setShowConfirmationModal(true);
  };

  const confirmUploadNewDocuments = () => {
    removePhoto();
    setShowUploadSection(true);
    setShowConfirmationModal(false);
  };

  const cancelUploadNewDocuments = () => {
    setShowConfirmationModal(false);
  };

  const validateUserData = userData => {
    const missingFields = [];
    const fieldNames = {
      firstName: 'نام',
      lastName: 'نام خانوادگی',
      nationalCode: 'کد ملی',
      birthDate: 'تاریخ تولد',
      phoneNumber: 'شماره موبایل',
      cityProvinceName: 'استان',
      cityName: 'شهر',
      address: 'آدرس',
      postalCode: 'کد پستی',
      telephone: 'تلفن',
    };

    // Check main user fields
    if (!userData?.firstName?.trim()) {
      missingFields.push(fieldNames.firstName);
    }
    if (!userData?.lastName?.trim()) {
      missingFields.push(fieldNames.lastName);
    }
    if (!userData?.nationalCode?.trim()) {
      missingFields.push(fieldNames.nationalCode);
    }

    // Check personInfo fields
    if (!userData?.personInfo?.birthDate) {
      missingFields.push(fieldNames.birthDate);
    }
    if (!userData?.personInfo?.phoneNumber?.trim()) {
      missingFields.push(fieldNames.phoneNumber);
    }
    if (!userData?.personInfo?.cityProvinceName?.trim()) {
      missingFields.push(fieldNames.cityProvinceName);
    }
    if (!userData?.personInfo?.cityName?.trim()) {
      missingFields.push(fieldNames.cityName);
    }
    if (!userData?.personInfo?.address?.trim()) {
      missingFields.push(fieldNames.address);
    }
    if (!userData?.personInfo?.postalCode?.trim()) {
      missingFields.push(fieldNames.postalCode);
    }
    if (!userData?.personInfo?.telephone?.trim()) {
      missingFields.push(fieldNames.telephone);
    }

    return {
      isValid: missingFields.length === 0,
      missingFields: missingFields,
    };
  };

  const fields = [
    {
      name: 'firstName',
      label: 'نام',
      type: 'text',
      placeholder: 'نام',
      value: user?.firstName,
    },
    {
      name: 'lastName',
      label: 'نام خانوادگی',
      type: 'text',
      placeholder: 'نام خانوادگی',
      value: user?.lastName,
    },
    {
      name: 'birthDate',
      label: 'تاریخ تولد',
      type: 'text',
      placeholder: '1370/00/00',
      value: user?.personInfo?.birthDate ? DateConvert(user?.personInfo?.birthDate) : '',
    },
    {
      name: 'nationalCode',
      label: 'کد ملی',
      type: 'text',
      placeholder: 'کد ملی',
      value: user?.nationalCode,
    },
    {
      name: 'phoneNumber',
      label: 'شماره موبایل',
      type: 'text',
      placeholder: 'شماره موبایل',
      value: convertToLocalNumber(user?.personInfo?.phoneNumber),
    },
    {
      name: 'branchCityName',
      label: 'استان',
      type: 'text',
      placeholder: 'استان',
      value: user?.personInfo?.cityProvinceName,
    },
    {
      name: 'branchName',
      label: 'شهر',
      type: 'text',
      placeholder: 'شهر',
      value: user?.personInfo?.cityName,
    },
    {
      name: 'address',
      label: 'آدرس',
      type: 'text',
      placeholder: 'آدرس',
      value: user?.personInfo?.address,
    },
    {
      name: 'postalCode',
      label: 'کد پستی',
      type: 'text',
      placeholder: 'کدپستی',
      value: user?.personInfo?.postalCode,
    },
    {
      name: 'telephone',
      label: 'تلفن',
      type: 'text',
      placeholder: 'تلفن',
      value: user?.personInfo?.telephone,
    },
  ];

  const handleActualCancellation = async () => {
    try {
      const res = await axiosInstance.get(`/api/v1/Request/OptOut/${paramsId}`);
      if (res.status === 200 && res?.data?.isSuccess) {
        toast.success('درخواست شما با موفقیت لغو شد', {
          className: 'rtl-toast-message',
        });
        navigate('/dash');
      } else {
        toast.error(res?.data?.message || 'مشکلی در درخواست وجود دارد', {
          className: 'rtl-toast-message',
        });
      }
    } catch (error) {
      let errorMessage = 'خطایی در لغو درخواست رخ داده است.';
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage, { className: 'rtl-toast-message' });
    }
  };

  const FileUploader = ({ label, fileKey }) => (
    <div className='w-full'>
      <label className='text-lg font-medium text-gray-700 flex items-center gap-2 mb-4'>
        تصویر {label} خود را بارگذاری کنید.
      </label>
      <div
        className='border mt-2 border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300 relative'
        onDragOver={e => e.preventDefault()}
        onDrop={e => handleDrop(e, fileKey)}
      >
        {/* نمایش پیش‌نمایش تصویر در صورت وجود */}
        {mandatoryFiles[fileKey]?.preview &&
        mandatoryFiles[fileKey]?.format.startsWith('image/') ? (
          <>
            <img
              src={mandatoryFiles[fileKey].preview}
              alt={label}
              width='60'
              height='60'
              className='mx-auto mb-2 rounded object-contain'
            />
            <p className='text-sm text-gray-600'>{mandatoryFiles[fileKey].file?.name}</p>
            {/* دکمه حذف فایل */}
            <button
              type='button'
              onClick={() => clearFile(fileKey)}
              className='absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600'
              aria-label={`حذف ${label}`}
            >
              &times;
            </button>
          </>
        ) : (
          <span className='block text-sm text-gray-500 mb-2'>
            فایل را بکشید و رها کنید یا کلیک کنید
          </span>
        )}

        <input
          type='file'
          id={`file-input-${fileKey}`}
          ref={fileInputRefs[fileKey]}
          className='mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100'
          onChange={e => handleFileUpload(e, fileKey)}
          accept='image/png, image/jpeg'
        />

        {/* نمایش وضعیت آپلود */}
        {uploadProgress[fileKey]?.status && (
          <div className='mt-2 text-center'>
            {uploadProgress[fileKey].status === 'uploading' && (
              <div role='status' className='flex items-center justify-center'>
                <SvgSpinner />
                <span className='text-blue-500 text-sm ml-2'>
                  {uploadProgress[fileKey].message}
                </span>
              </div>
            )}
            {uploadProgress[fileKey].status === 'success' && (
              <p className='text-green-500 text-sm'>{uploadProgress[fileKey].message}</p>
            )}
            {uploadProgress[fileKey].status === 'error' && (
              <p className='text-red-500 text-sm'>{uploadProgress[fileKey].message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    const fetchUserImages = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get(`/api/v1/User/Get/${user?.id}`);
        if (res?.data?.isSuccess && res?.data?.data?.attachments) {
          setAttachemnts(res.data.data.attachments);
        } else {
          setAttachemnts([]);
        }
      } catch (error) {
        console.error('Error fetching user images:', error);
        setAttachemnts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchUserImages();
    } else {
      setIsLoading(false);
    }
    const validation = validateUserData(user);
    if (!validation.isValid) {
      toast.error(`لطفا تمام اطلاعات هویتی را در صفحه پروفایل تکمیل کنید`, {
        className: 'rtl-toast-message',
      });
      navigate(`/profile?callBackUrl=/requests/complete-request?id=${requestId}`);
      return;
    }
  }, [user?.id]);
  const returnPhotoBase64 = type => {
    const attachemnt = attachemnts?.find(item => item.attachmentType === type);
    return attachemnt?.file;
  };

  return (
    <div>
      <div className='mt-8 bg-white custom-shadow rounded-2xl p-6'>
        <div className='bg-white custom-shadow rounded-2xl p-4 mb-8'>
          <h2 className='text-lg font-bold mb-4'>اطلاعات هویتی</h2>
          <div className='grid grid-cols-2 max-lg:grid-cols-1 p-4 gap-4'>
            <form onSubmit={handleSubmit(onSubmit)} className='w-full gap-4'>
              <div dir='rtl' className='col-span-2'>
                {fields.slice(0, 5).map((field, index) => (
                  <div key={index} className='flex flex-col w-full mt-6'>
                    <label
                      htmlFor={field.name}
                      className='text-sm font-bold text-black relative top-2 mb-0 mr-2 px-1 bg-white w-max'
                    >
                      {field.label}: *
                    </label>
                    <input
                      {...register(field.name, {
                        required: `${field.label} الزامی است`,
                      })}
                      className='p-3 text-sm border-2 border-[#445052] rounded-lg bg-white focus:outline-none'
                      placeholder={field.placeholder}
                      type={field.type}
                      value={field.value || ''}
                      disabled
                    />
                    {errors[field.name] && (
                      <p className='text-red-500 text-sm mt-1'>{errors[field.name].message}</p>
                    )}
                  </div>
                ))}
              </div>
            </form>
            <form className='w-full gap-4'>
              <div dir='rtl' className='col-span-2'>
                {fields.slice(5, 12).map((field, index) => (
                  <div key={index} className='flex flex-col w-full mt-6'>
                    <label
                      htmlFor={field.name}
                      className='text-sm font-bold text-black relative top-2 mb-0 mr-2 px-1 bg-white w-max'
                    >
                      {field.label}: *
                    </label>
                    <input
                      {...register(field.name, {
                        required: `${field.label} الزامی است`,
                      })}
                      disabled
                      className='p-3 text-sm border-2 border-[#445052] rounded-lg bg-white focus:outline-none'
                      placeholder={field.placeholder}
                      type={field.type}
                      defaultValue={field.value || ''}
                    />
                    {errors[field.name] && (
                      <p className='text-red-500 text-sm mt-1'>{errors[field.name].message}</p>
                    )}
                  </div>
                ))}
              </div>
            </form>
          </div>
        </div>
        <div>
          {/* Conditional rendering for file upload section */}
          {isLoading ? (
            <div className='flex justify-center items-center h-40'>درحال بارگذاری اطلاعات</div>
          ) : attachemnts !== null && attachemnts.length > 0 ? (
            <div className='flex flex-col justify-center items-center'>
              <h2 className='text-lg font-bold mb-4 text-center'>مدارک هویتی بارگذاری شده</h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center items-center w-full max-w-4xl'>
                <div className='relative flex justify-center '>
                  {returnPhotoBase64(102) ? (
                    <div className='relative'>
                      <img
                        src={`data:image/jpeg;base64,${returnPhotoBase64(102)}`}
                        alt='User Document '
                        className='w-40 h-40 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity shadow-md'
                        onClick={() =>
                          openImageModal(`data:image/jpeg;base64,${returnPhotoBase64(102)}`)
                        }
                      />
                      <button
                        type='button'
                        onClick={() =>
                          removePhotoSingle(
                            attachemnts?.find(item => item.attachmentType === 102)?.id,
                          )
                        }
                        className='absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors'
                        aria-label='حذف شناسنامه'
                      >
                        <MdClose />
                      </button>
                    </div>
                  ) : (
                    <FileUploader label='شناسنامه' fileKey='birthCertificate' />
                  )}
                </div>
                <div className='relative flex justify-center '>
                  {returnPhotoBase64(100) ? (
                    <div className='relative'>
                      <img
                        src={`data:image/jpeg;base64,${returnPhotoBase64(100)}`}
                        alt='User Document'
                        className='w-40 h-40 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity shadow-md'
                        onClick={() =>
                          openImageModal(`data:image/jpeg;base64,${returnPhotoBase64(100)}`)
                        }
                      />
                      <button
                        type='button'
                        onClick={() =>
                          removePhotoSingle(
                            attachemnts?.find(item => item.attachmentType === 100)?.id,
                          )
                        }
                        className='absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors'
                        aria-label='حذف روی کارت ملی'
                      >
                        <MdClose />
                      </button>
                    </div>
                  ) : (
                    <FileUploader label='روی کارت ملی' fileKey='nationalCardFront' />
                  )}
                </div>
                <div className='relative flex justify-center '>
                  {returnPhotoBase64(101) ? (
                    <div className='relative'>
                      <img
                        src={`data:image/jpeg;base64,${returnPhotoBase64(101)}`}
                        alt='User Document '
                        className='w-40 h-40 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity shadow-md'
                        onClick={() =>
                          openImageModal(`data:image/jpeg;base64,${returnPhotoBase64(101)}`)
                        }
                      />
                      <button
                        type='button'
                        onClick={() =>
                          removePhotoSingle(
                            attachemnts?.find(item => item.attachmentType === 101)?.id,
                          )
                        }
                        className='absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors'
                        aria-label='حذف گواهی کسر از حقوق'
                      >
                        <MdClose />
                      </button>
                    </div>
                  ) : (
                    <FileUploader label='گواهی کسر از حقوق' fileKey='nationalCardBack' />
                  )}
                </div>
              </div>
              <div className='mt-6'>
                <button
                  type='button'
                  onClick={handleUploadNewDocuments}
                  className='px-6 py-2 bg-purple-primary text-white rounded-lg  transition-colors'
                >
                  بارگذاری مدارک جدید
                </button>
              </div>
              {showUploadSection && (
                <div className='mt-8 border-t pt-6'>
                  <h3 className='text-lg font-bold mb-4'>بارگذاری مدارک جدید</h3>
                  <p className='text-gray-600 mb-6'>
                    اگر می‌خواهید مدارک جدیدی بارگذاری کنید، فایل‌های زیر را انتخاب کنید.
                  </p>
                  <div dir='rtl' className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    <FileUploader label='شناسنامه' fileKey='birthCertificate' />
                    <FileUploader label='روی کارت ملی' fileKey='nationalCardFront' />
                    <FileUploader label='گواهی کسر از حقوق' fileKey='nationalCardBack' />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className='text-lg font-bold mb-4'>بارگذاری مدارک هویتی </h2>
              <p className='text-gray-600 mb-6'>
                لطفاً تصاویر شناسنامه، روی کارت ملی و گواهی کسر از حقوق را بارگذاری کنید. تمامی
                فایل‌ها باید با فرمت تصویری (مانند JPG, PNG) و حجم کمتر از 3 مگابایت باشند.
              </p>
              <div dir='rtl' className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                <FileUploader label='شناسنامه' fileKey='birthCertificate' />
                <FileUploader label='روی کارت ملی' fileKey='nationalCardFront' />
                <FileUploader label='گواهی کسر از حقوق' fileKey='nationalCardBack' />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div
          className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
          onClick={closeImageModal}
        >
          <div className='relative max-w-4xl max-h-full p-4'>
            <img
              src={selectedImage}
              alt='تصویر بزرگ شده'
              className='max-w-full max-h-full object-contain'
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={closeImageModal}
              className='absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-all'
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for uploading new documents */}
      {showConfirmationModal && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-bold mb-4 text-center'>تایید بارگذاری مدارک جدید</h3>
            <p className='text-gray-600 mb-6 text-center leading-relaxed'>
              با بارگذاری مدارک جدید، تمامی مدارک قبلی شما حذف خواهد شد. آیا مطمئن هستید که
              می‌خواهید ادامه دهید؟
            </p>
            <div className='flex gap-4 justify-center'>
              <button
                onClick={confirmUploadNewDocuments}
                className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
              >
                بله، ادامه دهید
              </button>
              <button
                onClick={cancelUploadNewDocuments}
                className='px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors'
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditMode ? (
        <NavigationButton
          onNext={handleSubmit(onSubmit)}
          nextLabel='ویرایش'
          cancelLabel='حذف'
          // onCancel={handleActualCancellation}
          isNextDisabled={isButtonDisabled || isLoading}
          isFirstStep={false}
        />
      ) : (
        <NavigationButton
          onNext={handleSubmit(onSubmit)}
          onCancel={handleActualCancellation}
          isNextDisabled={isButtonDisabled || isLoading}
          isFirstStep={false}
        />
      )}
    </div>
  );
};

export default UserInformation;

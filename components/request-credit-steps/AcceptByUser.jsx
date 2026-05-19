import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import NavigationButton from "../buttons/NavigationButton";
import Modal from "../newui/common/Modal";
import { PriceDisplayWithOutLabel } from "../../utils/formatTomanReadable";

const Loading = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-700">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gold-primary-900"></div>
    <p className="mt-4 text-lg">در حال بارگذاری اطلاعات...</p>
  </div>
);

const AcceptByUser = ({ onBack, user, ruleText }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  // const [income, setIncome] = useState("");
  // const [installment, setInstallment] = useState("");

  const [requestData, setRequestData] = useState(null);
  const [recieveAmount, setRecieveAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [searchParams] = useSearchParams();

  const [isChecked, setIsChecked] = useState(false);

  const [userImage, setUserImages] = useState(null);

  // Image modal states
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Rules modal states
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const requestId = searchParams.get("id");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequestPreview = async () => {
      setLoading(true);
      setError(null);
      try {
        const idToFetch = requestId || localStorage.getItem("requestId");

        if (!idToFetch) {
          toast.error("ریکوئست شما یافت نشد.");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("aToken");
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axiosInstance.get(`/api/v1/Request/preview/${idToFetch}`, {
          headers: {
            ...headers,
            accept: "text/plain",
          },
        });
        const data = response?.data?.data;
        setRequestData(data);
        const tempRecivedData = data.creditAmount - data.creditAmount / Math.floor(data.planFirstSystemFee + data.planFirstBankFee);
        setRecieveAmount(tempRecivedData);
      } catch (err) {
        console.error("خطا در دریافت اطلاعات پیش‌نمایش:", err);
        setError("مشکلی در بارگذاری اطلاعات پیش‌نمایش رخ داده است. لطفا دوباره تلاش کنید.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequestPreview();
  }, [requestId]);

  useEffect(() => {
    const fetchUserImages = async () => {
      try {
        const res = await axiosInstance.get(`/api/v1/User/Get/${user?.id}`);
        if (res?.data?.isSuccess && res?.data?.data?.attachments) {
          setUserImages(res.data.data.attachments);
        } else {
          setUserImages([]);
        }
      } catch (error) {
        console.error("Error fetching user images:", error);
        setUserImages([]);
      }
    };

    if (user?.id) {
      fetchUserImages();
    }
  }, [user?.id]);

  // const formatNumber = (value) => {
  //   return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // };

  // const handleIncomeChange = (e) => {
  //   const value = e.target.value;
  //   setIncome(formatNumber(value));
  //   setValue("income", value.replace(/,/g, ""));
  // };

  // const handleInstallmentChange = (e) => {
  //   const value = e.target.value;
  //   setInstallment(formatNumber(value));
  //   setValue("installment", value.replace(/,/g, ""));
  // };

  const onSubmit = () => {
    if (!requestId) {
      toast.error("شناسه درخواست نامشخص است.");
      return;
    }
    if (requestId) {
      axiosInstance
        .get(`/api/v1/Request/UserConfirm/${requestId}`)
        .then((res) => {
          if (res.status === 200) {
            navigate("/dash");
          } else {
            toast.error(res?.message);
          }
        })
        .catch(() => {
          toast.error("مشکلی در ارتباط با سرور پیش آمده است.");
        });
    }
  };

  const handleActualCancellation = async () => {
    try {
      const res = await axiosInstance.get(`/api/v1/Request/OptOut/${requestId}`);
      if (res.status === 200 || res?.data?.isSuccess) {
        toast.success("درخواست شما با موفقیت لغو شد");
        navigate("/dash");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="w-full bg-white custom-shadow rounded-2xl gap-4 p-4 text-center text-red-600 font-bold">{error}</div>;
  }

  // if (!requestData) {
  //   return <div className="w-full bg-white custom-shadow rounded-2xl gap-4 p-4 text-center text-gray-600">اطلاعاتی برای نمایش یافت نشد.</div>;
  // }

  const createBase64ImageUrl = (base64String, mimeType = "image/jpeg") => {
    if (!base64String) return null;
    return `data:${mimeType};base64,${base64String}`;
  };

  // Image modal handlers
  const openImageModal = (imageSrc) => {
    setSelectedImage(imageSrc);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  // Rules modal handlers
  const openRulesModal = () => {
    setIsRulesModalOpen(true);
  };

  // Helper function to safely format numbers
  const formatAmount = (amount) => {
    if (!amount || isNaN(amount)) return "نامشخص";
    // Convert number to Toman (divide by 10) and format
    const tomanAmount = Math.round(Number(amount));
    return `${tomanAmount.toLocaleString("fa")} ریال`;
  };

  const chequeFileImageBase64 = requestData?.chequeFileImage;
  const backChequeFileImageBase64 = requestData?.chequeFileImageBack;
  const invoiceFileImageBase64 = requestData?.invoiceFileImage;
  const incomeInfoFileImages = requestData?.incomeInfo?.incomeInfoFileImage;
  const deductionSalaryFileImage = requestData?.chequeFileImageDeductionSalary;
  const promissoryImage = requestData?.chequeFileImagePromissory;
  const returnPhotoBase64 = (type) => {
    const attachemnt = userImage?.find((item) => item.attachmentType === type);
    return attachemnt?.file;
  };
  return (
    <div className="w-full bg-white custom-shadow rounded-2xl p-6 md:p-8 ">
      {loading ? (
        <div>بارگذاری ...</div>
      ) : (
        <>
          {" "}
          <div className="text-center">
            <h2 className="font-extrabold text-3xl text-gray-900 mb-3 border-b-2 border-gold-primary-700 pb-2 inline-block">جزئیات درخواست شما</h2>
            <p className="text-gray-600 text-lg leading-relaxed">در این بخش می‌توانید تمامی جزئیات مربوط به درخواست اعتبار خود را به دقت مشاهده و سپس تایید نمایید.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 w-full text-gray-700 overflow-hidden">
            {/* User Information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg border border-blue-100 transform hover:scale-105 transition-transform duration-300 overflow-hidden">
              <h3 className="font-bold text-xl text-blue-700 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                اطلاعات کاربر
              </h3>
              <div className="space-y-2">
                <p className="flex justify-between items-center text-base">
                  <span className="font-medium text-gray-800">نام:</span>
                  <span className="text-gray-700">{requestData?.userFirstName || "نامشخص"}</span>
                </p>
                <p className="flex justify-between items-center text-base">
                  <span className="font-medium text-gray-800">نام خانوادگی:</span>
                  <span className="text-gray-700">{requestData?.userLastName || "نامشخص"}</span>
                </p>
                <p className="flex justify-between items-center text-base">
                  <span className="font-medium text-gray-800">کد ملی:</span>
                  <span className="text-gray-700">{requestData?.userNationalCode || "نامشخص"}</span>
                </p>

                <div className="">
                  <span className="font-medium text-gray-800">مدارک هویتی:</span>

                  <div className="flex sm:flex-row flex-col  justify-between mt-2">
                    {userImage?.map((res, index) => (
                      <img key={index} src={`data:image/jpeg;base64,${res?.file}`} alt={`User Document ${index + 1}`} className="w-24 lg:w-28 h-fit my-1 cursor-pointer hover:opacity-80 transition-opacity rounded-md" onClick={() => openImageModal(`data:image/jpeg;base64,${res?.file}`)} title="برای مشاهده تصویر کامل کلیک کنید" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cheque and Invoice Information */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl shadow-lg border border-green-100 transform hover:scale-105 transition-transform duration-300">
              <h3 className="font-bold text-xl text-green-700 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                اطلاعات اعتبار
              </h3>
              <div className="space-y-2">
                <p className="flex justify-between items-center text-base">
                  <span className="font-medium text-gray-800">شناسه صیاد چک:</span>
                  <span className="text-gray-700">{requestData?.chequeSayadId || "نامشخص"}</span>
                </p>
                <p className="flex justify-between items-center text-base">
                  <span className="font-medium text-gray-800">تصویر چک صیادی:</span>
                  {chequeFileImageBase64 ? <img src={createBase64ImageUrl(chequeFileImageBase64)} alt="تصویر چک صیادی" className="w-24 h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity" onClick={() => openImageModal(createBase64ImageUrl(chequeFileImageBase64))} title="برای مشاهده تصویر کامل کلیک کنید" /> : <span className="text-gray-700">تصویری وجود ندارد</span>}
                </p>
                <p className="flex justify-between items-center text-base">
                  <span className="font-medium text-gray-800">تصویر پشت چک صیادی:</span>
                  {backChequeFileImageBase64 ? <img src={createBase64ImageUrl(backChequeFileImageBase64)} alt="تصویر چک صیادی" className="w-24 h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity" onClick={() => openImageModal(createBase64ImageUrl(backChequeFileImageBase64))} title="برای مشاهده تصویر کامل کلیک کنید" /> : <span className="text-gray-700">تصویری وجود ندارد</span>}
                </p>
                <p className="flex justify-between items-center text-base">
                  <span className="font-medium text-gray-800">تصویر سفته :</span>
                  {promissoryImage ? <img src={createBase64ImageUrl(promissoryImage)} alt="تصویر  سفته" className="w-24 h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity" onClick={() => openImageModal(createBase64ImageUrl(promissoryImage))} title="برای مشاهده تصویر کامل کلیک کنید" /> : <span className="text-gray-700">تصویری وجود ندارد</span>}
                </p>
                <p className="flex justify-between items-center text-base">
                  <span className="font-medium text-gray-800">تصویر گواهی کسر از حقوق :</span>
                  {deductionSalaryFileImage ? <img src={createBase64ImageUrl(deductionSalaryFileImage)} alt="تصویر گواهی کسر از حقوق" className="w-24 h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity" onClick={() => openImageModal(createBase64ImageUrl(deductionSalaryFileImage))} title="برای مشاهده تصویر کامل کلیک کنید" /> : <span className="text-gray-700">تصویری وجود ندارد</span>}
                </p>
              </div>
            </div>

            {/* Income Information */}
            {requestData?.incomeInfo && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl shadow-lg border border-yellow-100 col-span-1 lg:col-span-2 transform hover:scale-105 transition-transform duration-300">
                <h3 className="font-bold text-xl text-orange-700 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.592 1L21 12m-2.208 9L11 19m-9.792-7L1 5m14.828 4.828l-8.485 8.485M12 10V5m0 14v-5" />
                  </svg>
                  اطلاعات درآمدی
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <p className="flex flex-col text-base">
                    <span className="font-medium text-gray-800 mb-1">مقدار درآمد:</span>
                    <span className="whitespace-nowrap text-gray-700 font-semibold">{requestData?.incomeInfo.income ? formatAmount(requestData?.incomeInfo.income) : "نامشخص"}</span>
                  </p>
                  <p className="flex flex-col text-base">
                    <span className="font-medium text-gray-800 mb-1">توانایی پرداخت قسط:</span>
                    <span className="whitespace-nowrap text-gray-700 font-semibold">{requestData?.incomeInfo.payAbility ? `${requestData?.incomeInfo.payAbility.toLocaleString()} ریال` : "نامشخص"}</span>
                  </p>
                  <p className="flex flex-col text-base">
                    <span className="font-medium text-gray-800 mb-1">تصاویر اطلاعات درآمدی:</span>
                    <span className="flex flex-wrap gap-2">
                      {incomeInfoFileImages && incomeInfoFileImages.length > 0
                        ? incomeInfoFileImages.map((image, index) => (
                            <a key={index} href={image} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline flex items-center text-sm">
                              تصویر {index + 1}
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ))
                        : "تصویری وجود ندارد"}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Plan Details */}
            {requestData?.plan && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl shadow-lg border border-purple-100 transform hover:scale-105 transition-transform duration-300">
                <h3 className="font-bold text-xl text-purple-700 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  جزئیات طرح
                </h3>
                <div className="space-y-2">
                  <p className="flex justify-between items-center text-base">
                    <span className="font-medium text-gray-800">نام طرح:</span>
                    <span className="text-gray-700">{requestData?.plan.planName || "نامشخص"}</span>
                  </p>
                  <p className="flex justify-between items-center text-base">
                    <span className="font-medium text-gray-800">درصد سود:</span>
                    <span className="text-gray-700">{requestData?.plan.planPercentage ? `${requestData?.plan.planPercentage}%` : "نامشخص"}</span>
                  </p>
                  <p className="flex justify-between items-center text-base">
                    <span className="font-medium text-gray-800">تعداد اقساط:</span>
                    <span className="text-gray-700">{requestData?.plan.planPeriod || "نامشخص"}</span>
                  </p>
                  <p className="flex justify-between items-center text-base">
                    <span className="font-medium text-gray-800">ضمانت‌های طرح:</span>
                    <span className="text-gray-700">{requestData?.plan.planGuarantees || "نامشخص"}</span>
                  </p>
                </div>
              </div>
            )}
            {/* Guarantees */}
            {requestData?.planIsInvoiceRequired && requestData?.invoiceFileImage && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-xl shadow-lg border border-amber-100 transform hover:scale-105 transition-transform duration-300">
                <h3 className="font-bold text-xl text-amber-700 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  پیش فاکتور
                </h3>
                <div className="space-y-2">
                  <p className="flex justify-between items-center text-base">
                    <span className="font-medium text-gray-800">تصویر :</span>
                    {invoiceFileImageBase64 ? (
                      <img src={createBase64ImageUrl(invoiceFileImageBase64)} alt="تصویر پیش فاکتور" className="w-24 h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity" onClick={() => openImageModal(createBase64ImageUrl(invoiceFileImageBase64))} title="برای مشاهده تصویر کامل کلیک کنید" />
                    ) : requestData?.invoiceFileImage ? (
                      <a href={requestData?.invoiceFileImage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline flex items-center">
                        مشاهده
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-gray-700">تصویری وجود ندارد</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Financial Details */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl shadow-lg border border-red-100 transform hover:scale-105 transition-transform duration-300">
              <h3 className="font-bold text-xl text-red-700 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                جزئیات مالی
              </h3>
              <div className="space-y-2">
                <p className="flex justify-between items-center text-base">
                  <span className="font-medium text-gray-800">نام طرح :</span>
                  <span className="whitespace-nowrap text-gray-700 font-semibold">{requestData?.planName}</span>
                </p>
                <p className="flex justify-between items-center text-base">
                  <span className="font-medium text-gray-800">دوره بازپرداخت:</span>
                  <span className="whitespace-nowrap text-gray-700 font-semibold">{requestData?.period ? `${requestData.period.toLocaleString("fa")} ماه` : "نامشخص"}</span>
                </p>
                <p className="flex justify-between items-center text-base">
                  <span className="font-medium text-gray-800">مبلغ هر قسط:</span>
                  <span className="whitespace-nowrap text-gray-700 font-semibold">{PriceDisplayWithOutLabel(requestData?.loanDetailAmount)}ریال</span>
                </p>
                <p className="flex justify-between items-center text-base">
                  <span className="font-medium text-gray-800">مبلغ اعتبار:</span>
                  <span className="whitespace-nowrap text-gray-700 font-semibold">{PriceDisplayWithOutLabel(requestData?.creditAmount)}ریال</span>
                </p>

                <p className="flex justify-between items-center text-base">
                  <span className="font-medium text-gray-800">سود:</span>
                  <span className="whitespace-nowrap text-gray-700 font-semibold">{PriceDisplayWithOutLabel(requestData?.feeAmount)}ریال</span>
                </p>
                <p className="flex justify-between items-center text-base">
                  <span className="font-medium text-gray-800">اعتبار دریافتی :</span>
                  <span className="whitespace-nowrap text-gray-700 font-semibold">{PriceDisplayWithOutLabel(recieveAmount)}ریال</span>
                </p>
                <p className="flex justify-between items-center text-lg font-bold text-green-700 pt-2 border-t border-gray-200">
                  <span className="font-bold">مبلغ قابل پرداخت:</span>
                  <span>{PriceDisplayWithOutLabel(requestData?.totalRefundAmount)}ریال</span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-10 md:mt-12 flex-col items-center">
            {/* Checkbox */}
            <div className="flex items-center mb-6">
              <input id="terms-checkbox" type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} className="h-5 w-5 text-gold-primary-900 border-gray-300 rounded focus:ring-gold-primary-700 focus:ring-2" />
              <label htmlFor="terms-checkbox" className="mx-3 text-xs md:text-lg font-medium text-gray-700 cursor-pointer">
                شرایط را مطالعه کرده‌ام و می‌پذیرم
              </label>

              {ruleText && (
                <button type="button" onClick={openRulesModal} className="mr-4 text-blue-600 hover:text-blue-800 underline text-sm font-medium">
                  مشاهده قوانین و مقررات
                </button>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-6 w-full">
              {/* <button
            type="button"
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            onClick={onBack}
          >
            مرحله قبل
          </button> */}
              {/* <button
            type="button"
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            onClick={handleActualCancellation}
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            type="button"
            className={`px-8 py-3 rounded-lg shadow-md transition-all duration-300 transform ${
              isChecked
                ? "bg-gold-primary-900 hover:bg-gold-primary-800 text-white hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gold-primary-700 focus:ring-opacity-50"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
            disabled={!isChecked}
          >
            ثبت درخواست
          </button> */}
              <NavigationButton onNext={handleSubmit(onSubmit)} onCancel={handleActualCancellation} isFirstStep={false} isNextDisabled={!isChecked} />
            </div>
          </div>
          {/* Image Modal */}
          {isImageModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeImageModal}>
              <div className="relative max-w-4xl max-h-screen p-4">
                <button onClick={closeImageModal} className="absolute top-2 right-2 text-white text-3xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center">
                  ×
                </button>
                <img src={selectedImage} alt="تصویر بزرگ شده" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
              </div>
            </div>
          )}
          {/* Rules Modal */}
          <Modal setIsOpen={setIsRulesModalOpen} isOpen={isRulesModalOpen} size="lg">
            <div className="mb-5 text-base font-bold">قوانین و مقررات طرح</div>

            <div className="text-sm" style={{ whiteSpace: "pre-wrap" }}>
              {ruleText}
            </div>
          </Modal>
          {/* // <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeRulesModal}>
        //   <div className="relative bg-white rounded-lg max-w-4xl max-h-[80vh] w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        //     <div className="flex items-center justify-between p-6 border-b border-gray-200">
        //       <h2 className="text-xl font-bold text-gray-900">قوانین و مقررات طرح</h2>
        //       <button onClick={closeRulesModal} className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center">
        //         ×
        //       </button>
        //     </div>
        //     <div className="p-6 overflow-y-auto max-h-[60vh]">
        //       <div className="text-gray-700 leading-relaxed whitespace-pre-wrap border-l-4 border-blue-500 pl-4 bg-gray-50 p-4 rounded">{ruleText}</div>
        //     </div>
        //     <div className="flex justify-end p-6 border-t border-gray-200">
        //       <button onClick={closeRulesModal} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors duration-200">
        //         بستن
        //       </button>
        //     </div>
        //   </div>
        // </div> */}{" "}
        </>
      )}
    </div>
  );
};

export default AcceptByUser;

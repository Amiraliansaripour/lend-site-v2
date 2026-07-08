<<<<<<< HEAD
import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../../api/axiosInstance";
import SvgSpinner from "../loading/SvgSpinner"; // فرض بر این است که این کامپوننت یک اسپینر SVG نمایش می‌دهد
import axios from "axios";
import { useForm } from "react-hook-form";
import { FiHelpCircle, FiChevronDown, FiChevronUp } from "react-icons/fi";
import Alert from "../Alert"; // فرض بر این است که این کامپوننت یک هشدار نمایش می‌دهد
import toast from "react-hot-toast"; // اضافه شدن toast
import NavigationButton from "../buttons/NavigationButton";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatNumberWithRegex } from "../../utils/formatNumberWithRegex";
import { convertRialToToman } from "../../utils/RialToToman";
import FrontOfCheck from "../../assets/FrontOfCheck.png";
import { PriceDisplayWithOutLabel } from "../../utils/formatTomanReadable";

const ChequeRegistration = ({ onBack, onNext, isEditMode, name = "", shenase = "", price = "", yektaID = "", guarantees }) => {
  const [shake, setShake] = useState(false);
  const [attachmentId, setAttachmentId] = useState(null); // ID فایل آپلود شده
  const [attachmentBackId, setAttachmentBackId] = useState(null); // ID فایل پشت چک آپلود شده
  const [attachmentPromissoryId, setAttachmentPromissoryId] = useState(null); // ID فایل سفته آپلود شده
  const [attachmentDeductionSalaryId, setAttachmentDeductionSalaryId] = useState(null); // ID فایل کسر از حقوق آپلود شده
  const [mandatoryFiles, setMandatoryFiles] = useState({
    chequeImage: null, // تغییر نام از idCardBack به chequeImage برای وضوح بیشتر
    chequeBackImage: null, // تصویر پشت چک
    promissoryImage: null, // تصویر سفته
    salaryDeductionImage: null, // تصویر کسر از حقوق
  });
  const [optionalFiles, setOptionalFiles] = useState([]); // برای فایل‌های اختیاری
  const [uploadProgress, setUploadProgress] = useState({}); // وضعیت آپلود (status, message, progress)
  const [showHelpText, setShowHelpText] = useState(false); // برای نمایش متن راهنما
  const [guaranteedAmount, setGuaranteedAmount] = useState();

  // Accordion states for each guarantee section
  const [accordionStates, setAccordionStates] = useState({
    cheque: true, // Start with cheque section open
    salaryDeduction: false,
    promissoryNote: false,
  });

  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("id");
  const navigate = useNavigate();

  // Canvas states
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const sayadId = watch("sayadId") || "";
  const token = localStorage.getItem("aToken");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Toggle accordion sections
  const toggleAccordion = (section) => {
    setAccordionStates((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imgRef.current;

    if (canvas && ctx && img) {
      const drawCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.font = "14px Arial";
        ctx.fillStyle = "#000";

        if (name) {
          ctx.fillText(name, 500, 154);
        }
        if (shenase) {
          ctx.fillText(shenase, 220, 149);
        }
        if (guaranteedAmount) {
          ctx.fillText(guaranteedAmount, 193, 190);
        }
        if (sayadId) {
          ctx.fillText(sayadId, 220, 74);
        }
      };

      if (img.complete) {
        drawCanvas();
      } else {
        img.onload = drawCanvas;
      }
    }
  }, [name, shenase, guaranteedAmount, sayadId]);

  useEffect(() => {
    axiosInstance
      .get(`/api/v1/Request/Get/${requestId}`, {
        headers: {
          ...headers,
        },
      })
      .then((res) => setGuaranteedAmount(res?.data?.data?.guaranteedAmount));
  }, []);

  // تابع آپلود فایل به سرور
  const uploadFileToServer = async (file, key, type = 101) => {
    setUploadProgress((prev) => ({
      ...prev,
      [key]: { status: "uploading", message: "در حال آپلود...", progress: 0 },
    }));

    try {
      const formData = new FormData();
      formData.append("Name", file.name); // استفاده از نام واقعی فایل
      formData.append("attachmentType", type); // مثلاً کد 201 برای تصویر چک صیادی
      formData.append("file", file);

      const response = await axiosInstance.post(`${import.meta.env.VITE_BASE_API}/api/v1/Attachment/create1`, formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress((prev) => ({
            ...prev,
            [key]: {
              status: "uploading",
              message: `در حال آپلود: ${percentCompleted}%`,
              progress: percentCompleted,
            },
          }));
        },
      });

      if (response.status === 200 && response.data.isSuccess) {
        setUploadProgress((prev) => ({
          ...prev,
          [key]: { status: "success", message: "با موفقیت آپلود شد!" },
        }));

        // ذخیره ID فایل آپلود شده بر اساس نوع فایل
        if (key === "chequeImage") {
          setAttachmentId(response?.data?.data?.id);
          toast.success("تصویر چک با موفقیت آپلود شد.");
        } else if (key === "chequeBackImage") {
          setAttachmentBackId(response?.data?.data?.id);
          toast.success("تصویر پشت چک با موفقیت آپلود شد.");
        } else if (key === "promissoryImage") {
          setAttachmentPromissoryId(response?.data?.data?.id);
          toast.success("تصویر سفته با موفقیت آپلود شد.");
        } else if (key === "salaryDeductionImage") {
          setAttachmentDeductionSalaryId(response?.data?.data?.id);
          toast.success("تصویر کسر از حقوق با موفقیت آپلود شد.");
        }
      } else {
        // اگر isSuccess: false بود، پیام خطا را از سرور دریافت می‌کنیم
        const errorMessage = response.data.message || "خطایی نامشخص در سرور رخ داد.";
        setUploadProgress((prev) => ({
          ...prev,
          [key]: { status: "error", message: errorMessage },
        }));
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = "مشکلی در ارتباط با سرور پیش آمد، لطفاً دوباره تلاش کنید.";

      // مدیریت خطاهای خاص Axios
      if (axios.isAxiosError(error) && error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors).join(", ");
        }
      }
      setUploadProgress((prev) => ({
        ...prev,
        [key]: { status: "error", message: errorMessage },
      }));
      toast.error(errorMessage);
    }
  };

  // تابع مشترک برای پردازش فایل اجباری (انتخاب یا درگ و دراپ)
  const processMandatoryFile = (file, key, type = 101) => {
    if (file && file.size <= 3 * 1024 * 1024) {
      const previewUrl = URL.createObjectURL(file);

      setMandatoryFiles((prev) => ({
        ...prev,
        [key]: {
          file: file,
          preview: previewUrl, // URL پیش‌نمایش
          format: file.type,
        },
      }));

      uploadFileToServer(file, key, type);
    } else {
      setUploadProgress((prev) => ({
        ...prev,
        [key]: {
          status: "error",
          message: "حجم فایل باید کمتر از 3 مگابایت باشد.",
        },
      }));
      toast.error("حجم فایل باید کمتر از 3 مگابایت باشد.");
      // در صورت خطا، پیش‌نمایش را نیز پاک کنید
      setMandatoryFiles((prev) => ({
        ...prev,
        [key]: null,
      }));
    }
  };

  // مدیریت آپلود از طریق انتخاب فایل
  const handleMandatoryUpload = (event, key, type = 101) => {
    const file = event.target.files[0];
    if (file) {
      processMandatoryFile(file, key, type);
    } else {
      // اگر کاربر کنسل کرد یا فایلی انتخاب نکرد، پیش‌نمایش را پاک کن
      setMandatoryFiles((prev) => ({
        ...prev,
        [key]: null,
      }));
      setUploadProgress((prev) => ({
        ...prev,
        [key]: {}, // وضعیت آپلود را نیز ریست کن
      }));
    }
  };

  const handleDrop = (event, key) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      processMandatoryFile(file, key);
    }
  };

  useEffect(() => {
    return () => {
      if (mandatoryFiles.chequeImage && mandatoryFiles.chequeImage.preview) {
        URL.revokeObjectURL(mandatoryFiles.chequeImage.preview);
      }
      if (mandatoryFiles.chequeBackImage && mandatoryFiles.chequeBackImage.preview) {
        URL.revokeObjectURL(mandatoryFiles.chequeBackImage.preview);
      }
      if (mandatoryFiles.promissoryImage && mandatoryFiles.promissoryImage.preview) {
        URL.revokeObjectURL(mandatoryFiles.promissoryImage.preview);
      }
      if (mandatoryFiles.salaryDeductionImage && mandatoryFiles.salaryDeductionImage.preview) {
        URL.revokeObjectURL(mandatoryFiles.salaryDeductionImage.preview);
      }
      optionalFiles.forEach((fileData) => {
        if (fileData && fileData.preview) {
          URL.revokeObjectURL(fileData.preview);
        }
      });
    };
  }, [mandatoryFiles.chequeImage, mandatoryFiles.chequeBackImage, mandatoryFiles.promissoryImage, mandatoryFiles.salaryDeductionImage, optionalFiles]);

  const onSubmit = async (data) => {
    if (guarantees?.includes("چک")) {
      if (sayadId.length !== 16) {
        toast.error("شناسه یکتای صیادی باید 16 رقم باشد.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      if (!mandatoryFiles.chequeImage || uploadProgress.chequeImage?.status !== "success") {
        toast.error("لطفاً تصویر چک صیادی را آپلود کرده و از موفقیت آن اطمینان حاصل کنید.");
        return;
      }

      if (!mandatoryFiles.chequeBackImage || uploadProgress.chequeBackImage?.status !== "success") {
        toast.error("لطفاً تصویر پشت چک صیادی را آپلود کرده و از موفقیت آن اطمینان حاصل کنید.");
        return;
      }
    }

    if (guarantees?.includes("کسر از حقوق")) {
      if (!mandatoryFiles.salaryDeductionImage || uploadProgress.salaryDeductionImage?.status !== "success") {
        toast.error("لطفاً تصویر مدرک کسر از حقوق را آپلود کرده و از موفقیت آن اطمینان حاصل کنید.");
        return;
      }
    }

    if (guarantees?.includes("سفته")) {
      if (!mandatoryFiles.promissoryImage || uploadProgress.promissoryImage?.status !== "success") {
        toast.error("لطفاً تصویر سفته را آپلود کرده و از موفقیت آن اطمینان حاصل کنید.");
        return;
      }
    }

    const formData = {
      sayadId: sayadId ? sayadId : null,
      requestId: requestId,
      attachmentId: attachmentId,
      attachmentBackId: attachmentBackId,
      attachmentPromissoryId: attachmentPromissoryId,
      attachmentDeductionSalaryId: attachmentDeductionSalaryId,
    };
    try {
      const response = await axiosInstance.post(`/api/v1/Cheque/Chequeregister`, formData);

      if (response.status === 200 && response.data.isSuccess) {
        axiosInstance
          .post(`/api/v1/Request/ChangeRequestState`, {
            id: requestId,
            requestState: 7,
          })
          .then(
            (response) => {
              if (isEditMode === true) {
                navigate("/dash");
              }
              onNext({ cheque: formData });
            },
            (error) => {
              console.log(error);
            }
          );
      } else {
        const errorMessage = response.data.message || "خطایی در ثبت اطلاعات  رخ داد.";
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Error submitting cheque form:", err);
      let errorMessage = "مشکلی در ارسال فرم پیش آمد. لطفاً دوباره تلاش کنید.";

      if (axios.isAxiosError(err) && err.response && err.response.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors) {
          errorMessage = Object.values(err.response.data.errors).join(", ");
        }
      }
      toast.error(errorMessage);
    }
  };

  const handleInputChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // فقط اعداد را نگه دار

    if (input.length > 16) {
      input = input.slice(0, 16);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error("شناسه یکتای صیادی نمی‌تواند بیشتر از 16 رقم باشد.");
    } else if (input.length < 16 && input.length > 0) {
      toast.info(`باقی‌مانده: ${16 - input.length} رقم`);
    }

    setValue("sayadId", input, { shouldValidate: true });
  };

  const onError = (errors) => {
    if (errors.sayadId) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error(errors.sayadId.message);
    }
  };
  // لغو درخواست
  const handleActualCancellation = async () => {
    try {
      const res = await axiosInstance.get(`/api/v1/Request/OptOut/${requestId}`);
      console.log("res data", res?.status);
      if (res.status === 200 || res?.data?.isSuccess) {
        toast.success("درخواست شما با موفقیت لغو شد");
        navigate("/dash");
      } else {
        toast.error("مشکلی در درخواست وجود دارد");
      }
    } catch (error) {
      console.error("خطا در لغو درخواست:", error);
      toast.error("خطایی رخ داده است");
    }
  };
  return (
    <div className="grid">
      <div className="text-right shadow-lg p-6 rounded-2xl bg-white">
        {guarantees.includes("چک") && (
          <div className="w-full flex flex-col items-start justify-start border border-gray-200 rounded-lg mb-4">
            <div className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200" onClick={() => toggleAccordion("cheque")}>
              <h2 className="font-bold text-xl">ثبت چک صیادی</h2>
              {accordionStates.cheque ? <FiChevronUp className="text-xl text-gray-600" /> : <FiChevronDown className="text-xl text-gray-600" />}
            </div>
            <div className={`w-full px-4 pb-4 transition-all duration-300 overflow-hidden ${accordionStates.cheque ? "max-h-none opacity-100" : "max-h-0 opacity-0 pb-0"}`}>
              {/* Content wrapper */}
              <Alert className="mt-4 w-full mb-6 ">
                <p className="font-bold text-lg text-center mb-6">چک باید در وجه زیر باشد:</p>
                <div className="flex flex-col justify-center md:flex-row md:gap-10 items-start">
                  <span>
                    <span className="col-span-1">شناسه ملی شرکت: </span>
                    <span className="font-bold text-blue-500 ">14014520172</span>
                  </span>
                  <span>
                    <span className="col-span-1">نام شرکت: </span>
                    <span className="font-bold text-blue-500 col-span-1">فناوری اطلاعات راژمان</span>
                  </span>
                </div>
              </Alert>

              <form onSubmit={handleSubmit(onSubmit, onError)} className="w-full mt-6 grid gap-5">
                <div className="w-full mb-10 grid gap-8 sm:place-items-center">
                  <div className="grid gap-4 w-full md:w-2/4">
                    <span className="flex items-center gap-2">
                      <p className="text-base font-medium text-gray-700">شناسه یکتای صیادی</p>
                      <div className="relative group md:flex items-center gap-2">
                        <FiHelpCircle className="text-blue-500 cursor-pointer" onClick={() => setShowHelpText(!showHelpText)} />
                        {showHelpText && <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">شناسه یکتا 16 رقم دارد</div>}
                      </div>
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="sayadId"
                      value={sayadId}
                      onChange={handleInputChange}
                      className={`lg:w-80 text-right border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent ${sayadId.length === 16 ? "border-green-500 focus:ring-green-500" : "border-red-500 focus:ring-red-500"} ${shake ? "animate-shake" : ""}`}
                      {...register("sayadId", {
                        required: "شناسه یکتای صیادی الزامی است.",
                        minLength: {
                          value: 16,
                          message: "شناسه یکتای صیادی باید 16 رقم باشد.",
                        },
                        maxLength: {
                          value: 16,
                          message: "شناسه یکتای صیادی باید 16 رقم باشد.",
                        },
                      })}
                    />
                    <span className={`text-sm ${sayadId.length === 16 ? "text-green-600" : "text-red-600"}`}>{sayadId.length <= 0 ? null : `${sayadId.length} رقم وارد شده`}</span>
                    {errors.sayadId && <span className="text-red-500 text-sm mt-1">{errors.sayadId.message}</span>}
                  </div>
                  <div className="grid gap-4 w-full mb-6">
                    <label className="block text-lg font-medium text-gray-700">پیش‌نمایش چک صیادی</label>
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center">
                      <canvas ref={canvasRef} width={600} height={300} className="border border-gray-400 rounded bg-white max-w-full mx-auto" style={{ maxWidth: "100%", height: "auto" }} />
                      <img ref={imgRef} src={FrontOfCheck} alt="Front of Check" style={{ display: "none" }} />
                    </div>
                  </div>
                  <div className="grid gap-4 w-full md:w-2/4">
                    <label className="block text-lg font-medium text-gray-700">تصویر چک صیادی *</label>
                    <p className="text-blue-500">پسوندهای مجاز: .jpg, .jpeg, .png</p>
                    <div className="border border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "chequeImage")}>
                      {mandatoryFiles.chequeImage?.preview ? <img src={mandatoryFiles.chequeImage.preview} alt="تصویر چک صیادی" width="60" height="60" className="mx-auto mb-2 rounded" /> : <span className="block text-sm text-gray-500 mb-2">فایل را بکشید و رها کنید یا کلیک کنید</span>}
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        className="mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                        onChange={(e) => handleMandatoryUpload(e, "chequeImage", 107)}
                        // کلید `value` را اضافه کنید تا فیلد ورودی فایل هنگام کنسل شدن ریست شود
                        value={mandatoryFiles.chequeImage ? undefined : ""}
                      />
                    </div>
                    <Alert>
                      مبلغ ثبت چک باید &nbsp;
                      <span className="!font-bold text-red-500">{PriceDisplayWithOutLabel(+guaranteedAmount)}</span>
                      &nbsp; ریال باشد
                    </Alert>
                    {uploadProgress.chequeImage?.status && (
                      <div className="mt-2 text-center">
                        {uploadProgress.chequeImage.status === "uploading" && (
                          <div role="status" className="flex items-center justify-center">
                            <SvgSpinner />
                            <span className="text-blue-500 text-sm ml-2">{uploadProgress.chequeImage.message}</span>
                          </div>
                        )}
                        {uploadProgress.chequeImage.status === "success" && <p className="text-green-500 text-sm">{uploadProgress.chequeImage.message}</p>}
                        {uploadProgress.chequeImage.status === "error" && <p className="text-red-500 text-sm">{uploadProgress.chequeImage.message}</p>}
                      </div>
                    )}
                  </div>
                  <div className="grid gap-4 w-full md:w-2/4">
                    <label className="block text-lg font-medium text-gray-700">تصویر پشت چک صیادی *</label>
                    <p className="text-blue-500">پسوندهای مجاز: .jpg, .jpeg, .png</p>

                    <div className="border border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "chequeBackImage")}>
                      {mandatoryFiles.chequeBackImage?.preview ? <img src={mandatoryFiles.chequeBackImage.preview} alt="تصویر پشت چک صیادی" width="60" height="60" className="mx-auto mb-2 rounded" /> : <span className="block text-sm text-gray-500 mb-2">فایل را بکشید و رها کنید یا کلیک کنید</span>}
                      <input type="file" accept="image/png, image/jpeg" className="mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" onChange={(e) => handleMandatoryUpload(e, "chequeBackImage", 107)} value={mandatoryFiles.chequeBackImage ? undefined : ""} />
                    </div>

                    {uploadProgress.chequeBackImage?.status && (
                      <div className="mt-2 text-center">
                        {uploadProgress.chequeBackImage.status === "uploading" && (
                          <div role="status" className="flex items-center justify-center">
                            <SvgSpinner />
                            <span className="text-blue-500 text-sm ml-2">{uploadProgress.chequeBackImage.message}</span>
                          </div>
                        )}
                        {uploadProgress.chequeBackImage.status === "success" && <p className="text-green-500 text-sm">{uploadProgress.chequeBackImage.message}</p>}
                        {uploadProgress.chequeBackImage.status === "error" && <p className="text-red-500 text-sm">{uploadProgress.chequeBackImage.message}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
        {guarantees.includes("کسر از حقوق") && (
          <div className="w-full flex flex-col items-start justify-start border border-gray-200 rounded-lg mb-4">
            <div className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200" onClick={() => toggleAccordion("salaryDeduction")}>
              <h2 className="font-bold text-xl">کسر از حقوق</h2>
              {accordionStates.salaryDeduction ? <FiChevronUp className="text-xl text-gray-600" /> : <FiChevronDown className="text-xl text-gray-600" />}
            </div>
            <div className={`w-full px-4 pb-4 transition-all duration-300 overflow-hidden ${accordionStates.salaryDeduction ? "max-h-none opacity-100" : "max-h-0 opacity-0 pb-0"}`}>
              {/* Content wrapper */}
              <Alert className="mt-4 w-full mb-6 ">
                <p className="font-bold text-lg text-center mb-6">لطفاً مدارک مربوط به کسر از حقوق را آپلود کنید:</p>
              </Alert>

              <div className="w-full mt-6 grid gap-5">
                <div className="w-full mb-10 grid gap-8 sm:place-items-center">
                  <div className="grid gap-4 w-full md:w-2/4">
                    <label className="block text-lg font-medium text-gray-700">تصویر مدرک کسر از حقوق *</label>
                    <p className="text-blue-500">پسوندهای مجاز: .jpg, .jpeg, .png</p>
                    <div className="border border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "salaryDeductionImage")}>
                      {mandatoryFiles.salaryDeductionImage?.preview ? <img src={mandatoryFiles.salaryDeductionImage.preview} alt="تصویر مدرک کسر از حقوق" width="60" height="60" className="mx-auto mb-2 rounded" /> : <span className="block text-sm text-gray-500 mb-2">فایل را بکشید و رها کنید یا کلیک کنید</span>}
                      <input type="file" accept="image/png, image/jpeg" className="mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" onChange={(e) => handleMandatoryUpload(e, "salaryDeductionImage", 110)} value={mandatoryFiles.salaryDeductionImage ? undefined : ""} />
                    </div>
                    {uploadProgress.salaryDeductionImage?.status && (
                      <div className="mt-2 text-center">
                        {uploadProgress.salaryDeductionImage.status === "uploading" && (
                          <div role="status" className="flex items-center justify-center">
                            <SvgSpinner />
                            <span className="text-blue-500 text-sm ml-2">{uploadProgress.salaryDeductionImage.message}</span>
                          </div>
                        )}
                        {uploadProgress.salaryDeductionImage.status === "success" && <p className="text-green-500 text-sm">{uploadProgress.salaryDeductionImage.message}</p>}
                        {uploadProgress.salaryDeductionImage.status === "error" && <p className="text-red-500 text-sm">{uploadProgress.salaryDeductionImage.message}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {guarantees.includes("سفته") && (
          <div className="w-full flex flex-col items-start justify-start border border-gray-200 rounded-lg mb-4">
            <div className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200" onClick={() => toggleAccordion("promissoryNote")}>
              <h2 className="font-bold text-xl">سفته</h2>
              {accordionStates.promissoryNote ? <FiChevronUp className="text-xl text-gray-600" /> : <FiChevronDown className="text-xl text-gray-600" />}
            </div>
            <div className={`w-full px-4 pb-4 transition-all duration-300 overflow-hidden ${accordionStates.promissoryNote ? "max-h-none opacity-100" : "max-h-0 opacity-0 pb-0"}`}>
              {/* Content wrapper */}
              <Alert className="mt-4 w-full mb-6 ">
                <p className="font-bold text-lg text-center mb-6">لطفاً مدارک مربوط به سفته را آپلود کنید:</p>
                <div className="flex flex-col justify-center md:flex-row md:gap-10 items-start">
                  <span>مبلغ تضمین: </span>
                  <span className="font-bold text-blue-500 ">{PriceDisplayWithOutLabel(+guaranteedAmount)} ریال</span>
                </div>
              </Alert>

              <div className="w-full mt-6 grid gap-5">
                <div className="w-full mb-10 grid gap-8 sm:place-items-center">
                  <div className="grid gap-4 w-full md:w-2/4">
                    <label className="block text-lg font-medium text-gray-700">تصویر سفته *</label>
                    <p className="text-blue-500">پسوندهای مجاز: .jpg, .jpeg, .png</p>
                    <div className="border border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "promissoryImage")}>
                      {mandatoryFiles.promissoryImage?.preview ? <img src={mandatoryFiles.promissoryImage.preview} alt="تصویر سفته" width="60" height="60" className="mx-auto mb-2 rounded" /> : <span className="block text-sm text-gray-500 mb-2">فایل را بکشید و رها کنید یا کلیک کنید</span>}
                      <input type="file" accept="image/png, image/jpeg" className="mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" onChange={(e) => handleMandatoryUpload(e, "promissoryImage", 111)} value={mandatoryFiles.promissoryImage ? undefined : ""} />
                    </div>
                    {uploadProgress.promissoryImage?.status && (
                      <div className="mt-2 text-center">
                        {uploadProgress.promissoryImage.status === "uploading" && (
                          <div role="status" className="flex items-center justify-center">
                            <SvgSpinner />
                            <span className="text-blue-500 text-sm ml-2">{uploadProgress.promissoryImage.message}</span>
                          </div>
                        )}
                        {uploadProgress.promissoryImage.status === "success" && <p className="text-green-500 text-sm">{uploadProgress.promissoryImage.message}</p>}
                        {uploadProgress.promissoryImage.status === "error" && <p className="text-red-500 text-sm">{uploadProgress.promissoryImage.message}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <NavigationButton onNext={onSubmit} onCancel={handleActualCancellation} isFirstStep={false} />
    </div>
  );
};

export default ChequeRegistration;
=======
import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../../api/axiosInstance";
import SvgSpinner from "../loading/SvgSpinner"; // فرض بر این است که این کامپوننت یک اسپینر SVG نمایش می‌دهد
import axios from "axios";
import { useForm } from "react-hook-form";
import { FiHelpCircle, FiChevronDown, FiChevronUp } from "react-icons/fi";
import Alert from "../Alert"; // فرض بر این است که این کامپوننت یک هشدار نمایش می‌دهد
import toast from "react-hot-toast"; // اضافه شدن toast
import NavigationButton from "../buttons/NavigationButton";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatNumberWithRegex } from "../../utils/formatNumberWithRegex";
import { convertRialToToman } from "../../utils/RialToToman";
import FrontOfCheck from "../../assets/FrontOfCheck.png";
import { PriceDisplayWithOutLabel } from "../../utils/formatTomanReadable";

const ChequeRegistration = ({ onBack, onNext, isEditMode, name = "", shenase = "", price = "", yektaID = "", guarantees }) => {
  const [shake, setShake] = useState(false);
  const [attachmentId, setAttachmentId] = useState(null); // ID فایل آپلود شده
  const [attachmentBackId, setAttachmentBackId] = useState(null); // ID فایل پشت چک آپلود شده
  const [attachmentPromissoryId, setAttachmentPromissoryId] = useState(null); // ID فایل سفته آپلود شده
  const [attachmentDeductionSalaryId, setAttachmentDeductionSalaryId] = useState(null); // ID فایل کسر از حقوق آپلود شده
  const [mandatoryFiles, setMandatoryFiles] = useState({
    chequeImage: null, // تغییر نام از idCardBack به chequeImage برای وضوح بیشتر
    chequeBackImage: null, // تصویر پشت چک
    promissoryImage: null, // تصویر سفته
    salaryDeductionImage: null, // تصویر کسر از حقوق
  });
  const [optionalFiles, setOptionalFiles] = useState([]); // برای فایل‌های اختیاری
  const [uploadProgress, setUploadProgress] = useState({}); // وضعیت آپلود (status, message, progress)
  const [showHelpText, setShowHelpText] = useState(false); // برای نمایش متن راهنما
  const [guaranteedAmount, setGuaranteedAmount] = useState();

  // Accordion states for each guarantee section
  const [accordionStates, setAccordionStates] = useState({
    cheque: true, // Start with cheque section open
    salaryDeduction: false,
    promissoryNote: false,
  });

  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("id");
  const navigate = useNavigate();

  // Canvas states
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const sayadId = watch("sayadId") || "";
  const token = localStorage.getItem("aToken");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Toggle accordion sections
  const toggleAccordion = (section) => {
    setAccordionStates((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imgRef.current;

    if (canvas && ctx && img) {
      const drawCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.font = "14px Arial";
        ctx.fillStyle = "#000";

        if (name) {
          ctx.fillText(name, 500, 154);
        }
        if (shenase) {
          ctx.fillText(shenase, 220, 149);
        }
        if (guaranteedAmount) {
          ctx.fillText(guaranteedAmount, 193, 190);
        }
        if (sayadId) {
          ctx.fillText(sayadId, 220, 74);
        }
      };

      if (img.complete) {
        drawCanvas();
      } else {
        img.onload = drawCanvas;
      }
    }
  }, [name, shenase, guaranteedAmount, sayadId]);

  useEffect(() => {
    axiosInstance
      .get(`/api/v1/Request/Get/${requestId}`, {
        headers: {
          ...headers,
        },
      })
      .then((res) => setGuaranteedAmount(res?.data?.data?.guaranteedAmount));
  }, []);

  // تابع آپلود فایل به سرور
  const uploadFileToServer = async (file, key, type = 101) => {
    setUploadProgress((prev) => ({
      ...prev,
      [key]: { status: "uploading", message: "در حال آپلود...", progress: 0 },
    }));

    try {
      const formData = new FormData();
      formData.append("Name", file.name); // استفاده از نام واقعی فایل
      formData.append("attachmentType", type); // مثلاً کد 201 برای تصویر چک صیادی
      formData.append("file", file);

      const response = await axiosInstance.post(`${import.meta.env.VITE_BASE_API}/api/v1/Attachment/create1`, formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress((prev) => ({
            ...prev,
            [key]: {
              status: "uploading",
              message: `در حال آپلود: ${percentCompleted}%`,
              progress: percentCompleted,
            },
          }));
        },
      });

      if (response.status === 200 && response.data.isSuccess) {
        setUploadProgress((prev) => ({
          ...prev,
          [key]: { status: "success", message: "با موفقیت آپلود شد!" },
        }));

        // ذخیره ID فایل آپلود شده بر اساس نوع فایل
        if (key === "chequeImage") {
          setAttachmentId(response?.data?.data?.id);
          toast.success("تصویر چک با موفقیت آپلود شد.");
        } else if (key === "chequeBackImage") {
          setAttachmentBackId(response?.data?.data?.id);
          toast.success("تصویر پشت چک با موفقیت آپلود شد.");
        } else if (key === "promissoryImage") {
          setAttachmentPromissoryId(response?.data?.data?.id);
          toast.success("تصویر سفته با موفقیت آپلود شد.");
        } else if (key === "salaryDeductionImage") {
          setAttachmentDeductionSalaryId(response?.data?.data?.id);
          toast.success("تصویر کسر از حقوق با موفقیت آپلود شد.");
        }
      } else {
        // اگر isSuccess: false بود، پیام خطا را از سرور دریافت می‌کنیم
        const errorMessage = response.data.message || "خطایی نامشخص در سرور رخ داد.";
        setUploadProgress((prev) => ({
          ...prev,
          [key]: { status: "error", message: errorMessage },
        }));
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = "مشکلی در ارتباط با سرور پیش آمد، لطفاً دوباره تلاش کنید.";

      // مدیریت خطاهای خاص Axios
      if (axios.isAxiosError(error) && error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors).join(", ");
        }
      }
      setUploadProgress((prev) => ({
        ...prev,
        [key]: { status: "error", message: errorMessage },
      }));
      toast.error(errorMessage);
    }
  };

  // تابع مشترک برای پردازش فایل اجباری (انتخاب یا درگ و دراپ)
  const processMandatoryFile = (file, key, type = 101) => {
    if (file && file.size <= 3 * 1024 * 1024) {
      const previewUrl = URL.createObjectURL(file);

      setMandatoryFiles((prev) => ({
        ...prev,
        [key]: {
          file: file,
          preview: previewUrl, // URL پیش‌نمایش
          format: file.type,
        },
      }));

      uploadFileToServer(file, key, type);
    } else {
      setUploadProgress((prev) => ({
        ...prev,
        [key]: {
          status: "error",
          message: "حجم فایل باید کمتر از 3 مگابایت باشد.",
        },
      }));
      toast.error("حجم فایل باید کمتر از 3 مگابایت باشد.");
      // در صورت خطا، پیش‌نمایش را نیز پاک کنید
      setMandatoryFiles((prev) => ({
        ...prev,
        [key]: null,
      }));
    }
  };

  // مدیریت آپلود از طریق انتخاب فایل
  const handleMandatoryUpload = (event, key, type = 101) => {
    const file = event.target.files[0];
    if (file) {
      processMandatoryFile(file, key, type);
    } else {
      // اگر کاربر کنسل کرد یا فایلی انتخاب نکرد، پیش‌نمایش را پاک کن
      setMandatoryFiles((prev) => ({
        ...prev,
        [key]: null,
      }));
      setUploadProgress((prev) => ({
        ...prev,
        [key]: {}, // وضعیت آپلود را نیز ریست کن
      }));
    }
  };

  const handleDrop = (event, key) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      processMandatoryFile(file, key);
    }
  };

  useEffect(() => {
    return () => {
      if (mandatoryFiles.chequeImage && mandatoryFiles.chequeImage.preview) {
        URL.revokeObjectURL(mandatoryFiles.chequeImage.preview);
      }
      if (mandatoryFiles.chequeBackImage && mandatoryFiles.chequeBackImage.preview) {
        URL.revokeObjectURL(mandatoryFiles.chequeBackImage.preview);
      }
      if (mandatoryFiles.promissoryImage && mandatoryFiles.promissoryImage.preview) {
        URL.revokeObjectURL(mandatoryFiles.promissoryImage.preview);
      }
      if (mandatoryFiles.salaryDeductionImage && mandatoryFiles.salaryDeductionImage.preview) {
        URL.revokeObjectURL(mandatoryFiles.salaryDeductionImage.preview);
      }
      optionalFiles.forEach((fileData) => {
        if (fileData && fileData.preview) {
          URL.revokeObjectURL(fileData.preview);
        }
      });
    };
  }, [mandatoryFiles.chequeImage, mandatoryFiles.chequeBackImage, mandatoryFiles.promissoryImage, mandatoryFiles.salaryDeductionImage, optionalFiles]);

  const onSubmit = async (data) => {
    if (guarantees?.includes("چک")) {
      if (sayadId.length !== 16) {
        toast.error("شناسه یکتای صیادی باید 16 رقم باشد.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      if (!mandatoryFiles.chequeImage || uploadProgress.chequeImage?.status !== "success") {
        toast.error("لطفاً تصویر چک صیادی را آپلود کرده و از موفقیت آن اطمینان حاصل کنید.");
        return;
      }

      if (!mandatoryFiles.chequeBackImage || uploadProgress.chequeBackImage?.status !== "success") {
        toast.error("لطفاً تصویر پشت چک صیادی را آپلود کرده و از موفقیت آن اطمینان حاصل کنید.");
        return;
      }
    }

    if (guarantees?.includes("کسر از حقوق")) {
      if (!mandatoryFiles.salaryDeductionImage || uploadProgress.salaryDeductionImage?.status !== "success") {
        toast.error("لطفاً تصویر مدرک کسر از حقوق را آپلود کرده و از موفقیت آن اطمینان حاصل کنید.");
        return;
      }
    }

    if (guarantees?.includes("سفته")) {
      if (!mandatoryFiles.promissoryImage || uploadProgress.promissoryImage?.status !== "success") {
        toast.error("لطفاً تصویر سفته را آپلود کرده و از موفقیت آن اطمینان حاصل کنید.");
        return;
      }
    }

    const formData = {
      sayadId: sayadId ? sayadId : null,
      requestId: requestId,
      attachmentId: attachmentId,
      attachmentBackId: attachmentBackId,
      attachmentPromissoryId: attachmentPromissoryId,
      attachmentDeductionSalaryId: attachmentDeductionSalaryId,
    };
    try {
      const response = await axiosInstance.post(`/api/v1/Cheque/Chequeregister`, formData);

      if (response.status === 200 && response.data.isSuccess) {
        axiosInstance
          .post(`/api/v1/Request/ChangeRequestState`, {
            id: requestId,
            requestState: 7,
          })
          .then(
            (response) => {
              if (isEditMode === true) {
                navigate("/dash");
              }
              onNext({ cheque: formData });
            },
            (error) => {
              console.log(error);
            }
          );
      } else {
        const errorMessage = response.data.message || "خطایی در ثبت اطلاعات  رخ داد.";
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Error submitting cheque form:", err);
      let errorMessage = "مشکلی در ارسال فرم پیش آمد. لطفاً دوباره تلاش کنید.";

      if (axios.isAxiosError(err) && err.response && err.response.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors) {
          errorMessage = Object.values(err.response.data.errors).join(", ");
        }
      }
      toast.error(errorMessage);
    }
  };

  const handleInputChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // فقط اعداد را نگه دار

    if (input.length > 16) {
      input = input.slice(0, 16);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error("شناسه یکتای صیادی نمی‌تواند بیشتر از 16 رقم باشد.");
    } else if (input.length < 16 && input.length > 0) {
      toast.info(`باقی‌مانده: ${16 - input.length} رقم`);
    }

    setValue("sayadId", input, { shouldValidate: true });
  };

  const onError = (errors) => {
    if (errors.sayadId) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error(errors.sayadId.message);
    }
  };
  // لغو درخواست
  const handleActualCancellation = async () => {
    try {
      const res = await axiosInstance.get(`/api/v1/Request/OptOut/${requestId}`);
      console.log("res data", res?.status);
      if (res.status === 200 || res?.data?.isSuccess) {
        toast.success("درخواست شما با موفقیت لغو شد");
        navigate("/dash");
      } else {
        toast.error("مشکلی در درخواست وجود دارد");
      }
    } catch (error) {
      console.error("خطا در لغو درخواست:", error);
      toast.error("خطایی رخ داده است");
    }
  };
  return (
    <div className="grid">
      <div className="text-right shadow-lg p-6 rounded-2xl bg-white">
        {guarantees.includes("چک") && (
          <div className="w-full flex flex-col items-start justify-start border border-gray-200 rounded-lg mb-4">
            <div className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200" onClick={() => toggleAccordion("cheque")}>
              <h2 className="font-bold text-xl">ثبت چک صیادی</h2>
              {accordionStates.cheque ? <FiChevronUp className="text-xl text-gray-600" /> : <FiChevronDown className="text-xl text-gray-600" />}
            </div>
            <div className={`w-full px-4 pb-4 transition-all duration-300 overflow-hidden ${accordionStates.cheque ? "max-h-none opacity-100" : "max-h-0 opacity-0 pb-0"}`}>
              {/* Content wrapper */}
              <Alert className="mt-4 w-full mb-6 ">
                <p className="font-bold text-lg text-center mb-6">چک باید در وجه زیر باشد:</p>
                <div className="flex flex-col justify-center md:flex-row md:gap-10 items-start">
                  <span>
                    <span className="col-span-1">شناسه ملی شرکت: </span>
                    <span className="font-bold text-blue-500 ">14014520172</span>
                  </span>
                  <span>
                    <span className="col-span-1">نام شرکت: </span>
                    <span className="font-bold text-blue-500 col-span-1">فناوری اطلاعات راژمان</span>
                  </span>
                </div>
              </Alert>

              <form onSubmit={handleSubmit(onSubmit, onError)} className="w-full mt-6 grid gap-5">
                <div className="w-full mb-10 grid gap-8 sm:place-items-center">
                  <div className="grid gap-4 w-full md:w-2/4">
                    <span className="flex items-center gap-2">
                      <p className="text-base font-medium text-gray-700">شناسه یکتای صیادی</p>
                      <div className="relative group md:flex items-center gap-2">
                        <FiHelpCircle className="text-blue-500 cursor-pointer" onClick={() => setShowHelpText(!showHelpText)} />
                        {showHelpText && <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">شناسه یکتا 16 رقم دارد</div>}
                      </div>
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="sayadId"
                      value={sayadId}
                      onChange={handleInputChange}
                      className={`lg:w-80 text-right border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent ${sayadId.length === 16 ? "border-green-500 focus:ring-green-500" : "border-red-500 focus:ring-red-500"} ${shake ? "animate-shake" : ""}`}
                      {...register("sayadId", {
                        required: "شناسه یکتای صیادی الزامی است.",
                        minLength: {
                          value: 16,
                          message: "شناسه یکتای صیادی باید 16 رقم باشد.",
                        },
                        maxLength: {
                          value: 16,
                          message: "شناسه یکتای صیادی باید 16 رقم باشد.",
                        },
                      })}
                    />
                    <span className={`text-sm ${sayadId.length === 16 ? "text-green-600" : "text-red-600"}`}>{sayadId.length <= 0 ? null : `${sayadId.length} رقم وارد شده`}</span>
                    {errors.sayadId && <span className="text-red-500 text-sm mt-1">{errors.sayadId.message}</span>}
                  </div>
                  <div className="grid gap-4 w-full mb-6">
                    <label className="block text-lg font-medium text-gray-700">پیش‌نمایش چک صیادی</label>
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center">
                      <canvas ref={canvasRef} width={600} height={300} className="border border-gray-400 rounded bg-white max-w-full mx-auto" style={{ maxWidth: "100%", height: "auto" }} />
                      <img ref={imgRef} src={FrontOfCheck} alt="Front of Check" style={{ display: "none" }} />
                    </div>
                  </div>
                  <div className="grid gap-4 w-full md:w-2/4">
                    <label className="block text-lg font-medium text-gray-700">تصویر چک صیادی *</label>
                    <p className="text-blue-500">پسوندهای مجاز: .jpg, .jpeg, .png</p>
                    <div className="border border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "chequeImage")}>
                      {mandatoryFiles.chequeImage?.preview ? <img src={mandatoryFiles.chequeImage.preview} alt="تصویر چک صیادی" width="60" height="60" className="mx-auto mb-2 rounded" /> : <span className="block text-sm text-gray-500 mb-2">فایل را بکشید و رها کنید یا کلیک کنید</span>}
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        className="mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                        onChange={(e) => handleMandatoryUpload(e, "chequeImage", 107)}
                        // کلید `value` را اضافه کنید تا فیلد ورودی فایل هنگام کنسل شدن ریست شود
                        value={mandatoryFiles.chequeImage ? undefined : ""}
                      />
                    </div>
                    <Alert>
                      مبلغ ثبت چک باید &nbsp;
                      <span className="!font-bold text-red-500">{PriceDisplayWithOutLabel(+guaranteedAmount)}</span>
                      &nbsp; ریال باشد
                    </Alert>
                    {uploadProgress.chequeImage?.status && (
                      <div className="mt-2 text-center">
                        {uploadProgress.chequeImage.status === "uploading" && (
                          <div role="status" className="flex items-center justify-center">
                            <SvgSpinner />
                            <span className="text-blue-500 text-sm ml-2">{uploadProgress.chequeImage.message}</span>
                          </div>
                        )}
                        {uploadProgress.chequeImage.status === "success" && <p className="text-green-500 text-sm">{uploadProgress.chequeImage.message}</p>}
                        {uploadProgress.chequeImage.status === "error" && <p className="text-red-500 text-sm">{uploadProgress.chequeImage.message}</p>}
                      </div>
                    )}
                  </div>
                  <div className="grid gap-4 w-full md:w-2/4">
                    <label className="block text-lg font-medium text-gray-700">تصویر پشت چک صیادی *</label>
                    <p className="text-blue-500">پسوندهای مجاز: .jpg, .jpeg, .png</p>

                    <div className="border border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "chequeBackImage")}>
                      {mandatoryFiles.chequeBackImage?.preview ? <img src={mandatoryFiles.chequeBackImage.preview} alt="تصویر پشت چک صیادی" width="60" height="60" className="mx-auto mb-2 rounded" /> : <span className="block text-sm text-gray-500 mb-2">فایل را بکشید و رها کنید یا کلیک کنید</span>}
                      <input type="file" accept="image/png, image/jpeg" className="mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" onChange={(e) => handleMandatoryUpload(e, "chequeBackImage", 107)} value={mandatoryFiles.chequeBackImage ? undefined : ""} />
                    </div>

                    {uploadProgress.chequeBackImage?.status && (
                      <div className="mt-2 text-center">
                        {uploadProgress.chequeBackImage.status === "uploading" && (
                          <div role="status" className="flex items-center justify-center">
                            <SvgSpinner />
                            <span className="text-blue-500 text-sm ml-2">{uploadProgress.chequeBackImage.message}</span>
                          </div>
                        )}
                        {uploadProgress.chequeBackImage.status === "success" && <p className="text-green-500 text-sm">{uploadProgress.chequeBackImage.message}</p>}
                        {uploadProgress.chequeBackImage.status === "error" && <p className="text-red-500 text-sm">{uploadProgress.chequeBackImage.message}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
        {guarantees.includes("کسر از حقوق") && (
          <div className="w-full flex flex-col items-start justify-start border border-gray-200 rounded-lg mb-4">
            <div className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200" onClick={() => toggleAccordion("salaryDeduction")}>
              <h2 className="font-bold text-xl">کسر از حقوق</h2>
              {accordionStates.salaryDeduction ? <FiChevronUp className="text-xl text-gray-600" /> : <FiChevronDown className="text-xl text-gray-600" />}
            </div>
            <div className={`w-full px-4 pb-4 transition-all duration-300 overflow-hidden ${accordionStates.salaryDeduction ? "max-h-none opacity-100" : "max-h-0 opacity-0 pb-0"}`}>
              {/* Content wrapper */}
              <Alert className="mt-4 w-full mb-6 ">
                <p className="font-bold text-lg text-center mb-6">لطفاً مدارک مربوط به کسر از حقوق را آپلود کنید:</p>
              </Alert>

              <div className="w-full mt-6 grid gap-5">
                <div className="w-full mb-10 grid gap-8 sm:place-items-center">
                  <div className="grid gap-4 w-full md:w-2/4">
                    <label className="block text-lg font-medium text-gray-700">تصویر مدرک کسر از حقوق *</label>
                    <p className="text-blue-500">پسوندهای مجاز: .jpg, .jpeg, .png</p>
                    <div className="border border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "salaryDeductionImage")}>
                      {mandatoryFiles.salaryDeductionImage?.preview ? <img src={mandatoryFiles.salaryDeductionImage.preview} alt="تصویر مدرک کسر از حقوق" width="60" height="60" className="mx-auto mb-2 rounded" /> : <span className="block text-sm text-gray-500 mb-2">فایل را بکشید و رها کنید یا کلیک کنید</span>}
                      <input type="file" accept="image/png, image/jpeg" className="mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" onChange={(e) => handleMandatoryUpload(e, "salaryDeductionImage", 110)} value={mandatoryFiles.salaryDeductionImage ? undefined : ""} />
                    </div>
                    {uploadProgress.salaryDeductionImage?.status && (
                      <div className="mt-2 text-center">
                        {uploadProgress.salaryDeductionImage.status === "uploading" && (
                          <div role="status" className="flex items-center justify-center">
                            <SvgSpinner />
                            <span className="text-blue-500 text-sm ml-2">{uploadProgress.salaryDeductionImage.message}</span>
                          </div>
                        )}
                        {uploadProgress.salaryDeductionImage.status === "success" && <p className="text-green-500 text-sm">{uploadProgress.salaryDeductionImage.message}</p>}
                        {uploadProgress.salaryDeductionImage.status === "error" && <p className="text-red-500 text-sm">{uploadProgress.salaryDeductionImage.message}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {guarantees.includes("سفته") && (
          <div className="w-full flex flex-col items-start justify-start border border-gray-200 rounded-lg mb-4">
            <div className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200" onClick={() => toggleAccordion("promissoryNote")}>
              <h2 className="font-bold text-xl">سفته</h2>
              {accordionStates.promissoryNote ? <FiChevronUp className="text-xl text-gray-600" /> : <FiChevronDown className="text-xl text-gray-600" />}
            </div>
            <div className={`w-full px-4 pb-4 transition-all duration-300 overflow-hidden ${accordionStates.promissoryNote ? "max-h-none opacity-100" : "max-h-0 opacity-0 pb-0"}`}>
              {/* Content wrapper */}
              <Alert className="mt-4 w-full mb-6 ">
                <p className="font-bold text-lg text-center mb-6">لطفاً مدارک مربوط به سفته را آپلود کنید:</p>
                <div className="flex flex-col justify-center md:flex-row md:gap-10 items-start">
                  <span>مبلغ تضمین: </span>
                  <span className="font-bold text-blue-500 ">{PriceDisplayWithOutLabel(+guaranteedAmount)} ریال</span>
                </div>
              </Alert>

              <div className="w-full mt-6 grid gap-5">
                <div className="w-full mb-10 grid gap-8 sm:place-items-center">
                  <div className="grid gap-4 w-full md:w-2/4">
                    <label className="block text-lg font-medium text-gray-700">تصویر سفته *</label>
                    <p className="text-blue-500">پسوندهای مجاز: .jpg, .jpeg, .png</p>
                    <div className="border border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "promissoryImage")}>
                      {mandatoryFiles.promissoryImage?.preview ? <img src={mandatoryFiles.promissoryImage.preview} alt="تصویر سفته" width="60" height="60" className="mx-auto mb-2 rounded" /> : <span className="block text-sm text-gray-500 mb-2">فایل را بکشید و رها کنید یا کلیک کنید</span>}
                      <input type="file" accept="image/png, image/jpeg" className="mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" onChange={(e) => handleMandatoryUpload(e, "promissoryImage", 111)} value={mandatoryFiles.promissoryImage ? undefined : ""} />
                    </div>
                    {uploadProgress.promissoryImage?.status && (
                      <div className="mt-2 text-center">
                        {uploadProgress.promissoryImage.status === "uploading" && (
                          <div role="status" className="flex items-center justify-center">
                            <SvgSpinner />
                            <span className="text-blue-500 text-sm ml-2">{uploadProgress.promissoryImage.message}</span>
                          </div>
                        )}
                        {uploadProgress.promissoryImage.status === "success" && <p className="text-green-500 text-sm">{uploadProgress.promissoryImage.message}</p>}
                        {uploadProgress.promissoryImage.status === "error" && <p className="text-red-500 text-sm">{uploadProgress.promissoryImage.message}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <NavigationButton onNext={onSubmit} onCancel={handleActualCancellation} isFirstStep={false} />
    </div>
  );
};

export default ChequeRegistration;
>>>>>>> a47b58a (pwa)

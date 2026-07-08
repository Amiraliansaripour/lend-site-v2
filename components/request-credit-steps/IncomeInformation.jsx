<<<<<<< HEAD
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import SvgSpinner from "../loading/SvgSpinner";
import Alert from "../Alert";
import NavigationButton from "../buttons/NavigationButton";

const IncomeInformation = ({ onNext, onBack, user, userIncom, setUserIncom, isEditMode }) => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [mandatoryFiles, setMandatoryFiles] = useState({
    AccountTurnover: null,
    SalarySlip: null,
  });
  const [optionalFiles, setOptionalFiles] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);

  const [attachmentIdList, setAttachmentIdList] = useState([]);
  const [searchParams] = useSearchParams();
  const paramsId = searchParams.get("id");
  const userId = user?.id;
  const reqId = paramsId;

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: userIncom,
  });

  const formatNumber = (value) => {
    if (!value) return "";
    const num = value.toString().replace(/,/g, "").replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const Income = watch("income");
  const installmentPayment = watch("payAbility");

  // Check if all required fields and files are valid
  useEffect(() => {
    const checkFormValidity = () => {
      // Check if both input fields have values
      const hasIncomeValue = Income && Income.trim() !== "";
      const hasInstallmentValue = installmentPayment && installmentPayment.trim() !== "";

      // Check if both mandatory files are uploaded successfully
      const hasAccountTurnover = mandatoryFiles.AccountTurnover && uploadProgress.AccountTurnover?.status === "success";
      const hasSalarySlip = mandatoryFiles.SalarySlip && uploadProgress.SalarySlip?.status === "success";

      // Form is valid only when all conditions are met
      const isValid = hasIncomeValue && hasInstallmentValue && hasAccountTurnover && hasSalarySlip;

      setIsFormValid(isValid);
    };

    checkFormValidity();
  }, [Income, installmentPayment, mandatoryFiles, uploadProgress]);

  const navigate = useNavigate();
  const token = localStorage.getItem("aToken");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const handleActualCancellation = async () => {
    try {
      const res = await axiosInstance.get(`/api/v1/Request/OptOut/${paramsId}`, {
        headers: {
          ...headers,
        },
      });

      if (res.status === 200 || res?.data?.isSuccess) {
        toast.success("درخواست شما با موفقیت لغو شد");
        navigate("/dash");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const onSubmit = async (data) => {
    const numericIncome = Income ? Number(Income.replace(/,/g, "")) : 0;
    const numericInstallmentPayment = installmentPayment ? Number(installmentPayment.replace(/,/g, "")) : 0;

    if (numericIncome && numericInstallmentPayment && numericInstallmentPayment >= numericIncome) {
      toast.error("مقدار قسط نباید بیشتر یا مساوی درآمد شما باشد");
      return;
    }

    if ((mandatoryFiles.AccountTurnover && uploadProgress.AccountTurnover?.status !== "success") || (mandatoryFiles.SalarySlip && uploadProgress.SalarySlip?.status !== "success")) {
      toast.error("لطفاً منتظر بمانید تا آپلود فایل‌ها تکمیل شود.");
      return;
    }

    setUserIncom(data);

    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_BASE_API}/api/v1/IncomeInfo/Create`,
        {
          income: numericIncome * 10,
          payAbility: numericInstallmentPayment * 10,
          requestId: paramsId,
          attachmentIds: [...attachmentIdList],
        },
        {
          headers: {
            ...headers,
          },
        }
      );

      if (response.status === 200 && response.data.isSuccess) {
        onNext();
      } else {
        const errorMessage = response.data.message || "خطا در ارسال اطلاعات درآمدی رخ داد.";
        toast.error(errorMessage);
      }
    } catch (error) {
      let errorMessage = "مشکلی در ارتباط با سرور پیش آمد، لطفاً دوباره تلاش کنید.";

      if (axios.isAxiosError(error) && error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors).join(", ");
        }
      }
    }
  };

  const addAttachmentId = (id) => {
    if (id && !attachmentIdList.includes(id)) {
      setAttachmentIdList((prev) => [...prev, id]);
    }
  };

  const uploadFileToServer = async (file, key) => {
    setUploadProgress((prev) => ({
      ...prev,
      [key]: { status: "uploading", message: "در حال آپلود...", progress: 0 },
    }));

    try {
      const formData = new FormData();
      formData.append("Name", file.name);

      let attachmentType;
      if (key === "AccountTurnover") {
        attachmentType = 101;
      } else if (key === "SalarySlip") {
        attachmentType = 101;
      } else if (key.startsWith("optionalFile_")) {
        attachmentType = 103;
      }
      formData.append("attachmentType", attachmentType);
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
        addAttachmentId(response?.data?.data?.id);
      } else {
        const errorMessage = response.data.message || "خطایی نامشخص در سرور رخ داد.";
        setUploadProgress((prev) => ({
          ...prev,
          [key]: { status: "error", message: errorMessage },
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = "مشکلی در ارتباط با سرور پیش آمد، لطفاً دوباره تلاش کنید.";

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
    }
  };

  const processMandatoryFile = (file, key) => {
    if (file && file.size <= 3 * 1024 * 1024) {
      const previewUrl = URL.createObjectURL(file);

      setMandatoryFiles((prev) => ({
        ...prev,
        [key]: {
          file: file,
          preview: previewUrl,
          format: file.type,
        },
      }));

      uploadFileToServer(file, key);
    } else {
      setUploadProgress((prev) => ({
        ...prev,
        [key]: {
          status: "error",
          message: "حجم فایل باید کمتر از 3 مگابایت باشد.",
        },
      }));
      toast.error("حجم فایل باید کمتر از 3 مگابایت باشد.");
    }
  };

  const handleMandatoryUpload = (event, key) => {
    const file = event.target.files[0];
    if (file) {
      processMandatoryFile(file, key);
    } else {
      setMandatoryFiles((prev) => ({
        ...prev,
        [key]: null,
      }));
      setUploadProgress((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  const handleDrop = (event, key) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      processMandatoryFile(file, key);
    }
  };

  const clearMandatoryFile = (key) => {
    setMandatoryFiles((prev) => {
      const currentFile = prev[key];
      if (currentFile && currentFile.preview) {
        URL.revokeObjectURL(currentFile.preview);
      }
      return {
        ...prev,
        [key]: null,
      };
    });
    setUploadProgress((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });

    const inputElement = document.getElementById(`file-input-${key}`);
    if (inputElement) {
      inputElement.value = "";
    }
  };

  useEffect(() => {
    return () => {
      Object.values(mandatoryFiles).forEach((fileData) => {
        if (fileData && fileData.preview) {
          URL.revokeObjectURL(fileData.preview);
        }
      });

      optionalFiles.forEach((fileData) => {
        if (fileData && fileData.preview) {
          URL.revokeObjectURL(fileData.preview);
        }
      });
    };
  }, [mandatoryFiles, optionalFiles]);

  const handleOptionalUpload = (event, index) => {
    const file = event.target.files[0];
    if (file && file.size <= 3 * 1024 * 1024) {
      const previewUrl = URL.createObjectURL(file);

      setOptionalFiles((prev) => {
        const updated = [...prev];
        updated[index] = {
          file: file,
          preview: previewUrl,
          format: file.type,
        };
        return updated;
      });

      uploadFileToServer(file, `optionalFile_${index}`);
    } else {
      setUploadProgress((prev) => ({
        ...prev,
        [`optionalFile_${index}`]: {
          status: "error",
          message: "حجم فایل باید کمتر از 3 مگابایت باشد.",
        },
      }));
      toast.error("حجم فایل باید کمتر از 3 مگابایت باشد.");
    }
  };

  const clearOptionalFile = (index) => {
    setOptionalFiles((prev) => {
      const updated = [...prev];
      const fileData = updated[index];
      if (fileData && fileData.preview) {
        URL.revokeObjectURL(fileData.preview);
      }
      updated[index] = null;
      return updated;
    });
    setUploadProgress((prev) => {
      const newState = { ...prev };
      delete newState[`optionalFile_${index}`];
      return newState;
    });

    const inputElement = document.getElementById(`optional-file-input-${index}`);
    if (inputElement) {
      inputElement.value = "";
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full gap-4 ">
        <div className=" max-lg:grid-cols-1 bg-white custom-shadow rounded-2xl gap-4 p-6">
          <h2 className="text-lg font-bold mb-4">اطلاعات درآمدی</h2>
          <div dir="rtl" className="grid grid-cols-2 gap-10">
            <div className="grid col-span-2 grid-cols-2 row-span-1">
              <div className="md:flex gap-8 col-span-2 mb-6">
                {/* مقدار درآمد */}
                <div className="flex flex-col col-span-1 w-full mt-6">
                  <label htmlFor="Income" className="text-sm font-bold text-black relative top-2 mb-0 mr-2 px-1 bg-white w-max">
                    مقدار درآمد (تومان)
                  </label>
                  <Controller
                    name="income"
                    control={control}
                    rules={{
                      validate: (value) => {
                        const payAbilityValue = watch("payAbility")?.replace(/,/g, "");

                        if (payAbilityValue && !value) {
                          return "مقدار درآمد الزامی است زمانی که میزان اقساط وارد شده است.";
                        }

                        if (value && payAbilityValue && Number(value.replace(/,/g, "")) <= Number(payAbilityValue)) {
                          return "مقدار درآمد باید بیشتر از میزان اقساط باشد.";
                        }
                        return true;
                      },
                    }}
                    render={({ field }) => <input {...field} value={formatNumber(field.value)} onChange={(e) => field.onChange(e.target.value.replace(/,/g, ""))} className="p-[11px_10px] border-2 border-gray-primary rounded-lg bg-white focus:outline-none" placeholder="مثال: 200,000,000" type="text" />}
                  />
                  {errors.income && <span className="text-red-500 text-xs">{errors.income.message}</span>}
                </div>

                {/* میزان اقساط ماهیانه */}
                <div className="flex flex-col w-full mt-6">
                  <label className="text-sm font-bold text-black relative top-2 mb-0 mr-2 px-1 bg-white w-max">میزان اقساط ماهیانه شما (تومان) :</label>
                  <Controller
                    name="payAbility"
                    control={control}
                    rules={{
                      validate: (value) => {
                        if (!value) return true;
                        const incomeValue = watch("income")?.replace(/,/g, "");
                        const payAbility = value?.replace(/,/g, "");

                        if (incomeValue && Number(payAbility) > Number(incomeValue)) {
                          return "میزان اقساط نمی‌تواند بیشتر از درآمد باشد.";
                        }
                        return true;
                      },
                    }}
                    render={({ field }) => <input {...field} value={formatNumber(field.value)} onChange={(e) => field.onChange(e.target.value.replace(/,/g, ""))} className="p-[11px_10px] border-2 border-gray-primary rounded-lg bg-white focus:outline-none" placeholder="مثال: 50,000,000" type="text" />}
                  />
                  {errors.payAbility && <span className="text-red-500 text-xs">{errors.payAbility.message}</span>}
                </div>
              </div>

              {/* آپلود فایل‌های اجباری: گردش حساب و فیش حقوقی */}
              <div className="col-span-2 md:flex gap-6">
                {/* گردش حساب */}
                <div className="w-full">
                  <label className="block text-lg font-medium mb-2 text-gray-700">گردش حساب</label>
                  <p className="text-blue-500">پسوندهای مجاز: excel, txt, jpg, jpeg, png</p>
                  <div className="border border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300 relative" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "AccountTurnover")}>
                    {/* نمایش پیش‌نمایش فایل */}
                    {mandatoryFiles.AccountTurnover && mandatoryFiles.AccountTurnover.preview ? (
                      <>
                        <img src={mandatoryFiles.AccountTurnover.preview} alt="گردش حساب" width="60" height="60" className="mx-auto mb-2 rounded" />
                        <p className="text-sm text-gray-600">{mandatoryFiles.AccountTurnover.file?.name}</p>
                      </>
                    ) : (
                      <span className="block text-sm text-gray-500 mb-2">فایل را بکشید و رها کنید یا کلیک کنید</span>
                    )}
                    <input
                      type="file"
                      id="file-input-AccountTurnover"
                      className="mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                      accept="
    application/vnd.ms-excel, 
    application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, 
    .xls, 
    .xlsx, 
    text/plain, 
    .txt, 
    image/jpeg, 
    .jpg, 
    .jpeg, 
    image/png, 
    .png
  "
                      onChange={(e) => handleMandatoryUpload(e, "AccountTurnover")}
                    />
                  </div>
                  {/* نمایش وضعیت آپلود */}
                  {uploadProgress.AccountTurnover && (
                    <div className="mt-2 text-center">
                      {uploadProgress.AccountTurnover.status === "uploading" && (
                        <div role="status" className="flex items-center justify-center">
                          <SvgSpinner /> {/* کامپوننت اسپینر */}
                          <span className="text-blue-500 text-sm ml-2">{uploadProgress.AccountTurnover.message}</span>
                        </div>
                      )}
                      {uploadProgress.AccountTurnover.status === "success" && <p className="text-green-500 text-sm">{uploadProgress.AccountTurnover.message}</p>}
                      {uploadProgress.AccountTurnover.status === "error" && <p className="text-red-500 text-sm">{uploadProgress.AccountTurnover.message}</p>}
                    </div>
                  )}
                </div>

                {/* فیش حقوقی */}
                <div className="w-full">
                  <label className="block text-lg font-medium mb-2 text-gray-700">فیش حقوقی</label>
                  <p className="text-blue-500">پسوندهای مجاز: excel, txt, jpg, jpeg, png</p>

                  <div className="border border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300 relative" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "SalarySlip")}>
                    {/* نمایش پیش‌نمایش فایل */}
                    {mandatoryFiles.SalarySlip && mandatoryFiles.SalarySlip.preview ? (
                      <>
                        <img src={mandatoryFiles.SalarySlip.preview} alt="فیش حقوقی" width="60" height="60" className="mx-auto mb-2 rounded" />
                        <p className="text-sm text-gray-600">{mandatoryFiles.SalarySlip.file?.name}</p>
                      </>
                    ) : (
                      <span className="block text-sm text-gray-500 mb-2">فایل را بکشید و رها کنید یا کلیک کنید</span>
                    )}
                    <input
                      type="file"
                      id="file-input-SalarySlip"
                      accept="
                      application/vnd.ms-excel, 
                      application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, 
                      .xls, 
                      .xlsx, 
                      text/plain, 
                      .txt, 
                      image/jpeg, 
                      .jpg, 
                      .jpeg, 
                      image/png, 
                      .png
                    "
                      className="mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                      onChange={(e) => handleMandatoryUpload(e, "SalarySlip")}
                    />
                  </div>
                  {/* نمایش وضعیت آپلود */}
                  {uploadProgress.SalarySlip && (
                    <div className="mt-2 text-center">
                      {uploadProgress.SalarySlip.status === "uploading" && (
                        <div role="status" className="flex items-center justify-center">
                          <SvgSpinner />
                          <span className="text-blue-500 text-sm ml-2">{uploadProgress.SalarySlip.message}</span>
                        </div>
                      )}
                      {uploadProgress.SalarySlip.status === "success" && <p className="text-green-500 text-sm">{uploadProgress.SalarySlip.message}</p>}
                      {uploadProgress.SalarySlip.status === "error" && <p className="text-red-500 text-sm">{uploadProgress.SalarySlip.message}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
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
            className="bg-gold-primary-900 hover:bg-gold-primary-800 text-white px-8 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gold-primary-700 focus:ring-opacity-50"
          >
            تایید و مرحله بعد
          </button>
        </div> */}

        {isEditMode ? (
          <NavigationButton
            onNext={onSubmit}
            nextLabel="ویرایش"
            // onCancel={handleActualCancellation}
            isFirstStep={false}
            isNextDisabled={!isFormValid}
          />
        ) : (
          <NavigationButton onNext={onSubmit} onCancel={handleActualCancellation} isFirstStep={false} isNextDisabled={!isFormValid} />
        )}

        {/* Validation Status Indicator */}
        {!isFormValid && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">برای ادامه، موارد زیر را تکمیل کنید:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              {(!Income || Income.trim() === "") && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full ml-2"></span>
                  مقدار درآمد را وارد کنید
                </li>
              )}
              {(!installmentPayment || installmentPayment.trim() === "") && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full ml-2"></span>
                  میزان اقساط ماهیانه را وارد کنید
                </li>
              )}
              {(!mandatoryFiles.AccountTurnover || uploadProgress.AccountTurnover?.status !== "success") && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full ml-2"></span>
                  فایل گردش حساب را آپلود کنید
                </li>
              )}
              {(!mandatoryFiles.SalarySlip || uploadProgress.SalarySlip?.status !== "success") && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full ml-2"></span>
                  فایل فیش حقوقی را آپلود کنید
                </li>
              )}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};

export default IncomeInformation;
=======
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import SvgSpinner from "../loading/SvgSpinner";
import Alert from "../Alert";
import NavigationButton from "../buttons/NavigationButton";

const IncomeInformation = ({ onNext, onBack, user, userIncom, setUserIncom, isEditMode }) => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [mandatoryFiles, setMandatoryFiles] = useState({
    AccountTurnover: null,
    SalarySlip: null,
  });
  const [optionalFiles, setOptionalFiles] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);

  const [attachmentIdList, setAttachmentIdList] = useState([]);
  const [searchParams] = useSearchParams();
  const paramsId = searchParams.get("id");
  const userId = user?.id;
  const reqId = paramsId;

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: userIncom,
  });

  const formatNumber = (value) => {
    if (!value) return "";
    const num = value.toString().replace(/,/g, "").replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const Income = watch("income");
  const installmentPayment = watch("payAbility");

  // Check if all required fields and files are valid
  useEffect(() => {
    const checkFormValidity = () => {
      // Check if both input fields have values
      const hasIncomeValue = Income && Income.trim() !== "";
      const hasInstallmentValue = installmentPayment && installmentPayment.trim() !== "";

      // Check if both mandatory files are uploaded successfully
      const hasAccountTurnover = mandatoryFiles.AccountTurnover && uploadProgress.AccountTurnover?.status === "success";
      const hasSalarySlip = mandatoryFiles.SalarySlip && uploadProgress.SalarySlip?.status === "success";

      // Form is valid only when all conditions are met
      const isValid = hasIncomeValue && hasInstallmentValue && hasAccountTurnover && hasSalarySlip;

      setIsFormValid(isValid);
    };

    checkFormValidity();
  }, [Income, installmentPayment, mandatoryFiles, uploadProgress]);

  const navigate = useNavigate();
  const token = localStorage.getItem("aToken");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const handleActualCancellation = async () => {
    try {
      const res = await axiosInstance.get(`/api/v1/Request/OptOut/${paramsId}`, {
        headers: {
          ...headers,
        },
      });

      if (res.status === 200 || res?.data?.isSuccess) {
        toast.success("درخواست شما با موفقیت لغو شد");
        navigate("/dash");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const onSubmit = async (data) => {
    const numericIncome = Income ? Number(Income.replace(/,/g, "")) : 0;
    const numericInstallmentPayment = installmentPayment ? Number(installmentPayment.replace(/,/g, "")) : 0;

    if (numericIncome && numericInstallmentPayment && numericInstallmentPayment >= numericIncome) {
      toast.error("مقدار قسط نباید بیشتر یا مساوی درآمد شما باشد");
      return;
    }

    if ((mandatoryFiles.AccountTurnover && uploadProgress.AccountTurnover?.status !== "success") || (mandatoryFiles.SalarySlip && uploadProgress.SalarySlip?.status !== "success")) {
      toast.error("لطفاً منتظر بمانید تا آپلود فایل‌ها تکمیل شود.");
      return;
    }

    setUserIncom(data);

    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_BASE_API}/api/v1/IncomeInfo/Create`,
        {
          income: numericIncome * 10,
          payAbility: numericInstallmentPayment * 10,
          requestId: paramsId,
          attachmentIds: [...attachmentIdList],
        },
        {
          headers: {
            ...headers,
          },
        }
      );

      if (response.status === 200 && response.data.isSuccess) {
        onNext();
      } else {
        const errorMessage = response.data.message || "خطا در ارسال اطلاعات درآمدی رخ داد.";
        toast.error(errorMessage);
      }
    } catch (error) {
      let errorMessage = "مشکلی در ارتباط با سرور پیش آمد، لطفاً دوباره تلاش کنید.";

      if (axios.isAxiosError(error) && error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors).join(", ");
        }
      }
    }
  };

  const addAttachmentId = (id) => {
    if (id && !attachmentIdList.includes(id)) {
      setAttachmentIdList((prev) => [...prev, id]);
    }
  };

  const uploadFileToServer = async (file, key) => {
    setUploadProgress((prev) => ({
      ...prev,
      [key]: { status: "uploading", message: "در حال آپلود...", progress: 0 },
    }));

    try {
      const formData = new FormData();
      formData.append("Name", file.name);

      let attachmentType;
      if (key === "AccountTurnover") {
        attachmentType = 101;
      } else if (key === "SalarySlip") {
        attachmentType = 101;
      } else if (key.startsWith("optionalFile_")) {
        attachmentType = 103;
      }
      formData.append("attachmentType", attachmentType);
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
        addAttachmentId(response?.data?.data?.id);
      } else {
        const errorMessage = response.data.message || "خطایی نامشخص در سرور رخ داد.";
        setUploadProgress((prev) => ({
          ...prev,
          [key]: { status: "error", message: errorMessage },
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = "مشکلی در ارتباط با سرور پیش آمد، لطفاً دوباره تلاش کنید.";

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
    }
  };

  const processMandatoryFile = (file, key) => {
    if (file && file.size <= 3 * 1024 * 1024) {
      const previewUrl = URL.createObjectURL(file);

      setMandatoryFiles((prev) => ({
        ...prev,
        [key]: {
          file: file,
          preview: previewUrl,
          format: file.type,
        },
      }));

      uploadFileToServer(file, key);
    } else {
      setUploadProgress((prev) => ({
        ...prev,
        [key]: {
          status: "error",
          message: "حجم فایل باید کمتر از 3 مگابایت باشد.",
        },
      }));
      toast.error("حجم فایل باید کمتر از 3 مگابایت باشد.");
    }
  };

  const handleMandatoryUpload = (event, key) => {
    const file = event.target.files[0];
    if (file) {
      processMandatoryFile(file, key);
    } else {
      setMandatoryFiles((prev) => ({
        ...prev,
        [key]: null,
      }));
      setUploadProgress((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  const handleDrop = (event, key) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      processMandatoryFile(file, key);
    }
  };

  const clearMandatoryFile = (key) => {
    setMandatoryFiles((prev) => {
      const currentFile = prev[key];
      if (currentFile && currentFile.preview) {
        URL.revokeObjectURL(currentFile.preview);
      }
      return {
        ...prev,
        [key]: null,
      };
    });
    setUploadProgress((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });

    const inputElement = document.getElementById(`file-input-${key}`);
    if (inputElement) {
      inputElement.value = "";
    }
  };

  useEffect(() => {
    return () => {
      Object.values(mandatoryFiles).forEach((fileData) => {
        if (fileData && fileData.preview) {
          URL.revokeObjectURL(fileData.preview);
        }
      });

      optionalFiles.forEach((fileData) => {
        if (fileData && fileData.preview) {
          URL.revokeObjectURL(fileData.preview);
        }
      });
    };
  }, [mandatoryFiles, optionalFiles]);

  const handleOptionalUpload = (event, index) => {
    const file = event.target.files[0];
    if (file && file.size <= 3 * 1024 * 1024) {
      const previewUrl = URL.createObjectURL(file);

      setOptionalFiles((prev) => {
        const updated = [...prev];
        updated[index] = {
          file: file,
          preview: previewUrl,
          format: file.type,
        };
        return updated;
      });

      uploadFileToServer(file, `optionalFile_${index}`);
    } else {
      setUploadProgress((prev) => ({
        ...prev,
        [`optionalFile_${index}`]: {
          status: "error",
          message: "حجم فایل باید کمتر از 3 مگابایت باشد.",
        },
      }));
      toast.error("حجم فایل باید کمتر از 3 مگابایت باشد.");
    }
  };

  const clearOptionalFile = (index) => {
    setOptionalFiles((prev) => {
      const updated = [...prev];
      const fileData = updated[index];
      if (fileData && fileData.preview) {
        URL.revokeObjectURL(fileData.preview);
      }
      updated[index] = null;
      return updated;
    });
    setUploadProgress((prev) => {
      const newState = { ...prev };
      delete newState[`optionalFile_${index}`];
      return newState;
    });

    const inputElement = document.getElementById(`optional-file-input-${index}`);
    if (inputElement) {
      inputElement.value = "";
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full gap-4 ">
        <div className=" max-lg:grid-cols-1 bg-white custom-shadow rounded-2xl gap-4 p-6">
          <h2 className="text-lg font-bold mb-4">اطلاعات درآمدی</h2>
          <div dir="rtl" className="grid grid-cols-2 gap-10">
            <div className="grid col-span-2 grid-cols-2 row-span-1">
              <div className="md:flex gap-8 col-span-2 mb-6">
                {/* مقدار درآمد */}
                <div className="flex flex-col col-span-1 w-full mt-6">
                  <label htmlFor="Income" className="text-sm font-bold text-black relative top-2 mb-0 mr-2 px-1 bg-white w-max">
                    مقدار درآمد (تومان)
                  </label>
                  <Controller
                    name="income"
                    control={control}
                    rules={{
                      validate: (value) => {
                        const payAbilityValue = watch("payAbility")?.replace(/,/g, "");

                        if (payAbilityValue && !value) {
                          return "مقدار درآمد الزامی است زمانی که میزان اقساط وارد شده است.";
                        }

                        if (value && payAbilityValue && Number(value.replace(/,/g, "")) <= Number(payAbilityValue)) {
                          return "مقدار درآمد باید بیشتر از میزان اقساط باشد.";
                        }
                        return true;
                      },
                    }}
                    render={({ field }) => <input {...field} value={formatNumber(field.value)} onChange={(e) => field.onChange(e.target.value.replace(/,/g, ""))} className="p-[11px_10px] border-2 border-gray-primary rounded-lg bg-white focus:outline-none" placeholder="مثال: 200,000,000" type="text" />}
                  />
                  {errors.income && <span className="text-red-500 text-xs">{errors.income.message}</span>}
                </div>

                {/* میزان اقساط ماهیانه */}
                <div className="flex flex-col w-full mt-6">
                  <label className="text-sm font-bold text-black relative top-2 mb-0 mr-2 px-1 bg-white w-max">میزان اقساط ماهیانه شما (تومان) :</label>
                  <Controller
                    name="payAbility"
                    control={control}
                    rules={{
                      validate: (value) => {
                        if (!value) return true;
                        const incomeValue = watch("income")?.replace(/,/g, "");
                        const payAbility = value?.replace(/,/g, "");

                        if (incomeValue && Number(payAbility) > Number(incomeValue)) {
                          return "میزان اقساط نمی‌تواند بیشتر از درآمد باشد.";
                        }
                        return true;
                      },
                    }}
                    render={({ field }) => <input {...field} value={formatNumber(field.value)} onChange={(e) => field.onChange(e.target.value.replace(/,/g, ""))} className="p-[11px_10px] border-2 border-gray-primary rounded-lg bg-white focus:outline-none" placeholder="مثال: 50,000,000" type="text" />}
                  />
                  {errors.payAbility && <span className="text-red-500 text-xs">{errors.payAbility.message}</span>}
                </div>
              </div>

              {/* آپلود فایل‌های اجباری: گردش حساب و فیش حقوقی */}
              <div className="col-span-2 md:flex gap-6">
                {/* گردش حساب */}
                <div className="w-full">
                  <label className="block text-lg font-medium mb-2 text-gray-700">گردش حساب</label>
                  <p className="text-blue-500">پسوندهای مجاز: excel, txt, jpg, jpeg, png</p>
                  <div className="border border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300 relative" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "AccountTurnover")}>
                    {/* نمایش پیش‌نمایش فایل */}
                    {mandatoryFiles.AccountTurnover && mandatoryFiles.AccountTurnover.preview ? (
                      <>
                        <img src={mandatoryFiles.AccountTurnover.preview} alt="گردش حساب" width="60" height="60" className="mx-auto mb-2 rounded" />
                        <p className="text-sm text-gray-600">{mandatoryFiles.AccountTurnover.file?.name}</p>
                      </>
                    ) : (
                      <span className="block text-sm text-gray-500 mb-2">فایل را بکشید و رها کنید یا کلیک کنید</span>
                    )}
                    <input
                      type="file"
                      id="file-input-AccountTurnover"
                      className="mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                      accept="
    application/vnd.ms-excel, 
    application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, 
    .xls, 
    .xlsx, 
    text/plain, 
    .txt, 
    image/jpeg, 
    .jpg, 
    .jpeg, 
    image/png, 
    .png
  "
                      onChange={(e) => handleMandatoryUpload(e, "AccountTurnover")}
                    />
                  </div>
                  {/* نمایش وضعیت آپلود */}
                  {uploadProgress.AccountTurnover && (
                    <div className="mt-2 text-center">
                      {uploadProgress.AccountTurnover.status === "uploading" && (
                        <div role="status" className="flex items-center justify-center">
                          <SvgSpinner /> {/* کامپوننت اسپینر */}
                          <span className="text-blue-500 text-sm ml-2">{uploadProgress.AccountTurnover.message}</span>
                        </div>
                      )}
                      {uploadProgress.AccountTurnover.status === "success" && <p className="text-green-500 text-sm">{uploadProgress.AccountTurnover.message}</p>}
                      {uploadProgress.AccountTurnover.status === "error" && <p className="text-red-500 text-sm">{uploadProgress.AccountTurnover.message}</p>}
                    </div>
                  )}
                </div>

                {/* فیش حقوقی */}
                <div className="w-full">
                  <label className="block text-lg font-medium mb-2 text-gray-700">فیش حقوقی</label>
                  <p className="text-blue-500">پسوندهای مجاز: excel, txt, jpg, jpeg, png</p>

                  <div className="border border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300 relative" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "SalarySlip")}>
                    {/* نمایش پیش‌نمایش فایل */}
                    {mandatoryFiles.SalarySlip && mandatoryFiles.SalarySlip.preview ? (
                      <>
                        <img src={mandatoryFiles.SalarySlip.preview} alt="فیش حقوقی" width="60" height="60" className="mx-auto mb-2 rounded" />
                        <p className="text-sm text-gray-600">{mandatoryFiles.SalarySlip.file?.name}</p>
                      </>
                    ) : (
                      <span className="block text-sm text-gray-500 mb-2">فایل را بکشید و رها کنید یا کلیک کنید</span>
                    )}
                    <input
                      type="file"
                      id="file-input-SalarySlip"
                      accept="
                      application/vnd.ms-excel, 
                      application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, 
                      .xls, 
                      .xlsx, 
                      text/plain, 
                      .txt, 
                      image/jpeg, 
                      .jpg, 
                      .jpeg, 
                      image/png, 
                      .png
                    "
                      className="mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                      onChange={(e) => handleMandatoryUpload(e, "SalarySlip")}
                    />
                  </div>
                  {/* نمایش وضعیت آپلود */}
                  {uploadProgress.SalarySlip && (
                    <div className="mt-2 text-center">
                      {uploadProgress.SalarySlip.status === "uploading" && (
                        <div role="status" className="flex items-center justify-center">
                          <SvgSpinner />
                          <span className="text-blue-500 text-sm ml-2">{uploadProgress.SalarySlip.message}</span>
                        </div>
                      )}
                      {uploadProgress.SalarySlip.status === "success" && <p className="text-green-500 text-sm">{uploadProgress.SalarySlip.message}</p>}
                      {uploadProgress.SalarySlip.status === "error" && <p className="text-red-500 text-sm">{uploadProgress.SalarySlip.message}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
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
            className="bg-gold-primary-900 hover:bg-gold-primary-800 text-white px-8 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gold-primary-700 focus:ring-opacity-50"
          >
            تایید و مرحله بعد
          </button>
        </div> */}

        {isEditMode ? (
          <NavigationButton
            onNext={onSubmit}
            nextLabel="ویرایش"
            // onCancel={handleActualCancellation}
            isFirstStep={false}
            isNextDisabled={!isFormValid}
          />
        ) : (
          <NavigationButton onNext={onSubmit} onCancel={handleActualCancellation} isFirstStep={false} isNextDisabled={!isFormValid} />
        )}

        {/* Validation Status Indicator */}
        {!isFormValid && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">برای ادامه، موارد زیر را تکمیل کنید:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              {(!Income || Income.trim() === "") && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full ml-2"></span>
                  مقدار درآمد را وارد کنید
                </li>
              )}
              {(!installmentPayment || installmentPayment.trim() === "") && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full ml-2"></span>
                  میزان اقساط ماهیانه را وارد کنید
                </li>
              )}
              {(!mandatoryFiles.AccountTurnover || uploadProgress.AccountTurnover?.status !== "success") && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full ml-2"></span>
                  فایل گردش حساب را آپلود کنید
                </li>
              )}
              {(!mandatoryFiles.SalarySlip || uploadProgress.SalarySlip?.status !== "success") && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full ml-2"></span>
                  فایل فیش حقوقی را آپلود کنید
                </li>
              )}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};

export default IncomeInformation;
>>>>>>> a47b58a (pwa)

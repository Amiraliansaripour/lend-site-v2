import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SvgSpinner from "../loading/SvgSpinner";
import axiosInstance from "../../api/axiosInstance";

const Attachments = ({ onBack, onNext, user, requestId }) => {
  const userId = user?.id;
  const navigate = useNavigate();
  const reqId = requestId;

  const [mandatoryFiles, setMandatoryFiles] = useState({
    idCardBack: null,
    idCardFront: null,
    signature: null,
  });
  const [optionalFiles, setOptionalFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // افزودن فیلد اختیاری (تا ۳ فایل)
  const handleAddOptionalField = () => {
    if (optionalFiles.length < 3) {
      setOptionalFiles([...optionalFiles, null]);
    } else {
      toast.error("حداکثر ۳ فایل اختیاری قابل آپلود است");
    }
  };

  // مدیریت آپلود فایل‌های اجباری
  const handleMandatoryUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadProgress((prev) => ({ ...prev, [fieldName]: "uploading" }));

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(",")[1];
      const fileData = {
        file: base64Data,
        format: file.type,
        name: file.name,
      };
      setMandatoryFiles((prev) => ({ ...prev, [fieldName]: fileData }));
      setUploadProgress((prev) => ({ ...prev, [fieldName]: "success" }));
    };
    reader.onerror = () => {
      setUploadProgress((prev) => ({ ...prev, [fieldName]: "error" }));
      toast.error("خطا در خواندن فایل");
    };
    reader.readAsDataURL(file);
  };

  // مدیریت آپلود فایل‌های اختیاری
  const handleOptionalUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const fieldName = `optional_${index}`;
    setUploadProgress((prev) => ({ ...prev, [fieldName]: "uploading" }));

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(",")[1];
      const fileData = {
        file: base64Data,
        format: file.type,
        name: file.name,
      };
      setOptionalFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = fileData;
        return newFiles;
      });
      setUploadProgress((prev) => ({ ...prev, [fieldName]: "success" }));
    };
    reader.onerror = () => {
      setUploadProgress((prev) => ({ ...prev, [fieldName]: "error" }));
      toast.error("خطا در خواندن فایل");
    };
    reader.readAsDataURL(file);
  };

  // مدیریت drop فایل
  const handleDrop = (e, fieldName) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const input = document.createElement("input");
    input.type = "file";
    input.files = e.dataTransfer.files;
    const event = { target: input };
    handleMandatoryUpload(event, fieldName);
  };
  const token = localStorage.getItem("aToken");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const sendSms = async (req) => {
    try {
      await axiosInstance.get(`/api/v1/Request/UserConfirm/${req}`, {
        headers: {
          ...headers,
        },
      });
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("aToken");
        localStorage.removeItem("requestId");
        localStorage.removeItem("planId");
        navigate("/login");
      }
      throw error;
    }
  };

  const uploadFilesToAPI = async () => {
    const formData = new FormData();

    // افزودن فایل‌های اجباری
    if (mandatoryFiles.idCardBack) {
      const blob = await fetch(
        `data:${mandatoryFiles.idCardBack.format};base64,${mandatoryFiles.idCardBack.file}`
      ).then((res) => res.blob());
      formData.append("0", blob, mandatoryFiles.idCardBack.name);
    }

    if (mandatoryFiles.idCardFront) {
      const blob = await fetch(
        `data:${mandatoryFiles.idCardFront.format};base64,${mandatoryFiles.idCardFront.file}`
      ).then((res) => res.blob());
      formData.append("1", blob, mandatoryFiles.idCardFront.name);
    }

    if (mandatoryFiles.signature) {
      const blob = await fetch(
        `data:${mandatoryFiles.signature.format};base64,${mandatoryFiles.signature.file}`
      ).then((res) => res.blob());
      formData.append("2", blob, mandatoryFiles.signature.name);
    }

    // افزودن فایل‌های اختیاری
    optionalFiles.forEach((file, index) => {
      if (file) {
        const blob = fetch(`data:${file.format};base64,${file.file}`).then(
          (res) => res.blob()
        );
        formData.append(`${index + 3}`, blob, file.name);
      }
    });

    try {
      const response = await axiosInstance.post(
        "/api/v1/Attachment/Create1",
        formData,
        {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    // بررسی کامل بودن فایل‌های اجباری
    if (
      !mandatoryFiles.idCardBack ||
      !mandatoryFiles.idCardFront ||
      !mandatoryFiles.signature
    ) {
      toast.error("لطفا تمام فایل‌های اجباری را آپلود کنید");
      return;
    }

    setIsSubmitting(true);
    try {
      // ارسال فایل‌ها به API
      await uploadFilesToAPI();

      // ارسال SMS تأیید
      await sendSms(reqId);

      toast.success("مدارک شما با موفقیت ثبت شد");
      onNext({
        selfDeclaration: {
          mandatoryFiles,
          optionalFiles,
        },
      });
    } catch (error) {
      toast.error("خطا در ارسال مدارک. لطفا مجددا تلاش کنید");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // رندر فیلدهای اختیاری
  const renderOptionalFields = () => {
    return optionalFiles.map((file, index) => (
      <div key={index} className="mt-4">
        <input
          type="file"
          accept="image/png, image/jpeg"
          className="border border-gray-300 rounded p-2 w-full"
          onChange={(e) => handleOptionalUpload(e, index)}
        />
        {uploadProgress[`optional_${index}`] && (
          <div className="mt-2">
            {uploadProgress[`optional_${index}`] === "uploading" && (
              <div role="status">
                <SvgSpinner />
                <span className="sr-only">Loading...</span>
              </div>
            )}
            {uploadProgress[`optional_${index}`] === "success" && (
              <p className="text-green-500">با موفقیت آپلود شد !</p>
            )}
            {uploadProgress[`optional_${index}`] === "error" && (
              <p className="text-red-500">مشکلی پیش آمد مجددا تلاش کنید.</p>
            )}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">بارگذاری مدارک</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mandatory File: گواهی کسر از حقوق */}
        <div>
          <label className="block text-lg font-medium mb-2 text-gray-700">
            گواهی کسر از حقوق
          </label>
          <p className="text-blue-500">پسوندهای مجاز: .jpg, .jpeg, .png</p>
          <div
            className="border border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, "idCardBack")}
          >
            {mandatoryFiles.idCardBack ? (
              <img
                src={`data:${mandatoryFiles.idCardBack.format};base64,${mandatoryFiles.idCardBack.file}`}
                alt="گواهی کسر از حقوق"
                width="60"
                height="60"
                className="mx-auto mb-2 rounded"
              />
            ) : (
              <span className="block text-sm text-gray-500 mb-2">
                فایل را بکشید و رها کنید یا کلیک کنید
              </span>
            )}
            <input
              type="file"
              accept="image/png, image/jpeg"
              className="mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
              onChange={(e) => handleMandatoryUpload(e, "idCardBack")}
            />
          </div>
          {uploadProgress.idCardBack && (
            <div className="mt-2 text-center">
              {uploadProgress.idCardBack === "uploading" && (
                <div role="status">
                  <SvgSpinner />
                  <span className="sr-only">Loading...</span>
                </div>
              )}
              {uploadProgress.idCardBack === "success" && (
                <p className="text-green-500 text-sm">با موفقیت آپلود شد!</p>
              )}
              {uploadProgress.idCardBack === "error" && (
                <p className="text-red-500 text-sm">
                  مشکلی پیش آمد، مجدداً تلاش کنید.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Mandatory File: رویه کارت ملی */}
        <div>
          <label className="block text-lg font-medium mb-2 text-gray-700">
            رویه کارت ملی
          </label>
          <p className="text-blue-500">پسوندهای مجاز: .jpg, .jpeg, .png</p>

          <div
            className="border border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, "idCardFront")}
          >
            {mandatoryFiles.idCardFront ? (
              <img
                src={`data:${mandatoryFiles.idCardFront.format};base64,${mandatoryFiles.idCardFront.file}`}
                alt="رویه کارت ملی"
                width="60"
                height="60"
                className="mx-auto mb-2 rounded"
              />
            ) : (
              <span className="block text-sm text-gray-500 mb-2">
                فایل را بکشید و رها کنید یا کلیک کنید
              </span>
            )}
            <input
              type="file"
              accept="image/png, image/jpeg"
              className="mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
              onChange={(e) => handleMandatoryUpload(e, "idCardFront")}
            />
          </div>
          {uploadProgress.idCardFront && (
            <div className="mt-2 text-center">
              {uploadProgress.idCardFront === "uploading" && (
                <div role="status">
                  <SvgSpinner />
                  <span className="sr-only">Loading...</span>
                </div>
              )}
              {uploadProgress.idCardFront === "success" && (
                <p className="text-green-500 text-sm">با موفقیت آپلود شد!</p>
              )}
              {uploadProgress.idCardFront === "error" && (
                <p className="text-red-500 text-sm">
                  مشکلی پیش آمد، مجدداً تلاش کنید.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Mandatory File: امضا */}
        <div>
          <label className="block text-lg font-medium mb-2 text-gray-700">
            امضا
          </label>
          <p className="text-blue-500">پسوندهای مجاز: .jpg, .jpeg, .png</p>

          <div
            className="border border-gray-300 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, "signature")}
          >
            {mandatoryFiles.signature ? (
              <img
                src={`data:${mandatoryFiles.signature.format};base64,${mandatoryFiles.signature.file}`}
                alt="امضا"
                width="60"
                height="60"
                className="mx-auto mb-2 rounded"
              />
            ) : (
              <span className="block text-sm text-gray-500 mb-2">
                فایل را بکشید و رها کنید یا کلیک کنید
              </span>
            )}
            <input
              type="file"
              accept="image/png, image/jpeg"
              className="mt-2 w-full text-sm text-gray-600 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
              onChange={(e) => handleMandatoryUpload(e, "signature")}
            />
          </div>
          {uploadProgress.signature && (
            <div className="mt-2 text-center">
              {uploadProgress.signature === "uploading" && (
                <div role="status">
                  <SvgSpinner />
                  <span className="sr-only">Loading...</span>
                </div>
              )}
              {uploadProgress.signature === "success" && (
                <p className="text-green-500 text-sm">با موفقیت آپلود شد!</p>
              )}
              {uploadProgress.signature === "error" && (
                <p className="text-red-500 text-sm">
                  مشکلی پیش آمد، مجدداً تلاش کنید
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Optional Files */}
      <div className="mt-6">
        <h3 className="text-md font-bold mb-2">فایل‌های اختیاری</h3>
        {renderOptionalFields()}
        {optionalFiles.length < 3 && (
          <button
            type="button"
            className="mt-4 bg-gold-primary-900 text-white px-4 py-2 rounded"
            onClick={handleAddOptionalField}
          >
            + افزودن فایل اختیاری
          </button>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          className="bg-gray-600 text-white px-4 py-2 rounded"
          onClick={onBack}
        >
          انصراف
        </button>
        <button
          onClick={handleSubmit}
          type="submit"
          className="bg-gradient-to-r bg-gold-primary-900 text-white px-4 py-2 rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <SvgSpinner className="w-5 h-5 mr-2" />
              در حال ارسال...
            </span>
          ) : (
            "مرحله بعد"
          )}
        </button>
      </div>
    </div>
  );
};

export default Attachments;

<<<<<<< HEAD
import React, { useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaMoneyBillWave, FaCheckCircle } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { formatNumberWithRegex } from "../../utils/formatNumberWithRegex";
import NavigationButton from "../buttons/NavigationButton";
import { PriceDisplayWithOutLabel } from "../../utils/formatTomanReadable";

const explanations = ["این هزینه برای استعلام وضعیت اعتباری شما از مراجع ذی‌صلاح دریافت می‌شود.", "نتیجه استعلام به صورت محرمانه فقط در اختیار شما قرار می‌گیرد.", "پرداخت این هزینه به منزله تضمین دریافت اعتبار نیست و صرفا برای بررسی اولیه است.", "مبلغ پرداختی بابت استعلام به هیچ عنوان قابل استرداد نمی‌باشد."];

const PayValidation = ({ user, requestId, validationPrice }) => {
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const token = localStorage.getItem("aToken");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const navigateUserToPayment = useCallback((token, terminalID, merchantId) => {
    // console.log(
    //   `PayValidation: Redirecting to Payment Gateway with Token: ${token}, TerminalID: ${terminalID}, MerchantID: ${merchantId}`
    // );

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `https://panel.aqayepardakht.ir/startpay/${token}`;
    // form.action = "https://rt.sizpay.ir/Route/Payment";
    form.target = "_self";

    const fields = [
      { name: "MerchantID", value: merchantId },
      { name: "TerminalID", value: terminalID },
      { name: "Token", value: token },
    ];

    fields.forEach(({ name, value }) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }, []);

  const handleGeneralPayment = async () => {
    if (!user?.id) {
      toast.error("اطلاعات کاربر برای انجام پرداخت ناقص است.");
      console.error("Payment failed: User ID is missing.");
      return;
    }

    setIsPaymentLoading(true);
    let formData = {
      // userId: user.id,
      requestId: requestId ? requestId : id,
      payType: 2,
    };

    axios
      .post(`${import.meta.env.VITE_BASE_API}/api/v1/Pay/GetToken`, formData, {
        headers: { ...headers },
      })
      .then((response) => {
        console.log("Payment GetToken API response", response);
        if (response?.data?.data) {
          let { token, terminalID, merchantId } = response.data.data;
          navigateUserToPayment(token, terminalID, merchantId);
        } else {
          const message = response?.data?.message || "پاسخ معتبر از سرور پرداخت دریافت نشد.";
          toast.error(message);
          setIsPaymentLoading(false);
        }
      })
      .catch((error) => {
        console.error("PayValidation: Payment initiation failed:", error);
        toast.error(error?.response?.data?.message || "خطا در شروع فرآیند پرداخت.");
        setIsPaymentLoading(false);
      });
  };

  const isPaymentButtonDisabled = isPaymentLoading || !user?.id;

  const toPersianDigits = (num) => {
    const persian = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return num.toString().replace(/\d/g, (d) => persian[parseInt(d)]);
  };
  // const validationCost = 21900;
  // const expertFee = 16200;
  // const vatRate = 0.1; // 10%
  // const subtotalBeforeVAT = validationCost + expertFee;
  // const vatAmount = subtotalBeforeVAT * vatRate;
  // const totalAmount = subtotalBeforeVAT + vatAmount;

  return (
    <div className="w-full min-h-screen bg-white p-4">
      <div className="flex flex-col items-center justify-start pt-10">
        {/* باکس توضیحات */}
        <div className="text-lg w-full font-semibold border-b text-right border-r-4 border-green-400 bg-green-50 shadow-lg rounded-md rounded-b-none p-6 max-w-sm mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">پیش فاکتور</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-gray-700">
              <span className="flex items-start text-gray-700 text-sm text-right">اعتبار سنجی:</span>
              <span className="flex items-start text-gray-700 text-sm font-bold text-right">{PriceDisplayWithOutLabel(validationPrice)} ریال</span>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border-r-4 border-b border-green-400 p-4 shadow-sm  w-full max-w-sm">
          <h3 className="text-lg font-semibold text-green-800 mb-3 text-right">چرا این هزینه را پرداخت می‌کنید؟</h3>

          <ul className="space-y-3">
            {explanations.map((explanation, index) => (
              <li key={index} className="flex items-start text-gray-700 text-sm text-right">
                <FaCheckCircle className="h-5 w-5 text-green-600 ml-2 flex-shrink-0" />
                <span className="leading-6">{explanation}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* باکس اصلی فرم و پرداخت */}
        <div className="bg-white w-full max-w-sm border-r-4 border-green-400 p-4 shadow-sm rounded-md rounded-t-none">
          {/* Form Inputs */}
          <div className="mb-4">
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1 text-right">
              شماره موبایل
            </label>

            <input dir="ltr" type="text" id="mobile" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none text-gray-400 sm:text-sm text-right" value={user?.personInfo?.phoneNumber || ""} disabled />
          </div>

          <div className="mb-6">
            <label htmlFor="national-code" className="block text-sm font-medium text-gray-700 mb-1 text-right">
              کد ملی
            </label>

            <input type="text" id="national-code" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none text-gray-400 sm:text-sm text-right" value={user?.personInfo?.nationalCode || ""} disabled />
          </div>
          {/* بخش نمایش مبلغ */}
          <div className="mt-6 mb-6 text-center text-gray-700">
            <span className="text-base text-black">مبلغ اعتبار سنجی: </span>

            <span className="inline-flex items-baseline">
              <span className="text-3xl font-bold text-green-600 ml-1">{PriceDisplayWithOutLabel(validationPrice)} </span>
              <span className="text-base text-black">ریال</span>
            </span>
          </div>

          <button type="button" onClick={handleGeneralPayment} className={`w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 ease-in-out${isPaymentButtonDisabled && "opacity-50 cursor-not-allowed"}`} disabled={isPaymentButtonDisabled}>
            {isPaymentLoading ? (
              <div className="animate-spin w-5 h-5 border-t-2 border-white rounded-full"></div>
            ) : (
              <>
                <FaMoneyBillWave className="h-5 w-5" />
                پرداخت هزینه اعتبارسنجی   
              </>
            )}
          </button>

          {/* Navigation Buttons */}
          {/* <div className="mt-6">
            {isEditMode ? (
              <NavigationButton
                onNext={() => {
                  // Use nextStepKey if available, otherwise default to step 6 (ProformaInvoice)
                  const targetStep = nextStepKey || 6;
                  onNext({}, targetStep);
                }}
                nextLabel="ویرایش"
                cancelLabel="حذف"
                onCancel={onCancellation}
                isFirstStep={false}
              />
            ) : (
              <NavigationButton
                onNext={() => {
                  // Use nextStepKey if available, otherwise default to step 6 (ProformaInvoice)
                  const targetStep = nextStepKey || 6;
                  onNext({}, targetStep);
                }}
                onCancel={onCancellation}
                isFirstStep={false}
              />
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default PayValidation;
=======
import React, { useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaMoneyBillWave, FaCheckCircle } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { formatNumberWithRegex } from "../../utils/formatNumberWithRegex";
import NavigationButton from "../buttons/NavigationButton";
import { PriceDisplayWithOutLabel } from "../../utils/formatTomanReadable";

const explanations = ["این هزینه برای استعلام وضعیت اعتباری شما از مراجع ذی‌صلاح دریافت می‌شود.", "نتیجه استعلام به صورت محرمانه فقط در اختیار شما قرار می‌گیرد.", "پرداخت این هزینه به منزله تضمین دریافت اعتبار نیست و صرفا برای بررسی اولیه است.", "مبلغ پرداختی بابت استعلام به هیچ عنوان قابل استرداد نمی‌باشد."];

const PayValidation = ({ user, requestId, validationPrice }) => {
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const token = localStorage.getItem("aToken");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const navigateUserToPayment = useCallback((token, terminalID, merchantId) => {
    // console.log(
    //   `PayValidation: Redirecting to Payment Gateway with Token: ${token}, TerminalID: ${terminalID}, MerchantID: ${merchantId}`
    // );

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `https://panel.aqayepardakht.ir/startpay/${token}`;
    // form.action = "https://rt.sizpay.ir/Route/Payment";
    form.target = "_self";

    const fields = [
      { name: "MerchantID", value: merchantId },
      { name: "TerminalID", value: terminalID },
      { name: "Token", value: token },
    ];

    fields.forEach(({ name, value }) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }, []);

  const handleGeneralPayment = async () => {
    if (!user?.id) {
      toast.error("اطلاعات کاربر برای انجام پرداخت ناقص است.");
      console.error("Payment failed: User ID is missing.");
      return;
    }

    setIsPaymentLoading(true);
    let formData = {
      // userId: user.id,
      requestId: requestId ? requestId : id,
      payType: 2,
    };

    axios
      .post(`${import.meta.env.VITE_BASE_API}/api/v1/Pay/GetToken`, formData, {
        headers: { ...headers },
      })
      .then((response) => {
        console.log("Payment GetToken API response", response);
        if (response?.data?.data) {
          let { token, terminalID, merchantId } = response.data.data;
          navigateUserToPayment(token, terminalID, merchantId);
        } else {
          const message = response?.data?.message || "پاسخ معتبر از سرور پرداخت دریافت نشد.";
          toast.error(message);
          setIsPaymentLoading(false);
        }
      })
      .catch((error) => {
        console.error("PayValidation: Payment initiation failed:", error);
        toast.error(error?.response?.data?.message || "خطا در شروع فرآیند پرداخت.");
        setIsPaymentLoading(false);
      });
  };

  const isPaymentButtonDisabled = isPaymentLoading || !user?.id;

  const toPersianDigits = (num) => {
    const persian = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return num.toString().replace(/\d/g, (d) => persian[parseInt(d)]);
  };
  // const validationCost = 21900;
  // const expertFee = 16200;
  // const vatRate = 0.1; // 10%
  // const subtotalBeforeVAT = validationCost + expertFee;
  // const vatAmount = subtotalBeforeVAT * vatRate;
  // const totalAmount = subtotalBeforeVAT + vatAmount;

  return (
    <div className="w-full min-h-screen bg-white p-4">
      <div className="flex flex-col items-center justify-start pt-10">
        {/* باکس توضیحات */}
        <div className="text-lg w-full font-semibold border-b text-right border-r-4 border-green-400 bg-green-50 shadow-lg rounded-md rounded-b-none p-6 max-w-sm mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">پیش فاکتور</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-gray-700">
              <span className="flex items-start text-gray-700 text-sm text-right">اعتبار سنجی:</span>
              <span className="flex items-start text-gray-700 text-sm font-bold text-right">{PriceDisplayWithOutLabel(validationPrice)} ریال</span>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border-r-4 border-b border-green-400 p-4 shadow-sm  w-full max-w-sm">
          <h3 className="text-lg font-semibold text-green-800 mb-3 text-right">چرا این هزینه را پرداخت می‌کنید؟</h3>

          <ul className="space-y-3">
            {explanations.map((explanation, index) => (
              <li key={index} className="flex items-start text-gray-700 text-sm text-right">
                <FaCheckCircle className="h-5 w-5 text-green-600 ml-2 flex-shrink-0" />
                <span className="leading-6">{explanation}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* باکس اصلی فرم و پرداخت */}
        <div className="bg-white w-full max-w-sm border-r-4 border-green-400 p-4 shadow-sm rounded-md rounded-t-none">
          {/* Form Inputs */}
          <div className="mb-4">
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1 text-right">
              شماره موبایل
            </label>

            <input dir="ltr" type="text" id="mobile" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none text-gray-400 sm:text-sm text-right" value={user?.personInfo?.phoneNumber || ""} disabled />
          </div>

          <div className="mb-6">
            <label htmlFor="national-code" className="block text-sm font-medium text-gray-700 mb-1 text-right">
              کد ملی
            </label>

            <input type="text" id="national-code" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none text-gray-400 sm:text-sm text-right" value={user?.personInfo?.nationalCode || ""} disabled />
          </div>
          {/* بخش نمایش مبلغ */}
          <div className="mt-6 mb-6 text-center text-gray-700">
            <span className="text-base text-black">مبلغ اعتبار سنجی: </span>

            <span className="inline-flex items-baseline">
              <span className="text-3xl font-bold text-green-600 ml-1">{PriceDisplayWithOutLabel(validationPrice)} </span>
              <span className="text-base text-black">ریال</span>
            </span>
          </div>

          <button type="button" onClick={handleGeneralPayment} className={`w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 ease-in-out${isPaymentButtonDisabled && "opacity-50 cursor-not-allowed"}`} disabled={isPaymentButtonDisabled}>
            {isPaymentLoading ? (
              <div className="animate-spin w-5 h-5 border-t-2 border-white rounded-full"></div>
            ) : (
              <>
                <FaMoneyBillWave className="h-5 w-5" />
                پرداخت هزینه اعتبارسنجی   
              </>
            )}
          </button>

          {/* Navigation Buttons */}
          {/* <div className="mt-6">
            {isEditMode ? (
              <NavigationButton
                onNext={() => {
                  // Use nextStepKey if available, otherwise default to step 6 (ProformaInvoice)
                  const targetStep = nextStepKey || 6;
                  onNext({}, targetStep);
                }}
                nextLabel="ویرایش"
                cancelLabel="حذف"
                onCancel={onCancellation}
                isFirstStep={false}
              />
            ) : (
              <NavigationButton
                onNext={() => {
                  // Use nextStepKey if available, otherwise default to step 6 (ProformaInvoice)
                  const targetStep = nextStepKey || 6;
                  onNext({}, targetStep);
                }}
                onCancel={onCancellation}
                isFirstStep={false}
              />
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default PayValidation;
>>>>>>> a47b58a (pwa)

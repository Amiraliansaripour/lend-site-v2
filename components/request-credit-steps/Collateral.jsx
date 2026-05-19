import React, { useEffect, useState } from "react";
import { AiOutlineDownload } from "react-icons/ai";
import StockList from "./Collateral/StockList";
import CollateralOtp from "./Collateral/CollateralOtp";
import axiosInstance from "../../api/axiosInstance";

import ChequeRegistration from "./ChequeRegistration";
import Alert from "../Alert";
import { useSearchParams } from "react-router-dom";

/*
const CheckContent = () => (
  <div className="text-right p-6 bg-white rounded-lg shadow-md border border-gray-200">
    <h2 className="text-xl font-bold mb-4 text-gray-800">روش چک انتخاب شد</h2>
    <p className="text-gray-700">سلام، این صفحه جدید است که اطلاعات مربوط به روش وثیقه گذاری با چک را نمایش می‌دهد.</p>
  </div>
);
*/

const Collateral = ({ onBack, onNext, user, isEditMode, guarantees }) => {
  const [loading, setLoading] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [otp, setOtp] = useState(new Array(5).fill(""));
  const [stocks, setStocks] = useState(null);
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("id");
  // console.log("requestId", requestId);

  const [selectedMethod, setSelectedMethod] = useState(null);
  console.log(guarantees, "ss");
  const token = localStorage.getItem("aToken");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const loginUser = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 5) {
      alert("لطفا کد OTP پنج رقمی را وارد کنید.");
      return;
    }
    setLoading(true);
    let formData = {
      userId: user?.id,
      otp: otpValue,
    };

    try {
      const response = await axiosInstance.post(`${import.meta.env.VITE_BASE_API}/api/v1/Pledge/GetPortfoOtp`, formData, {
        headers: {
          ...headers,
        },
      });
      setLoading(false);
      setLoginModal(false);
      setStocks(response?.data?.data);
    } catch (error) {
      setLoading(false);
      console.error("Error validating OTP or getting portfolio:", error);
      alert("کد OTP اشتباه است یا مشکلی پیش آمده. لطفا دوباره تلاش کنید.");
    }
  };

  const onSubmitCollateral = (data) => {
    console.log("Proceeding with Collateral method.");
    onNext({
      method: "collateral",
      stocksData: stocks /* potentially add selected stocks data */,
    });
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);

    if (method !== "collateral") {
      setStocks(null);
      if (loginModal) setLoginModal(false);
      setOtp(new Array(5).fill(""));
    }
  };
  return (
    <div>
      {selectedMethod === null && (
        <div className="text-right shadow-lg p-6 rounded-lg border-2 bg-white">
          <Alert className="mt-4 w-full mb-6 ">
            <p className="font-semibold text-center">توجه: زمان بررسی درخواست از ساعت ۸ صبح تا ۴ بعدازظهر می‌باشد.</p>
          </Alert>
          {/* <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
            لطفا روش مورد نظر برای وثیقه را انتخاب کنید
          </h2> */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <button onClick={() => handleMethodSelect("check")} className="flex flex-col items-center justify-center p-8 border-2 border-transparent hover:border-gold-primary-900 transition-all ease-in rounded-lg shadow-md w-full md:w-1/2 bg-gradient-to-br from-green-50 to-green-100 text-center cursor-pointer group">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gold-primary-900 mb-4 group-hover:scale-110 transition-transform ease-in-out">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3h7.5m-7.5-6h7.5m-3 6l3-3m0 0l3 3m-6-9h.008v.008H12v-.008ZM12 15h.008v.008H12v-.008Z" />
              </svg>
              <span className="text-xl font-bold text-gray-800 mb-2 group-hover:text-gold-primary-800 transition-colors ease-in-out">بارگذاری وثیقه</span>

              <div className="text-sm text-gray-600 mb-2">
                <p>وثیقه های مورد نیاز</p>
                {guarantees?.map((item, index) => (
                  <>
                    <span key={item}>{item} </span>
                    {index !== guarantees?.length - 1 && <span className="px-1"> و </span>}
                  </>
                ))}
              </div>
              <div className="flex items-center text-gold-primary-700 text-sm opacity-0 group-hover:opacity-100 transition-opacity ease-in-out">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>برای انتخاب کلیک کنید</span>
              </div>
            </button>
          </div>
          <div className="flex justify-between mt-24">
            {/* <button
              type="button"
              className="bg-gray-600 text-white px-4 py-2 rounded"
              onClick={onBack}
            >
              انصراف
            </button> */}
          </div>
        </div>
      )}

      {/* {selectedMethod === "collateral" && (
        <>
          <div className="text-right shadow-lg p-3 rounded-lg border-2 bg-white">
            <p className="text-gray-700">
              <strong>کاربر گرامی</strong>، <br />
              شما می‌توانید از <strong>دارایی توثیق شده</strong> خود به عنوان
              <strong>وثیقه</strong> برای <strong>صندوق دارایی بورسی</strong>
              بهره ببرید و به این ترتیب <strong>اقساط</strong> مورد نظر خود را پرداخت کنید. این روش امکان استفاده از دارایی‌های موجود به‌عنوان پشتوانه مالی را فراهم می‌کند و روند پرداخت اقساط را ساده و امن می‌نماید.
            </p>
            <div className="w-full h-[2px] bg-[#d3d2d2c7] mt-5 mb-5"></div>
            <p className="mt-5 text-gray-700">
              در صورتی که تمایل به استفاده از <strong>دارایی توثیق شده</strong>
              به عنوان <strong>وثیقه</strong> جهت پرداخت اقساط
              <strong>صندوق دارایی بورسی</strong> ندارید، می‌توانید با
              <strong>ثبت نهایی درخواست</strong> خود، ادامه فرآیند را بدون استفاده از این امکان طی نمایید. برای هرگونه سوال یا راهنمایی بیشتر، با تیم <strong>پشتیبانی</strong> ما تماس بگیرید.
            </p>
          </div>

          {stocks && <StockList data={stocks} requestId={requestId} />}

    

          {isEditMode ? (
            <div className="flex justify-end mt-24">
              <button onClick={onSubmitCollateral} type="button" className="bg-gold-primary-900 text-white px-4 py-2 rounded">
                ویرایش
              </button>
            </div>
          ) : (
            <div className="flex justify-end mt-24">
              <button type="button" className="bg-gray-600 text-white px-4 py-2 rounded" onClick={onBack}>
                انصراف
              </button>
              <button onClick={onSubmitCollateral} type="button" className="bg-gold-primary-900 text-white px-4 py-2 rounded">
                مرحله بعد
              </button>
            </div>
          )}
        </>
      )} */}

      {selectedMethod === "check" && <ChequeRegistration onBack={onBack} onNext={onNext} user={user} requestId={requestId} isEditMode={isEditMode} guarantees={guarantees} name="فناوری اطلاعات راژمان" shenase="14014520172" price="1,000,000" yektaID="1234567890123456" />}

      {selectedMethod === "collateral" && <CollateralOtp otp={otp} setOtp={setOtp} loginUser={loginUser} loginModal={loginModal} setLoginModal={setLoginModal} setLoading={setLoading} loading={loading} />}
    </div>
  );
};

export default Collateral;

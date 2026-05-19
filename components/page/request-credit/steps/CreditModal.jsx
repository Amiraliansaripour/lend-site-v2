import { FaTimes } from "react-icons/fa";
import { createPortal } from "react-dom";

import { useEffect, useState } from "react";
import cn from "../../utils/cn";
import Button from "../newui/common/Button";
import Checkbox from "../newui/common/Checkbox";
import { Link, useNavigate } from "react-router-dom";
import { PriceDisplayWithOutLabel } from "../../utils/formatTomanReadable";
import { beginingText, entireText } from "../newui/login/AgreementText";

const CreditModal = ({ isOpen, price, setIsOpen, title, size = "large", showCloseButton = true, closeOnOverlayClick = true, closeOnEscape = true, className = "", onConfirm, isCheckRequired = false }) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (closeOnEscape && event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, closeOnEscape, setIsOpen]);

  const [checkedTerms, setCheckedTerms] = useState(false);
  const [checkNational, setCheckedNational] = useState(false);
  const [checkedFee, setCheckedFee] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  // Size classes
  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-lg",
    large: "max-w-3xl",
    xlarge: "max-w-4xl",
    full: "max-w-7xl mx-4",
  };
  const navigate = useNavigate();
  if (!isOpen) return null;
  const boxClass = " p-5 text-black bg-[#EDEDED] rounded-[4px] text-sm lg:text-base";
  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn" onClick={handleOverlayClick}>
      <div
        className={`
          relative bg-white rounded-lg shadow-2xl transform transition-all duration-300 
          ${sizeClasses[size]} w-full max-h-[95vh] overflow-hidden animate-scaleIn ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <div className={cn("flex items-center absolute left-3 top-2 justify-between", title && "border-b border-gray-200 p-6")}>
            {showCloseButton && (
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200" aria-label="بستن">
                <FaTimes className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-12 overflow-y-auto max-h-[calc(95vh)] px-5 lg:px-10">
          <div className="text-dark-blue text-base lg:text-xl font-semibold text-center mb-6">نکات قابل توجه جهت درخواست اعتبار (کیف پول اعتباری)</div>
          <div className="text-[#454545] text-sm lg:text-base mb-10">پیش از ثبت درخواست خود بهتر است به موارد زیر توجه کنید:</div>
          <div className="flex flex-col gap-4">
            <div className={boxClass}>امکان دریافت تسهیلات به صورت نقدی وجود ندارد و تنها اعتبار خرید به شما تخصیص می یابد.</div>
            <div className={boxClass}>تکمیل مدارک، داشتن رتبه اعتباری مناسب و داشتن دسته چک، سه شرط اصلی برای بررسی درخواست شماست.</div>
            <div className={boxClass}>به دلیل کارمزدهای مربوط به تشکیل پرونده و فرآیندهای ارزیابی، مبلغ نهایی خرید نقدی و اقساطی متفاوت خواهد بود.</div>
            <div className={boxClass}>
              <div className="text-dark-blue text-base lg:text-lg mb-4">هزینه اعتبارسنجی</div>
              <div className="text-[#454545] mb-7">این مبلغ جهت استفاده از سرویس‌های برخط پرداخت می‌شود.</div>
              <div className="text-black mt-4 pb-2">اعتبارسنجی بانکی</div>
              <div className="flex justify-between text-[#454545]">
                <div className="text-xs lg:text-sm">تایید خوش حسابی شما در سیستم بانکی به وسیله شرکت مشاوره رتبه بندی ایرانیان</div>
                {/* <div className="text-black whitespace-nowrap">۸,۰۰۰ تومان</div> */}
              </div>
              <div className="text-black mt-4 pb-2">سنجش ظرفیت اعتبار</div>
              <div className="flex justify-between text-[#454545]">
                <div className="text-xs lg:text-sm">بررسی میزان اعتبار قابل دریافت شما</div>
                {price ? <div className="text-black whitespace-nowrap">{PriceDisplayWithOutLabel(price)} ریال</div> : <div className="text-black whitespace-nowrap">-</div>}
              </div>
            </div>
            <div className="mt-4 py-4 lg:py-7 border-t border-b border-[#A9A9A9] flex flex-col  gap-6">
              {isCheckRequired && (
                <div className="flex gap-4 items-center">
                  <Checkbox name="credit-terms" checked={checkedTerms} onChange={(e) => setCheckedTerms(e.target.checked)} />
                  <label htmlFor="credit-terms" className="text-xs lg:text-sm ">
                    دارای دسته چک به نام خودم هستم.
                  </label>
                </div>
              )}
              <div className="flex gap-4 items-center">
                <Checkbox name="number-national" checked={checkNational} onChange={(e) => setCheckedNational(e.target.checked)} />
                <label htmlFor="number-national" className="text-xs lg:text-sm ">
                  تعهد مینمایم کد ملی و شماره همراه مطابقت دارد
                </label>
              </div>
              <div className="flex gap-4 items-center">
                <Checkbox name="credit-fee" checked={checkedFee} onChange={(e) => setCheckedFee(e.target.checked)} />
                <label htmlFor="credit-fee" className="text-xs lg:text-sm ">
                  مفاهیم را خوانده و{" "}
                  <button type="button" onClick={() => setShowTermsModal(true)} className="text-[#C81E1E] underline hover:text-red-700 transition-colors">
                    {" "}
                    قوانین{" "}
                  </button>
                  را پذیرفته ام.
                </label>
              </div>
            </div>
            <div className="flex gap-3 justify-end mb-28">
              <Button className="rounded !text-xs md:text-base" onClick={() => setIsOpen(false)}>
                انصراف
              </Button>
              {onConfirm ? (
                <Button
                  className="rounded !text-xs md:text-base bg-[#939393] text-white border-none"
                  disabled={!isCheckRequired ? !checkedFee || !checkNational : !checkedTerms || !checkedFee || !checkNational}
                  onClick={() => {
                    const isValid = !isCheckRequired ? checkedFee && checkNational : checkedTerms && checkedFee && checkNational;
                    if (isValid) {
                      setIsOpen(false);
                      onConfirm();
                    }
                  }}
                >
                  تایید و ادامه
                </Button>
              ) : (
                <Link to="/requests">
                  <Button className="rounded !text-xs md:text-base bg-[#939393] text-white border-none" disabled={!isCheckRequired ? !checkedFee || !checkNational : !checkedTerms || !checkedFee || !checkNational}>
                    تایید و ادامه
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Terms and Conditions Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-dark-blue">شرایط و قوانین استفاده از خدمات</h3>
                <button onClick={() => setShowTermsModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200" aria-label="بستن">
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="text-sm lg:text-base text-gray-700 leading-7 space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-r-4 border-blue-400">
                    <p className="text-justify">{beginingText}</p>
                  </div>

                  <div className="space-y-4">
                    {entireText.split("\n").map(
                      (paragraph, index) =>
                        paragraph.trim() && (
                          <p key={index} className="text-justify leading-relaxed">
                            {paragraph.trim()}
                          </p>
                        )
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <Button className="rounded !text-sm" onClick={() => setShowTermsModal(false)}>
                  بستن
                </Button>
                <Button
                  className="rounded !text-sm bg-dark-blue text-white hover:text-gray-300 border-none"
                  onClick={() => {
                    setShowTermsModal(false);
                    setCheckedFee(true);
                  }}
                >
                  موافقم و می‌پذیرم
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render modal in portal to avoid z-index issues
  return createPortal(modalContent, document.body);
};

export default CreditModal;

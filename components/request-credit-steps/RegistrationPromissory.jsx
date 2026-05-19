import React from "react";

const RegistrationPromissory = ({ onBack, onNext, user, requestId }) => {
  const onSubmit = (data) => {
    onNext({ check: data });
  };
  return (
    <div>
      ثبت سفته
      {/* دکمه‌های مرحله بعد و انصراف */}
      <div className="flex justify-between mt-24">
        <button
          type="button"
          className="bg-gray-600 text-white px-4 py-2 rounded"
          onClick={onBack}
        >
          انصراف
        </button>
        <button
          onClick={onSubmit}
          type="button"
          className="bg-gold-primary-900 text-white px-4 py-2 rounded"
        >
          ارسال
        </button>
      </div>
    </div>
  );
};

export default RegistrationPromissory;

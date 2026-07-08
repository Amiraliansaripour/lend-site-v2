import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const SalaryInfo = ({ onNext, onBack }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const [income, setIncome] = useState('');
  const [installment, setInstallment] = useState('');

  const formatNumber = value => {
    return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleIncomeChange = e => {
    const value = e.target.value;
    setIncome(formatNumber(value));
    setValue('income', value.replace(/,/g, ''));
  };

  const handleInstallmentChange = e => {
    const value = e.target.value;
    setInstallment(formatNumber(value));
    setValue('installment', value.replace(/,/g, ''));
  };

  const onSubmit = data => {
    onNext({ selfDeclaration: data });
  };

  return (
    <div className='w-full bg-white custom-shadow rounded-2xl gap-4 p-4'>
      <div className='w-full flex flex-col items-start justify-start'>
        <div>
          <h2 className='font-bold text-xl'>اطلاعات درآمدی</h2>
        </div>
        <br />
        <p className='text-gray-500'>
          لطفا اطلاعات زیر را تکمیل و صحت آن را تایید کنید. این اطلاعات در مراحل بعد با مدارک ارائه
          شده شما مطابقت داده خواهد شد
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='grid grid-cols-2 max-lg:grid-cols-2 max-md:grid-cols-1 gap-5'
      >
        {/* میانگین درآمد ماهیانه */}
        <div className='flex flex-col w-full mt-6'>
          <label className='text-xs font-bold text-black relative top-2 mb-0 mr-[7px] px-[3px] bg-white w-max'>
            میانگین درآمد ماهیانه (ریال):
          </label>
          <input
            className='p-[11px_10px] border-2 border-gray-primary rounded-lg bg-white focus:outline-none'
            name='income'
            placeholder='مثال: 200,000,000'
            type='text'
            value={income}
            {...register('income', { required: 'این فیلد الزامی است' })}
            onChange={handleIncomeChange}
          />
          {errors.income && <span className='text-red-500 text-xs'>{errors.income.message}</span>}
        </div>

        {/* میزان اقساط ماهیانه */}
        <div className='flex flex-col w-full mt-6'>
          <label className='text-xs font-bold text-black relative top-2 mb-0 mr-[7px] px-[3px] bg-white w-max'>
            میزان اقساط ماهیانه شما (ریال) :
          </label>
          <input
            className='p-[11px_10px] border-2 border-gray-primary rounded-lg bg-white focus:outline-none'
            name='installment'
            placeholder='مثال: 50,000,000'
            type='text'
            value={installment}
            {...register('installment', { required: 'این فیلد الزامی است' })}
            onChange={handleInstallmentChange}
          />
          {errors.installment && (
            <span className='text-red-500 text-xs'>{errors.installment.message}</span>
          )}
        </div>

        {/* وضعیت شغلی */}
        {/* <div className="flex flex-col w-full mt-6">
          <label className="text-xs font-bold text-black relative top-2 mb-0 mr-[7px] px-[3px] bg-white w-max">
            وضعیت شغلی:
          </label>
          <select
            className="p-[11px_10px] border-2 border-[#445052] rounded-lg bg-white focus:outline-none"
            {...register("jobStatus", { required: "این فیلد الزامی است" })}
          >
            <option value="">لطفا انتخاب کنید</option>
            <option value="employed">شاغل</option>
            <option value="self-employed">خویش‌فرما</option>
            <option value="unemployed">بیکار</option>
          </select>
          {errors.jobStatus && <span className="text-red-500 text-xs">{errors.jobStatus.message}</span>}
        </div> */}
      </form>

      <div className='flex justify-between mt-24'>
        <button type='button' className='bg-gray-600 text-white px-4 py-2 rounded' onClick={onBack}>
          انصراف
        </button>
        <button
          onClick={handleSubmit(onSubmit)}
          type='button'
          className='bg-gold-primary-900 text-white px-4 py-2 rounded'
        >
          مرحله بعد
        </button>
      </div>
    </div>
  );
};

export default SalaryInfo;

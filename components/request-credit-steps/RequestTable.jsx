import { useEffect, useState } from 'react';
import { DateConvert } from '../../utils/ConvertDate';
import { formatNumberWithRegex } from '../../utils/formatNumberWithRegex';
import { ArrowSvg } from '../../assets/images';
import { convertRialToToman } from '../../utils/RialToToman';
import axiosInstance from '../../api/axiosInstance';

const RequestTable = () => {
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const user = JSON.parse(localStorage.getItem('userInfo'));
  const getRequests = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/Request/GetByNationalCode/${user?.nationalCode}`,
      );
      const requestData = response?.data?.data || [];
      setRequests(requestData);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getRequests();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [requests]);

  const totalPages = requests ? Math.ceil(requests.length / pageSize) : 0;
  const displayedRequests = requests
    ? requests.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize)
    : [];

  return (
    <div dir='rtl' className='mt-4'>
      <div className='overflow-x-auto rounded-2xl custom-shadow light-scroll '>
        <table className='min-w-full border-collapse border border-gray-300'>
          <thead>
            <tr className='border-b-2 border-gray-300 p-4'>
              <th className='px-4 py-8 text-center'>تاریخ</th>
              <th className='px-4 py-8 text-center'>مبلغ</th>
              <th className='px-4 py-8 text-center'>شناسه درخواست</th>
              <th className='px-4 py-8 text-center'>دوره بازپرداخت</th>
              <th className='px-4 py-8 text-center'>طرح</th>
              <th className='px-4 py-8 text-center'>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {/* 
            

            
            */}
            {requests.length > 0 ? (
              displayedRequests.map((request, index) => (
                <tr className='mt-2' key={index}>
                  <td className='text-[14px] opacity-[0.7] font-base mt-3 px-4 py-8 text-center'>
                    {request?.requestDate ? DateConvert(request.requestDate) : 'یافت نشد'}
                  </td>
                  <td className='text-[14px] opacity-[0.7] font-base mt-3 px-4 py-8 text-center'>
                    {request.creditAmount
                      ? convertRialToToman(formatNumberWithRegex(request.creditAmount))
                      : '000'}{' '}
                    تومان
                  </td>
                  <td className='text-[14px] opacity-[0.7] font-base mt-3 px-4 py-8 text-center'>
                    {request?.requestNumber ? request.requestNumber : 'یافت نشد'}
                  </td>
                  <td className='text-[14px] opacity-[0.7] font-base mt-3 px-4 py-8 text-center'>
                    {request?.period ? `${request.period} ماهه` : 'یافت نشد'}
                  </td>
                  <td className='text-[14px] opacity-[0.7] text-center font-base mt-3 px-4 py-8 flex justify-center'>
                    {request?.planName ? request.planName : '#'}
                  </td>

                  {/* <td className="text-[14px] opacity-[0.7] font-base mt-3 px-4 py-8 text-center">
                    {request?.requestState == 1 ? (
                      <spanorange className="px-2 bg-green-200 text-green-500 border-orange-400 border orange-md">
                        تایید شده
                      </spanorange
                    ) : request?.requestState == 2 ? (
                      <span className="px-2 bg-red-200 text-red-500 border-red-400 border rounded-md">
                        رد شده
                      </span>
                    ) : (
                      <span className="px-2 bg-yellow-200 text-yellow-500 border-yellow-400 border rounded-md">
                        در انتظار تایید
                      </span>
                    )}
                  </td> */}

                  <td className='text-[14px] opacity-[0.7] font-base mt-3 px-4 py-8 text-center'>
                    {request.requestState === 1 ? (
                      <span className='whitespace-nowrap rounded-md border border-yellow-400 bg-yellow-200 px-2 font-bold text-yellow-500'>
                        انتخاب طرح توسط کاربر
                      </span>
                    ) : request.requestState === 2 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        تایید اطلاعات هویتی توسط کاربر{' '}
                      </span>
                    ) : request.requestState === 3 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        تایید اعتبارسنجی توسط کاربر
                      </span>
                    ) : request.requestState === 4 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        ثبت اطلاعات درآمدی توسط کاربر
                      </span>
                    ) : request.requestState === 5 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        ثبت چک توسط کاربر
                      </span>
                    ) : request.requestState === 6 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        ثبت پیش فاکتور توسط کاربر
                      </span>
                    ) : request.requestState === 7 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        ثبت پیش فاکتور توسط کاربر
                      </span>
                    ) : request.requestState === 8 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        در انتظار تایید
                      </span>
                    ) : request.requestState === 11 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        تایید طرح توسط ادمین
                      </span>
                    ) : request.requestState === 12 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        تایید اطلاعات هویتی توسط ادمین
                      </span>
                    ) : request.requestState === 13 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        تایید اعتبارسنجی توسط ادمین
                      </span>
                    ) : request.requestState === 14 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        تایید اطلاعات درآمدی توسط ادمین
                      </span>
                    ) : request.requestState === 15 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        تایید چک توسط ادمین
                      </span>
                    ) : request.requestState === 16 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        تایید توثیق توسط ادمین
                      </span>
                    ) : request.requestState === 17 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        تایید پیش فاکتور توسط ادمین
                      </span>
                    ) : request.requestState === 18 ? (
                      <span className='whitespace-nowrap rounded-md border border-green-400 bg-green-200 px-2 font-bold text-green-500'>
                        تایید نهایی توسط ادمین
                      </span>
                    ) : request.requestState === 21 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        رد طرح توسط ادمین
                      </span>
                    ) : request.requestState === 22 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        رد اطلاعات هویتی توسط ادمین
                      </span>
                    ) : request.requestState === 23 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        رد اعتبارسنجی توسط ادمین
                      </span>
                    ) : request.requestState === 24 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        رد اطلاعات درآمدی توسط ادمین
                      </span>
                    ) : request.requestState === 25 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        رد چک توسط ادمین
                      </span>
                    ) : request.requestState === 26 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        رد توثیق توسط ادمین
                      </span>
                    ) : request.requestState === 27 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        رد پیش فاکتور توسط ادمین
                      </span>
                    ) : request.requestState === 28 ? (
                      <span className='whitespace-nowrap rounded-md border border-orange-400 bg-orange-200 px-2 font-bold text-orange-500'>
                        رد نهایی توسط ادمین
                      </span>
                    ) : (
                      <span className='whitespace-nowrap rounded-md border border-red-400 bg-red-200 px-2 font-bold text-red-500'>
                        رد شده
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='6' className='p-10 text-center text-gray-500'>
                  🚫 مقداری یافت نشد
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* بخش پیجینیشن */}
        {requests.length > 0 && (
          <div className='w-full flex items-center justify-between p-8'>
            <div className='text-gray-500'>
              صفحه {currentPage} از {totalPages}
            </div>
            <div className='flex justify-center'>
              <div className='flex items-center justify-end gap-2'>
                <label htmlFor='pageSize' className='mr-2 text-gray-700'>
                  تعداد موارد در هر صفحه:
                </label>
                <input
                  id='pageSize'
                  type='number'
                  min='1'
                  value={pageSize}
                  onChange={e => {
                    const newSize = parseInt(e.target.value) || 1;
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                  className='border border-gray-300 rounded px-2 py-1 w-16'
                />
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <img src={ArrowSvg} alt='صفحه قبلی' width='20' height='20' />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <img className='rotate-180' src={ArrowSvg} alt='صفحه بعدی' width='20' height='20' />
              </button>
            </div>
          </div>
        )}
        {/* بخش انتخاب تعداد موارد در هر صفحه */}

        {/* <ButtonCta className="pb-2" link="/requests/complete-request">
          دریافت اعتبار
        </ButtonCta> */}
      </div>
    </div>
  );
};

export default RequestTable;

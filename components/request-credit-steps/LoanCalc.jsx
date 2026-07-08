<<<<<<< HEAD
import { useEffect, useState, useRef } from "react"; // Removed 'use' as it's not a React hook

import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { convertRialToToman } from "../../utils/RialToToman";
import axiosInstance from "../../api/axiosInstance";
import { PriceDisplayWithOutLabel } from "../../utils/formatTomanReadable";
import NavigationButtons from "../buttons/NavigationButton";
import Button from "../newui/common/Button";
import cn from "../../utils/cn";
import CreditModal from "../HOME/CreditModal";
// Enhanced loan calculation based on backend C# logic
const calculateLoanDetails = (planData, creditAmount) => {
  if (!planData || !creditAmount) return null;

  let firstSystemFee = planData.firstSystemFee || 0;
  let firstBankFee = planData.firstBankFee || 0;
  let duringSystemFee = planData.duringSystemFee || 0;
  let duringBankFee = planData.duringBankFee || 0;
  const period = parseInt(planData.period) || 12;

  let mainAmountByFirst = creditAmount;
  let mainAmountByDuring = creditAmount;

  let firstSystemFeeAmount = 0;
  let firstBankFeeAmount = 0;
  let duringSystemFeeAmount = 0;
  let duringBankFeeAmount = 0;

  // Calculate first period fees (deducted from amount received)
  if (firstSystemFee > 0 || firstBankFee > 0) {
    firstSystemFeeAmount = Math.round((firstSystemFee * mainAmountByFirst * period) / 1200);
    firstBankFeeAmount = Math.round((firstBankFee * mainAmountByFirst * period) / 1200);
    mainAmountByFirst = mainAmountByFirst - firstSystemFeeAmount - firstBankFeeAmount;
    // اگر کارمزد اول دوره داشته باشد از مبلغ اعطا شده کم میشود
  }

  // Calculate during period fees (added to total repayment)
  if (duringSystemFee > 0 || duringBankFee > 0) {
    duringSystemFeeAmount = Math.round((duringSystemFee * mainAmountByDuring * period) / 1200);
    duringBankFeeAmount = Math.round((duringBankFee * mainAmountByDuring * period) / 1200);
    mainAmountByDuring = mainAmountByDuring + duringSystemFeeAmount + duringBankFeeAmount;
  }

  // Calculate monthly installment
  let couponAmount = Math.ceil(mainAmountByDuring / period);
  let couponMainAmount = Math.ceil(creditAmount / period);

  // Calculate totals
  const netAmountReceived = mainAmountByFirst; // Amount user actually receives
  const totalRepaymentAmount = mainAmountByDuring; // Total amount to be repaid
  const monthlyInstallment = couponAmount; // Monthly installment amount

  // Total fees calculation
  const totalFees = firstSystemFeeAmount + firstBankFeeAmount + duringSystemFeeAmount + duringBankFeeAmount;

  return {
    originalAmount: creditAmount,
    netAmountReceived: Math.round(netAmountReceived),
    totalRepaymentAmount: Math.round(totalRepaymentAmount),
    monthlyInstallment: Math.round(monthlyInstallment),
    totalInterest: Math.round(totalFees),
    fees: {
      firstSystemFeeAmount: Math.round(firstSystemFeeAmount),
      firstBankFeeAmount: Math.round(firstBankFeeAmount),
      duringSystemFeeAmount: Math.round(duringSystemFeeAmount),
      duringBankFeeAmount: Math.round(duringBankFeeAmount),
      systemFeePerInstallment: Math.floor(duringSystemFeeAmount / period),
      bankFeePerInstallment: Math.floor(duringBankFeeAmount / period),
      couponMainAmount: Math.round(couponMainAmount),
      totalFees: Math.round(totalFees),
    },
    period: period,
  };
};

// Legacy calculation for fallback
const calculateInstallment = (amount, months) => {
  const totalInterest = amount / 100;
  const totalAmount = amount + totalInterest;
  const monthlyInstallment = totalAmount / months;
  return monthlyInstallment;
};

async function calculatePMT(principal, annualInterestRate, totalPayments) {
  const r = annualInterestRate / 100 / 12;

  const numerator = principal * r * Math.pow(1 + r, totalPayments);
  const denominator = Math.pow(1 + r, totalPayments) - 1;

  const installment = numerator / denominator;

  return {
    installment: installment,
    total: installment * totalPayments,
  };
}

const LoanCalc = ({ onNext, setRequestId, user, requestId, isEditMode }) => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const navigate = useNavigate();
  const [financiers, setFinanciers] = useState([{ name: "...بارگذاری ", disable: true }]);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null); // New state for detailed plan data
  const [value, setValue] = useState(300000000);
  const [duration, setDuration] = useState(12);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [planId, setPlanId] = useState();
  const [planGuarantees, setPlanGuarantees] = useState();
  const [loanCalculation, setLoanCalculation] = useState(null); // New state for calculation results

  // وضعیت دکمه ی مرحله ی بعد

  // const [callToAction, setCallToAction] = useState(false);

  const financierSelectRef = useRef(null);

  const getFinancier = async () => {
    try {
      const response = await axiosInstance.get(`/api/v1/Financier/GetPlanForLend`);
      const fetchedPlans = response?.data?.data?.plans || [];
      setFinanciers(fetchedPlans);

      if (fetchedPlans.length > 0) {
        const firstPlan = fetchedPlans[fetchedPlans.length - 1];
        setSelectedPlan(firstPlan);
        setPlanId(firstPlan?.id);

        setDuration(firstPlan?.period);
        setValue(firstPlan?.minAmount);
        // Fetch detailed plan data for calculation
        try {
          const planDetailsResponse = await axiosInstance.get(`/api/v1/Plan/Get/${firstPlan?.id}`);

          if (planDetailsResponse?.data?.isSuccess) {
            const planDetails = planDetailsResponse.data.data;
            setSelectedPlanDetails(planDetails);
            setPlanGuarantees(planDetails?.guarantees);

            // Calculate loan details with the new plan
            const calculation = calculateLoanDetails(planDetails, value);

            setLoanCalculation(calculation);
          }
        } catch (planError) {
          console.error("Error fetching plan details:", planError);
          // Fallback to old guarantees method
          axiosInstance.get(`/api/v1/Plan/Get/${firstPlan?.id}`).then((res) => setPlanGuarantees(res?.data?.data?.guarantees));
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("aToken");
        localStorage.removeItem("requestId");
        localStorage.removeItem("planId");
        navigate("/login");
      }
    }
  };
  useEffect(() => {
    getFinancier();
  }, []);

  // Recalculate when value or selected plan details change
  useEffect(() => {
    if (selectedPlanDetails && value) {
      const calculate = async () => {
        const result = await calculatePMT(value, selectedPlanDetails.duringBankFee + selectedPlanDetails.duringSystemFee, selectedPlanDetails.period);
        let firstPlansToghater = selectedPlanDetails.firstBankFee + selectedPlanDetails.firstSystemFee;
        const receivedAmount = value - (value * firstPlansToghater) / 100;
        setLoanCalculation({
          originalAmount: value,
          netAmountReceived: value,
          totalRepaymentAmount: Math.round(result.total),
          monthlyInstallment: Math.round(result.installment),
          totalInterest: Math.round(result.total - value),
          period: selectedPlanDetails.period,
          receivedAmount: receivedAmount,
        });
      };
      calculate();
    }
  }, [selectedPlanDetails, value]);
  // Calculate installment details using new calculation or fallback to old method
  const installmentAmount = loanCalculation ? loanCalculation.monthlyInstallment : Math.floor(calculateInstallment(value, duration));

  const totalPayable = loanCalculation ? loanCalculation.totalRepaymentAmount : installmentAmount * duration;

  const totalInterest = loanCalculation ? loanCalculation.totalInterest : totalPayable - value;

  const netAmountReceived = loanCalculation ? loanCalculation.netAmountReceived : value;
  const totalRecived = loanCalculation ? loanCalculation.receivedAmount : installmentAmount;

  const handleChange = (event) => {
    setValue(Number(event.target.value));
  };

  // When user clicks on a plan button
  const handlePlanClick = async (plan, index) => {
    try {
      const response = await axiosInstance.get(`/api/v1/Plan/Get/${plan?.id}`);

      if (response?.data?.isSuccess) {
        const planDetails = response.data.data;
        setSelectedPlanDetails(planDetails);
        setPlanGuarantees(planDetails?.guarantees);

        setSelectedPlan(plan);
        setPlanId(plan?.id);

        setDuration(plan?.period);
        setValue(planDetails?.minAmount);
        // Calculate loan details with the new plan will be handled by useEffect
      }
    } catch (error) {
      console.error("Error fetching plan details:", error);
      // Fallback to old method
      axiosInstance.get(`/api/v1/Plan/Get/${plan?.id}`).then((res) => setPlanGuarantees(res?.data?.data?.guarantees));

      setSelectedPlan(plan);
      setPlanId(plan?.id);

      setDuration(plan?.period);
    }
  };

  const onSubmit = () => {
    if (!selectedPlan) {
      toast.error("لطفا طرح را انتخاب کنید");
      financierSelectRef.current.focus();
      return;
    }

    const finalData = {
      isActive: true,
      userId: user?.personInfo?.userId,
      creditAmount: value,
      planId: planId,
      requestState: 1,
      ...(id && { id }),
    };

    axiosInstance.post(`/api/v1/Request/Create`, finalData).then(
      (response) => {
        if (response?.data?.isSuccess) {
          const requestId = response?.data?.data?.id;

          localStorage.setItem("planId", JSON.stringify(requestId));
          localStorage.setItem("requestId", requestId);
          setRequestId(requestId);

          if (isEditMode) {
            onNext(finalData);
          } else {
            navigate(`/requests/complete-request?id=${requestId}`);
          }
        } else {
          toast.error("خطا در ایجاد درخواست");
        }
      },
      (err) => {
        if (err.response?.status === 400) {
          toast.error(err.response.data.message);
          console.log(err);
        } else if (err.response?.status === 401) {
          localStorage.removeItem("userInfo");
          localStorage.removeItem("aToken");
          localStorage.removeItem("requestId");
          localStorage.removeItem("planId");
          navigate("/login");
        } else {
          toast.error("خطا در ارسال درخواست");
        }
      }
    );
  };

  return (
    <>
      <div>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10  justify-center">
          {/* Left Section - Calculator Controls */}
          <div className="w-full lg:w-3/5 pt-8 lg:pt-12">
            <div className="font-bold text-lg sm:text-xl mb-3 sm:mb-5">نمایشگر اقساط</div>
            <div className="text-base sm:text-lg text-[#454545] mb-8 sm:mb-12 lg:mb-[75px]"> لطفا مبلغ درخواستی و مدت بازپرداخت را انتخاب کنید.</div>

            {/* Amount Selector */}
            <div className="pr-4 sm:pr-6 md:pr-8 lg:pr-11 bg-pink-light p-3 sm:p-4 rounded-lg border border-[#F5F0FF]">
              <div className="mb-8 sm:mb-10 lg:mb-12 text-light-text text-sm sm:text-base">مبلغ مورد نظر</div>
              <div className="flex flex-col">
                <div className="relative mb-2">
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-full"
                    style={{
                      left: `calc(${((value - (selectedPlan ? convertRialToToman(selectedPlan?.minAmount.toString()) : 20000000)) / ((selectedPlan ? convertRialToToman(selectedPlan?.maxAmount.toString()) : 200000000) - (selectedPlan ? convertRialToToman(selectedPlan?.minAmount.toString()) : 20000000))) * 100}% + 15px)`,
                      top: "-10px",
                    }}
                  >
                    <div className={cn("text-[#3F455D]  sm:pl-3 py-1 rounded-lg text-xs sm:text-sm font-bold relative")}>{PriceDisplayWithOutLabel(value)}</div>
                  </div>
                </div>
                <input
                  dir="ltr"
                  id="range-slider"
                  type="range"
                  min={selectedPlan ? convertRialToToman(selectedPlan?.minAmount.toString()) : "20000000"}
                  max={selectedPlan ? convertRialToToman(selectedPlan?.maxAmount.toString()) : "200000000"}
                  step="10000000"
                  value={value}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-400 rounded-lg appearance-none cursor-pointer focus:outline-none self-center slider-purple"
                  style={{
                    background: `linear-gradient(to right, #7929CF 0%, #7929CF ${((value - (selectedPlan ? convertRialToToman(selectedPlan?.minAmount.toString()) : 20000000)) / ((selectedPlan ? convertRialToToman(selectedPlan?.maxAmount.toString()) : 200000000) - (selectedPlan ? convertRialToToman(selectedPlan?.minAmount.toString()) : 20000000))) * 100}%, #d1d5db ${((value - (selectedPlan ? convertRialToToman(selectedPlan?.minAmount.toString()) : 20000000)) / ((selectedPlan ? convertRialToToman(selectedPlan?.maxAmount.toString()) : 200000000) - (selectedPlan ? convertRialToToman(selectedPlan?.minAmount.toString()) : 20000000))) * 100}%, #d1d5db 100%)`,
                  }}
                />
                <div className="text-sm sm:text-base lg:text-lg text-purple-darker flex justify-between w-full pt-2">
                  <div> {selectedPlan ? PriceDisplayWithOutLabel(selectedPlan?.maxAmount) : PriceDisplayWithOutLabel(200000000)}</div>
                  <div>{selectedPlan ? PriceDisplayWithOutLabel(selectedPlan?.minAmount) : PriceDisplayWithOutLabel(200000000)}</div>
                </div>
              </div>
            </div>

            <div className="pr-4 sm:pr-6 md:pr-8 lg:pr-11 bg-pink-light p-3 sm:p-4 rounded-lg border border-[#F5F0FF] mt-4 sm:mt-6 lg:mt-9">
              <div className="text-light-text text-xs sm:text-sm mb-3">طرح ها</div>
              <div className="flex flex-wrap gap-2">
                {financiers.map((item) => {
                  return (
                    <>
                      {item.isActive && (
                        <Button className="text-xs px-2 py-2 flex-shrink-0" onClick={() => handlePlanClick(item)} active={item?.id === selectedPlan?.id} key={item?.name}>
                          {item?.name}
                        </Button>
                      )}
                    </>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3 max-w-[545px] mx-auto lg:mx-0 mt-8 lg:mt-[87px]">
            <div className="p-4 sm:p-5 lg:p-[17px] px-4 sm:px-5 calculator-shadow rounded-2xl h-full">
              <div className="mb-8 sm:mb-12 lg:mb-[74px]">
                <img className="w-24 sm:w-32 lg:w-36" src="/img/black-logo.png" alt="Logo" />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between text-sm sm:text-base lg:text-lg mb-3">
                  <div>مبلغ قسط ماهانه</div>
                  <div>{PriceDisplayWithOutLabel(installmentAmount)} ریال</div>
                </div>
                <div className="flex justify-between text-sm sm:text-base lg:text-lg mb-3 text-darker-text font-light">
                  <div>اعتبار دریافتی شما</div>
                  <div>{PriceDisplayWithOutLabel(totalRecived)} ریال</div>
                </div>
                <div className="flex justify-between text-sm sm:text-base lg:text-lg pb-4 border-b border-[#F5F0FF] text-darker-text font-light">
                  <div>سود پرداختی</div>
                  <div>{PriceDisplayWithOutLabel(totalInterest)} ریال</div>
                </div>
                <div className="flex justify-between text-sm sm:text-base lg:text-lg pt-4">
                  <div className="">جمع کل اقساط</div>
                  <div className="">{PriceDisplayWithOutLabel(totalPayable)} ریال</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CreditModal isOpen={creditModalOpen} price={selectedPlan?.documentAmount} setIsOpen={setCreditModalOpen} isCheckRequired={selectedPlan?.guarantees?.includes("چک")} title="نکات قابل توجه جهت درخواست اعتبار" onConfirm={onSubmit} />
        {isEditMode ? (
          <NavigationButtons
            onNext={onSubmit}
            nextLabel="ویرایش"
            // cancelLabel="بازگشت"
            isFirstStep
          />
        ) : (
          <NavigationButtons onNext={() => setCreditModalOpen(true)} nextLabel="مرحله بعد" cancelLabel="بازگشت" isFirstStep />
        )}
      </div>
    </>
  );
};

export default LoanCalc;
=======
import { useEffect, useState, useRef } from "react"; // Removed 'use' as it's not a React hook

import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { convertRialToToman } from "../../utils/RialToToman";
import axiosInstance from "../../api/axiosInstance";
import { PriceDisplayWithOutLabel } from "../../utils/formatTomanReadable";
import NavigationButtons from "../buttons/NavigationButton";
import Button from "../newui/common/Button";
import cn from "../../utils/cn";
import CreditModal from "../HOME/CreditModal";
// Enhanced loan calculation based on backend C# logic
const calculateLoanDetails = (planData, creditAmount) => {
  if (!planData || !creditAmount) return null;

  let firstSystemFee = planData.firstSystemFee || 0;
  let firstBankFee = planData.firstBankFee || 0;
  let duringSystemFee = planData.duringSystemFee || 0;
  let duringBankFee = planData.duringBankFee || 0;
  const period = parseInt(planData.period) || 12;

  let mainAmountByFirst = creditAmount;
  let mainAmountByDuring = creditAmount;

  let firstSystemFeeAmount = 0;
  let firstBankFeeAmount = 0;
  let duringSystemFeeAmount = 0;
  let duringBankFeeAmount = 0;

  // Calculate first period fees (deducted from amount received)
  if (firstSystemFee > 0 || firstBankFee > 0) {
    firstSystemFeeAmount = Math.round((firstSystemFee * mainAmountByFirst * period) / 1200);
    firstBankFeeAmount = Math.round((firstBankFee * mainAmountByFirst * period) / 1200);
    mainAmountByFirst = mainAmountByFirst - firstSystemFeeAmount - firstBankFeeAmount;
    // اگر کارمزد اول دوره داشته باشد از مبلغ اعطا شده کم میشود
  }

  // Calculate during period fees (added to total repayment)
  if (duringSystemFee > 0 || duringBankFee > 0) {
    duringSystemFeeAmount = Math.round((duringSystemFee * mainAmountByDuring * period) / 1200);
    duringBankFeeAmount = Math.round((duringBankFee * mainAmountByDuring * period) / 1200);
    mainAmountByDuring = mainAmountByDuring + duringSystemFeeAmount + duringBankFeeAmount;
  }

  // Calculate monthly installment
  let couponAmount = Math.ceil(mainAmountByDuring / period);
  let couponMainAmount = Math.ceil(creditAmount / period);

  // Calculate totals
  const netAmountReceived = mainAmountByFirst; // Amount user actually receives
  const totalRepaymentAmount = mainAmountByDuring; // Total amount to be repaid
  const monthlyInstallment = couponAmount; // Monthly installment amount

  // Total fees calculation
  const totalFees = firstSystemFeeAmount + firstBankFeeAmount + duringSystemFeeAmount + duringBankFeeAmount;

  return {
    originalAmount: creditAmount,
    netAmountReceived: Math.round(netAmountReceived),
    totalRepaymentAmount: Math.round(totalRepaymentAmount),
    monthlyInstallment: Math.round(monthlyInstallment),
    totalInterest: Math.round(totalFees),
    fees: {
      firstSystemFeeAmount: Math.round(firstSystemFeeAmount),
      firstBankFeeAmount: Math.round(firstBankFeeAmount),
      duringSystemFeeAmount: Math.round(duringSystemFeeAmount),
      duringBankFeeAmount: Math.round(duringBankFeeAmount),
      systemFeePerInstallment: Math.floor(duringSystemFeeAmount / period),
      bankFeePerInstallment: Math.floor(duringBankFeeAmount / period),
      couponMainAmount: Math.round(couponMainAmount),
      totalFees: Math.round(totalFees),
    },
    period: period,
  };
};

// Legacy calculation for fallback
const calculateInstallment = (amount, months) => {
  const totalInterest = amount / 100;
  const totalAmount = amount + totalInterest;
  const monthlyInstallment = totalAmount / months;
  return monthlyInstallment;
};

async function calculatePMT(principal, annualInterestRate, totalPayments) {
  const r = annualInterestRate / 100 / 12;

  const numerator = principal * r * Math.pow(1 + r, totalPayments);
  const denominator = Math.pow(1 + r, totalPayments) - 1;

  const installment = numerator / denominator;

  return {
    installment: installment,
    total: installment * totalPayments,
  };
}

const LoanCalc = ({ onNext, setRequestId, user, requestId, isEditMode }) => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const navigate = useNavigate();
  const [financiers, setFinanciers] = useState([{ name: "...بارگذاری ", disable: true }]);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null); // New state for detailed plan data
  const [value, setValue] = useState(300000000);
  const [duration, setDuration] = useState(12);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [planId, setPlanId] = useState();
  const [planGuarantees, setPlanGuarantees] = useState();
  const [loanCalculation, setLoanCalculation] = useState(null); // New state for calculation results

  // وضعیت دکمه ی مرحله ی بعد

  // const [callToAction, setCallToAction] = useState(false);

  const financierSelectRef = useRef(null);

  const getFinancier = async () => {
    try {
      const response = await axiosInstance.get(`/api/v1/Financier/GetPlanForLend`);
      const fetchedPlans = response?.data?.data?.plans || [];
      setFinanciers(fetchedPlans);

      if (fetchedPlans.length > 0) {
        const firstPlan = fetchedPlans[fetchedPlans.length - 1];
        setSelectedPlan(firstPlan);
        setPlanId(firstPlan?.id);

        setDuration(firstPlan?.period);
        setValue(firstPlan?.minAmount);
        // Fetch detailed plan data for calculation
        try {
          const planDetailsResponse = await axiosInstance.get(`/api/v1/Plan/Get/${firstPlan?.id}`);

          if (planDetailsResponse?.data?.isSuccess) {
            const planDetails = planDetailsResponse.data.data;
            setSelectedPlanDetails(planDetails);
            setPlanGuarantees(planDetails?.guarantees);

            // Calculate loan details with the new plan
            const calculation = calculateLoanDetails(planDetails, value);

            setLoanCalculation(calculation);
          }
        } catch (planError) {
          console.error("Error fetching plan details:", planError);
          // Fallback to old guarantees method
          axiosInstance.get(`/api/v1/Plan/Get/${firstPlan?.id}`).then((res) => setPlanGuarantees(res?.data?.data?.guarantees));
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("aToken");
        localStorage.removeItem("requestId");
        localStorage.removeItem("planId");
        navigate("/login");
      }
    }
  };
  useEffect(() => {
    getFinancier();
  }, []);

  // Recalculate when value or selected plan details change
  useEffect(() => {
    if (selectedPlanDetails && value) {
      const calculate = async () => {
        const result = await calculatePMT(value, selectedPlanDetails.duringBankFee + selectedPlanDetails.duringSystemFee, selectedPlanDetails.period);
        let firstPlansToghater = selectedPlanDetails.firstBankFee + selectedPlanDetails.firstSystemFee;
        const receivedAmount = value - (value * firstPlansToghater) / 100;
        setLoanCalculation({
          originalAmount: value,
          netAmountReceived: value,
          totalRepaymentAmount: Math.round(result.total),
          monthlyInstallment: Math.round(result.installment),
          totalInterest: Math.round(result.total - value),
          period: selectedPlanDetails.period,
          receivedAmount: receivedAmount,
        });
      };
      calculate();
    }
  }, [selectedPlanDetails, value]);
  // Calculate installment details using new calculation or fallback to old method
  const installmentAmount = loanCalculation ? loanCalculation.monthlyInstallment : Math.floor(calculateInstallment(value, duration));

  const totalPayable = loanCalculation ? loanCalculation.totalRepaymentAmount : installmentAmount * duration;

  const totalInterest = loanCalculation ? loanCalculation.totalInterest : totalPayable - value;

  const netAmountReceived = loanCalculation ? loanCalculation.netAmountReceived : value;
  const totalRecived = loanCalculation ? loanCalculation.receivedAmount : installmentAmount;

  const handleChange = (event) => {
    setValue(Number(event.target.value));
  };

  // When user clicks on a plan button
  const handlePlanClick = async (plan, index) => {
    try {
      const response = await axiosInstance.get(`/api/v1/Plan/Get/${plan?.id}`);

      if (response?.data?.isSuccess) {
        const planDetails = response.data.data;
        setSelectedPlanDetails(planDetails);
        setPlanGuarantees(planDetails?.guarantees);

        setSelectedPlan(plan);
        setPlanId(plan?.id);

        setDuration(plan?.period);
        setValue(planDetails?.minAmount);
        // Calculate loan details with the new plan will be handled by useEffect
      }
    } catch (error) {
      console.error("Error fetching plan details:", error);
      // Fallback to old method
      axiosInstance.get(`/api/v1/Plan/Get/${plan?.id}`).then((res) => setPlanGuarantees(res?.data?.data?.guarantees));

      setSelectedPlan(plan);
      setPlanId(plan?.id);

      setDuration(plan?.period);
    }
  };

  const onSubmit = () => {
    if (!selectedPlan) {
      toast.error("لطفا طرح را انتخاب کنید");
      financierSelectRef.current.focus();
      return;
    }

    const finalData = {
      isActive: true,
      userId: user?.personInfo?.userId,
      creditAmount: value,
      planId: planId,
      requestState: 1,
      ...(id && { id }),
    };

    axiosInstance.post(`/api/v1/Request/Create`, finalData).then(
      (response) => {
        if (response?.data?.isSuccess) {
          const requestId = response?.data?.data?.id;

          localStorage.setItem("planId", JSON.stringify(requestId));
          localStorage.setItem("requestId", requestId);
          setRequestId(requestId);

          if (isEditMode) {
            onNext(finalData);
          } else {
            navigate(`/requests/complete-request?id=${requestId}`);
          }
        } else {
          toast.error("خطا در ایجاد درخواست");
        }
      },
      (err) => {
        if (err.response?.status === 400) {
          toast.error(err.response.data.message);
          console.log(err);
        } else if (err.response?.status === 401) {
          localStorage.removeItem("userInfo");
          localStorage.removeItem("aToken");
          localStorage.removeItem("requestId");
          localStorage.removeItem("planId");
          navigate("/login");
        } else {
          toast.error("خطا در ارسال درخواست");
        }
      }
    );
  };

  return (
    <>
      <div>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10  justify-center">
          {/* Left Section - Calculator Controls */}
          <div className="w-full lg:w-3/5 pt-8 lg:pt-12">
            <div className="font-bold text-lg sm:text-xl mb-3 sm:mb-5">نمایشگر اقساط</div>
            <div className="text-base sm:text-lg text-[#454545] mb-8 sm:mb-12 lg:mb-[75px]"> لطفا مبلغ درخواستی و مدت بازپرداخت را انتخاب کنید.</div>

            {/* Amount Selector */}
            <div className="pr-4 sm:pr-6 md:pr-8 lg:pr-11 bg-pink-light p-3 sm:p-4 rounded-lg border border-[#F5F0FF]">
              <div className="mb-8 sm:mb-10 lg:mb-12 text-light-text text-sm sm:text-base">مبلغ مورد نظر</div>
              <div className="flex flex-col">
                <div className="relative mb-2">
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-full"
                    style={{
                      left: `calc(${((value - (selectedPlan ? convertRialToToman(selectedPlan?.minAmount.toString()) : 20000000)) / ((selectedPlan ? convertRialToToman(selectedPlan?.maxAmount.toString()) : 200000000) - (selectedPlan ? convertRialToToman(selectedPlan?.minAmount.toString()) : 20000000))) * 100}% + 15px)`,
                      top: "-10px",
                    }}
                  >
                    <div className={cn("text-[#3F455D]  sm:pl-3 py-1 rounded-lg text-xs sm:text-sm font-bold relative")}>{PriceDisplayWithOutLabel(value)}</div>
                  </div>
                </div>
                <input
                  dir="ltr"
                  id="range-slider"
                  type="range"
                  min={selectedPlan ? convertRialToToman(selectedPlan?.minAmount.toString()) : "20000000"}
                  max={selectedPlan ? convertRialToToman(selectedPlan?.maxAmount.toString()) : "200000000"}
                  step="10000000"
                  value={value}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-400 rounded-lg appearance-none cursor-pointer focus:outline-none self-center slider-purple"
                  style={{
                    background: `linear-gradient(to right, #7929CF 0%, #7929CF ${((value - (selectedPlan ? convertRialToToman(selectedPlan?.minAmount.toString()) : 20000000)) / ((selectedPlan ? convertRialToToman(selectedPlan?.maxAmount.toString()) : 200000000) - (selectedPlan ? convertRialToToman(selectedPlan?.minAmount.toString()) : 20000000))) * 100}%, #d1d5db ${((value - (selectedPlan ? convertRialToToman(selectedPlan?.minAmount.toString()) : 20000000)) / ((selectedPlan ? convertRialToToman(selectedPlan?.maxAmount.toString()) : 200000000) - (selectedPlan ? convertRialToToman(selectedPlan?.minAmount.toString()) : 20000000))) * 100}%, #d1d5db 100%)`,
                  }}
                />
                <div className="text-sm sm:text-base lg:text-lg text-purple-darker flex justify-between w-full pt-2">
                  <div> {selectedPlan ? PriceDisplayWithOutLabel(selectedPlan?.maxAmount) : PriceDisplayWithOutLabel(200000000)}</div>
                  <div>{selectedPlan ? PriceDisplayWithOutLabel(selectedPlan?.minAmount) : PriceDisplayWithOutLabel(200000000)}</div>
                </div>
              </div>
            </div>

            <div className="pr-4 sm:pr-6 md:pr-8 lg:pr-11 bg-pink-light p-3 sm:p-4 rounded-lg border border-[#F5F0FF] mt-4 sm:mt-6 lg:mt-9">
              <div className="text-light-text text-xs sm:text-sm mb-3">طرح ها</div>
              <div className="flex flex-wrap gap-2">
                {financiers.map((item) => {
                  return (
                    <>
                      {item.isActive && (
                        <Button className="text-xs px-2 py-2 flex-shrink-0" onClick={() => handlePlanClick(item)} active={item?.id === selectedPlan?.id} key={item?.name}>
                          {item?.name}
                        </Button>
                      )}
                    </>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3 max-w-[545px] mx-auto lg:mx-0 mt-8 lg:mt-[87px]">
            <div className="p-4 sm:p-5 lg:p-[17px] px-4 sm:px-5 calculator-shadow rounded-2xl h-full">
              <div className="mb-8 sm:mb-12 lg:mb-[74px]">
                <img className="w-24 sm:w-32 lg:w-36" src="/img/black-logo.png" alt="Logo" />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between text-sm sm:text-base lg:text-lg mb-3">
                  <div>مبلغ قسط ماهانه</div>
                  <div>{PriceDisplayWithOutLabel(installmentAmount)} ریال</div>
                </div>
                <div className="flex justify-between text-sm sm:text-base lg:text-lg mb-3 text-darker-text font-light">
                  <div>اعتبار دریافتی شما</div>
                  <div>{PriceDisplayWithOutLabel(totalRecived)} ریال</div>
                </div>
                <div className="flex justify-between text-sm sm:text-base lg:text-lg pb-4 border-b border-[#F5F0FF] text-darker-text font-light">
                  <div>سود پرداختی</div>
                  <div>{PriceDisplayWithOutLabel(totalInterest)} ریال</div>
                </div>
                <div className="flex justify-between text-sm sm:text-base lg:text-lg pt-4">
                  <div className="">جمع کل اقساط</div>
                  <div className="">{PriceDisplayWithOutLabel(totalPayable)} ریال</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CreditModal isOpen={creditModalOpen} price={selectedPlan?.documentAmount} setIsOpen={setCreditModalOpen} isCheckRequired={selectedPlan?.guarantees?.includes("چک")} title="نکات قابل توجه جهت درخواست اعتبار" onConfirm={onSubmit} />
        {isEditMode ? (
          <NavigationButtons
            onNext={onSubmit}
            nextLabel="ویرایش"
            // cancelLabel="بازگشت"
            isFirstStep
          />
        ) : (
          <NavigationButtons onNext={() => setCreditModalOpen(true)} nextLabel="مرحله بعد" cancelLabel="بازگشت" isFirstStep />
        )}
      </div>
    </>
  );
};

export default LoanCalc;
>>>>>>> a47b58a (pwa)

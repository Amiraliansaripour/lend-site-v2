<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import {
  PanelLayout,
  UserInformation,
  LoanCalc,
  ProformaInvoice,
  IncomeInformation,
  PayValidation,
  Collateral,
  IraninanValidation,
  FinotechValidation,
} from '../../components';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import AcceptByUser from '../../components/REQUESTS/AcceptByUser';
import ProgressBarMultiStep from '../../components/REQUESTS/ProgressBarMultiStep';

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const [requestId, setRequestId] = useState('');
  const [userIncom, setUserIncom] = useState({
    Income: '',
    installmentPayment: '',
  });
  const [stepLabels, setStepLabels] = useState([
    { label: 'انتخاب طرح', key: 1 },
    { label: 'اطلاعات هویتی', key: 2 },
    { label: 'پرداخت', key: 3 },
    { label: 'اعتبار سنجی', key: 4 },
    { label: 'اطلاعات درآمدی', key: 5 },
    { label: 'پیش فاکتور', key: 6 },
    { label: 'ضمانت', key: 7 },
    { label: 'تایید کلی اطلاعات', key: 8 },
  ]);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [stepsToShow, setStepsToShow] = useState([]);
  const [isStepsLoaded, setIsStepsLoaded] = useState(false);
  const [validateType, setValidateType] = useState(null);
  const [ruleText, setRuleText] = useState(null);
  const [validationPrice, setValidationPrice] = useState(null);
  const [neededScore, setNeededScore] = useState(null);

  const [formData, setFormData] = useState({
    generalInfo: {},
    selfDeclaration: {},
    uploadMark: null,
    check: {},
    requestId: {},
  });
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const editMode = searchParams.get('editMode') === 'true';
  const location = useLocation();
  const [forCorrections, setForCorrections] = useState([]);
  const [correctionStepIndex, setCorrectionStepIndex] = useState(0);
  const [guarantees, setGuarantees] = useState(null);

  const getNextStepKey = currentStepKey => {
    const currentIndex = stepsToShow.findIndex(step => step.key === currentStepKey);
    if (currentIndex !== -1 && currentIndex < stepsToShow.length - 1) {
      return stepsToShow[currentIndex + 1].key;
    }
    return null;
  };

  const handleNext = (data, nextStepKey = null) => {
    setFormData(prev => ({ ...prev, ...data }));

    if (editMode && forCorrections.length > 0) {
      if (correctionStepIndex < forCorrections.length - 1) {
        setCorrectionStepIndex(prev => prev + 1);
        setCurrentStep(forCorrections[correctionStepIndex + 1]);
      }
    } else {
      if (nextStepKey) {
        const currentIndex = stepsToShow.findIndex(step => step.key === currentStep);
        const nextIndex = stepsToShow.findIndex(step => step.key === nextStepKey);
        if (nextIndex !== -1) {
          setCurrentStep(nextStepKey);
        } else {
          setCurrentStep(prev => prev + 1);
        }
      } else {
        const currentIndex = stepsToShow.findIndex(step => step.key === currentStep);
        if (currentIndex !== -1 && currentIndex < stepsToShow.length - 1) {
          setCurrentStep(stepsToShow[currentIndex + 1].key);
        }
      }
    }
  };

  const handleCancellation = () => {
    if (editMode && forCorrections.length > 0) {
      if (correctionStepIndex > 0) {
        setCorrectionStepIndex(prev => prev - 1);
        setCurrentStep(forCorrections[correctionStepIndex - 1]);
      }
    } else {
      const currentIndex = stepsToShow.findIndex(step => step.key === currentStep);
      if (currentIndex > 0) {
        setCurrentStep(stepsToShow[currentIndex - 1].key);
      }
    }
  };

  const handleOtpVerificationSuccess = data => {
    setIsOtpVerified(true);
    setValidationData(data);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  const activeStepRef = React.useRef(null);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
      });
    }
  }, [currentStep]);

  async function fetchUserStep() {
    axiosInstance
      .get(`/api/v1/Request/Get/${id}`)
      .then(res => {
        const requestState = res?.data?.data?.requestState;
        fetchPlanData(res?.data?.data?.planId);
        let normalizedStep;
        let response = res?.data?.data;
        if (requestState >= 11 && requestState <= 18) {
          normalizedStep = requestState - 10 + (editMode ? 0 : 1);
        } else if (requestState >= 1 && requestState <= 8) {
          normalizedStep = requestState + (editMode ? 0 : 1);
        } else if (requestState >= 21 && requestState <= 28) {
          normalizedStep = requestState - 20 + (editMode ? 0 : 1);
        } else {
          normalizedStep = 1;
        }
        setCurrentStep(normalizedStep);

        let updatedSteps = [
          { label: 'انتخاب طرح', key: 1 },
          { label: 'اطلاعات هویتی', key: 2 },
          { label: 'پرداخت', key: 3 },
          { label: 'اعتبار سنجی', key: 4 },
          { label: 'اطلاعات درآمدی', key: 5 },
          { label: 'پیش فاکتور', key: 6 },
          { label: 'ضمانت', key: 7 },
          { label: 'تایید کلی اطلاعات', key: 8 },
        ];
        if (!response.planIsInvoiceRequired) {
          updatedSteps = updatedSteps.filter(item => item.key !== 6);
        }
        if (!response.planIsGuaranteeRequired) {
          updatedSteps = updatedSteps.filter(item => item.key !== 7);
        }
        if (!response.planIsIncomeRequired) {
          updatedSteps = updatedSteps.filter(item => item.key !== 5);
        }
        if (!response.planIsValidateRequired) {
          updatedSteps = updatedSteps.filter(item => item.key !== 4);
          updatedSteps = updatedSteps.filter(item => item.key !== 3);
        }

        let tmpdata =
          editMode && forCorrections.length > 0
            ? forCorrections?.map(i => updatedSteps[i.key - 1])
            : updatedSteps;

        setStepsToShow(tmpdata);
        setStepLabels(updatedSteps);
        setIsStepsLoaded(true);
      })
      .catch(error => {
        console.error('Error creating or fetching request data:', error);
        setCurrentStep(1);
      });
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const fetchPlanData = async id => {
    try {
      const response = await axiosInstance.get(`/api/v1/Plan/Get/${id}`);

      setValidateType(response?.data?.data?.validateType);
      setRuleText(response?.data?.data.ruleText);
      setValidationPrice(response?.data?.data.documentAmount);
      setGuarantees(response?.data?.data?.guarantees);
      setNeededScore(response?.data?.data.score);
    } catch (error) {
      console.error('Error fetching plan data:', error);
    }
  };

  useEffect(() => {
    if (id !== null) {
      fetchUserStep();
    }
  }, [id]);

  useEffect(() => {
    localStorage.removeItem('requestId');
    localStorage.removeItem('planId');
  }, []);
  useEffect(() => {
    if (id) {
      localStorage.setItem('requestId', id);
      setRequestId(id);
    }
  }, [id, location, searchParams]);

  useEffect(() => {
    if (editMode && location.state?.forCorrections?.length > 0) {
      setForCorrections(location.state.forCorrections);
      setCurrentStep(location.state.forCorrections[0]);
      setCorrectionStepIndex(0);
    }
  }, [editMode, location.state]);

  useEffect(() => {
    if (stepsToShow.length > 0 && isStepsLoaded) {
      const isStep = stepsToShow.find(i => i.key === currentStep);
      if (!isStep) {
        for (let index = 0; index < stepsToShow.length; index++) {
          const element = stepsToShow[index];
          if (element.key > currentStep) {
            setCurrentStep(element.key);
            return;
          }
        }
      }
    }
  }, [stepsToShow, currentStep, isStepsLoaded]);

  return (
    <PanelLayout title='مراحل ثبت درخواست'>
      <div dir='rtl' className='custom-shadow overflow- w-full gap-4 rounded-2xl bg-[#fff] p-4'>
        <ProgressBarMultiStep
          editMode={editMode}
          stepsToShow={stepsToShow}
          currentStep={currentStep}
          activeStepRef={activeStepRef}
          forCorrections={forCorrections}
          correctionStepIndex={correctionStepIndex}
        />
        <AnimatePresence mode='wait'>
          {(!isStepsLoaded || stepsToShow.find(step => step.key === 1)) && currentStep === 1 && (
            <motion.div
              key='step1'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <LoanCalc
                onNext={handleNext}
                user={user}
                setRequestId={setRequestId}
                requestId={requestId}
                isEditMode={editMode}
                nextStepKey={getNextStepKey(1)}
              />
            </motion.div>
          )}
          {(!isStepsLoaded || stepsToShow.find(step => step.key === 2)) && currentStep === 2 && (
            <motion.div
              key='step2'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <UserInformation
                user={user}
                onCancellation={handleCancellation}
                onNext={handleNext}
                requestId={requestId}
                isEditMode={editMode}
                nextStepKey={getNextStepKey(2)}
              />
            </motion.div>
          )}
          {(!isStepsLoaded || stepsToShow.find(step => step.key === 3)) && currentStep === 3 && (
            <motion.div
              key='step3'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <PayValidation
                setCurrentStep={setCurrentStep}
                onCancellation={handleCancellation}
                requestId={requestId}
                user={user}
                onNext={handleNext}
                isEditMode={editMode}
                nextStepKey={getNextStepKey(3)}
                validationPrice={validationPrice}
              />
            </motion.div>
          )}
          {isStepsLoaded && stepsToShow.find(step => step.key === 4) && currentStep === 4 && (
            <motion.div
              key='step4'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              {validateType === 1 ? (
                <IraninanValidation
                  onCancellation={handleCancellation}
                  neededScore={neededScore}
                  requestId={requestId}
                  user={user}
                  onNext={handleNext}
                  isOtpVerified={isOtpVerified}
                  validationData={validationData}
                  onOtpVerificationSuccess={handleOtpVerificationSuccess}
                  isEditMode={editMode}
                  nextStepKey={getNextStepKey(4)}
                />
              ) : validateType === 0 ? (
                <FinotechValidation
                  onCancellation={handleCancellation}
                  neededScore={neededScore}
                  requestId={requestId}
                  user={user}
                  onNext={handleNext}
                  isOtpVerified={isOtpVerified}
                  validationData={validationData}
                  onOtpVerificationSuccess={handleOtpVerificationSuccess}
                  isEditMode={editMode}
                  nextStepKey={getNextStepKey(4)}
                />
              ) : (
                <>اطلاعات اعتبار سنجی یافت نشد.</>
              )}
            </motion.div>
          )}
          {isStepsLoaded && stepsToShow.find(step => step.key === 5) && currentStep === 5 && (
            <motion.div
              key='step5'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <IncomeInformation
                userIncom={userIncom}
                setUserIncom={setUserIncom}
                onNext={handleNext}
                onCancellation={handleCancellation}
                user={user}
                requestId={requestId}
                isEditMode={editMode}
                nextStepKey={getNextStepKey(5)}
              />
            </motion.div>
          )}
          {(!isStepsLoaded || stepsToShow.find(step => step.key === 6)) && currentStep === 6 && (
            <motion.div
              key='step6'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <ProformaInvoice
                onCancellation={handleCancellation}
                user={user}
                requestId={requestId}
                onNext={handleNext}
                onBack={handleBack}
                isEditMode={editMode}
                nextStepKey={getNextStepKey(6)}
              />
            </motion.div>
          )}
          {isStepsLoaded && stepsToShow.find(step => step.key === 7) && currentStep === 7 && (
            <motion.div
              key='step7'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <Collateral
                onCancellation={handleCancellation}
                guarantees={guarantees}
                requestId={requestId}
                user={user}
                onNext={handleNext}
                onBack={handleBack}
                isEditMode={editMode}
                nextStepKey={getNextStepKey(7)}
              />
            </motion.div>
          )}
          {(!isStepsLoaded || stepsToShow.find(step => step.key === 8)) && currentStep === 8 && (
            <motion.div
              key='step8'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <AcceptByUser
                onCancellation={handleCancellation}
                requestId={requestId}
                user={user}
                onNext={handleNext}
                onBack={handleBack}
                isEditMode={editMode}
                nextStepKey={getNextStepKey(8)}
                ruleText={ruleText}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PanelLayout>
  );
};

export default MultiStepForm;
=======
import React, { useEffect, useState } from 'react';
import {
  PanelLayout,
  UserInformation,
  LoanCalc,
  ProformaInvoice,
  IncomeInformation,
  PayValidation,
  Collateral,
  IraninanValidation,
  FinotechValidation,
} from '../../components';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import AcceptByUser from '../../components/REQUESTS/AcceptByUser';
import ProgressBarMultiStep from '../../components/REQUESTS/ProgressBarMultiStep';

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const [requestId, setRequestId] = useState('');
  const [userIncom, setUserIncom] = useState({
    Income: '',
    installmentPayment: '',
  });
  const [stepLabels, setStepLabels] = useState([
    { label: 'انتخاب طرح', key: 1 },
    { label: 'اطلاعات هویتی', key: 2 },
    { label: 'پرداخت', key: 3 },
    { label: 'اعتبار سنجی', key: 4 },
    { label: 'اطلاعات درآمدی', key: 5 },
    { label: 'پیش فاکتور', key: 6 },
    { label: 'ضمانت', key: 7 },
    { label: 'تایید کلی اطلاعات', key: 8 },
  ]);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [stepsToShow, setStepsToShow] = useState([]);
  const [isStepsLoaded, setIsStepsLoaded] = useState(false);
  const [validateType, setValidateType] = useState(null);
  const [ruleText, setRuleText] = useState(null);
  const [validationPrice, setValidationPrice] = useState(null);
  const [neededScore, setNeededScore] = useState(null);

  const [formData, setFormData] = useState({
    generalInfo: {},
    selfDeclaration: {},
    uploadMark: null,
    check: {},
    requestId: {},
  });
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const editMode = searchParams.get('editMode') === 'true';
  const location = useLocation();
  const [forCorrections, setForCorrections] = useState([]);
  const [correctionStepIndex, setCorrectionStepIndex] = useState(0);
  const [guarantees, setGuarantees] = useState(null);

  const getNextStepKey = currentStepKey => {
    const currentIndex = stepsToShow.findIndex(step => step.key === currentStepKey);
    if (currentIndex !== -1 && currentIndex < stepsToShow.length - 1) {
      return stepsToShow[currentIndex + 1].key;
    }
    return null;
  };

  const handleNext = (data, nextStepKey = null) => {
    setFormData(prev => ({ ...prev, ...data }));

    if (editMode && forCorrections.length > 0) {
      if (correctionStepIndex < forCorrections.length - 1) {
        setCorrectionStepIndex(prev => prev + 1);
        setCurrentStep(forCorrections[correctionStepIndex + 1]);
      }
    } else {
      if (nextStepKey) {
        const currentIndex = stepsToShow.findIndex(step => step.key === currentStep);
        const nextIndex = stepsToShow.findIndex(step => step.key === nextStepKey);
        if (nextIndex !== -1) {
          setCurrentStep(nextStepKey);
        } else {
          setCurrentStep(prev => prev + 1);
        }
      } else {
        const currentIndex = stepsToShow.findIndex(step => step.key === currentStep);
        if (currentIndex !== -1 && currentIndex < stepsToShow.length - 1) {
          setCurrentStep(stepsToShow[currentIndex + 1].key);
        }
      }
    }
  };

  const handleCancellation = () => {
    if (editMode && forCorrections.length > 0) {
      if (correctionStepIndex > 0) {
        setCorrectionStepIndex(prev => prev - 1);
        setCurrentStep(forCorrections[correctionStepIndex - 1]);
      }
    } else {
      const currentIndex = stepsToShow.findIndex(step => step.key === currentStep);
      if (currentIndex > 0) {
        setCurrentStep(stepsToShow[currentIndex - 1].key);
      }
    }
  };

  const handleOtpVerificationSuccess = data => {
    setIsOtpVerified(true);
    setValidationData(data);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  const activeStepRef = React.useRef(null);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
      });
    }
  }, [currentStep]);

  async function fetchUserStep() {
    axiosInstance
      .get(`/api/v1/Request/Get/${id}`)
      .then(res => {
        const requestState = res?.data?.data?.requestState;
        fetchPlanData(res?.data?.data?.planId);
        let normalizedStep;
        let response = res?.data?.data;
        if (requestState >= 11 && requestState <= 18) {
          normalizedStep = requestState - 10 + (editMode ? 0 : 1);
        } else if (requestState >= 1 && requestState <= 8) {
          normalizedStep = requestState + (editMode ? 0 : 1);
        } else if (requestState >= 21 && requestState <= 28) {
          normalizedStep = requestState - 20 + (editMode ? 0 : 1);
        } else {
          normalizedStep = 1;
        }
        setCurrentStep(normalizedStep);

        let updatedSteps = [
          { label: 'انتخاب طرح', key: 1 },
          { label: 'اطلاعات هویتی', key: 2 },
          { label: 'پرداخت', key: 3 },
          { label: 'اعتبار سنجی', key: 4 },
          { label: 'اطلاعات درآمدی', key: 5 },
          { label: 'پیش فاکتور', key: 6 },
          { label: 'ضمانت', key: 7 },
          { label: 'تایید کلی اطلاعات', key: 8 },
        ];
        if (!response.planIsInvoiceRequired) {
          updatedSteps = updatedSteps.filter(item => item.key !== 6);
        }
        if (!response.planIsGuaranteeRequired) {
          updatedSteps = updatedSteps.filter(item => item.key !== 7);
        }
        if (!response.planIsIncomeRequired) {
          updatedSteps = updatedSteps.filter(item => item.key !== 5);
        }
        if (!response.planIsValidateRequired) {
          updatedSteps = updatedSteps.filter(item => item.key !== 4);
          updatedSteps = updatedSteps.filter(item => item.key !== 3);
        }

        let tmpdata =
          editMode && forCorrections.length > 0
            ? forCorrections?.map(i => updatedSteps[i.key - 1])
            : updatedSteps;

        setStepsToShow(tmpdata);
        setStepLabels(updatedSteps);
        setIsStepsLoaded(true);
      })
      .catch(error => {
        console.error('Error creating or fetching request data:', error);
        setCurrentStep(1);
      });
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const fetchPlanData = async id => {
    try {
      const response = await axiosInstance.get(`/api/v1/Plan/Get/${id}`);

      setValidateType(response?.data?.data?.validateType);
      setRuleText(response?.data?.data.ruleText);
      setValidationPrice(response?.data?.data.documentAmount);
      setGuarantees(response?.data?.data?.guarantees);
      setNeededScore(response?.data?.data.score);
    } catch (error) {
      console.error('Error fetching plan data:', error);
    }
  };

  useEffect(() => {
    if (id !== null) {
      fetchUserStep();
    }
  }, [id]);

  useEffect(() => {
    localStorage.removeItem('requestId');
    localStorage.removeItem('planId');
  }, []);
  useEffect(() => {
    if (id) {
      localStorage.setItem('requestId', id);
      setRequestId(id);
    }
  }, [id, location, searchParams]);

  useEffect(() => {
    if (editMode && location.state?.forCorrections?.length > 0) {
      setForCorrections(location.state.forCorrections);
      setCurrentStep(location.state.forCorrections[0]);
      setCorrectionStepIndex(0);
    }
  }, [editMode, location.state]);

  useEffect(() => {
    if (stepsToShow.length > 0 && isStepsLoaded) {
      const isStep = stepsToShow.find(i => i.key === currentStep);
      if (!isStep) {
        for (let index = 0; index < stepsToShow.length; index++) {
          const element = stepsToShow[index];
          if (element.key > currentStep) {
            setCurrentStep(element.key);
            return;
          }
        }
      }
    }
  }, [stepsToShow, currentStep, isStepsLoaded]);

  return (
    <PanelLayout title='مراحل ثبت درخواست'>
      <div dir='rtl' className='custom-shadow overflow- w-full gap-4 rounded-2xl bg-[#fff] p-4'>
        <ProgressBarMultiStep
          editMode={editMode}
          stepsToShow={stepsToShow}
          currentStep={currentStep}
          activeStepRef={activeStepRef}
          forCorrections={forCorrections}
          correctionStepIndex={correctionStepIndex}
        />
        <AnimatePresence mode='wait'>
          {(!isStepsLoaded || stepsToShow.find(step => step.key === 1)) && currentStep === 1 && (
            <motion.div
              key='step1'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <LoanCalc
                onNext={handleNext}
                user={user}
                setRequestId={setRequestId}
                requestId={requestId}
                isEditMode={editMode}
                nextStepKey={getNextStepKey(1)}
              />
            </motion.div>
          )}
          {(!isStepsLoaded || stepsToShow.find(step => step.key === 2)) && currentStep === 2 && (
            <motion.div
              key='step2'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <UserInformation
                user={user}
                onCancellation={handleCancellation}
                onNext={handleNext}
                requestId={requestId}
                isEditMode={editMode}
                nextStepKey={getNextStepKey(2)}
              />
            </motion.div>
          )}
          {(!isStepsLoaded || stepsToShow.find(step => step.key === 3)) && currentStep === 3 && (
            <motion.div
              key='step3'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <PayValidation
                setCurrentStep={setCurrentStep}
                onCancellation={handleCancellation}
                requestId={requestId}
                user={user}
                onNext={handleNext}
                isEditMode={editMode}
                nextStepKey={getNextStepKey(3)}
                validationPrice={validationPrice}
              />
            </motion.div>
          )}
          {isStepsLoaded && stepsToShow.find(step => step.key === 4) && currentStep === 4 && (
            <motion.div
              key='step4'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              {validateType === 1 ? (
                <IraninanValidation
                  onCancellation={handleCancellation}
                  neededScore={neededScore}
                  requestId={requestId}
                  user={user}
                  onNext={handleNext}
                  isOtpVerified={isOtpVerified}
                  validationData={validationData}
                  onOtpVerificationSuccess={handleOtpVerificationSuccess}
                  isEditMode={editMode}
                  nextStepKey={getNextStepKey(4)}
                />
              ) : validateType === 0 ? (
                <FinotechValidation
                  onCancellation={handleCancellation}
                  neededScore={neededScore}
                  requestId={requestId}
                  user={user}
                  onNext={handleNext}
                  isOtpVerified={isOtpVerified}
                  validationData={validationData}
                  onOtpVerificationSuccess={handleOtpVerificationSuccess}
                  isEditMode={editMode}
                  nextStepKey={getNextStepKey(4)}
                />
              ) : (
                <>اطلاعات اعتبار سنجی یافت نشد.</>
              )}
            </motion.div>
          )}
          {isStepsLoaded && stepsToShow.find(step => step.key === 5) && currentStep === 5 && (
            <motion.div
              key='step5'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <IncomeInformation
                userIncom={userIncom}
                setUserIncom={setUserIncom}
                onNext={handleNext}
                onCancellation={handleCancellation}
                user={user}
                requestId={requestId}
                isEditMode={editMode}
                nextStepKey={getNextStepKey(5)}
              />
            </motion.div>
          )}
          {(!isStepsLoaded || stepsToShow.find(step => step.key === 6)) && currentStep === 6 && (
            <motion.div
              key='step6'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <ProformaInvoice
                onCancellation={handleCancellation}
                user={user}
                requestId={requestId}
                onNext={handleNext}
                onBack={handleBack}
                isEditMode={editMode}
                nextStepKey={getNextStepKey(6)}
              />
            </motion.div>
          )}
          {isStepsLoaded && stepsToShow.find(step => step.key === 7) && currentStep === 7 && (
            <motion.div
              key='step7'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <Collateral
                onCancellation={handleCancellation}
                guarantees={guarantees}
                requestId={requestId}
                user={user}
                onNext={handleNext}
                onBack={handleBack}
                isEditMode={editMode}
                nextStepKey={getNextStepKey(7)}
              />
            </motion.div>
          )}
          {(!isStepsLoaded || stepsToShow.find(step => step.key === 8)) && currentStep === 8 && (
            <motion.div
              key='step8'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <AcceptByUser
                onCancellation={handleCancellation}
                requestId={requestId}
                user={user}
                onNext={handleNext}
                onBack={handleBack}
                isEditMode={editMode}
                nextStepKey={getNextStepKey(8)}
                ruleText={ruleText}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PanelLayout>
  );
};

export default MultiStepForm;
>>>>>>> a47b58a (pwa)

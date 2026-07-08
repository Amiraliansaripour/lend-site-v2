import { FaCheck } from 'react-icons/fa6';

const ProgressBarMultiStep = ({
  editMode,
  stepsToShow,
  currentStep,
  activeStepRef,
  forCorrections = [],
  correctionStepIndex = 0,
}) => {
  return (
    <div className='overflow-hidden'>
      <div className='flex w-full flex-col items-center overflow-auto pr-[450px] sm:pr-[350px] md:pr-[200px] lg:pr-0'>
        <div className={`relative mb-4 w-fit items-center flex justify-between`}>
          {/* خط زمینه */}
          <div className='absolute top-6 left-0 right-0 z-0 h-0.5 rounded-full bg-gray-300 ' />
          {/* خط پیشرفت */}
          <div
            className='absolute top-6 right-0 z-10 h-0.5 rounded-full bg-gradient-to-r from-[#d0fae4] to-[#06753C] transition-all duration-500'
            style={{
              width: `${((editMode && forCorrections.length > 0 ? correctionStepIndex + 1 : stepsToShow.findIndex(step => step.key === currentStep) + 1) / stepsToShow?.length) * 100}%`,
            }}
          />
          {stepsToShow?.map((label, idx) => {
            const stepNumber = idx + 1;
            const currentStepIndex = stepsToShow.findIndex(step => step.key === currentStep);
            const isCompleted =
              editMode && forCorrections.length > 0
                ? correctionStepIndex > idx
                : currentStepIndex > idx;
            const isActive =
              editMode && forCorrections.length > 0
                ? correctionStepIndex === idx
                : currentStepIndex === idx;
            const labelStyle = isActive ? 'text-gray-800 font-bold z-50' : 'text-gray-800';
            return (
              <div
                ref={isActive ? activeStepRef : null}
                key={idx}
                className='relative z-20 flex w-28 flex-col whitespace-nowrap text-center md:items-center'
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-md transition-all duration-300 ${isCompleted ? 'bg-[#00E56D]' : isActive ? 'bg-white !text-purple-primary border-2 border-purple-primary' : ' bg-[#ebebeb]  !text-[#686868] '}`}
                >
                  {isCompleted ? (
                    <p className=''>
                      <FaCheck size={15} />
                    </p>
                  ) : (
                    Number(stepNumber).toLocaleString('fa')
                  )}
                </div>
                <span
                  className={`mt-2 text-xs sm:text-sm ${label.key % 2 === 0 ? `sm:block ${labelStyle}` : 'block'}`}
                >
                  {label.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressBarMultiStep;

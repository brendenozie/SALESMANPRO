import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  CheckCircleIcon} from "@heroicons/react/24/outline";

// -------------------
// STEP PER COMPONENT
// -------------------

interface StepperProps {
  step: number;
  stepsForCategory: number[];
  STEP_LABELS: Record<number, string>;
  onStepClick?: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ step, stepsForCategory, onStepClick, STEP_LABELS }) => {
  const labels = stepsForCategory.map((num) => STEP_LABELS[num]);
  const stepCount = labels.length;
  const progressWidth = `${((step - 1) / (stepCount - 1)) * 100}%`;

  const scrollRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (stepRefs.current[step - 1] && scrollRef.current) {
      stepRefs.current[step - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    }
  }, [step]);

  return (
    <div className="relative w-full px-4 pt-4">
      <div
        ref={scrollRef}
        className="flex items-center justify-between overflow-x-auto no-scrollbar space-x-6 pb-4 snap-x snap-mandatory"
      >
        {labels.map((label, index) => {
          const isActive = index + 1 === step;
          const isCompleted = index + 1 < step;
          return (
            <div
              key={index}
              ref={(el) => (stepRefs.current[index] = el)}
              className="flex flex-col items-center min-w-[70px] cursor-pointer snap-center"
              onClick={() => isCompleted && onStepClick?.(index + 1)}
            >
              <motion.div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold shadow-md border-2 transition-all ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 scale-110 shadow-lg"
                    : isCompleted
                    ? "bg-blue-400 text-white border-blue-400"
                    : "bg-gray-300 text-gray-500 border-gray-300"
                }`}
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {isCompleted ? (
                  <CheckCircleIcon className="w-5 h-5 animate-pulse" />
                ) : (
                  index + 1
                )}
              </motion.div>
              <p
                className={`mt-2 text-xs font-medium truncate w-16 text-center ${
                  isActive
                    ? "text-blue-600 font-semibold"
                    : isCompleted
                    ? "text-blue-400"
                    : "text-gray-400"
                }`}
              >
                {label}
              </p>
              <div className={`w-2 h-2 rounded-full mt-2 ${isActive ? "bg-blue-600" : "bg-gray-300"}`} />
            </div>
          );
        })}
      </div>
      <div className="relative w-full h-[2px] bg-gray-300 rounded-full">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"
          animate={{ width: progressWidth }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};


export default Stepper;

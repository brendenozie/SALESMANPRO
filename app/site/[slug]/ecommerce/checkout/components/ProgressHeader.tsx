import StepIndicator from "./StepIndicator";

export default function ProgressHeader({ step }: { step: number }) {
  return (
    <div className="w-full lg:w-64">
      <div className="sticky top-4 space-y-4">
        <StepIndicator
          label="Billing Details"
          active={step === 1}
          completed={step > 1}
        />
        <StepIndicator
          label="Shipping"
          active={step === 2}
          completed={step > 2}
        />
        <StepIndicator
          label="Payment"
          active={step === 3}
          completed={step > 3}
        />
        <StepIndicator
          label="Review & Confirm"
          active={step === 4}
          completed={step > 4}
        />
      </div>
    </div>
  );
}

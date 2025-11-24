import InputField from "./InputField";

export default function BillingSection({ onNext }: { onNext: () => void }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">

      <h2 className="text-xl font-semibold">Billing Details</h2>

      {/* NAME */}
      <InputField label="Full Name" name="fullName" />

      {/* EMAIL */}
      <InputField label="Email Address" name="email" type="email" />

      {/* PHONE */}
      <InputField label="Phone Number" name="phone" />

      <button
        onClick={onNext}
        className="w-full bg-black text-white py-3 rounded-xl mt-4"
      >
        Continue to Shipping
      </button>
    </div>
  );
}

import React, { ChangeEvent, useCallback } from 'react';

// --- Type and Interface Definitions ---

/**
 * Interface for Payment settings, extended to include Paystack and boolean
 * flags to enable/disable each method. Matches the expected Prisma schema model.
 */
export interface PaymentSettings {
  id?: string | null | undefined;
  companyId?: string | null | undefined;

  // Global settings for which methods are active
  isStripeEnabled?: boolean | null | undefined;
  isPaypalEnabled?: boolean | null | undefined;
  isMpesaEnabled?: boolean | null | undefined;
  isPaystackEnabled?: boolean | null | undefined; // New field
  isGhubaEnabled?: boolean | null | undefined; // NEW FIELD for Ghuba

  // Stripe
  stripeKey?: string | null | undefined; // Consider renaming to stripePublishableKey for clarity

  // PayPal
  paypalKey?: string | null | undefined;

  // M-Pesa
  mpesaShortcode?: string | null | undefined;
  mpesaConsumerKey?: string | null | undefined;
  mpesaConsumerSecret?: string | null | undefined;
  mpesaCallbackUrl?: string | null | undefined;

  // Paystack (New fields)
  paystackPublicKey?: string | null | undefined;
  paystackSecretKey?: string | null | undefined;

  // Ghuba (NEW FIELDS)
  ghubaMerchantId?: string | null | undefined;
  ghubaApiKey?: string | null | undefined;

}

/**
 * Props for the PaymentAccordion component.
 */
export interface PaymentAccordionProps {
  paymentSettings: PaymentSettings | null;
  onChange: (updated: PaymentSettings) => void;
}

// --- Helper Components (for visual appeal and reusability) ---

interface ToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const PaymentMethodToggle: React.FC<ToggleProps> = ({
  label,
  description,
  enabled,
  onToggle,
}) => (
  <div
    className={`flex items-center justify-between p-4 rounded-xl transition duration-200 ease-in-out ${
      enabled ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'
    } border shadow-sm`}
  >
    <div className="flex flex-col">
      <span className="text-lg font-semibold text-gray-800">{label}</span>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"
      ></div>
    </label>
  </div>
);

// --- Main Component ---

/**
 * A component for editing payment integration settings.
 * It provides a clear way to enable/disable gateways and configure them.
 */
export default function PaymentAccordion({
  paymentSettings,
  onChange,
}: PaymentAccordionProps) {

  /**
   * A generic handler to update a specific string field in the settings object.
   */
  const updateStringField = (key: keyof PaymentSettings, value: string) => {
    onChange({ ...paymentSettings, [key]: value });
  };

  /**
   * A generic handler to update a specific boolean field (toggle) in the settings object.
   * Uses useCallback to prevent unnecessary re-renders in the child components.
   */
  const updateBooleanField = useCallback(
    (key: keyof PaymentSettings, value: boolean) => {
      onChange({ ...paymentSettings, [key]: value });
    },
    [paymentSettings, onChange]
  );

  /**
   * Renders the input field for a payment gateway setting.
   */
  const renderInputField = (
    id: keyof PaymentSettings,
    label: string,
    placeholder: string,
    isSecret: boolean = false // Added for better security hint
  ) => (
    <div>
      <label
        htmlFor={String(id)}
        className="block text-sm font-semibold text-gray-700"
      >
        {label}
        {isSecret && (
          <span className="ml-2 text-xs text-red-500">
            (Keep this secret!)
          </span>
        )}
      </label>
      <input
        id={String(id)}
        type={isSecret ? 'password' : 'text'}
        value={(paymentSettings?.[id] as string) || ''}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          updateStringField(id, e.target.value)
        }
        placeholder={placeholder}
        className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-2xl rounded-3xl transform transition duration-500 hover:shadow-3xl">
      <div className="flex justify-between items-center mb-8 border-b border-indigo-100 pb-4">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Payment Gateway Configuration
        </h2>
        <span className="text-3xl text-indigo-600" role="img" aria-label="credit-card">
          💳
        </span>
      </div>

      {/* 1. Payment Method Selection Section */}
      <section className="mb-10 p-6 border border-indigo-100 rounded-xl bg-indigo-50/50">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-3">🔌</span> Select Active Methods
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Toggle the switch for each payment gateway you wish to enable and configure.
        </p>
        <div className="space-y-4">
          <PaymentMethodToggle
            label="Ghuba Payments"
            description="Enable payments via Ghuba (Note: A 10% transaction fee will be deducted)."
            enabled={paymentSettings?.isGhubaEnabled ?? false}
            onToggle={(value) => updateBooleanField('isGhubaEnabled', value)}
          />

          <PaymentMethodToggle
            label="Stripe"
            description="Enable credit/debit card payments via Stripe."
            enabled={paymentSettings?.isStripeEnabled ?? false}
            onToggle={(value) => updateBooleanField('isStripeEnabled', value)}
          />

          <PaymentMethodToggle
            label="PayPal"
            description="Enable payments through the PayPal platform."
            enabled={paymentSettings?.isPaypalEnabled ?? false}
            onToggle={(value) => updateBooleanField('isPaypalEnabled', value)}
          />

          <PaymentMethodToggle
            label="M-Pesa (Daraja API)"
            description="Enable mobile payments popular in East Africa."
            enabled={paymentSettings?.isMpesaEnabled ?? false}
            onToggle={(value) => updateBooleanField('isMpesaEnabled', value)}
          />

          <PaymentMethodToggle
            label="Paystack"
            description="Enable card and bank payments popular in Africa (e.g., Nigeria, Ghana, South Africa)."
            enabled={paymentSettings?.isPaystackEnabled ?? false}
            onToggle={(value) => updateBooleanField('isPaystackEnabled', value)}
          />
        </div>
      </section>

      {/* 2. Configuration Details Section */}
      <section className="p-6 border border-gray-200 rounded-xl bg-white shadow-inner">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="text-2xl mr-3">⚙️</span> Gateway API Credentials
        </h3>
        <div className="space-y-8">          

          {/* Ghuba Configuration (NEW) */}
          {(paymentSettings?.isGhubaEnabled ?? false) && (
            <div className="p-5 border-l-4 border-yellow-500 bg-yellow-50 rounded-lg shadow-md">
              <h4 className="text-lg font-bold text-yellow-700 mb-4">Ghuba Settings</h4>
              <p className="text-sm text-yellow-800 mb-4 p-3 border border-yellow-300 bg-yellow-100 rounded-md font-medium">
                <strong>⚠️ Transaction Fee Notice:</strong> Enabling Ghuba Payments will incur a 10% deduction on all successful transactions; please ensure you factor this into your pricing strategy.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputField(
                  'ghubaMerchantId',
                  'Ghuba Merchant ID',
                  'e.g., GHB12345678'
                )}
                {renderInputField(
                  'ghubaApiKey',
                  'Ghuba API Key',
                  'e.g., gsk_live_xxxxxxxxxxxx',
                  true // Mark as secret
                )}
              </div>
            </div>
          )}

          {/* Stripe Configuration */}
          {(paymentSettings?.isStripeEnabled ?? false) && (
            <div className="p-5 border-l-4 border-indigo-500 bg-indigo-50 rounded-lg shadow-md">
              <h4 className="text-lg font-bold text-indigo-700 mb-4">Stripe Settings</h4>
              {renderInputField(
                'stripeKey',
                'Stripe Publishable Key',
                'e.g., pk_live_xxxxxxxxxxxx'
              )}
            </div>
          )}

          {/* PayPal Configuration */}
          {(paymentSettings?.isPaypalEnabled ?? false) && (
            <div className="p-5 border-l-4 border-blue-500 bg-blue-50 rounded-lg shadow-md">
              <h4 className="text-lg font-bold text-blue-700 mb-4">PayPal Settings</h4>
              {renderInputField(
                'paypalKey',
                'PayPal Client ID',
                'e.g., Axxxxxxxxxxxx'
              )}
            </div>
          )}

          {/* Paystack Configuration (NEW) */}
          {(paymentSettings?.isPaystackEnabled ?? false) && (
            <div className="p-5 border-l-4 border-green-500 bg-green-50 rounded-lg shadow-md">
              <h4 className="text-lg font-bold text-green-700 mb-4">Paystack Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputField(
                  'paystackPublicKey',
                  'Paystack Public Key',
                  'e.g., pk_live_xxxxxxxxxxxx'
                )}
                {renderInputField(
                  'paystackSecretKey',
                  'Paystack Secret Key',
                  'e.g., sk_live_xxxxxxxxxxxx',
                  true // Mark as secret
                )}
              </div>
            </div>
          )}

          {/* M-Pesa Configuration */}
          {(paymentSettings?.isMpesaEnabled ?? false) && (
            <div className="p-5 border-l-4 border-red-500 bg-red-50 rounded-lg shadow-md">
              <h4 className="text-lg font-bold text-red-700 mb-4">M-Pesa (Daraja API) Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputField(
                  'mpesaShortcode',
                  'Shortcode (Paybill/Till Number)',
                  'e.g., 600123'
                )}
                {renderInputField(
                  'mpesaConsumerKey',
                  'Consumer Key',
                  'e.g., xxxxxxxxxx'
                )}
                {renderInputField(
                  'mpesaConsumerSecret',
                  'Consumer Secret',
                  'e.g., xxxxxxxxxx',
                  true // Mark as secret
                )}
                <div className="md:col-span-2">
                  {renderInputField(
                    'mpesaCallbackUrl',
                    'Validation/Confirmation URL',
                    'e.g., https://yourstore.com/mpesa-callback'
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
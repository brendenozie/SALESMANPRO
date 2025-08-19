import React, { ChangeEvent } from 'react';

/**
 * Interface for Payment settings, matching the Prisma schema model.
 */
export interface PaymentSettings {
  id?: string | null | undefined;
  companyId?: string | null | undefined;
  stripeKey?: string | null | undefined;
  paypalKey?: string | null | undefined;
  mpesaShortcode?: string | null | undefined;
  mpesaConsumerKey?: string | null | undefined;
  mpesaConsumerSecret?: string | null | undefined;
  mpesaCallbackUrl?: string | null | undefined;
}

/**
 * Props for the PaymentAccordion component.
 */
export interface PaymentAccordionProps {
  paymentSettings: PaymentSettings;
  onChange: (updated: PaymentSettings) => void;
}

/**
 * A component for editing payment integration settings.
 * It provides fields for various payment gateways like Stripe, PayPal, and M-Pesa.
 */
export default function PaymentAccordion({
  paymentSettings,
  onChange,
}: PaymentAccordionProps) {

  /**
   * A generic handler to update a specific field in the payment settings object.
   * It creates a new object with the updated field and calls the parent onChange handler.
   * @param key The key of the field to update.
   * @param value The new value for the field.
   */
  const updateField = (key: keyof PaymentSettings, value: string) => {
    onChange({ ...paymentSettings, [key]: value });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-2xl">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Payments Settings</h2>
        <span className="text-2xl" role="img" aria-label="credit-card">💳</span>
      </div>

      {/* Payment Integrations Section */}
      <section className="p-6 border border-gray-200 rounded-xl bg-gray-50">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Payment Integrations
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Set up your payment gateways.
        </p>
        <div className="space-y-6">
          {/* Stripe Key */}
          <div>
            <label htmlFor="stripeKey" className="block text-sm font-semibold text-gray-700">
              Stripe Publishable Key
            </label>
            <input
              id="stripeKey"
              type="text"
              // Correctly binding the value to the prop
              value={paymentSettings?.stripeKey || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('stripeKey', e.target.value)
              }
              placeholder="e.g., pk_test_xxxxxxx"
              className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            />
          </div>
          {/* PayPal Key */}
          <div>
            <label htmlFor="paypalKey" className="block text-sm font-semibold text-gray-700">
              PayPal Client ID
            </label>
            <input
              id="paypalKey"
              type="text"
              // Correctly binding the value to the prop
              value={paymentSettings?.paypalKey || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('paypalKey', e.target.value)
              }
              placeholder="e.g., Axxxxxxxxxxxx"
              className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            />
          </div>

          {/* M-Pesa Section */}
          <div className="border-t border-gray-200 pt-6 mt-6 space-y-4">
            <h4 className="text-lg font-bold text-gray-800">M-Pesa (Daraja API)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="mpesaShortcode" className="block text-sm font-semibold text-gray-700">
                  Shortcode
                </label>
                <input
                  id="mpesaShortcode"
                  type="text"
                  // Correctly binding the value to the prop
                  value={paymentSettings?.mpesaShortcode || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateField('mpesaShortcode', e.target.value)
                  }
                  placeholder="e.g., 600123"
                  className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                />
              </div>
              <div>
                <label htmlFor="mpesaConsumerKey" className="block text-sm font-semibold text-gray-700">
                  Consumer Key
                </label>
                <input
                  id="mpesaConsumerKey"
                  type="text"
                  // Correctly binding the value to the prop
                  value={paymentSettings?.mpesaConsumerKey || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateField('mpesaConsumerKey', e.target.value)
                  }
                  placeholder="e.g., xxxxxxxxxx"
                  className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="mpesaConsumerSecret" className="block text-sm font-semibold text-gray-700">
                  Consumer Secret
                </label>
                <input
                  id="mpesaConsumerSecret"
                  type="text"
                  // Correctly binding the value to the prop
                  value={paymentSettings?.mpesaConsumerSecret || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateField('mpesaConsumerSecret', e.target.value)
                  }
                  placeholder="e.g., xxxxxxxxxx"
                  className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="mpesaCallbackUrl" className="block text-sm font-semibold text-gray-700">
                  Callback URL
                </label>
                <input
                  id="mpesaCallbackUrl"
                  type="text"
                  // Correctly binding the value to the prop
                  value={paymentSettings?.mpesaCallbackUrl || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateField('mpesaCallbackUrl', e.target.value)
                  }
                  placeholder="e.g., https://yourstore.com/mpesa-callback"
                  className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

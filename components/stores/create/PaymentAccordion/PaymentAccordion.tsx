import React, { ChangeEvent } from 'react';

export interface PaymentSettings {
  mpesaShortcode?: string;
  mpesaConsumerKey?: string;
  mpesaConsumerSecret?: string;
  mpesaCallbackUrl?: string;
}

export interface PaymentAccordionProps {
  paymentSettings: PaymentSettings;
  onChange: (updated: PaymentSettings) => void;
}

export default function PaymentAccordion({
  paymentSettings,
  onChange,
}: PaymentAccordionProps) {
  const updateField = (key: keyof PaymentSettings, value: string) => {
    onChange({ ...paymentSettings, [key]: value });
  };

  return (
    <div className="max-w-3xl mx-auto p-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Payments</h2>
        <span className="text-2xl" role="img" aria-label="credit-card">💳</span>
      </div>

      {/* Payment Settings */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">M-Pesa (Daraja API)</h3>

        <fieldset className="border border-gray-200 rounded-lg p-4 space-y-6">
          <legend className="text-sm font-medium text-gray-600 px-2">Credentials</legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Shortcode */}
            <div>
              <label htmlFor="mpesaShortcode" className="block text-sm font-medium text-gray-700">
                Business Shortcode
              </label>
              <input
                id="mpesaShortcode"
                type="text"
                value={paymentSettings.mpesaShortcode || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateField('mpesaShortcode', e.target.value)
                }
                placeholder="123456"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter your 6-digit M-Pesa Paybill or shortcode.
              </p>
            </div>

            {/* Consumer Key */}
            <div>
              <label htmlFor="mpesaConsumerKey" className="block text-sm font-medium text-gray-700">
                Consumer Key
              </label>
              <input
                id="mpesaConsumerKey"
                type="text"
                value={paymentSettings.mpesaConsumerKey || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateField('mpesaConsumerKey', e.target.value)
                }
                placeholder="Daraja Key"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                From your Safaricom Daraja app dashboard.
              </p>
            </div>

            {/* Consumer Secret */}
            <div className="sm:col-span-2">
              <label htmlFor="mpesaConsumerSecret" className="block text-sm font-medium text-gray-700">
                Consumer Secret
              </label>
              <input
                id="mpesaConsumerSecret"
                type="text"
                value={paymentSettings.mpesaConsumerSecret || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateField('mpesaConsumerSecret', e.target.value)
                }
                placeholder="Daraja Secret"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Secret key for authenticating requests to M-Pesa.
              </p>
            </div>

            {/* Callback URL */}
            <div className="sm:col-span-2">
              <label htmlFor="mpesaCallbackUrl" className="block text-sm font-medium text-gray-700">
                Callback URL
              </label>
              <input
                id="mpesaCallbackUrl"
                type="url"
                value={paymentSettings.mpesaCallbackUrl || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateField('mpesaCallbackUrl', e.target.value)
                }
                placeholder="https://yourdomain.com/callback"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                This URL will receive transaction results from M-Pesa.
              </p>
            </div>
          </div>
        </fieldset>
      </section>
    </div>
  );
}

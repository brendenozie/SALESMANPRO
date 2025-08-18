import React, { ChangeEvent } from 'react';


export interface PaymentSettings {
  id?: string;
  companyId?: string;
  stripeKey?: string | null;
  paypalKey?: string | null;
  mpesaShortcode?: string | null;
  mpesaConsumerKey?: string | null;
  mpesaConsumerSecret?: string | null;
  mpesaCallbackUrl?: string | null;
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

  const handlePaymentChange = (key: keyof PaymentSettings, value: any) => {
    // onChange({
    //   paymentSettings: {
    //     ...settings.paymentSettings,
    //     [key]: value,
    //   },
    // });
  };
  

  return (
    <div className="max-w-3xl mx-auto p-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Payments</h2>
        <span className="text-2xl" role="img" aria-label="credit-card">💳</span>
      </div>

       {/* Payment Settings Section */}
            <section className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Payment Integrations
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Set up your payment gateways.
              </p>
              <div className="space-y-6">
                <div>
                  <label htmlFor="stripeKey" className="block text-sm font-semibold text-gray-700">
                    Stripe Publishable Key
                  </label>
                  <input
                    id="stripeKey"
                    type="text"
                    // value={settings.paymentSettings.stripeKey || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handlePaymentChange('stripeKey', e.target.value)
                    }
                    placeholder="e.g., pk_test_xxxxxxx"
                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  />
                </div>
                <div>
                  <label htmlFor="paypalKey" className="block text-sm font-semibold text-gray-700">
                    PayPal Client ID
                  </label>
                  <input
                    id="paypalKey"
                    type="text"
                    // value={settings.paymentSettings.paypalKey || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handlePaymentChange('paypalKey', e.target.value)
                    }
                    placeholder="e.g., Axxxxxxxxxxxx"
                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="mpesaShortcode" className="block text-sm font-semibold text-gray-700">
                      M-Pesa Shortcode
                    </label>
                    <input
                      id="mpesaShortcode"
                      type="text"
                      // value={settings.paymentSettings.mpesaShortcode || ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handlePaymentChange('mpesaShortcode', e.target.value)
                      }
                      placeholder="e.g., 600123"
                      className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    />
                  </div>
                  <div>
                    <label htmlFor="mpesaConsumerKey" className="block text-sm font-semibold text-gray-700">
                      M-Pesa Consumer Key
                    </label>
                    <input
                      id="mpesaConsumerKey"
                      type="text"
                      // value={settings.paymentSettings.mpesaConsumerKey || ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handlePaymentChange('mpesaConsumerKey', e.target.value)
                      }
                      placeholder="e.g., xxxxxxxxxx"
                      className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="mpesaConsumerSecret" className="block text-sm font-semibold text-gray-700">
                    M-Pesa Consumer Secret
                  </label>
                  <input
                    id="mpesaConsumerSecret"
                    type="text"
                    // value={settings.paymentSettings.mpesaConsumerSecret || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handlePaymentChange('mpesaConsumerSecret', e.target.value)
                    }
                    placeholder="e.g., xxxxxxxxxx"
                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  />
                </div>
                <div>
                  <label htmlFor="mpesaCallbackUrl" className="block text-sm font-semibold text-gray-700">
                    M-Pesa Callback URL
                  </label>
                  <input
                    id="mpesaCallbackUrl"
                    type="text"
                    // value={settings.paymentSettings.mpesaCallbackUrl || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handlePaymentChange('mpesaCallbackUrl', e.target.value)
                    }
                    placeholder="e.g., https://yourstore.com/mpesa-callback"
                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  />
                </div>
              </div>
            </section>
      

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
                // value={paymentSettings.mpesaShortcode || ''}
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
                // value={paymentSettings.mpesaConsumerKey || ''}
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
                // value={paymentSettings.mpesaConsumerSecret || ''}
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
                // value={paymentSettings.mpesaCallbackUrl || ''}
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

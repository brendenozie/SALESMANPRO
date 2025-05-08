import React from 'react';

const plans = [
  {
    name: 'Ghuba Basic',
    features: {
      website: ['Standard Ghuba subdomain', 'SSL Certificate'],
      inventory: ['Unlimited Products'],
      sales: ['Unlimited Sales Records', '20 Invoices & Receipts'],
      payments: ['Online Payment Gateway (KES only)'],
      crm: ['25 Messaging credits', 'Unlimited Customer Records', 'Default Groups'],
      operations: ['1 Staff user', 'App dashboard'],
      integrations: ['Facebook Pixel (ShipBubble)'],
      support: ['Email & In-App Support'],
    },
  },
  {
    name: 'Ghuba Starter',
    features: {
      website: ['Custom domain', 'SSL Certificate'],
      inventory: ['Unlimited Products', 'Bulk Product Edit'],
      sales: ['Unlimited Sales Records', '50 Invoices & Receipts', 'Unlimited Coupons'],
      payments: ['Online Payment Gateway (KES + USD settlements)'],
      crm: ['100 Messaging credits', 'Unlimited Customer Records', '5 Custom Groups'],
      operations: ['3 Staff users', 'App + trend reports', 'Expense Records'],
      integrations: ['Facebook Pixel, Google Analytics, Fez Delivery'],
      support: ['Priority Support'],
    },
  },
  {
    name: 'Ghuba Pro',
    features: {
      website: ['Custom domain + favicon', 'SSL Certificate'],
      inventory: ['Unlimited Products', 'Bulk Edit', 'Variations'],
      sales: ['Unlimited Sales & Receipts', 'Limit Coupons', 'POS'],
      payments: ['Full KES & USD support'],
      crm: ['200 Messaging credits', 'Unlimited Records', '20 Custom Groups'],
      operations: ['5 Staff users', 'App + email insights', 'Reconciliation'],
      integrations: ['All carriers + automation'],
      support: ['Account Manager'],
    },
  },
  {
    name: 'Ghuba Growth',
    features: {
      website: ['Fully branded domain', 'SSL Certificate'],
      inventory: ['Unlimited Products', 'Bulk Edit', 'Variations', 'MOQ'],
      sales: ['Unlimited Sales & Receipts', 'Coupons', 'POS'],
      payments: ['KES, USD & EUR support'],
      crm: ['1000 Messaging credits', 'Unlimited Records', '100 Custom Groups'],
      operations: ['Unlimited Staff', 'Advanced analytics', 'Multi-location'],
      integrations: ['Free-shipping rules engine'],
      support: ['Dedicated helpline'],
    },
  },
];

export default function PricingTable() {
  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2"></th>
            {plans.map((plan) => (
              <th key={plan.name} className="border px-4 py-2 text-center">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(plans[0].features).map((section) => (
            <React.Fragment key={section}>
              <tr>
                <td className="border px-4 py-2 font-bold capitalize">
                  {section.replace(/([A-Z])/g, ' $1').trim()}
                </td>
                {plans.map((plan) => (
                  <td key={plan.name + section} className="border px-4 py-2">
                    <ul className="list-disc list-inside space-y-1">
                      {plan.features[section].map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

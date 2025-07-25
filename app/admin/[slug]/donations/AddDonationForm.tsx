import React, { useState } from 'react';
import { Donation } from '@prisma/client'; // Assuming Donation type is imported from Prisma client

// Define your interfaces for props and data
interface User {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
}

interface Campaign {
  id: string;
  name: string;
}

interface AddDonationFormData {
  donorId: string;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  notes: string | null;
  status: Donation['status'];
  projectId: string | null;
  campaignId: string | null;
  transactionId: string | null;
  donationDate: string; // ISO string
}

interface AddDonationFormProps {
  onSubmit: (data: AddDonationFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
  users: User[];
  projects: Project[];
  campaigns: Campaign[];
}

const AddDonationForm: React.FC<AddDonationFormProps> = ({ onSubmit, onCancel, isLoading, users, projects, campaigns }) => {
  const [donorId, setDonorId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<Donation['status']>('PENDING');
  const [projectId, setProjectId] = useState<string>('');
  const [campaignId, setCampaignId] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // State for input validation feedback
  const [amountError, setAmountError] = useState<string | null>(null);
  const [donorError, setDonorError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setAmountError(null);
    setDonorError(null);

    let hasError = false;

    if (!donorId) {
      setDonorError('Please select a donor.');
      hasError = true;
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Amount must be a positive number.');
      hasError = true;
    }

    if (hasError) {
      setFormError('Please correct the highlighted fields.');
      return;
    }

    onSubmit({
      donorId,
      amount: parsedAmount,
      currency,
      paymentMethod: paymentMethod || null,
      notes: notes || null,
      status,
      projectId: projectId || null,
      campaignId: campaignId || null,
      transactionId: transactionId || null,
      donationDate: new Date().toISOString(),
    });
  };

  // Common Tailwind classes
  const baseInputClasses = "mt-1 block w-full p-3 border rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-500 shadow-sm";
  const validInputClasses = "border-gray-700 focus:ring-teal-500 focus:border-teal-500";
  const errorInputClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
  const labelClasses = "block text-sm font-semibold text-gray-300 mb-1";
  const optionalLabelClasses = "text-gray-400 font-normal ml-2 text-xs"; // For optional field labels

  // Determine input classes dynamically based on validation state
  const getDonorInputClasses = () => `${baseInputClasses} ${donorError ? errorInputClasses : validInputClasses}`;
  const getAmountInputClasses = () => `${baseInputClasses} ${amountError ? errorInputClasses : validInputClasses}`;
  const getDefaultInputClasses = () => `${baseInputClasses} ${validInputClasses}`;

  // Donation status styles
  const statusOptions = [
    { value: 'PENDING', label: 'Pending', color: 'bg-yellow-600' },
    { value: 'SUCCESS', label: 'Success', color: 'bg-green-600' },
    { value: 'FAILED', label: 'Failed', color: 'bg-red-600' },
    { value: 'REFUNDED', label: 'Refunded', color: 'bg-blue-600' },
  ];

  const getStatusColor = (currentStatus: Donation['status']) => {
    return statusOptions.find(opt => opt.value === currentStatus)?.color || 'bg-gray-600';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6 bg-gray-900 rounded-xl shadow-2xl border border-gray-800 animate-fade-in-up">
      <h2 className="text-3xl font-extrabold text-white text-center mb-8 tracking-tight">Add New Donation</h2>

      {formError && (
        <div className="bg-red-900 bg-opacity-40 border border-red-700 text-red-300 text-sm p-4 rounded-lg flex items-center gap-3 animate-slide-down">
          <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {formError}
        </div>
      )}

      {/* Donor Selection */}
      <div>
        <label htmlFor="donorId" className={labelClasses}>Donor <span className="text-red-500">*</span></label>
        <select
          id="donorId"
          value={donorId}
          onChange={(e) => {
            setDonorId(e.target.value);
            setDonorError(null); // Clear error on change
          }}
          className={getDonorInputClasses()}
          required
        >
          <option value="" disabled>Select a donor from the list</option>
          {users.length > 0 ? (
            users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))
          ) : (
            <option value="" disabled>No donors available</option>
          )}
        </select>
        {donorError && <p className="mt-1 text-red-400 text-xs">{donorError}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className={labelClasses}>Amount <span className="text-red-500">*</span></label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setAmountError(null); // Clear error on change
            }}
            step="0.01"
            className={getAmountInputClasses()}
            required
            placeholder="e.g., 100.00"
          />
          {amountError && <p className="mt-1 text-red-400 text-xs">{amountError}</p>}
        </div>

        {/* Currency Input */}
        <div>
          <label htmlFor="currency" className={labelClasses}>Currency <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={getDefaultInputClasses()}
            required
            placeholder="e.g., USD, KES, EUR"
            maxLength={5} // Limit currency code length
          />
          <p className="mt-1 text-gray-500 text-xs">Standard 3-letter currency code (e.g., USD).</p>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label htmlFor="paymentMethod" className={labelClasses}>
          Payment Method <span className={optionalLabelClasses}>(Optional)</span>
        </label>
        <input
          type="text"
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className={getDefaultInputClasses()}
          placeholder="e.g., Credit Card, M-Pesa, PayPal"
        />
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className={labelClasses}>Status <span className="text-red-500">*</span></label>
        <div className="relative">
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Donation['status'])}
            className={`${getDefaultInputClasses()} appearance-none pr-10`} // Hide default arrow
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom arrow/indicator */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15 8.293l-1.414-1.414L10 10.828l-3.293-3.293L5.586 8.293 9.293 12.95z"/></svg>
          </div>
          {/* Visual status indicator */}
          <span className={`absolute top-1/2 right-12 -translate-y-1/2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)} text-white`}>
            {statusOptions.find(opt => opt.value === status)?.label}
          </span>
        </div>
        <p className="mt-1 text-gray-500 text-xs">Current state of the donation.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Project (Optional) */}
        <div>
          <label htmlFor="projectId" className={labelClasses}>
            Project <span className={optionalLabelClasses}>(Optional)</span>
          </label>
          <select
            id="projectId"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className={getDefaultInputClasses()}
          >
            <option value="">None (General donation)</option>
            {projects.length > 0 ? (
              projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))
            ) : (
              <option value="" disabled>No projects available</option>
            )}
          </select>
          <p className="mt-1 text-gray-500 text-xs">Link to a specific project.</p>
        </div>

        {/* Campaign (Optional) */}
        <div>
          <label htmlFor="campaignId" className={labelClasses}>
            Campaign <span className={optionalLabelClasses}>(Optional)</span>
          </label>
          <select
            id="campaignId"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className={getDefaultInputClasses()}
          >
            <option value="">None (Not part of a campaign)</option>
            {campaigns.length > 0 ? (
              campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))
            ) : (
              <option value="" disabled>No campaigns available</option>
            )}
          </select>
          <p className="mt-1 text-gray-500 text-xs">Link to a specific fundraising campaign.</p>
        </div>
      </div>

      {/* Transaction ID */}
      <div>
        <label htmlFor="transactionId" className={labelClasses}>
          Transaction ID <span className={optionalLabelClasses}>(Optional)</span>
        </label>
        <input
          type="text"
          id="transactionId"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          className={getDefaultInputClasses()}
          placeholder="e.g., PAY-XYZ-123, M-Pesa T123ABC"
        />
        <p className="mt-1 text-gray-500 text-xs">Unique identifier from the payment gateway.</p>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelClasses}>
          Notes <span className={optionalLabelClasses}>(Optional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className={`${getDefaultInputClasses()} resize-y`}
          placeholder="Add any additional notes about this donation here..."
        ></textarea>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 bg-gray-700 text-gray-200 rounded-lg shadow-md hover:bg-gray-600 transition-all duration-300 ease-in-out font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-300 ease-in-out font-bold flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Add Donation
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AddDonationForm;
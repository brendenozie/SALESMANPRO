"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const LogPaymentModal: React.FC<any> = ({ isOpen, onClose, feeRecord, onSavePayment, isSubmitting, onDownloadReceipt }) => {
  const [paymentAmount, setPaymentAmount] = React.useState<number>(0);
  const [paymentMethod, setPaymentMethod] = React.useState<string>("");
  // const [receiptNumber, setReceiptNumber] = React.useState<string>("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePayment({
      amount: paymentAmount,
      method: paymentMethod,
      // receiptNumber
    });
  };

  React.useEffect(() => {
    if (isOpen && feeRecord) {
      setPaymentAmount(feeRecord.calculatedBalanceDue);
    }
  }, [isOpen, feeRecord]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-white/5 bg-emerald-500/5">
               <h2 className="text-2xl font-black text-white">Record Payment</h2>
               <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-black">Transaction Portal</p>
            </div>

            <div className="px-8 pt-8">
               <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
                    <span>Outstanding Balance</span>
                    <span className="text-rose-400">${feeRecord?.calculatedBalanceDue.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-white/5 w-full" />
                  <div className="flex justify-between items-center text-xs font-black text-white">
                    <span>Student</span>
                    <span>{feeRecord?.student?.firstName} {feeRecord?.student?.lastName}</span>
                  </div>
               </div>
            </div>

            {/* <button type="button" onClick={() => onDownloadReceipt(feeRecord?.id)} className="text-indigo-400 hover:text-indigo-300 text-xs font-bold px-8">
              Download Receipt
            </button> */}

            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$
                  {/* Current Amount: ${feeRecord?.calculatedBalanceDue.toLocaleString()} */}
                </span>
                <input type="number" step="0.01" value={paymentAmount} onChange={e => setPaymentAmount(parseFloat(e.target.value))} 
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 pl-8 text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" />
              </div>

              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="">Select Method</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="M-Pesa">M-Pesa</option>
              </select>

              {/* <input type="text" placeholder="Receipt Number" value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white" /> */}

              <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all mt-4">
                {isSubmitting ? "Processing..." : "Confirm Transaction"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogPaymentModal;
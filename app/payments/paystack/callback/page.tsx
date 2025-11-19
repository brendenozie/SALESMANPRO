"use client";

import React, { useEffect } from 'react';

// --- Icon Components ---

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-orange-500 border-gray-200"></div>
);

// --- Main Verification Page Component ---

export default function App() {

  useEffect(() => {
    // Parse the reference from the URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("reference");
    const provider = urlParams.get("provider");
    const checkoutRequestId = urlParams.get("checkoutRequestId");
    
    if (!ref) {
      // If there's no reference, we can't do anything.
      // Redirect to a failure page.
      window.location.href = "/subscription/failed?message=No payment reference found.";
      return;
    }

    // Immediately redirect to the API verification endpoint.
    // The server-side GET handler will take over, verify with Paystack,
    // update the database, and then redirect the user to the
    // final success or failure page.
    window.location.href = `/api/payments/verify?reference=${ref}&provider=${provider || 'paystack'}&checkoutRequestId=${checkoutRequestId || ''}`;

  }, []); // Empty dependency array means this runs once on page load

  // This page will only be visible for a brief moment
  // while the browser initiates the redirect.
  // We show a persistent loading state.
  return (
    <div className="w-full min-h-screen font-sans bg-gray-50 flex items-center justify-center">
    
      <div className="max-w-lg w-full bg-white p-10 rounded-2xl shadow-2xl text-center">
        <>
          <LoadingSpinner />
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Finalizing Your Payment...</h2>
          <p className="mt-2 text-gray-600">Please wait, we are securely verifying your subscription.</p>
        </>
      </div>
    </div>
  );
}
// import React, { useState, useEffect } from 'react';

// // --- Icon Components ---

// const CheckCircleIcon = () => (
//   <svg className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//   </svg>
// );

// const ExclamationCircleIcon = () => (
//   <svg className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//   </svg>
// );

// const LoadingSpinner = () => (
//   <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-orange-500 border-gray-200"></div>
// );

// // --- Main Verification Page Component ---

// export default function App() {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);
//   const [reference, setReference] = useState<string | null>(null);

//   /**
//    * Mocks a backend API call to verify the payment reference.
//    */
//   const verifyPaymentReference = async (ref: string) => {
//     console.log(`Verifying payment reference: ${ref}`);
//     // This is where you would make a fetch request to your backend:
//     const res = await fetch(`/api/payments-subscription/verify`, {
//       method: 'POST',
//       body: JSON.stringify({ reference: ref })
//     });
//     const data = await res.json();
//     if (!data.success) throw new Error(data.message);
    
//     // --- Mocking the API response ---
//     // return new Promise((resolve, reject) => {
//     //   setTimeout(() => {
//     //     // Simulate a successful verification
//     //     if (ref && ref !== "fail") {
//     //       resolve({ success: true, message: "Payment Verified Successfully!" });
//     //     } else {
//     //       // Simulate a failed verification
//     //       reject(new Error("Invalid payment reference or payment failed."));
//     //     }
//     //   }, 2500); // 2.5-second delay
//     // });
//   };

//   useEffect(() => {
//     // Parse the reference from the URL query string
//     const urlParams = new URLSearchParams(window.location.search);
//     const ref = urlParams.get("reference");
    
//     if (!ref) {
//       setError("No payment reference found. Please try again.");
//       setLoading(false);
//       return;
//     }

//     setReference(ref);

//     // Immediately start verification
//     verifyPaymentReference(ref)
//       .then(() => {
//         setSuccess(true);
//         setError(null);
//       })
//       .catch((err) => {
//         setError(err.message || "An unknown error occurred during verification.");
//         setSuccess(false);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []); // Empty dependency array means this runs once on page load

//   const navigateToDashboard = () => {
//     // In a real app, this would use a router or window.location
//     console.log("Navigating to dashboard...");
//     window.location.href = "/dashboard"; // or your main app page
//   };
  
//   const navigateToPricing = () => {
//     // In a real app, this would use a router or window.location
//     console.log("Navigating to pricing...");
//     window.location.href = "/pricing"; // or back to the modal
//   };

//   /**
//    * Renders the current state of the verification process.
//    */
//   const renderState = () => {
//     if (loading) {
//       return (
//         <>
//           <LoadingSpinner />
//           <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Verifying Your Payment...</h2>
//           <p className="mt-2 text-gray-600">Please wait, this won't take long.</p>
//         </>
//       );
//     }

//     if (error) {
//       return (
//         <>
//           <ExclamationCircleIcon />
//           <h2 className="mt-6 text-2xl font-extrabold text-red-600">Payment Failed</h2>
//           <p className="mt-2 text-gray-600 max-w-md">{error}</p>
//           <button
//             onClick={navigateToPricing}
//             className="mt-8 w-full inline-flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-gradient-to-r from-orange-600 to-pink-500 hover:opacity-95 transform transition-all"
//           >
//             Try Payment Again
//           </button>
//         </>
//       );
//     }

//     if (success) {
//       return (
//         <>
//           <CheckCircleIcon />
//           <h2 className="mt-6 text-2xl font-extrabold text-green-600">Payment Successful!</h2>
//           <p className="mt-2 text-gray-600">Your subscription is now active. Welcome aboard!</p>
//           <button
//             onClick={navigateToDashboard}
//             className="mt-8 w-full inline-flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-green-600 hover:bg-green-700 transform transition-all"
//           >
//             Go to Your Dashboard
//           </button>
//         </>
//       );
//     }

//     return null; // Should not be reachable
//   };

//   return (
//     <div className="w-full min-h-screen font-sans bg-gray-50 flex items-center justify-center">
//       <script src="https://cdn.tailwindcss.com"></script>
//       <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;8S00;900&display=swap" rel="stylesheet" />
      
//       <div className="max-w-lg w-full bg-white p-10 rounded-2xl shadow-2xl text-center">
//         {renderState()}
//       </div>
//     </div>
//   );
// }
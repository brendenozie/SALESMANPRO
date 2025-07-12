import { setCookie } from "cookies-next";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const storeSignupPath = (rolePath: string) => {
  setCookie("signup_path", rolePath, { maxAge: 5 * 60 }); // Store for 5 minutes
};

const handleSignupNavigation = (role: string) => {
  storeSignupPath(role);
  window.location.href = "/register"; // Navigate to registration page
};

const Modal = ({ isOpen, onClose, title, children }: any) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          // onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className=" max-w-5xl w-full relative p-6"
            onClick={(e : any) => e.stopPropagation()}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-700">{title}</h2>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-White hover:text-gray-800 w-10 h-10 background-gray-200 rounded-full flex items-center justify-center transition duration-300 ease-in-out transform hover:scale-105"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

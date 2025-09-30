import { setCookie } from "cookies-next";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, ReactNode } from "react";

// --- Utility Functions (Kept for completeness) ---
const storeSignupPath = (rolePath: string) => {
  setCookie("signup_path", rolePath, { maxAge: 5 * 60 }); // Store for 5 minutes
};

const handleSignupNavigation = (role: string) => {
  storeSignupPath(role);
  window.location.href = "/register"; // Navigate to registration page
};
// ---------------------------------------------------

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Custom Tailwind classes for the inner modal content container (e.g., max-w, bg-color). Default set for mobile. */
  contentClassName?: string; 
  /** If true, clicking the backdrop closes the modal */
  closeOnBackdropClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  // Adjusted default to ensure mobile responsiveness (full width on small screens)
  contentClassName = 'sm:max-w-2xl bg-white shadow-2xl rounded-xl', 
  closeOnBackdropClick = true 
}) => {
  
  // Effect to handle Escape key press and body scrolling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    
    if (isOpen) {
        document.body.style.overflow = 'hidden'; // Prevents background scrolling
        document.addEventListener("keydown", handleKeyDown);
    } else {
        document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle backdrop click logic
  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  // Mobile-optimized animation for the modal content
  const mobileVariants = {
    hidden: { 
      y: "100%", // Start off-screen at the bottom
      opacity: 0,
    },
    visible: { 
      y: 0, 
      opacity: 1,
    },
    exit: { 
      y: "100%", 
      opacity: 0,
    },
  };

  // Desktop-optimized animation
  const desktopVariants = {
    hidden: { 
      scale: 0.95, 
      opacity: 0 
    },
    visible: { 
      scale: 1, 
      opacity: 1 
    },
    exit: { 
      scale: 0.95, 
      opacity: 0 
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-[1000] p-4 overflow-y-auto" // Added p-4 and overflow-y-auto for scrollability
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            // Mobile-first styling: full width, full height (on small screens)
            className={`w-full relative mx-0 my-auto sm:my-8 sm:w-auto ${contentClassName}`} 
            onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent closing when clicking inside
            
            // Choose animation based on screen size (a rough proxy for mobile vs desktop)
            // Note: In a real app, you might use a useMediaQuery hook for better detection
            initial={window.innerWidth < 640 ? mobileVariants.hidden : desktopVariants.hidden}
            animate={window.innerWidth < 640 ? mobileVariants.visible : desktopVariants.visible}
            exit={window.innerWidth < 640 ? mobileVariants.exit : desktopVariants.exit}
            transition={{ duration: 0.3, ease: "easeOut" }}
            
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 id="modal-title" className="text-xl font-semibold text-gray-800">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center transition duration-150 rounded-full hover:bg-gray-100"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body: Use max-h-screen to ensure content scrolls if it exceeds the viewport */}
            <div className="p-0 text-gray-700 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
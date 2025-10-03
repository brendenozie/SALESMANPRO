import { setCookie } from "cookies-next";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useEffect, useState, ReactNode } from "react";

// --- Utility Functions (Kept for completeness) ---
const storeSignupPath = (rolePath: string) => {
  setCookie("signup_path", rolePath, { maxAge: 5 * 60 }); // Store for 5 minutes
};

const handleSignupNavigation = (role: string) => {
  storeSignupPath(role);
  window.location.href = "/register"; // Navigate to registration page
};
// ---------------------------------------------------

// ---------------------------------------------------
// 💡 Custom Hook for Responsive Design
// ---------------------------------------------------

/**
 * Custom hook to determine if the current screen size is mobile based on a Tailwind CSS breakpoint.
 * Uses 'sm' breakpoint (default: 640px) as the switch point.
 * @param breakpoint The screen width threshold in pixels (defaults to 640 for 'sm').
 * @returns boolean - true if the screen width is less than the breakpoint.
 */
const useIsMobile = (breakpoint: number = 640): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check is run inside useEffect to ensure it only runs on the client side
    const mediaQuery = `(max-width: ${breakpoint - 1}px)`;
    const mediaQueryList = window.matchMedia(mediaQuery);

    const handleResize = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
    };

    // Initial check
    handleResize(mediaQueryList);

    // Set up listener for changes
    mediaQueryList.addEventListener("change", handleResize as any); // Type assertion for compatibility

    return () => {
      // Clean up listener
      mediaQueryList.removeEventListener("change", handleResize as any);
    };
  }, [breakpoint]);

  return isMobile;
};

// ---------------------------------------------------
// 💡 Modal Animations
// ---------------------------------------------------

// Mobile-optimized animation (Slide from bottom)
const mobileVariants: Variants = {
  hidden: {
    y: "100%", // Start off-screen at the bottom
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 250,
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
  },
};

// Desktop-optimized animation (Scale/Fade in from center)
const desktopVariants: Variants = {
  hidden: {
    scale: 0.95,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "tween",
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    scale: 0.95,
    opacity: 0,
  },
};

// ---------------------------------------------------
// 💡 Modal Component
// ---------------------------------------------------

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Custom Tailwind classes for the inner modal content container (e.g., max-w, bg-color). */
  contentClassName?: string;
  /** If true, clicking the backdrop closes the modal */
  closeOnBackdropClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  // Adjusted default to be mobile-first: full screen by default on small screens (w-full h-full)
  // and constrained on 'sm' and up (sm:w-auto sm:max-w-2xl sm:h-auto)
  // contentClassName = 'bg-white shadow-2xl rounded-none sm:rounded-xl w-full h-full sm:w-auto sm:max-w-2xl sm:h-auto',
   contentClassName = 'bg-white shadow-2xl rounded-none sm:rounded-xl w-full h-full sm:w-auto sm:max-w-4xl sm:h-auto',
  closeOnBackdropClick = true
}) => {
  // Use the custom hook to determine the view
  const isMobile = useIsMobile();

  // Effect to handle Escape key press and body scrolling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      // Use hidden for body overflow to prevent background scrolling
      document.body.style.overflow = 'hidden';
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset'; // Clean up on unmount
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle backdrop click logic
  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  const selectedVariants = isMobile ? mobileVariants : desktopVariants;
  const transitionConfig = {
    // framer-motion will merge this with the individual variant transitions
    duration: 0.3,
    ease: "easeOut"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          // Outer container (Backdrop)
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-[1000] p-0 sm:p-4 overflow-y-auto"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            // Inner container (Modal Content)
            // Mobile: fixed to bottom, full width/height (h-full w-full)
            // Desktop: centered, constrained size (sm:my-auto sm:w-auto)
            className={`relative mx-auto my-auto ${isMobile ? 'mt-auto' : 'my-auto'} ${contentClassName}`}
            onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent closing when clicking inside

            // Apply selected animation variants
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={selectedVariants}
            transition={transitionConfig}

            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
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

            {/* Modal Body: This will allow internal content to scroll if it exceeds the modal's height */}
            <div className={`p-0 text-gray-700 overflow-y-auto ${isMobile ? 'h-[calc(100vh-69px)]' : ''}`}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
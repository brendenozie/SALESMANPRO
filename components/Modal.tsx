import { setCookie } from "cookies-next";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useEffect, useState, ReactNode } from "react";

// --- Utility Functions ---
const storeSignupPath = (rolePath: string) => {
  setCookie("signup_path", rolePath, { maxAge: 5 * 60 });
};

const handleSignupNavigation = (role: string) => {
  storeSignupPath(role);
  window.location.href = "/register";
};

// --- Custom Hook for Responsive Breakpoint ---
const useIsMobile = (breakpoint: number = 640): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = `(max-width: ${breakpoint - 1}px)`;
    const mediaQueryList = window.matchMedia(mediaQuery);

    const handleResize = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
    };

    handleResize(mediaQueryList);
    mediaQueryList.addEventListener("change", handleResize as any);

    return () => {
      mediaQueryList.removeEventListener("change", handleResize as any);
    };
  }, [breakpoint]);

  return isMobile;
};

// --- Modal Animations ---
const mobileVariants: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", damping: 25, stiffness: 250 },
  },
  exit: { y: "100%", opacity: 0 },
};

const desktopVariants: Variants = {
  hidden: { scale: 0.94, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "tween", duration: 0.25, ease: "easeOut" },
  },
  exit: { scale: 0.97, opacity: 0 },
};

// --- Modal Component ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  contentClassName?: string;
  closeOnBackdropClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  contentClassName = `
    bg-white shadow-xl 
    rounded-none sm:rounded-2xl lg:rounded-3xl 
    w-full h-full sm:w-auto 
    sm:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw]
    max-h-[90vh]
    backdrop-blur-sm 
    overflow-hidden
  `,
  closeOnBackdropClick = true,
}) => {
  const isMobile = useIsMobile();

  // Escape key + body scroll lock
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) onClose();
  };

  const selectedVariants = isMobile ? mobileVariants : desktopVariants;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[1000] p-0 sm:p-4"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`relative mx-auto ${isMobile ? "mt-auto" : "my-auto"} ${contentClassName}`}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={selectedVariants}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* --- Mobile Drag Indicator --- */}
            {isMobile && (
              <div className="w-full flex justify-center pt-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>
            )}

            {/* --- Header --- */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 id="modal-title" className="text-xl font-semibold text-gray-800">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center transition duration-150 rounded-full hover:bg-gray-100"
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

            {/* --- Body --- */}
            <div
              className={`p-0 text-gray-700 overflow-y-auto ${
                isMobile ? "h-[calc(100vh-85px)] pb-safe pt-safe" : ""
              }`}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

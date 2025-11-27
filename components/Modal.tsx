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
  title?: string;
  children: ReactNode;
}

function Modal({ isOpen, onClose, children }: ModalProps) {
  // Disable background scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = ""; // reset
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
         <motion.div
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-6 overflow-y-auto"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
          >
            {/* Inner Container */}
            <div
              className="
                w-full
                sm:w-[90vw]     
                sm:max-w-[750px] 
                flex flex-col
                bg-transparent
                sm:max-h-full
              "
            >
              {children}
            </div>
          </motion.div>

        </>
      )}
    </AnimatePresence>
  );
}


export default Modal;

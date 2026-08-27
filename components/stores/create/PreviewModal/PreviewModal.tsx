import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowTopRightOnSquareIcon,
  LinkIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  name: string;
}

export default function PreviewModal({
  isOpen,
  onClose,
  url,
  name,
}: PreviewModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          // Backdrop
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            // Modal Panel
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} // Prevent closing modal when clicking inside
            className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Modal Header / Browser Bar */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-gray-100 p-3 shadow-md">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                <div className="h-3 w-3 rounded-full bg-green-400"></div>
                <button
                  onClick={onClose}
                  className="ml-2 text-gray-400 hover:text-gray-800"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* URL Bar */}
              <span
                id="modal-title"
                className="max-w-[150px] truncate rounded-full border border-gray-200 bg-white px-4 py-1 text-sm font-medium sm:max-w-md"
              >
                <LinkIcon className="mr-1 inline-block h-4 w-4 text-indigo-600" />
                <span className="text-gray-700">{name} Preview</span>
              </span>

              {/* Open in New Tab Button */}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                aria-label={`Open ${name} link in a new tab`}
              >
                New Tab <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
              </a>
            </div>

            {/* Iframe Content */}
            <iframe
              src={url}
              title={`${name} Live Template Preview`}
              className="h-full w-full flex-1 border-0 bg-white"
              loading="lazy"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
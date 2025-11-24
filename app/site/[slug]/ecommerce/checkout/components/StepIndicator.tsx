import { motion } from "framer-motion";

export default function StepIndicator({
  label,
  active,
  completed,
}: {
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.5 }}
      className="flex items-center gap-3"
    >
      <div
        className={`w-3 h-3 rounded-full transition-all ${
          completed ? "bg-green-500" :
          active ? "bg-blue-600" :
          "bg-gray-300"
        }`}
      />
      <span
        className={`text-sm ${
          active ? "text-blue-600 font-medium" : "text-gray-500"
        }`}
      >
        {label}
      </span>
    </motion.div>
  );
}

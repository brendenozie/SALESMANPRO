import React from 'react';
import clsx from "clsx";
import { motion } from "framer-motion";

const Section = ({ title, children, background = "none", }: { title: string; children: React.ReactNode; background?: "light" | "dark" | "none"; }) => {

  const bgClass = clsx({
    "bg-gray-50": background === "light",
    "bg-gray-900 text-white": background === "dark",
    "": background === "none",
  });

  return (
    <section className={clsx("py-16", bgClass)}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={clsx("text-3xl sm:text-4xl font-bold mb-4",
            background === "dark" ? "text-white" : "text-gray-800"
          )}
        >
          {title}
        </motion.h2>
        {title !== "" && (
          <>
            <div  className={clsx("w-16 h-1 rounded mb-8",  background === "dark" ? "bg-blue-400" : "bg-blue-600")} />
          </>
        )}        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-gray-600 mb-6"
        >
          {children}
        </motion.p>
      </div>
    </section>
  );
}

export default Section;

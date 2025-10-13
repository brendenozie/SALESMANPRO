"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { HomeIcon, InboxIcon } from "@heroicons/react/24/outline";
import { StoreForm } from "@/types/typings";

export default function DefaultSite({ pageData, status = 404, message = "Page Not Found" }: { pageData: StoreForm; status?: number; message?: string }) {
  const router = useRouter();
  const defaultMessages: Record<number, string> = {
    404: "Oops! We can't find that page.",
    500: "Something went wrong on our end.",
  };
  const displayMessage = message || defaultMessages[status] || defaultMessages[404];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-500 overflow-hidden">
      {/* Decorative Animated Blobs */}
      <motion.div
        className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-purple-400 rounded-full filter blur-3xl opacity-40"
        animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-400 rounded-full filter blur-2xl opacity-30"
        animate={{ y: [0, -20, 0], x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <motion.div
        className="relative z-10 bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 mb-4"
          initial={{ y: -30 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {status}
        </motion.h1>
        <motion.p
          className="text-xl text-gray-800 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {displayMessage}
        </motion.p>

        <div className="flex justify-center gap-6">
          <motion.button
            className="flex items-center gap-2 bg-white border-2 border-indigo-600 hover:border-indigo-700 text-indigo-600 hover:text-indigo-700 py-2 px-6 rounded-full font-semibold transition"
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push("/")}
          >
            <HomeIcon className="w-5 h-5"/> Go Home
          </motion.button>
          <motion.a
            href="mailto:admin@domain.com"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-full font-semibold shadow-lg transition"
            whileHover={{ scale: 1.05 }}
          >
            <InboxIcon className="w-5 h-5"/> Contact Admin
          </motion.a>
        </div>

        {status === 500 && (
          <motion.div
            className="mt-6 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p>Please try again later or email admin@domain.com for support.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

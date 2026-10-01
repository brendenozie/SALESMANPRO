"use client";

/**
 * components/ai/mascot/MascotAvatar.tsx
 *
 * Lightweight, animated, state-aware character avatar for the SalesmanPro AI Mascot.
 * Renders SVG micro-animations with minimal CPU/GPU overhead.
 * Expresses states: Idle, Listening, Thinking, Processing, Success, Needs Approval, Warning, Error, Speaking.
 */

import React from "react";
import { motion } from "framer-motion";
import { MascotState } from "@/lib/ai/mascot/types";

interface MascotAvatarProps {
  state: MascotState;
  size?: "sm" | "md" | "lg";
  character?: "alex" | "byte" | "nova";
  className?: string;
  onClick?: () => void;
}

export const MascotAvatar: React.FC<MascotAvatarProps> = ({
  state = "idle",
  size = "md",
  character = "alex",
  className = "",
  onClick,
}) => {
  const pixelSize = size === "sm" ? 44 : size === "lg" ? 80 : 58;

  // Color schemes based on character or state
  const isListening = state === "listening";
  const isThinking = state === "thinking";
  const isProcessing = state === "processing";
  const isSuccess = state === "success";
  const isApproval = state === "needs_approval";
  const isSpeaking = state === "speaking";
  const isError = state === "error" || state === "warning";

  // Visor / Accent Color based on state
  const visorColor = isError
    ? "#EF4444" // Red
    : isApproval
    ? "#F59E0B" // Amber
    : isSuccess
    ? "#10B981" // Emerald
    : isListening
    ? "#8B5CF6" // Violet
    : isThinking || isProcessing
    ? "#06B6D4" // Cyan
    : "#3B82F6"; // Electric Blue

  return (
    <div
      onClick={onClick}
      className={`relative select-none flex items-center justify-center cursor-pointer ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* Listening Pulse Rings */}
      {isListening && (
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full border-2 border-purple-400/80 pointer-events-none"
        />
      )}

      {/* Thinking Orbiting Particle */}
      {(isThinking || isProcessing) && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/60 pointer-events-none"
        >
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] -top-1 left-1/2 -translate-x-1/2 absolute" />
        </motion.div>
      )}

      {/* Floating Bobbing Motion */}
      <motion.div
        animate={
          state === "idle" || isSpeaking
            ? { y: [0, -4, 0] }
            : isProcessing
            ? { y: [0, -2, 0], scale: [1, 1.03, 1] }
            : {}
        }
        transition={{
          duration: isSpeaking ? 0.6 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-full h-full flex items-center justify-center"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]"
        >
          {/* Outer Ambient Glow Gradient */}
          <defs>
            <radialGradient id="mascotGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={visorColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={visorColor} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E1E38" />
            </linearGradient>
          </defs>

          {/* Glow backdrop */}
          <circle cx="50" cy="50" r="48" fill="url(#mascotGlow)" />

          {/* Character Head/Body: Sleek Curvature Shell */}
          <rect
            x="14"
            y="14"
            width="72"
            height="72"
            rx="24"
            fill="url(#bodyGrad)"
            stroke="#334155"
            strokeWidth="2.5"
          />

          {/* Decorative Corner Metallic Accents */}
          <circle cx="24" cy="24" r="2.5" fill="#64748B" />
          <circle cx="76" cy="24" r="2.5" fill="#64748B" />
          <circle cx="24" cy="76" r="2.5" fill="#64748B" />
          <circle cx="76" cy="76" r="2.5" fill="#64748B" />

          {/* Inner Visor Display Screen */}
          <rect
            x="22"
            y="26"
            width="56"
            height="46"
            rx="16"
            fill="url(#visorGrad)"
            stroke={visorColor}
            strokeWidth="1.8"
          />

          {/* Expressive Digital Eyes */}
          {isSuccess ? (
            // Happy inverted arcs for eyes
            <g stroke={visorColor} strokeWidth="3.5" strokeLinecap="round" fill="none">
              <path d="M 33 48 Q 40 40 47 48" />
              <path d="M 53 48 Q 60 40 67 48" />
            </g>
          ) : isApproval ? (
            // Alert eyes
            <g fill={visorColor}>
              <rect x="34" y="44" width="11" height="11" rx="4" />
              <rect x="55" y="44" width="11" height="11" rx="4" />
            </g>
          ) : isListening ? (
            // Soundwave listening lines
            <g stroke={visorColor} strokeWidth="3" strokeLinecap="round">
              <line x1="34" y1="44" x2="34" y2="54" />
              <line x1="42" y1="40" x2="42" y2="58" />
              <line x1="50" y1="36" x2="50" y2="62" />
              <line x1="58" y1="40" x2="58" y2="58" />
              <line x1="66" y1="44" x2="66" y2="54" />
            </g>
          ) : isThinking ? (
            // Concentrating dot matrices
            <g fill={visorColor}>
              <motion.circle
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                cx="38"
                cy="49"
                r="4.5"
              />
              <motion.circle
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
                cx="50"
                cy="49"
                r="4.5"
              />
              <motion.circle
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
                cx="62"
                cy="49"
                r="4.5"
              />
            </g>
          ) : (
            // Default Smart / Friendly Tech Eyes
            <g fill={visorColor}>
              {/* Left Eye */}
              <rect x="34" y="44" width="11" height="10" rx="3.5" />
              {/* Right Eye */}
              <rect x="55" y="44" width="11" height="10" rx="3.5" />
              {/* Eye Catchlight reflections */}
              <circle cx="37" cy="46" r="1.5" fill="#FFFFFF" />
              <circle cx="58" cy="46" r="1.5" fill="#FFFFFF" />
            </g>
          )}

          {/* Gentle Smile / Mouth in Idle or Speaking */}
          {isSpeaking ? (
            <motion.rect
              animate={{ height: [3, 8, 3], y: [62, 59, 62] }}
              transition={{ duration: 0.3, repeat: Infinity }}
              x="44"
              y="60"
              width="12"
              height="4"
              rx="2"
              fill={visorColor}
            />
          ) : !isListening && !isThinking ? (
            <path
              d="M 43 62 Q 50 66 57 62"
              stroke={visorColor}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
          ) : null}

          {/* Status Badge Pin (Top Right Corner) */}
          {isApproval && (
            <g transform="translate(68, 8)">
              <circle cx="10" cy="10" r="10" fill="#F59E0B" />
              <text
                x="10"
                y="14"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="bold"
              >
                !
              </text>
            </g>
          )}
          {isSuccess && (
            <g transform="translate(68, 8)">
              <circle cx="10" cy="10" r="10" fill="#10B981" />
              <path
                d="M 6 10 L 9 13 L 14 7"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
};

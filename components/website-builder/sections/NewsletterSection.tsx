"use client";

import React, { useState } from "react";
import { ThemeTokens, SectionStyle } from "@/types/website-builder";
import toast from "react-hot-toast";

interface NewsletterProps {
  content: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    incentiveBadge?: string;
  };
  styles?: SectionStyle;
  theme: ThemeTokens;
}

export default function NewsletterSection({
  content,
  styles = {},
  theme,
}: NewsletterProps) {
  const {
    title = "Unlock 10% Off Your First Order",
    subtitle = "Sign up for exclusive drops, restock alerts and private promotional codes.",
    buttonText = "Join VIP Club",
    incentiveBadge,
  } = content;

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    toast.success("Welcome! Check your email for your welcome discount code.");
  };

  return (
    <section
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-200/80 dark:border-zinc-800/80 transition-colors"
      style={{
        backgroundColor: styles.backgroundColor || "#F8FAFC",
        color: styles.textColor || undefined,
      }}
    >
      <div className="max-w-3xl mx-auto text-center space-y-4">
        {incentiveBadge && (
          <span
            className="inline-block text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-full"
            style={{
              backgroundColor: `${theme.primaryColor}1A`,
              color: theme.primaryColor,
            }}
          >
            {incentiveBadge}
          </span>
        )}

        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h2>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        {subscribed ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
            ✓ You're on the VIP list! Use code WELCOME10 at checkout.
          </div>
        ) : (
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-5 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 shadow-xs"
            />
            <button
              type="submit"
              className="w-full sm:w-auto shrink-0 px-6 py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 active:scale-98"
              style={{
                backgroundColor: theme.primaryColor,
                borderRadius: theme.buttonRadius === "full" ? "9999px" : "12px",
              }}
            >
              {buttonText}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

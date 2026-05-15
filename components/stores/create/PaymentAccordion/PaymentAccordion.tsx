"use client";

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
  CommandLineIcon,
  ArrowPathIcon,
  CreditCardIcon,
  WalletIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  SparklesIcon,
  ArrowUturnLeftIcon,
  CircleStackIcon,
  ShieldExclamationIcon
} from "@heroicons/react/24/outline";

/* ============================
   Types & Configuration
   ============================ */

export type PaymentSettings = {
  id?: string | null;
  companyId?: string | null;

  // Toggles
  isStripeEnabled?: boolean | null;
  isPaypalEnabled?: boolean | null;
  isMpesaEnabled?: boolean | null;
  isPaystackEnabled?: boolean | null;
  isGhubaEnabled?: boolean | null;

  // Stripe
  stripePublishableKey?: string | null;
  stripeSecretKey?: string | null;

  // PayPal
  paypalClientId?: string | null;
  paypalClientSecret?: string | null;

  // M-Pesa
  mpesaShortcode?: string | null;
  mpesaConsumerKey?: string | null;
  mpesaConsumerSecret?: string | null;
  mpesaCallbackUrl?: string | null;
  mpesaPasskey?: string | null;

  // Paystack
  paystackPublicKey?: string | null;
  paystackSecretKey?: string | null;

  // Ghuba
  ghubaMerchantId?: string | null;
  ghubaApiKey?: string | null;

  [key: string]: any;
};

export interface PaymentAccordionProps {
  paymentSettings: PaymentSettings | null;
  onChange: (updated: PaymentSettings) => void;
  onSave?: (payload: PaymentSettings) => Promise<void> | void;
}

type FieldConfig = {
  key: keyof PaymentSettings;
  label: string;
  placeholder?: string;
  type?: "text" | "password" | "url" | "number";
  requiredWhenEnabled?: boolean;
  secret?: boolean;
  hint?: string;
};

type GatewayConfig = {
  id: string;
  toggleKey: keyof PaymentSettings;
  label: string;
  hint: string;
  feeDescription?: string | null;
  brandColor: string; // Tailwind tint/border accent styles
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldConfig[];
  testEndpoint?: string;
  extraEndpoint?: string;
};

const GATEWAYS: Record<string, GatewayConfig> = {
  ghuba: {
    id: "ghuba",
    toggleKey: "isGhubaEnabled",
    label: "Ghuba Checkout",
    hint: "Local high-performance gateway — 10% structural base fee",
    feeDescription: "Transaction fee will be integrated dynamically into client pricing windows.",
    brandColor: "border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500",
    icon: SparklesIcon,
    fields: [
      { key: "ghubaMerchantId", label: "Merchant ID", placeholder: "GHB12345", requiredWhenEnabled: true },
      { key: "ghubaApiKey", label: "API Secret Key", secret: true, requiredWhenEnabled: true },
    ],
    testEndpoint: "/api/payments/ghuba/test",
  },
  stripe: {
    id: "stripe",
    toggleKey: "isStripeEnabled",
    label: "Stripe Global",
    hint: "Accept credit cards, wallets, and localized multi-currency payments globally",
    brandColor: "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500",
    icon: CreditCardIcon,
    fields: [
      { key: "stripePublishableKey", label: "Publishable Key", placeholder: "pk_live_...", requiredWhenEnabled: true },
      { key: "stripeSecretKey", label: "Secret Key", placeholder: "sk_live_...", secret: true, requiredWhenEnabled: false },
    ],
    testEndpoint: "/api/payments/stripe/test",
  },
  paypal: {
    id: "paypal",
    toggleKey: "isPaypalEnabled",
    label: "PayPal Commerce",
    hint: "Process secure digital wallet transactions and standard PayPal checkouts",
    brandColor: "border-sky-600/30 text-sky-600 dark:text-sky-400 bg-sky-600",
    icon: WalletIcon,
    fields: [
      { key: "paypalClientId", label: "Client ID", placeholder: "Client identification string", requiredWhenEnabled: true },
      { key: "paypalClientSecret", label: "Client Secret", secret: true, requiredWhenEnabled: false },
    ],
    testEndpoint: "/api/payments/paypal/test",
  },
  mpesa: {
    id: "mpesa",
    toggleKey: "isMpesaEnabled",
    label: "M-Pesa Express (Daraja)",
    hint: "Direct carrier billing integrations via Safaricom STK Push and C2B automated ledger sync",
    brandColor: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500",
    icon: DevicePhoneMobileIcon,
    fields: [
      { key: "mpesaShortcode", label: "Shortcode / Paybill", placeholder: "174379", requiredWhenEnabled: true },
      { key: "mpesaConsumerKey", label: "Consumer Key", placeholder: "Daraja app consumer client identity", requiredWhenEnabled: true },
      { key: "mpesaConsumerSecret", label: "Consumer Secret", secret: true, requiredWhenEnabled: true },
      { key: "mpesaCallbackUrl", label: "Validation Callback URL", type: "url", placeholder: "https://yourdomain.com/api/webhooks/mpesa", requiredWhenEnabled: true },
      { key: "mpesaPasskey", label: "Lipa Na M-Pesa Passkey", secret: true, requiredWhenEnabled: true },
    ],
    testEndpoint: "/api/payments/mpesa/test",
    extraEndpoint: "/api/payments/mpesa/stkpush",
  },
  paystack: {
    id: "paystack",
    toggleKey: "isPaystackEnabled",
    label: "Paystack Africa",
    hint: "Accelerated pan-African modern core billing ecosystem for cards, bank transfers, and mobile money",
    brandColor: "border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-500",
    icon: GlobeAltIcon,
    fields: [
      { key: "paystackPublicKey", label: "Public Key", placeholder: "pk_live_...", requiredWhenEnabled: true },
      { key: "paystackSecretKey", label: "Secret Key", placeholder: "sk_live_...", secret: true, requiredWhenEnabled: true },
    ],
    testEndpoint: "/api/payments/paystack/test",
  },
};

/* ============================
   Core Logical Hooks & Reducers
   ============================ */

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v ?? {}));

function useDebouncedEffect(cb: () => void, deps: any[], delay = 350) {
  const t = useRef<number | undefined>();
  useEffect(() => {
    window.clearTimeout(t.current);
    t.current = window.setTimeout(cb, delay) as unknown as number;
    return () => window.clearTimeout(t.current);
  }, deps);
}

const generateGhubaCredentials = () => {
  const rand = () => Math.random().toString(36).substring(2, 8).toUpperCase();
  return {
    merchantId: `GHB-${Math.floor(100000 + Math.random() * 900000)}`,
    apiKey: `gk_live_${rand()}${rand()}`,
  };
};

function buildZodSchemaForAll() {
  const shape: Record<string, any> = {};
  Object.values(GATEWAYS).forEach((g) => {
    shape[String(g.toggleKey)] = z.boolean().nullable().optional();
    g.fields.forEach((f) => {
      shape[String(f.key)] = z.union([z.string(), z.null(), z.undefined()]).optional();
    });
  });

  return z.object(shape).passthrough().superRefine((obj, ctx) => {
    Object.values(GATEWAYS).forEach((g) => {
      const enabled = !!obj[String(g.toggleKey)];
      g.fields.forEach((f) => {
        const val = obj[String(f.key)];
        if (enabled && f.requiredWhenEnabled) {
          if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${f.label} is explicitly required for initialization.`,
              path: [String(f.key)],
            });
          }
        }
      });
    });
  });
}

type Action =
  | { type: "SET"; key: keyof PaymentSettings; value: any }
  | { type: "REPLACE"; payload: PaymentSettings };

function reducer(state: PaymentSettings, action: Action): PaymentSettings {
  switch (action.type) {
    case "SET":
      return { ...state, [action.key]: action.value };
    case "REPLACE":
      return clone(action.payload);
    default:
      return state;
  }
}

/* ============================
   Micro-UI Atoms & Inputs
   ============================ */

const ModernToggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}> = React.memo(({ checked, onChange, disabled }) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={clsx(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed",
        checked ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
      )}
    >
      <span
        className={clsx(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
});

const ClipboardActionButton: React.FC<{ targetText: string }> = ({ targetText }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(targetText ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy operation failure", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition"
      title="Copy parameter to clipboard"
    >
      {copied ? <CheckIcon className="h-3.5 w-3.5 text-green-500" /> : <DocumentDuplicateIcon className="h-3.5 w-3.5" />}
    </button>
  );
};

interface InputAtomProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  type?: "text" | "password" | "url" | "number";
  onChange: (v: string) => void;
  error?: string;
  secret?: boolean;
}

const InputAtom: React.FC<InputAtomProps> = React.memo(({ id, label, value, placeholder, type = "text", onChange, error, secret }) => {
  const [reveal, setReveal] = useState(false);

  return (
    <div className="flex flex-col space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative rounded-xl shadow-sm">
        <input
          id={id}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          type={secret && !reveal ? "password" : type === "password" ? "text" : type}
          className={clsx(
            "w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent font-medium",
            error ? "border-red-400 dark:border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-800"
          )}
        />
        {secret && (
          <div className="absolute inset-y-0 right-3 flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setReveal(!reveal)}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              {reveal ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
            <ClipboardActionButton targetText={value} />
          </div>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs font-medium text-red-500 flex items-center gap-1 mt-0.5"
          >
            <ExclamationCircleIcon className="h-3.5 w-3.5" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ============================
   Interactive Testing Hooks
   ============================ */

function useTestConnection() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{ label: string; success: boolean; msg: string } | null>(null);

  const executeTest = useCallback(async (label: string, url: string | undefined, payload: any) => {
    if (!url) {
      setResult({ label, success: false, msg: "Endpoint runtime configuration unallocated." });
      return;
    }
    try {
      setLoading(label);
      setResult(null);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      setResult({
        label,
        success: res.ok,
        msg: res.ok ? "Handshake complete. Gateway operational." : data?.message || "Gateway authentication rejected.",
      });
    } catch (err: any) {
      setResult({ label, success: false, msg: err?.message || "Network layer processing fault." });
    } finally {
      setLoading(null);
    }
  }, []);

  return { loading, result, executeTest, clearResult: () => setResult(null) };
}

/* ============================
   Main Container Layout Component
   ============================ */

export default function PaymentAccordion({ paymentSettings, onChange, onSave }: PaymentAccordionProps) {
  const initial = useMemo<PaymentSettings>(() => {
    const s = { ...(paymentSettings ?? {}) };
    const otherKeys = ["isStripeEnabled", "isPaypalEnabled", "isMpesaEnabled", "isPaystackEnabled"];
    const hasActiveGtw = otherKeys.some((k) => !!s[k]);

    if (!hasActiveGtw && !s.isGhubaEnabled) {
      s.isGhubaEnabled = true;
      const defaults = generateGhubaCredentials();
      if (!s.ghubaMerchantId) s.ghubaMerchantId = defaults.merchantId;
      if (!s.ghubaApiKey) s.ghubaApiKey = defaults.apiKey;
    }
    return s;
  }, [paymentSettings]);

  const [state, dispatch] = useReducer(reducer, clone(initial));
  const [activeAccordion, setActiveAccordion] = useState<string | null>("ghuba");

  const schema = useMemo(() => buildZodSchemaForAll(), []);
  const errors = useMemo(() => {
    const parsed = schema.safeParse(state);
    if (parsed.success) return {};
    const errMap: Record<string, string> = {};
    parsed.error.errors.forEach((e) => {
      if (e.path.length) errMap[String(e.path[0])] = e.message;
    });
    return errMap;
  }, [state, schema]);

  const isFirstSync = useRef(true);
  useEffect(() => {
    if (isFirstSync.current) {
      dispatch({ type: "REPLACE", payload: clone(initial) });
      isFirstSync.current = false;
    }
  }, [initial]);

  useDebouncedEffect(() => {
    onChange(clone(state));
  }, [state], 500);

  const setField = useCallback((key: keyof PaymentSettings, value: any) => {
    dispatch({ type: "SET", key, value });
  }, []);

  const isDirty = useMemo(() => JSON.stringify(initial) !== JSON.stringify(state), [initial, state]);

  const handleSaveAction = useCallback(async () => {
    if (Object.keys(errors).length) {
      const targetField = Object.keys(errors)[0];
      const targetGateway = Object.values(GATEWAYS).find((g) =>
        g.fields.some((f) => String(f.key) === targetField)
      );
      if (targetGateway) setActiveAccordion(targetGateway.id);
      
      setTimeout(() => {
        const el = document.getElementById(targetField);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.focus();
      }, 150);
      return;
    }
    if (onSave) await onSave(clone(state));
  }, [errors, onSave, state]);

  const { loading: testLoading, result: testResult, executeTest } = useTestConnection();

  // Local Mpesa Sandbox Automation Variables
  const [mpesaConsolePhone, setMpesaConsolePhone] = useState("");
  const [mpesaConsoleAmount, setMpesaConsoleAmount] = useState("");
  const [stkPushLoading, setStkPushLoading] = useState(false);

  const triggerStkPushSimulation = async () => {
    if (!mpesaConsolePhone || !mpesaConsoleAmount) {
      alert("Please designate a specific payload amount and functional user target number.");
      return;
    }
    try {
      setStkPushLoading(true);
      const targetUrl = GATEWAYS.mpesa.extraEndpoint || "/api/payments/mpesa/stkpush";
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: mpesaConsolePhone,
          amount: Number(mpesaConsoleAmount),
          mpesaConsumerKey: state.mpesaConsumerKey,
          mpesaConsumerSecret: state.mpesaConsumerSecret,
          mpesaShortcode: state.mpesaShortcode,
          mpesaPasskey: state.mpesaPasskey,
          mpesaCallbackUrl: state.mpesaCallbackUrl,
          sandbox: true,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        alert("STK Push Network Signal dispatched successfully downstream.");
      } else {
        alert(`Simulation Refused: ${data?.error || "Invalid dynamic parameter state."}`);
      }
    } catch (e: any) {
      alert(`Network execution fault: ${e?.message}`);
    } finally {
      setStkPushLoading(false);
    }
  };

  const getGatewayErrorVolume = (g: GatewayConfig) =>
    g.fields.filter((f) => !!errors[String(f.key)]).length;

  const runGatewayDiagnostic = async (g: GatewayConfig) => {
    const fieldsErrCount = getGatewayErrorVolume(g);
    if (fieldsErrCount > 0) {
      alert("Cannot execute testing sequence. Resolve inline constraints first.");
      return;
    }
    const payload: Record<string, any> = {};
    g.fields.forEach((f) => { payload[String(f.key)] = state[String(f.key)]; });
    payload[String(g.toggleKey)] = !!state[String(g.toggleKey)];
    await executeTest(g.label, g.testEndpoint, payload);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 rounded-3xl space-y-8 shadow-xl transition-colors">
      
      {/* Control Module Header Banner */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Gateway Integration Panel
            </h2>
            {/* <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              <span>PCI-DSS Managed</span>
            </div> */}
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-xl">
            Configure transaction processors, map authorization vaults, and run terminal handshakes. 
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => dispatch({ type: "REPLACE", payload: clone(initial) })}
            disabled={!isDirty}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-40"
          >
            <ArrowUturnLeftIcon className="h-4 w-4" />
            Reset
          </button>
          {/* <button
            type="button"
            onClick={handleSaveAction}
            disabled={!isDirty}
            className={clsx(
              "px-5 py-2 text-sm font-bold rounded-xl text-white transition shadow-sm",
              isDirty 
                ? "bg-indigo-600 hover:bg-indigo-700 active:scale-98 cursor-pointer" 
                : "bg-gray-300 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
            )}
          >
            Commit Adjustments
          </button> */}
        </div>
      </header>

      {/* Main Structural Gateway Accordion Cluster */}
      <div className="space-y-4">
        {Object.values(GATEWAYS).map((g) => {
          const isEnabled = !!state[String(g.toggleKey)];
          const isOpen = activeAccordion === g.id;
          const errorCount = getGatewayErrorVolume(g);
          const GatewayIcon = g.icon;

          return (
            <div
              key={g.id}
              className={clsx(
                "border rounded-2xl overflow-hidden transition-all duration-300 bg-white dark:bg-gray-900 shadow-sm",
                isOpen 
                  ? "border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-md" 
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
              )}
            >
              {/* Accordion Trigger Header */}
              <div
                onClick={() => setActiveAccordion(isOpen ? null : g.id)}
                className="flex items-center justify-between p-5 cursor-pointer select-none"
              >
                <div className="flex items-center space-x-4">
                  <div className={clsx("p-2.5 rounded-xl border", isOpen ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/40" : "bg-gray-50 dark:bg-gray-800/60 border-gray-100 dark:border-gray-800")}>
                    <GatewayIcon className={clsx("h-6 w-6", isOpen ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400")} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {g.label}
                    </h3>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 max-w-md hidden sm:block">
                      {g.hint}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <AnimatePresence>
                    {errorCount > 0 && (
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="px-2.5 py-0.5 text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-full"
                      >
                        {errorCount} Conflict{errorCount > 1 ? "s" : ""}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  <div className={clsx(
                    "px-2.5 py-1 text-xs font-bold rounded-full border transition",
                    isEnabled 
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/30" 
                      : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                  )}>
                    {isEnabled ? "Online" : "Offline"}
                  </div>

                  <div className="h-px w-px sm:w-6 bg-gray-200 dark:bg-gray-800 hidden sm:block" />

                  <ModernToggle
                    checked={isEnabled}
                    onChange={(v) => setField(g.toggleKey, v)}
                  />

                  <ChevronDownIcon
                    className={clsx(
                      "h-5 w-5 text-gray-400 transition-transform duration-300",
                      isOpen && "rotate-180 text-gray-600 dark:text-gray-200"
                    )}
                  />
                </div>
              </div>

              {/* Accordion Body Viewport */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="p-6 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800 space-y-6">
                      {isEnabled ? (
                        <>
                          {/* Parameter Input Matrix */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {g.fields.map((f) => (
                              <InputAtom
                                key={String(f.key)}
                                id={String(f.key)}
                                label={f.label}
                                value={String(state[String(f.key)] ?? "")}
                                placeholder={f.placeholder}
                                type={f.type}
                                secret={f.secret}
                                onChange={(v) => setField(f.key, v)}
                                error={errors[String(f.key)]}
                              />
                            ))}
                          </div>

                          {/* Action Bar Diagnostics & Controls */}
                          <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center space-x-3">
                              <button
                                type="button"
                                onClick={() => runGatewayDiagnostic(g)}
                                disabled={!!testLoading}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 transition disabled:opacity-50"
                              >
                                {testLoading === g.label ? (
                                  <ArrowPathIcon className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                                ) : (
                                  <CommandLineIcon className="h-3.5 w-3.5" />
                                )}
                                <span>Validate Infrastructure</span>
                              </button>

                              {g.feeDescription && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                  {g.feeDescription}
                                </span>
                              )}
                            </div>

                            {/* Testing Evaluation Result Badges */}
                            <div>
                              {testResult && testResult.label === g.label && (
                                <div className={clsx(
                                  "text-xs px-3 py-1.5 rounded-xl font-semibold border flex items-center gap-1.5",
                                  testResult.success 
                                    ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30" 
                                    : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
                                )}>
                                  <CircleStackIcon className="h-4 w-4" />
                                  <span>{testResult.msg}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Contextual Sub-Terminal Console: M-Pesa Stk Push Mock Environment */}
                          {g.id === "mpesa" && (
                            <div className="mt-6 p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                  STK Push Network Sandbox Emulator
                                </h4>
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                                  Local Simulation Mode
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Target MSISDN / Phone Number</label>
                                  <input
                                    type="tel"
                                    value={mpesaConsolePhone}
                                    onChange={(e) => setMpesaConsolePhone(e.target.value)}
                                    placeholder="254712345678"
                                    className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Transaction Value (KES)</label>
                                  <input
                                    type="number"
                                    value={mpesaConsoleAmount}
                                    onChange={(e) => setMpesaConsoleAmount(e.target.value)}
                                    placeholder="e.g. 1500"
                                    className="w-full text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={triggerStkPushSimulation}
                                disabled={stkPushLoading}
                                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition disabled:opacity-40 shadow-sm"
                              >
                                {stkPushLoading ? "Transmitting Signal Package..." : "Execute Downstream Push Direct"}
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-6 text-sm font-medium text-gray-400 dark:text-gray-500">
                          Toggle gateway node status to online to expose internal configuration credentials.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Global Interface Sticky Footer Status Tracker */}
      <footer className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <span>
            <ShieldExclamationIcon className="h-3.5 w-3.5 text-yellow-500" />
           Uncommitted changes exist in buffer
          </span>
          {Object.keys(errors).length ? (
            <span className="text-red-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Validation exceptions blocks commit
            </span>
          ) : (
            <span className="text-green-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              All parameters sound & normalized
            </span>
          )}
        </div>
        
        <div className="text-gray-400 dark:text-gray-600 font-medium">
          State: {isDirty ? "Modified Buffer Pending" : "Synchronized with Core Datastore"}
        </div>
      </footer>

    </div>
  );
}
// "use client";

// import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
// import { z } from "zod";

// /**
//  * Schema-driven Payment Settings Accordion (Option C)
//  *
//  * Modified: Ghuba is selected by default with auto-generated credentials
//  * ONLY IF no other payment methods are currently enabled.
//  */

// /* ============================
//    Types
//    ============================ */

// export type PaymentSettings = {
//   id?: string | null;
//   companyId?: string | null;

//   // Toggles
//   isStripeEnabled?: boolean | null;
//   isPaypalEnabled?: boolean | null;
//   isMpesaEnabled?: boolean | null;
//   isPaystackEnabled?: boolean | null;
//   isGhubaEnabled?: boolean | null;

//   // Stripe
//   stripePublishableKey?: string | null;
//   stripeSecretKey?: string | null;

//   // PayPal
//   paypalClientId?: string | null;
//   paypalClientSecret?: string | null;

//   // M-Pesa
//   mpesaShortcode?: string | null;
//   mpesaConsumerKey?: string | null;
//   mpesaConsumerSecret?: string | null;
//   mpesaCallbackUrl?: string | null;
//   mpesaPasskey?: string | null;

//   // Paystack
//   paystackPublicKey?: string | null;
//   paystackSecretKey?: string | null;

//   // Ghuba (example)
//   ghubaMerchantId?: string | null;
//   ghubaApiKey?: string | null;

//   // Allow extension (index signature)
//   [key: string]: any;
// };

// export interface PaymentAccordionProps {
//   paymentSettings: PaymentSettings | null;
//   onChange: (updated: PaymentSettings) => void;
//   onSave?: (payload: PaymentSettings) => Promise<void> | void;
// }

// /* ============================
//    Utilities
//    ============================ */

// const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v ?? {}));

// function useDebouncedEffect(cb: () => void, deps: any[], delay = 350) {
//   const t = useRef<number | undefined>();
//   useEffect(() => {
//     window.clearTimeout(t.current);
//     t.current = window.setTimeout(cb, delay) as unknown as number;
//     return () => window.clearTimeout(t.current);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, deps);
// }

// // Helper to generate random credentials
// const generateGhubaCredentials = () => {
//   const rand = () => Math.random().toString(36).substring(2, 8).toUpperCase();
//   return {
//     merchantId: `GHB-${Math.floor(100000 + Math.random() * 900000)}`,
//     apiKey: `gk_live_${rand()}${rand()}`,
//   };
// };

// /* ============================
//    Zod validation schema + helpers
//    ============================ */

// type FieldConfig = {
//   key: keyof PaymentSettings;
//   label: string;
//   placeholder?: string;
//   type?: "text" | "password" | "url" | "number";
//   requiredWhenEnabled?: boolean;
//   secret?: boolean;
//   hint?: string;
// };

// type GatewayConfig = {
//   id: string;
//   toggleKey: keyof PaymentSettings;
//   label: string;
//   hint?: string;
//   feeDescription?: string | null;
//   fields: FieldConfig[];
//   testEndpoint?: string;
//   extraEndpoint?: string;
//   example?: Partial<PaymentSettings>;
// };

// const GATEWAYS: Record<string, GatewayConfig> = {
//   ghuba: {
//     id: "ghuba",
//     toggleKey: "isGhubaEnabled",
//     label: "Ghuba",
//     hint: "Local gateway — 10% fee applies",
//     feeDescription: "Transaction fee will be shown in UI pricing.",
//     fields: [
//       { key: "ghubaMerchantId", label: "Merchant ID", placeholder: "GHB12345", requiredWhenEnabled: true },
//       { key: "ghubaApiKey", label: "API Key", secret: true, requiredWhenEnabled: true },
//     ],
//     testEndpoint: "/api/payments/ghuba/test",
//   },
//   stripe: {
//     id: "stripe",
//     toggleKey: "isStripeEnabled",
//     label: "Stripe",
//     hint: "Card processing and wallets",
//     fields: [
//       { key: "stripePublishableKey", label: "Publishable Key", placeholder: "pk_live_...", requiredWhenEnabled: true },
//       { key: "stripeSecretKey", label: "Secret Key (server)", secret: true, requiredWhenEnabled: false },
//     ],
//     testEndpoint: "/api/payments/stripe/test",
//   },
//   paypal: {
//     id: "paypal",
//     toggleKey: "isPaypalEnabled",
//     label: "PayPal",
//     hint: "PayPal REST integration",
//     fields: [
//       { key: "paypalClientId", label: "Client ID", requiredWhenEnabled: true },
//       { key: "paypalClientSecret", label: "Client Secret", secret: true, requiredWhenEnabled: false },
//     ],
//     testEndpoint: "/api/payments/paypal/test",
//   },
//   mpesa: {
//     id: "mpesa",
//     toggleKey: "isMpesaEnabled",
//     label: "M-Pesa (Daraja)",
//     hint: "Daraja API for STK Push / C2B",
//     fields: [
//       { key: "mpesaShortcode", label: "Shortcode / Paybill", requiredWhenEnabled: true },
//       { key: "mpesaConsumerKey", label: "Consumer Key", requiredWhenEnabled: true },
//       { key: "mpesaConsumerSecret", label: "Consumer Secret", secret: true, requiredWhenEnabled: true },
//       { key: "mpesaCallbackUrl", label: "Callback URL", type: "url", requiredWhenEnabled: true },
//       { key: "mpesaPasskey", label: "Lipa na M-Pesa Passkey", secret: true, requiredWhenEnabled: true },
//     ],
//     testEndpoint: "/api/payments/mpesa/test",
//     extraEndpoint: "/api/payments/mpesa/stkpush",
//   },
//   paystack: {
//     id: "paystack",
//     toggleKey: "isPaystackEnabled",
//     label: "Paystack",
//     hint: "African payments (cards, bank)",
//     fields: [
//       { key: "paystackPublicKey", label: "Public Key", requiredWhenEnabled: true },
//       { key: "paystackSecretKey", label: "Secret Key", secret: true, requiredWhenEnabled: true },
//     ],
//     testEndpoint: "/api/payments/paystack/test",
//   },
// };

// function buildZodSchemaForAll(settings: PaymentSettings) {
//   const shape: Record<string, any> = {};

//   Object.values(GATEWAYS).forEach((g) => {
//     shape[String(g.toggleKey)] = z.boolean().nullable().optional();
//     g.fields.forEach((f) => {
//       shape[String(f.key)] = z.union([z.string(), z.null(), z.undefined()]).optional();
//     });
//   });

//   const base = z.object(shape).passthrough();

//   const refined = base.superRefine((obj, ctx) => {
//     Object.values(GATEWAYS).forEach((g) => {
//       const enabled = !!obj[String(g.toggleKey)];
//       g.fields.forEach((f) => {
//         const val = obj[String(f.key)];
//         if (enabled && f.requiredWhenEnabled) {
//           if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
//             ctx.addIssue({
//               code: z.ZodIssueCode.custom,
//               message: `${f.label} is required when ${g.label} is enabled`,
//               path: [String(f.key)],
//             });
//           }
//         }
//       });
//     });
//   });

//   return refined;
// }

// /* ============================
//    Local reducer & actions
//    ============================ */

// type Action =
//   | { type: "SET"; key: keyof PaymentSettings; value: any }
//   | { type: "REPLACE"; payload: PaymentSettings };

// function reducer(state: PaymentSettings, action: Action): PaymentSettings {
//   switch (action.type) {
//     case "SET":
//       return { ...state, [action.key]: action.value };
//     case "REPLACE":
//       return clone(action.payload);
//     default:
//       return state;
//   }
// }

// /* ============================
//    UI Subcomponents
//    ============================ */

// const Toggle: React.FC<{
//   id: string;
//   label: string;
//   description?: string;
//   checked: boolean;
//   onChange: (v: boolean) => void;
// }> = React.memo(({ id, label, description, checked, onChange }) => {
//   return (
//     <div className="flex items-start justify-between p-3 rounded-lg border bg-white shadow-sm">
//       <div>
//         <label htmlFor={id} className="block text-sm font-semibold text-gray-800">
//           {label}
//         </label>
//         {description && <div className="text-xs text-gray-500">{description}</div>}
//       </div>
//       <div>
//         <button
//           id={id}
//           aria-pressed={checked}
//           onClick={() => onChange(!checked)}
//           className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
//             checked ? "bg-indigo-600" : "bg-gray-200"
//           }`}
//         >
//           <span
//             className={`transform transition-transform h-5 w-5 bg-white rounded-full shadow-sm ${
//               checked ? "translate-x-5" : "translate-x-0"
//             }`}
//           />
//         </button>
//       </div>
//     </div>
//   );
// });

// const CopyButton: React.FC<{ content: string }> = ({ content }) => {
//   const [ok, setOk] = useState<string | null>(null);
//   const copy = useCallback(async () => {
//     try {
//       await navigator.clipboard.writeText(content ?? "");
//       setOk("Copied");
//       window.setTimeout(() => setOk(null), 1500);
//     } catch {
//       setOk("Failed");
//       window.setTimeout(() => setOk(null), 1500);
//     }
//   }, [content]);

//   return (
//     <button
//       type="button"
//       onClick={copy}
//       className="text-xs px-2 py-1 rounded-md bg-gray-100 border"
//       aria-label="Copy secret to clipboard"
//     >
//       {ok ?? "Copy"}
//     </button>
//   );
// };

// const InputField: React.FC<{
//   id: string;
//   label: string;
//   value: string;
//   placeholder?: string;
//   type?: "text" | "password" | "url" | "number";
//   onChange: (v: string) => void;
//   error?: string | null | undefined;
//   secret?: boolean;
//   hint?: string;
// }> = React.memo(({ id, label, value, placeholder, type = "text", onChange, error, secret, hint }) => {
//   const [reveal, setReveal] = useState(false);
//   useEffect(() => setReveal(false), [value]);

//   return (
//     <div className="flex flex-col">
//       <label htmlFor={id} className="text-sm font-medium text-gray-700 flex items-center gap-2">
//         <span>{label}</span>
//         {hint && <span className="text-xs text-gray-400">{hint}</span>}
//       </label>
//       <div className="mt-2 relative">
//         <input
//           id={id}
//           value={value ?? ""}
//           placeholder={placeholder}
//           onChange={(e) => onChange(e.target.value)}
//           type={secret && !reveal ? "password" : type}
//           className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
//             error ? "border-red-300" : "border-gray-200"
//           }`}
//         />
//         {secret && (
//           <div className="absolute right-2 top-2 flex items-center gap-2">
//             <button
//               type="button"
//               aria-label={reveal ? "Hide secret" : "Show secret"}
//               onClick={() => setReveal((s) => !s)}
//               className="text-xs px-2 py-1 rounded-md bg-gray-100 border"
//             >
//               {reveal ? "Hide" : "Show"}
//             </button>
//             <CopyButton content={value ?? ""} />
//           </div>
//         )}
//       </div>
//       {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
//     </div>
//   );
// });

// const GatewaySection: React.FC<{
//   title: string;
//   hint?: string;
//   enabled: boolean;
//   children: React.ReactNode;
//   errorCount?: number;
// }> = ({ title, hint, enabled, children, errorCount = 0 }) => {
//   return (
//     <section className="border rounded-xl p-4 bg-white shadow-sm">
//       <div className="flex items-center justify-between">
//         <div>
//           <h4 className="text-lg font-semibold">{title}</h4>
//           {hint && <div className="text-xs text-gray-500">{hint}</div>}
//         </div>
//         <div className="text-sm text-gray-600">
//           {enabled ? "Enabled" : "Disabled"}{" "}
//           {errorCount > 0 && <span className="ml-2 text-red-600">({errorCount} errors)</span>}
//         </div>
//       </div>
//       <div className="mt-4">{children}</div>
//     </section>
//   );
// };

// /* ============================
//    Test Connection Hook
//    ============================ */

// function useTestConnection() {
//   const [loading, setLoading] = useState<string | null>(null);
//   const [result, setResult] = useState<Record<string, any> | null>(null);

//   const test = useCallback(async (label: string, url: string | undefined, payload: any) => {
//     if (!url) {
//       setResult({ label, success: false, response: "No endpoint configured" });
//       return;
//     }
//     try {
//       setLoading(label);
//       setResult(null);
//       const res = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const json = await res.json().catch(() => null);
//       setResult({ label, success: res.ok, response: json ?? null });
//     } catch (err: any) {
//       setResult({ label, success: false, response: err?.message ?? String(err) });
//     } finally {
//       setLoading(null);
//       setTimeout(() => setResult(null), 2500);
//     }
//   }, []);

//   return { loading, result, test };
// }

// /* ============================
//    Main Component
//    ============================ */

// export default function PaymentAccordion({ paymentSettings, onChange, onSave }: PaymentAccordionProps) {
//   // Logic: Check if any OTHER gateways are enabled. If not, default Ghuba to true and fill credentials.
//   const initial = useMemo<PaymentSettings>(() => {
//     const s = { ...(paymentSettings ?? {}) };

//     // List of other gateways to check against
//     const otherGateways = ["isStripeEnabled", "isPaypalEnabled", "isMpesaEnabled", "isPaystackEnabled"];
//     const hasOtherEnabled = otherGateways.some((key) => !!s[key]);

//     // If no other gateway is enabled AND Ghuba isn't already set, enable it and gen credentials
//     if (!hasOtherEnabled && !s.isGhubaEnabled) {
//       s.isGhubaEnabled = true;
      
//       const creds = generateGhubaCredentials();
      
//       // Only auto-fill if empty
//       if (!s.ghubaMerchantId) s.ghubaMerchantId = creds.merchantId;
//       if (!s.ghubaApiKey) s.ghubaApiKey = creds.apiKey;
//     }

//     return s;
//   }, [paymentSettings]);

//   const [state, dispatch] = useReducer(reducer, clone(initial) as PaymentSettings);

//   // build zod validator once
//   const validator = useMemo(() => buildZodSchemaForAll(state), [state]);

//   // errors map
//   const errors = useMemo(() => {
//     const raw = validator.safeParse(state);
//     if (raw.success) return {};
//     const map: Record<string, string> = {};
//     raw.error.errors.forEach((e) => {
//       const path = e.path?.[0] ?? "form";
//       map[String(path)] = e.message;
//     });
//     return map;
//   }, [state, validator]);

//   const firstLoad = useRef(true);

//   // When props change (e.g. from DB load), update state, but respect the initialization logic above
//   useEffect(() => {
//     if (firstLoad.current) {
//       dispatch({ type: "REPLACE", payload: clone(initial) });
//       firstLoad.current = false;
//     }
//   }, [initial]);

//   // debounced outward onChange
//   useDebouncedEffect(
//     () => {
//       onChange(clone(state));
//     },
//     [state],
//     600
//   );

//   const setField = useCallback((key: keyof PaymentSettings, value: any) => {
//     dispatch({ type: "SET", key, value });
//   }, []);

//   // Save handler
//   const handleSave = useCallback(async () => {
//     if (Object.keys(errors).length) {
//       const first = Object.keys(errors)[0];
//       const el = document.getElementById(String(first));
//       el?.scrollIntoView({ behavior: "smooth", block: "center" });
//       (el as HTMLElement | null)?.focus();
//       return;
//     }
//     if (onSave) await onSave(clone(state));
//   }, [errors, onSave, state]);

//   // dirty check (compare against the calculated initial state, which may include auto-gen fields)
//   const dirty = useMemo(() => JSON.stringify(initial) !== JSON.stringify(state), [initial, state]);

//   const { loading: testLoading, result: testResult, test } = useTestConnection();

//   // local state for mpesa ad-hoc fields
//   const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
//   const updateField = useCallback((key: string, value: any) => {
//     setFieldValues((s) => ({ ...(s ?? {}), [key]: value }));
//   }, []);
//   const [mpesaLoading, setMpesaLoading] = useState(false);

//   useEffect(() => {
//     setFieldValues((prev = {}) => ({
//       mpesaPhone: prev.mpesaPhone ?? "",
//       mpesaAmount: prev.mpesaAmount ?? "",
//       mpesaConsumerKey: prev.mpesaConsumerKey ?? state.mpesaConsumerKey ?? "",
//       mpesaConsumerSecret: prev.mpesaConsumerSecret ?? state.mpesaConsumerSecret ?? "",
//       mpesaShortcode: prev.mpesaShortcode ?? state.mpesaShortcode ?? "",
//       mpesaPasskey: prev.mpesaPasskey ?? state.mpesaPasskey ?? "",
//       mpesaCallbackUrl: prev.mpesaCallbackUrl ?? state.mpesaCallbackUrl ?? "",
//       mpesaSandbox: prev.mpesaSandbox ?? state.mpesaSandbox ?? false,
//     }));
//   }, [
//     state.mpesaConsumerKey,
//     state.mpesaConsumerSecret,
//     state.mpesaShortcode,
//     state.mpesaPasskey,
//     state.mpesaCallbackUrl,
//     state.mpesaSandbox,
//   ]);

//   const gatewayErrorCount = useCallback(
//     (g: GatewayConfig) => g.fields.filter((f) => !!errors[String(f.key)]).length,
//     [errors]
//   );

//   const isGatewayValid = useCallback(
//     (g: GatewayConfig) => {
//       const enabled = !!state[String(g.toggleKey)];
//       if (!enabled) return true;
//       return g.fields.every((f) => {
//         if (!f.requiredWhenEnabled) return true;
//         const v = state[String(f.key)];
//         if (v === undefined || v === null) return false;
//         if (typeof v === "string" && v.trim() === "") return false;
//         return true;
//       });
//     },
//     [state]
//   );

//   const testGateway = useCallback(
//     async (g: GatewayConfig) => {
//       if (!isGatewayValid(g)) {
//         setTimeout(() => {
//           test(g.label, g.testEndpoint, { __simulate: "invalidate" });
//         }, 10);
//         return;
//       }
//       const payload: Record<string, any> = {};
//       g.fields.forEach((f) => {
//         payload[String(f.key)] = state[String(f.key)];
//       });
//       payload[String(g.toggleKey)] = !!state[String(g.toggleKey)];
//       await test(g.label, g.testEndpoint, payload);
//     },
//     [isGatewayValid, state, test]
//   );

//   return (
//     <div className="max-w-6xl mx-auto p-6 space-y-6">
//       <header className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-extrabold">Payment Gateway Configuration</h2>
//           <p className="text-sm text-gray-500">
//             Enable gateways, enter credentials and test connections. Secrets are masked by default.
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={handleSave}
//             disabled={!dirty}
//             className={`px-4 py-2 rounded-md text-sm text-white ${
//               dirty ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-300 cursor-not-allowed"
//             }`}
//           >
//             Save
//           </button>
//           <button
//             onClick={() => dispatch({ type: "REPLACE", payload: clone(initial) })}
//             className="px-4 py-2 rounded-md border text-sm"
//           >
//             Reset
//           </button>
//         </div>
//       </header>

//       {/* Toggles grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {Object.values(GATEWAYS).map((g) => (
//           <Toggle
//             key={g.id}
//             id={`t-${g.id}`}
//             label={g.label}
//             description={g.hint}
//             checked={!!state[String(g.toggleKey)]}
//             onChange={(v) => setField(g.toggleKey, v)}
//           />
//         ))}
//       </div>

//       {/* Details sections */}
//       <div className="space-y-6">
//         {Object.values(GATEWAYS).map((g) => {
//           const enabled = !!state[String(g.toggleKey)];
//           const errCount = gatewayErrorCount(g);
//           return (
//             <GatewaySection key={g.id} title={g.label} hint={g.hint} enabled={enabled} errorCount={errCount}>
//               {enabled ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {g.fields.map((f) => (
//                     <InputField
//                       key={String(f.key)}
//                       id={String(f.key)}
//                       label={f.label}
//                       value={String(state[String(f.key)] ?? "")}
//                       placeholder={f.placeholder}
//                       type={f.type as any}
//                       onChange={(v) => setField(f.key, v)}
//                       error={errors[String(f.key)]}
//                       secret={!!f.secret}
//                       hint={f.hint}
//                     />
//                   ))}

//                   <div className="md:col-span-2 flex gap-3 items-center">
//                     <button
//                       type="button"
//                       onClick={() => testGateway(g)}
//                       className="px-3 py-2 rounded-md border"
//                       disabled={!!testLoading}
//                     >
//                       {testLoading === g.label ? "Testing..." : "Test Connection"}
//                     </button>

//                     {/* test result */}
//                     <div className="text-sm text-gray-600">
//                       {!isGatewayValid(g) ? (
//                         <span className="text-red-600">Fix {errCount} required field(s) to test.</span>
//                       ) : testResult && testResult.label === g.label ? (
//                         testResult.success ? (
//                           <span className="text-green-600">Connection OK</span>
//                         ) : (
//                           <span className="text-red-600">Connection failed</span>
//                         )
//                       ) : (
//                         <span className="text-gray-500">{g.feeDescription ?? ""}</span>
//                       )}
//                     </div>
//                   </div>

//                   {g.id === "mpesa" && (
//                     <div className="mt-4 space-y-3">
//                       <div>
//                         <label className="block text-sm font-medium">Phone Number (07XXXXXXXX)</label>
//                         <input
//                           type="tel"
//                           value={fieldValues["mpesaPhone"] || ""}
//                           onChange={(e) => updateField("mpesaPhone", e.target.value)}
//                           placeholder="2547XXXXXXXX"
//                           className="w-full border px-3 py-2 rounded"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium">Amount</label>
//                         <input
//                           type="number"
//                           value={fieldValues["mpesaAmount"] || ""}
//                           onChange={(e) => updateField("mpesaAmount", e.target.value)}
//                           placeholder="100"
//                           className="w-full border px-3 py-2 rounded"
//                         />
//                       </div>
//                       <button
//                         onClick={async () => {
//                           try {
//                             setMpesaLoading(true);
//                             const res = await fetch("/api/payments/mpesa/stkpush", {
//                               method: "POST",
//                               headers: { "Content-Type": "application/json" },
//                               body: JSON.stringify({
//                                 phoneNumber: fieldValues["mpesaPhone"],
//                                 amount: Number(fieldValues["mpesaAmount"]),
//                                 mpesaConsumerKey: fieldValues["mpesaConsumerKey"],
//                                 mpesaConsumerSecret: fieldValues["mpesaConsumerSecret"],
//                                 mpesaShortcode: fieldValues["mpesaShortcode"],
//                                 mpesaPasskey: fieldValues["mpesaPasskey"],
//                                 mpesaCallbackUrl: fieldValues["mpesaCallbackUrl"],
//                                 sandbox: fieldValues["mpesaSandbox"],
//                               }),
//                             });
//                             const out = await res.json().catch(() => null);
//                             if (!out || !out.ok) {
//                               window.alert("STK Push failed: " + (out?.data?.errorMessage || out?.error || "Unknown"));
//                             } else {
//                               window.alert("STK Push Sent Successfully!");
//                             }
//                           } catch (err: any) {
//                             window.alert("STK Push Error: " + (err?.message ?? String(err)));
//                           } finally {
//                             setMpesaLoading(false);
//                           }
//                         }}
//                         className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
//                         disabled={mpesaLoading}
//                       >
//                         {mpesaLoading ? "Sending..." : "Send STK Push"}
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-sm text-gray-500">Enable to configure {g.label}.</div>
//               )}
//             </GatewaySection>
//           );
//         })}
//       </div>

//       <footer className="flex items-center justify-between pt-4">
//         <div className="text-sm text-gray-600">
//           Status:{" "}
//           {Object.keys(errors).length ? (
//             <span className="text-red-600">Configuration incomplete</span>
//           ) : (
//             <span className="text-green-600">OK</span>
//           )}
//         </div>

//         <div className="flex gap-2">
//           <button
//             onClick={handleSave}
//             disabled={!dirty}
//             className={`px-4 py-2 rounded-md text-white ${dirty ? "bg-indigo-600" : "bg-gray-300"}`}
//           >
//             Save
//           </button>
//           <button onClick={() => onChange(clone(state))} className="px-4 py-2 rounded-md border">
//             Apply (emit change)
//           </button>
//         </div>
//       </footer>
//     </div>
//   );
// }
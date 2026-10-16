"use client";

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
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
  ShieldExclamationIcon,
  BanknotesIcon
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
  ghubaPayoutPhone?: string | null;

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

type WebhookInfo = {
  label: string;
  urlPath: string;
  events?: string;
  hint: string;
  required: boolean;
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
  webhookInfo?: WebhookInfo;
  testEndpoint?: string;
  extraEndpoint?: string;
};

const GATEWAYS: Record<string, GatewayConfig> = {
  cash: {
    id: "cash",
    toggleKey: "isCashEnabled",
    label: "Cash on Delivery",
    hint: "Accept physical cash for in-person fulfillment and marketplace handoffs.",
    feeDescription: "Zero processing fees. Manual settlement required.",
    brandColor: "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500",
    icon: BanknotesIcon,
    fields: [
      { 
        key: "cashInstructions", 
        label: "Collection Instructions", 
        placeholder: "e.g., Please have exact change ready upon delivery...", 
        requiredWhenEnabled: false 
      },
    ],
  },
  ghuba: {
    id: "ghuba",
    toggleKey: "isGhubaEnabled",
    label: "Ghuba Managed Payments (Platform Default)",
    hint: "Accept customer payments via Ghuba's verified M-Pesa (Till 537214 & STK Push) and Paystack (Cards & Bank). Zero configuration required.",
    feeDescription: "Active & Ready. Customer payments are credited directly to your store sales ledger.",
    brandColor: "border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500",
    icon: SparklesIcon,
    webhookInfo: {
      label: "Platform Managed Webhook",
      urlPath: "/api/webhooks/ghuba",
      events: "payment.success, charge.success",
      hint: "Managed automatically by SalesManPro infrastructure. Zero store configuration required.",
      required: false,
    },
    fields: [
      {
        key: "ghubaPayoutPhone",
        label: "Store Payout M-Pesa Phone (Optional)",
        placeholder: "e.g. 0712345678 (Defaults to store contact phone)",
        type: "text",
        requiredWhenEnabled: false,
        hint: "M-Pesa phone number where Ghuba remits your store sales settlements.",
      },
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
    webhookInfo: {
      label: "Stripe Webhook Endpoint",
      urlPath: "/api/webhooks/stripe",
      events: "checkout.session.completed, payment_intent.succeeded",
      hint: "Paste this into your Stripe Dashboard → Developers → Webhooks to receive automatic order confirmations.",
      required: true,
    },
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
    webhookInfo: {
      label: "PayPal Webhook Endpoint",
      urlPath: "/api/webhooks/paypal",
      events: "CHECKOUT.ORDER.APPROVED, PAYMENT.CAPTURE.COMPLETED",
      hint: "Paste this into your PayPal Developer Dashboard → Apps & Credentials → Webhooks.",
      required: true,
    },
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
    webhookInfo: {
      label: "Safaricom Daraja STK Callback URL",
      urlPath: "/api/mpesa/callback",
      events: "STK Push Push Notification & CallbackMetadata",
      hint: "Safaricom Daraja pushes customer PIN confirmation callbacks directly to this endpoint.",
      required: true,
    },
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
    webhookInfo: {
      label: "Paystack Webhook URL",
      urlPath: "/api/webhooks/paystack",
      events: "charge.success",
      hint: "Register this in Paystack Dashboard → Settings → API & Webhooks → Live/Test Webhook URL.",
      required: true,
    },
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
    const otherKeys = ["isStripeEnabled", "isPaypalEnabled", "isMpesaEnabled", "isPaystackEnabled", "isCashEnabled"];
    const hasActiveGtw = otherKeys.some((k) => !!s[k]);

    // If no custom gateway is enabled, default Ghuba Managed Payments to enabled
    if (!hasActiveGtw && (s.isGhubaEnabled === undefined || s.isGhubaEnabled === null)) {
      s.isGhubaEnabled = true;
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
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

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
          sandbox: state.mpesaShortcode === "174379",
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
                          {/* Ghuba Managed Explanatory Banner */}
                          {g.id === "ghuba" && (
                            <div className="p-5 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 dark:from-indigo-950/40 dark:via-gray-900 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl space-y-3.5 shadow-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                                  <SparklesIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                  <span>Authoritative Platform Managed Gateway</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                                  Turnkey Solution
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                Your store automatically receives customer payments directly through Ghuba's verified infrastructure. 
                                No need to apply for or configure your own Safaricom Daraja API keys or Paystack merchant account.
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                                <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800/80 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                                  <div className="text-[11px] leading-tight">
                                    <span className="font-bold text-gray-900 dark:text-white block">M-Pesa STK & Till 537214</span>
                                    <span className="text-gray-500 dark:text-gray-400 text-[10px]">Instant phone prompts</span>
                                  </div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800/80 border border-teal-100 dark:border-teal-900/30 flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 flex-shrink-0" />
                                  <div className="text-[11px] leading-tight">
                                    <span className="font-bold text-gray-900 dark:text-white block">Paystack Africa</span>
                                    <span className="text-gray-500 dark:text-gray-400 text-[10px]">Cards & bank transfers</span>
                                  </div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800/80 border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                  <div className="text-[11px] leading-tight">
                                    <span className="font-bold text-gray-900 dark:text-white block">Auto Accounting</span>
                                    <span className="text-gray-500 dark:text-gray-400 text-[10px]">Sales balance & escrow</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Parameter Input Matrix */}
                          {g.fields.length > 0 && (
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
                          )}

                          {/* Webhook & Callback Infrastructure Integration Card */}
                          {g.webhookInfo && (
                            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/80 dark:border-indigo-900/40 space-y-2.5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                                    {g.webhookInfo.label}
                                  </span>
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    Functional & Connected
                                  </span>
                                </div>
                                {g.id === "mpesa" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const base = origin || "https://salesman.co.ke";
                                      setField("mpesaCallbackUrl", `${base}${g.webhookInfo?.urlPath}`);
                                    }}
                                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Auto-fill into Validation URL field</span>
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 font-mono text-xs text-gray-800 dark:text-gray-200 overflow-x-auto">
                                <span className="flex-1 truncate">
                                  {origin ? `${origin}${g.webhookInfo.urlPath}` : `https://salesman.co.ke${g.webhookInfo.urlPath}`}
                                </span>
                                <ClipboardActionButton
                                  targetText={origin ? `${origin}${g.webhookInfo.urlPath}` : `https://salesman.co.ke${g.webhookInfo.urlPath}`}
                                />
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                                <span>{g.webhookInfo.hint}</span>
                                {g.webhookInfo.events && (
                                  <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/30">
                                    Events: {g.webhookInfo.events}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

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

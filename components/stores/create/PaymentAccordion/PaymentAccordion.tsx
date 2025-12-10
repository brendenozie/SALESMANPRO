"use client";

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { z } from "zod";

/**
 * Schema-driven Payment Settings Accordion (Option C)
 *
 * Modified: Ghuba is selected by default with auto-generated credentials
 * ONLY IF no other payment methods are currently enabled.
 */

/* ============================
   Types
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

  // Ghuba (example)
  ghubaMerchantId?: string | null;
  ghubaApiKey?: string | null;

  // Allow extension (index signature)
  [key: string]: any;
};

export interface PaymentAccordionProps {
  paymentSettings: PaymentSettings | null;
  onChange: (updated: PaymentSettings) => void;
  onSave?: (payload: PaymentSettings) => Promise<void> | void;
}

/* ============================
   Utilities
   ============================ */

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v ?? {}));

function useDebouncedEffect(cb: () => void, deps: any[], delay = 350) {
  const t = useRef<number | undefined>();
  useEffect(() => {
    window.clearTimeout(t.current);
    t.current = window.setTimeout(cb, delay) as unknown as number;
    return () => window.clearTimeout(t.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// Helper to generate random credentials
const generateGhubaCredentials = () => {
  const rand = () => Math.random().toString(36).substring(2, 8).toUpperCase();
  return {
    merchantId: `GHB-${Math.floor(100000 + Math.random() * 900000)}`,
    apiKey: `gk_live_${rand()}${rand()}`,
  };
};

/* ============================
   Zod validation schema + helpers
   ============================ */

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
  hint?: string;
  feeDescription?: string | null;
  fields: FieldConfig[];
  testEndpoint?: string;
  extraEndpoint?: string;
  example?: Partial<PaymentSettings>;
};

const GATEWAYS: Record<string, GatewayConfig> = {
  ghuba: {
    id: "ghuba",
    toggleKey: "isGhubaEnabled",
    label: "Ghuba",
    hint: "Local gateway — 10% fee applies",
    feeDescription: "Transaction fee will be shown in UI pricing.",
    fields: [
      { key: "ghubaMerchantId", label: "Merchant ID", placeholder: "GHB12345", requiredWhenEnabled: true },
      { key: "ghubaApiKey", label: "API Key", secret: true, requiredWhenEnabled: true },
    ],
    testEndpoint: "/api/payments/ghuba/test",
  },
  stripe: {
    id: "stripe",
    toggleKey: "isStripeEnabled",
    label: "Stripe",
    hint: "Card processing and wallets",
    fields: [
      { key: "stripePublishableKey", label: "Publishable Key", placeholder: "pk_live_...", requiredWhenEnabled: true },
      { key: "stripeSecretKey", label: "Secret Key (server)", secret: true, requiredWhenEnabled: false },
    ],
    testEndpoint: "/api/payments/stripe/test",
  },
  paypal: {
    id: "paypal",
    toggleKey: "isPaypalEnabled",
    label: "PayPal",
    hint: "PayPal REST integration",
    fields: [
      { key: "paypalClientId", label: "Client ID", requiredWhenEnabled: true },
      { key: "paypalClientSecret", label: "Client Secret", secret: true, requiredWhenEnabled: false },
    ],
    testEndpoint: "/api/payments/paypal/test",
  },
  mpesa: {
    id: "mpesa",
    toggleKey: "isMpesaEnabled",
    label: "M-Pesa (Daraja)",
    hint: "Daraja API for STK Push / C2B",
    fields: [
      { key: "mpesaShortcode", label: "Shortcode / Paybill", requiredWhenEnabled: true },
      { key: "mpesaConsumerKey", label: "Consumer Key", requiredWhenEnabled: true },
      { key: "mpesaConsumerSecret", label: "Consumer Secret", secret: true, requiredWhenEnabled: true },
      { key: "mpesaCallbackUrl", label: "Callback URL", type: "url", requiredWhenEnabled: true },
      { key: "mpesaPasskey", label: "Lipa na M-Pesa Passkey", secret: true, requiredWhenEnabled: true },
    ],
    testEndpoint: "/api/payments/mpesa/test",
    extraEndpoint: "/api/payments/mpesa/stkpush",
  },
  paystack: {
    id: "paystack",
    toggleKey: "isPaystackEnabled",
    label: "Paystack",
    hint: "African payments (cards, bank)",
    fields: [
      { key: "paystackPublicKey", label: "Public Key", requiredWhenEnabled: true },
      { key: "paystackSecretKey", label: "Secret Key", secret: true, requiredWhenEnabled: true },
    ],
    testEndpoint: "/api/payments/paystack/test",
  },
};

function buildZodSchemaForAll(settings: PaymentSettings) {
  const shape: Record<string, any> = {};

  Object.values(GATEWAYS).forEach((g) => {
    shape[String(g.toggleKey)] = z.boolean().nullable().optional();
    g.fields.forEach((f) => {
      shape[String(f.key)] = z.union([z.string(), z.null(), z.undefined()]).optional();
    });
  });

  const base = z.object(shape).passthrough();

  const refined = base.superRefine((obj, ctx) => {
    Object.values(GATEWAYS).forEach((g) => {
      const enabled = !!obj[String(g.toggleKey)];
      g.fields.forEach((f) => {
        const val = obj[String(f.key)];
        if (enabled && f.requiredWhenEnabled) {
          if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${f.label} is required when ${g.label} is enabled`,
              path: [String(f.key)],
            });
          }
        }
      });
    });
  });

  return refined;
}

/* ============================
   Local reducer & actions
   ============================ */

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
   UI Subcomponents
   ============================ */

const Toggle: React.FC<{
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = React.memo(({ id, label, description, checked, onChange }) => {
  return (
    <div className="flex items-start justify-between p-3 rounded-lg border bg-white shadow-sm">
      <div>
        <label htmlFor={id} className="block text-sm font-semibold text-gray-800">
          {label}
        </label>
        {description && <div className="text-xs text-gray-500">{description}</div>}
      </div>
      <div>
        <button
          id={id}
          aria-pressed={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            checked ? "bg-indigo-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`transform transition-transform h-5 w-5 bg-white rounded-full shadow-sm ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
});

const CopyButton: React.FC<{ content: string }> = ({ content }) => {
  const [ok, setOk] = useState<string | null>(null);
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content ?? "");
      setOk("Copied");
      window.setTimeout(() => setOk(null), 1500);
    } catch {
      setOk("Failed");
      window.setTimeout(() => setOk(null), 1500);
    }
  }, [content]);

  return (
    <button
      type="button"
      onClick={copy}
      className="text-xs px-2 py-1 rounded-md bg-gray-100 border"
      aria-label="Copy secret to clipboard"
    >
      {ok ?? "Copy"}
    </button>
  );
};

const InputField: React.FC<{
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  type?: "text" | "password" | "url" | "number";
  onChange: (v: string) => void;
  error?: string | null | undefined;
  secret?: boolean;
  hint?: string;
}> = React.memo(({ id, label, value, placeholder, type = "text", onChange, error, secret, hint }) => {
  const [reveal, setReveal] = useState(false);
  useEffect(() => setReveal(false), [value]);

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <span>{label}</span>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </label>
      <div className="mt-2 relative">
        <input
          id={id}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          type={secret && !reveal ? "password" : type}
          className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            error ? "border-red-300" : "border-gray-200"
          }`}
        />
        {secret && (
          <div className="absolute right-2 top-2 flex items-center gap-2">
            <button
              type="button"
              aria-label={reveal ? "Hide secret" : "Show secret"}
              onClick={() => setReveal((s) => !s)}
              className="text-xs px-2 py-1 rounded-md bg-gray-100 border"
            >
              {reveal ? "Hide" : "Show"}
            </button>
            <CopyButton content={value ?? ""} />
          </div>
        )}
      </div>
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </div>
  );
});

const GatewaySection: React.FC<{
  title: string;
  hint?: string;
  enabled: boolean;
  children: React.ReactNode;
  errorCount?: number;
}> = ({ title, hint, enabled, children, errorCount = 0 }) => {
  return (
    <section className="border rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">{title}</h4>
          {hint && <div className="text-xs text-gray-500">{hint}</div>}
        </div>
        <div className="text-sm text-gray-600">
          {enabled ? "Enabled" : "Disabled"}{" "}
          {errorCount > 0 && <span className="ml-2 text-red-600">({errorCount} errors)</span>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
};

/* ============================
   Test Connection Hook
   ============================ */

function useTestConnection() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, any> | null>(null);

  const test = useCallback(async (label: string, url: string | undefined, payload: any) => {
    if (!url) {
      setResult({ label, success: false, response: "No endpoint configured" });
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
      const json = await res.json().catch(() => null);
      setResult({ label, success: res.ok, response: json ?? null });
    } catch (err: any) {
      setResult({ label, success: false, response: err?.message ?? String(err) });
    } finally {
      setLoading(null);
      setTimeout(() => setResult(null), 2500);
    }
  }, []);

  return { loading, result, test };
}

/* ============================
   Main Component
   ============================ */

export default function PaymentAccordion({ paymentSettings, onChange, onSave }: PaymentAccordionProps) {
  // Logic: Check if any OTHER gateways are enabled. If not, default Ghuba to true and fill credentials.
  const initial = useMemo<PaymentSettings>(() => {
    const s = { ...(paymentSettings ?? {}) };

    // List of other gateways to check against
    const otherGateways = ["isStripeEnabled", "isPaypalEnabled", "isMpesaEnabled", "isPaystackEnabled"];
    const hasOtherEnabled = otherGateways.some((key) => !!s[key]);

    // If no other gateway is enabled AND Ghuba isn't already set, enable it and gen credentials
    if (!hasOtherEnabled && !s.isGhubaEnabled) {
      s.isGhubaEnabled = true;
      
      const creds = generateGhubaCredentials();
      
      // Only auto-fill if empty
      if (!s.ghubaMerchantId) s.ghubaMerchantId = creds.merchantId;
      if (!s.ghubaApiKey) s.ghubaApiKey = creds.apiKey;
    }

    return s;
  }, [paymentSettings]);

  const [state, dispatch] = useReducer(reducer, clone(initial) as PaymentSettings);

  // build zod validator once
  const validator = useMemo(() => buildZodSchemaForAll(state), [state]);

  // errors map
  const errors = useMemo(() => {
    const raw = validator.safeParse(state);
    if (raw.success) return {};
    const map: Record<string, string> = {};
    raw.error.errors.forEach((e) => {
      const path = e.path?.[0] ?? "form";
      map[String(path)] = e.message;
    });
    return map;
  }, [state, validator]);

  const firstLoad = useRef(true);

  // When props change (e.g. from DB load), update state, but respect the initialization logic above
  useEffect(() => {
    if (firstLoad.current) {
      dispatch({ type: "REPLACE", payload: clone(initial) });
      firstLoad.current = false;
    }
  }, [initial]);

  // debounced outward onChange
  useDebouncedEffect(
    () => {
      onChange(clone(state));
    },
    [state],
    600
  );

  const setField = useCallback((key: keyof PaymentSettings, value: any) => {
    dispatch({ type: "SET", key, value });
  }, []);

  // Save handler
  const handleSave = useCallback(async () => {
    if (Object.keys(errors).length) {
      const first = Object.keys(errors)[0];
      const el = document.getElementById(String(first));
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      (el as HTMLElement | null)?.focus();
      return;
    }
    if (onSave) await onSave(clone(state));
  }, [errors, onSave, state]);

  // dirty check (compare against the calculated initial state, which may include auto-gen fields)
  const dirty = useMemo(() => JSON.stringify(initial) !== JSON.stringify(state), [initial, state]);

  const { loading: testLoading, result: testResult, test } = useTestConnection();

  // local state for mpesa ad-hoc fields
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const updateField = useCallback((key: string, value: any) => {
    setFieldValues((s) => ({ ...(s ?? {}), [key]: value }));
  }, []);
  const [mpesaLoading, setMpesaLoading] = useState(false);

  useEffect(() => {
    setFieldValues((prev = {}) => ({
      mpesaPhone: prev.mpesaPhone ?? "",
      mpesaAmount: prev.mpesaAmount ?? "",
      mpesaConsumerKey: prev.mpesaConsumerKey ?? state.mpesaConsumerKey ?? "",
      mpesaConsumerSecret: prev.mpesaConsumerSecret ?? state.mpesaConsumerSecret ?? "",
      mpesaShortcode: prev.mpesaShortcode ?? state.mpesaShortcode ?? "",
      mpesaPasskey: prev.mpesaPasskey ?? state.mpesaPasskey ?? "",
      mpesaCallbackUrl: prev.mpesaCallbackUrl ?? state.mpesaCallbackUrl ?? "",
      mpesaSandbox: prev.mpesaSandbox ?? state.mpesaSandbox ?? false,
    }));
  }, [
    state.mpesaConsumerKey,
    state.mpesaConsumerSecret,
    state.mpesaShortcode,
    state.mpesaPasskey,
    state.mpesaCallbackUrl,
    state.mpesaSandbox,
  ]);

  const gatewayErrorCount = useCallback(
    (g: GatewayConfig) => g.fields.filter((f) => !!errors[String(f.key)]).length,
    [errors]
  );

  const isGatewayValid = useCallback(
    (g: GatewayConfig) => {
      const enabled = !!state[String(g.toggleKey)];
      if (!enabled) return true;
      return g.fields.every((f) => {
        if (!f.requiredWhenEnabled) return true;
        const v = state[String(f.key)];
        if (v === undefined || v === null) return false;
        if (typeof v === "string" && v.trim() === "") return false;
        return true;
      });
    },
    [state]
  );

  const testGateway = useCallback(
    async (g: GatewayConfig) => {
      if (!isGatewayValid(g)) {
        setTimeout(() => {
          test(g.label, g.testEndpoint, { __simulate: "invalidate" });
        }, 10);
        return;
      }
      const payload: Record<string, any> = {};
      g.fields.forEach((f) => {
        payload[String(f.key)] = state[String(f.key)];
      });
      payload[String(g.toggleKey)] = !!state[String(g.toggleKey)];
      await test(g.label, g.testEndpoint, payload);
    },
    [isGatewayValid, state, test]
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">Payment Gateway Configuration</h2>
          <p className="text-sm text-gray-500">
            Enable gateways, enter credentials and test connections. Secrets are masked by default.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!dirty}
            className={`px-4 py-2 rounded-md text-sm text-white ${
              dirty ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Save
          </button>
          <button
            onClick={() => dispatch({ type: "REPLACE", payload: clone(initial) })}
            className="px-4 py-2 rounded-md border text-sm"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Toggles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(GATEWAYS).map((g) => (
          <Toggle
            key={g.id}
            id={`t-${g.id}`}
            label={g.label}
            description={g.hint}
            checked={!!state[String(g.toggleKey)]}
            onChange={(v) => setField(g.toggleKey, v)}
          />
        ))}
      </div>

      {/* Details sections */}
      <div className="space-y-6">
        {Object.values(GATEWAYS).map((g) => {
          const enabled = !!state[String(g.toggleKey)];
          const errCount = gatewayErrorCount(g);
          return (
            <GatewaySection key={g.id} title={g.label} hint={g.hint} enabled={enabled} errorCount={errCount}>
              {enabled ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {g.fields.map((f) => (
                    <InputField
                      key={String(f.key)}
                      id={String(f.key)}
                      label={f.label}
                      value={String(state[String(f.key)] ?? "")}
                      placeholder={f.placeholder}
                      type={f.type as any}
                      onChange={(v) => setField(f.key, v)}
                      error={errors[String(f.key)]}
                      secret={!!f.secret}
                      hint={f.hint}
                    />
                  ))}

                  <div className="md:col-span-2 flex gap-3 items-center">
                    <button
                      type="button"
                      onClick={() => testGateway(g)}
                      className="px-3 py-2 rounded-md border"
                      disabled={!!testLoading}
                    >
                      {testLoading === g.label ? "Testing..." : "Test Connection"}
                    </button>

                    {/* test result */}
                    <div className="text-sm text-gray-600">
                      {!isGatewayValid(g) ? (
                        <span className="text-red-600">Fix {errCount} required field(s) to test.</span>
                      ) : testResult && testResult.label === g.label ? (
                        testResult.success ? (
                          <span className="text-green-600">Connection OK</span>
                        ) : (
                          <span className="text-red-600">Connection failed</span>
                        )
                      ) : (
                        <span className="text-gray-500">{g.feeDescription ?? ""}</span>
                      )}
                    </div>
                  </div>

                  {g.id === "mpesa" && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium">Phone Number (07XXXXXXXX)</label>
                        <input
                          type="tel"
                          value={fieldValues["mpesaPhone"] || ""}
                          onChange={(e) => updateField("mpesaPhone", e.target.value)}
                          placeholder="2547XXXXXXXX"
                          className="w-full border px-3 py-2 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Amount</label>
                        <input
                          type="number"
                          value={fieldValues["mpesaAmount"] || ""}
                          onChange={(e) => updateField("mpesaAmount", e.target.value)}
                          placeholder="100"
                          className="w-full border px-3 py-2 rounded"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            setMpesaLoading(true);
                            const res = await fetch("/api/payments/mpesa/stkpush", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                phoneNumber: fieldValues["mpesaPhone"],
                                amount: Number(fieldValues["mpesaAmount"]),
                                mpesaConsumerKey: fieldValues["mpesaConsumerKey"],
                                mpesaConsumerSecret: fieldValues["mpesaConsumerSecret"],
                                mpesaShortcode: fieldValues["mpesaShortcode"],
                                mpesaPasskey: fieldValues["mpesaPasskey"],
                                mpesaCallbackUrl: fieldValues["mpesaCallbackUrl"],
                                sandbox: fieldValues["mpesaSandbox"],
                              }),
                            });
                            const out = await res.json().catch(() => null);
                            if (!out || !out.ok) {
                              window.alert("STK Push failed: " + (out?.data?.errorMessage || out?.error || "Unknown"));
                            } else {
                              window.alert("STK Push Sent Successfully!");
                            }
                          } catch (err: any) {
                            window.alert("STK Push Error: " + (err?.message ?? String(err)));
                          } finally {
                            setMpesaLoading(false);
                          }
                        }}
                        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        disabled={mpesaLoading}
                      >
                        {mpesaLoading ? "Sending..." : "Send STK Push"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">Enable to configure {g.label}.</div>
              )}
            </GatewaySection>
          );
        })}
      </div>

      <footer className="flex items-center justify-between pt-4">
        <div className="text-sm text-gray-600">
          Status:{" "}
          {Object.keys(errors).length ? (
            <span className="text-red-600">Configuration incomplete</span>
          ) : (
            <span className="text-green-600">OK</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!dirty}
            className={`px-4 py-2 rounded-md text-white ${dirty ? "bg-indigo-600" : "bg-gray-300"}`}
          >
            Save
          </button>
          <button onClick={() => onChange(clone(state))} className="px-4 py-2 rounded-md border">
            Apply (emit change)
          </button>
        </div>
      </footer>
    </div>
  );
}
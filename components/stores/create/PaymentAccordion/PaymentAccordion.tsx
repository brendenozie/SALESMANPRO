"use client";

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

// -----------------------------
// Types
// -----------------------------
export interface PaymentSettings {
  id?: string | null;
  companyId?: string | null;

  isStripeEnabled?: boolean | null;
  isPaypalEnabled?: boolean | null;
  isMpesaEnabled?: boolean | null;
  isPaystackEnabled?: boolean | null;
  isGhubaEnabled?: boolean | null;

  stripePublishableKey?: string | null;
  stripeSecretKey?: string | null;

  paypalClientId?: string | null;
  paypalClientSecret?: string | null;

  mpesaShortcode?: string | null;
  mpesaConsumerKey?: string | null;
  mpesaConsumerSecret?: string | null;
  mpesaCallbackUrl?: string | null;

  paystackPublicKey?: string | null;
  paystackSecretKey?: string | null;

  ghubaMerchantId?: string | null;
  ghubaApiKey?: string | null;
}

export interface PaymentAccordionProps {
  paymentSettings: PaymentSettings | null;
  onChange: (updated: PaymentSettings) => void;
  onSave?: (payload: PaymentSettings) => Promise<void> | void;
}

// -----------------------------
// API Endpoints (Mock Realistic)
// -----------------------------
// These would normally come from env vars or config.
export const PAYMENT_TEST_ENDPOINTS = {
  stripe: "/api/payments/stripe/test",
  paypal: "/api/payments/paypal/test",
  mpesa: "/api/payments/mpesa/test",
  paystack: "/api/payments/paystack/test",
  ghuba: "/api/payments/ghuba/test",
};

// -----------------------------
// Utilities
// -----------------------------
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v ?? {}));

function validate(settings: PaymentSettings) {
  const errors: Record<string, string> = {};

  if (settings.isStripeEnabled) {
    if (!settings.stripePublishableKey) errors.stripePublishableKey = "Publishable key is required";
    // secret key optional for client-side config, but warn if missing when enabled
    if (!settings.stripeSecretKey) errors.stripeSecretKey = "(Recommended) Secret key missing — cannot perform server side actions";
  }

  if (settings.isPaystackEnabled) {
    if (!settings.paystackPublicKey) errors.paystackPublicKey = "Public key required";
    if (!settings.paystackSecretKey) errors.paystackSecretKey = "Secret key required";
  }

  if (settings.isMpesaEnabled) {
    if (!settings.mpesaShortcode) errors.mpesaShortcode = "Shortcode / Paybill required";
    if (!settings.mpesaConsumerKey) errors.mpesaConsumerKey = "Consumer key required";
    if (!settings.mpesaConsumerSecret) errors.mpesaConsumerSecret = "Consumer secret required";
    if (!settings.mpesaCallbackUrl) errors.mpesaCallbackUrl = "Callback URL required";
  }

  if (settings.isGhubaEnabled) {
    if (!settings.ghubaMerchantId) errors.ghubaMerchantId = "Ghuba merchant id required";
    if (!settings.ghubaApiKey) errors.ghubaApiKey = "Ghuba api key required";
  }

  if (settings.isPaypalEnabled) {
    if (!settings.paypalClientId) errors.paypalClientId = "Paypal client id required";
  }

  return errors;
}

// --- Test Connection Hook ---
// Generic test call wrapper
export function useTestConnection() {
  const [loading, setLoading] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<Record<string, any> | null>(null);

  const test = async (label: string, url: string, payload: any) => {
    try {
      setLoading(label);
      setResult(null);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setResult({ label, success: res.ok, response: json });
    } catch (err: any) {
      setResult({ label, success: false, response: err.message });
    } finally {
      setLoading(null);
    }
  };

  return { loading, result, test };
}

// simple debounce hook
function useDebouncedEffect(cb: () => void, deps: any[], delay = 350) {
  const t = useRef<number | undefined>();
  useEffect(() => {
    window.clearTimeout(t.current);
    t.current = window.setTimeout(cb, delay);
    return () => window.clearTimeout(t.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// -----------------------------
// Reducer for local form state (immutable)
// -----------------------------
type Action = { type: "SET"; key: keyof PaymentSettings; value: any } | { type: "REPLACE"; payload: PaymentSettings };

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

// -----------------------------
// Small presentational components (memoized)
// -----------------------------
const Toggle: React.FC<{
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = React.memo(({ id, label, description, checked, onChange }) => {
  return (
    <div className="flex items-start justify-between p-4 rounded-xl border bg-white shadow-sm">
      <div className="mr-4">
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

// --- Test Button Component ---
const TestButton: React.FC<{ loading: boolean; onClick: () => void }> = ({ loading, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="mt-3 px-4 py-2 rounded-lg text-sm font-medium border border-indigo-300 hover:bg-indigo-50 transition"
    disabled={loading}
  >
    {loading ? "Testing..." : "Test Connection"}
  </button>
);

const InputField: React.FC<{
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  type?: "text" | "password" | "url";
  onChange: (v: string) => void;
  error?: string;
  secret?: boolean;
}> = React.memo(({ id, label, value, placeholder, type = "text", onChange, error, secret }) => {
  const [reveal, setReveal] = useState(false);
  useEffect(() => setReveal(false), [value]);

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-2 relative">
        <input
          id={id}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          type={secret && !reveal ? "password" : type}
          className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${error ? "border-red-300" : "border-gray-200"}`}
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

const CopyButton: React.FC<{ content: string }> = ({ content }) => {
  const [ok, setOk] = useState<string | null>(null);
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content ?? "");
      setOk("Copied");
      window.setTimeout(() => setOk(null), 1500);
    } catch (_e) {
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

// -----------------------------
// Gateway Section (collapsible + validation aware)
// -----------------------------
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
        <div className="text-sm text-gray-600">{enabled ? "Enabled" : "Disabled"} {errorCount > 0 && <span className="ml-2 text-red-600">({errorCount} errors)</span>}</div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
};

// -----------------------------
// Main component
// -----------------------------
export default function PaymentAccordion({ paymentSettings, onChange, onSave }: PaymentAccordionProps) {
  // Local copy to edit without immediately mutating parent
  const initial = useMemo(() => clone(paymentSettings ?? {}), [paymentSettings]);
  const [state, dispatch] = useReducer(reducer, initial as PaymentSettings);

  // keep an errors map
  const errors = useMemo(() => validate(state), [state]);

  // reflect parent updates into local state
  useEffect(() => {
    dispatch({ type: "REPLACE", payload: clone(paymentSettings ?? {}) });
  }, [paymentSettings]);

  // Debounce outward onChange so parent can persist while user types
  useDebouncedEffect(
    () => {
      onChange(clone(state));
    },
    // deps
    [state],
    600
  );

  const setField = useCallback((key: keyof PaymentSettings, value: any) => {
    dispatch({ type: "SET", key, value });
  }, []);

  const handleSave = useCallback(async () => {
    if (Object.keys(errors).length) {
      // simple UX: focus first error
      const first = Object.keys(errors)[0];
      const el = document.getElementById(String(first));
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus();
      return;
    }

    if (onSave) await onSave(clone(state));
  }, [errors, onSave, state]);

  // Mocked "test connection" actions — these should be wired to real endpoints in production
  const [testing, setTesting] = useState<null | { gateway: string; result: "ok" | "failed" }>(null);
  const testGateway = useCallback(async (gateway: string) => {
    setTesting({ gateway, result: "failed" });
    // Simulate network
    await new Promise((r) => setTimeout(r, 700));
    // For demo: success when required fields present
    const pass = Object.keys(errors).length === 0;
    setTesting({ gateway, result: pass ? "ok" : "failed" });
    window.setTimeout(() => setTesting(null), 1500);
  }, [errors]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">Payment Gateway Configuration (Enterprise)</h2>
          <p className="text-sm text-gray-500">Enable gateways, enter credentials and test connections. Secrets are masked by default.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm shadow hover:bg-indigo-700"
          >
            Save
          </button>
          <button
            onClick={() => dispatch({ type: "REPLACE", payload: clone(paymentSettings ?? {}) })}
            className="px-4 py-2 rounded-md border text-sm">
            Reset
          </button>
        </div>
      </header>

      {/* Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Toggle id="t-ghuba" label="Ghuba Payments" description="Local alternative gateway (10% fee)" checked={!!state.isGhubaEnabled} onChange={(v) => setField("isGhubaEnabled", v)} />
        <Toggle id="t-stripe" label="Stripe" description="Cards, Apple/Google Pay" checked={!!state.isStripeEnabled} onChange={(v) => setField("isStripeEnabled", v)} />
        <Toggle id="t-paypal" label="PayPal" description="PayPal standard flows" checked={!!state.isPaypalEnabled} onChange={(v) => setField("isPaypalEnabled", v)} />
        <Toggle id="t-mpesa" label="M-Pesa (Daraja)" description="Mobile money (East Africa)" checked={!!state.isMpesaEnabled} onChange={(v) => setField("isMpesaEnabled", v)} />
        <Toggle id="t-paystack" label="Paystack" description="African-focused payments" checked={!!state.isPaystackEnabled} onChange={(v) => setField("isPaystackEnabled", v)} />
      </div>

      {/* Details */}
      <div className="space-y-6">
        {/* Ghuba */}
        <GatewaySection title="Ghuba" hint="Local gateway — 10% fee applies" enabled={!!state.isGhubaEnabled} errorCount={Object.keys(errors).filter(k => k.startsWith('ghuba')).length}>
          {state.isGhubaEnabled ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField id="ghubaMerchantId" label="Merchant ID" value={state.ghubaMerchantId ?? ""} onChange={(v) => setField("ghubaMerchantId", v)} placeholder="GHB12345" error={errors.ghubaMerchantId} />
              <InputField id="ghubaApiKey" label="API Key" value={state.ghubaApiKey ?? ""} onChange={(v) => setField("ghubaApiKey", v)} placeholder="secret" secret error={errors.ghubaApiKey} />
              <div className="md:col-span-2 flex gap-2">
                <button className="px-3 py-2 rounded-md border" onClick={() => testGateway('ghuba')}>{testing?.gateway === 'ghuba' ? (testing.result === 'ok' ? 'OK' : 'Testing...') : 'Test Connection'}</button>
                <div className="text-sm text-gray-500">Enabling Ghuba will deduct 10% per transaction — show in UI pricing.</div>
              </div>
            </div>
          ) : <div className="text-sm text-gray-500">Enable to configure Ghuba.</div>}
        </GatewaySection>

        {/* Stripe */}
        <GatewaySection title="Stripe" hint="Card processing and wallets" enabled={!!state.isStripeEnabled} errorCount={Object.keys(errors).filter(k => k.startsWith('stripe')).length}>
          {state.isStripeEnabled ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField id="stripePublishableKey" label="Publishable Key" value={state.stripePublishableKey ?? ""} onChange={(v) => setField("stripePublishableKey", v)} placeholder="pk_live_..." error={errors.stripePublishableKey} />
              <InputField id="stripeSecretKey" label="Secret Key (server)" value={state.stripeSecretKey ?? ""} onChange={(v) => setField("stripeSecretKey", v)} placeholder="sk_live_..." secret error={errors.stripeSecretKey} />
              <div className="md:col-span-2 flex gap-2 items-center">
                <button className="px-3 py-2 rounded-md border" onClick={() => testGateway('stripe')}>Test Connection</button>
                <div className="text-sm text-gray-500">Make sure server-side webhooks and keys are configured for full functionality.</div>
              </div>
            </div>
          ) : <div className="text-sm text-gray-500">Enable to configure Stripe</div>}
        </GatewaySection>

        {/* PayPal */}
        <GatewaySection title="PayPal" hint="PayPal REST integration" enabled={!!state.isPaypalEnabled} errorCount={Object.keys(errors).filter(k => k.startsWith('paypal')).length}>
          {state.isPaypalEnabled ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField id="paypalClientId" label="Client ID" value={state.paypalClientId ?? ""} onChange={(v) => setField("paypalClientId", v)} placeholder="client_id..." error={errors.paypalClientId} />
              <InputField id="paypalClientSecret" label="Client Secret" value={state.paypalClientSecret ?? ""} onChange={(v) => setField("paypalClientSecret", v)} placeholder="secret" secret error={errors.paypalClientSecret} />
              <div className="md:col-span-2 flex gap-2 items-center">
                <button className="px-3 py-2 rounded-md border" onClick={() => testGateway('paypal')}>Test Connection</button>
                <div className="text-sm text-gray-500">Remember to set return/cancel URLs in PayPal dashboard.</div>
              </div>
            </div>
          ) : <div className="text-sm text-gray-500">Enable to configure PayPal</div>}
        </GatewaySection>

        {/* M-Pesa */}
        <GatewaySection title="M-Pesa (Daraja)" hint="Daraja API for STK Push / C2B" enabled={!!state.isMpesaEnabled} errorCount={Object.keys(errors).filter(k => k.startsWith('mpesa')).length}>
          {state.isMpesaEnabled ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField id="mpesaShortcode" label="Shortcode / Paybill" value={state.mpesaShortcode ?? ""} onChange={(v) => setField("mpesaShortcode", v)} placeholder="600123" error={errors.mpesaShortcode} />
              <InputField id="mpesaConsumerKey" label="Consumer Key" value={state.mpesaConsumerKey ?? ""} onChange={(v) => setField("mpesaConsumerKey", v)} placeholder="consumer_key" error={errors.mpesaConsumerKey} />
              <InputField id="mpesaConsumerSecret" label="Consumer Secret" value={state.mpesaConsumerSecret ?? ""} onChange={(v) => setField("mpesaConsumerSecret", v)} placeholder="consumer_secret" secret error={errors.mpesaConsumerSecret} />
              <InputField id="mpesaCallbackUrl" label="Callback URL" value={state.mpesaCallbackUrl ?? ""} onChange={(v) => setField("mpesaCallbackUrl", v)} placeholder="https://yourdomain.com/mpesa-callback" type="url" error={errors.mpesaCallbackUrl} />

              <div className="md:col-span-2 flex gap-2 items-center">
                <button className="px-3 py-2 rounded-md border" onClick={() => testGateway('mpesa')}>Test Connection</button>
                <div className="text-sm text-gray-500">Daraja requires server-side token exchange; do not embed secrets in public code.</div>
              </div>
            </div>
          ) : <div className="text-sm text-gray-500">Enable to configure M-Pesa</div>}
        </GatewaySection>

        {/* Paystack */}
        <GatewaySection title="Paystack" hint="African payments (cards, bank)" enabled={!!state.isPaystackEnabled} errorCount={Object.keys(errors).filter(k => k.startsWith('paystack')).length}>
          {state.isPaystackEnabled ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField id="paystackPublicKey" label="Public Key" value={state.paystackPublicKey ?? ""} onChange={(v) => setField("paystackPublicKey", v)} placeholder="pk_live_..." error={errors.paystackPublicKey} />
              <InputField id="paystackSecretKey" label="Secret Key" value={state.paystackSecretKey ?? ""} onChange={(v) => setField("paystackSecretKey", v)} placeholder="sk_live_..." secret error={errors.paystackSecretKey} />
              <div className="md:col-span-2 flex gap-2 items-center">
                <button className="px-3 py-2 rounded-md border" onClick={() => testGateway('paystack')}>Test Connection</button>
                <div className="text-sm text-gray-500">Use secret key only on server-side. This client form stores settings only.</div>
              </div>
            </div>
          ) : <div className="text-sm text-gray-500">Enable to configure Paystack</div>}
        </GatewaySection>

      </div>

      <footer className="flex items-center justify-between pt-4">
        <div className="text-sm text-gray-600">Status: {Object.keys(errors).length ? <span className="text-red-600">Configuration incomplete</span> : <span className="text-green-600">OK</span>}</div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-indigo-600 text-white">Save</button>
          <button onClick={() => onChange(clone(state))} className="px-4 py-2 rounded-md border">Apply (emit change)</button>
        </div>
      </footer>
    </div>
  );
}

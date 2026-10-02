/**
 * lib/automation/playwright/secretRedaction.ts
 *
 * Strict, multi-layer secret redaction engine for SalesmanPro.
 * Ensures zero secret leakage into terminal logs, exception traces,
 * audit files, or UI state.
 */

// Common high-entropy token patterns
const SENSITIVE_PATTERNS: RegExp[] = [
  // OpenAI API Key
  /(sk-[a-zA-Z0-9_-]{20,})/g,
  // Groq API Key
  /(gsk_[a-zA-Z0-9]{30,})/g,
  // Google / Firebase API Key
  /(AIza[0-9A-Za-z-_]{35})/g,
  // Anthropic API Key
  /(sk-ant-[a-zA-Z0-9-_]{30,})/g,
  // Meta Permanent System User / Graph Access Token
  /(EAAB[0-9A-Za-z]+)/g,
  // Stripe Secret & Webhook Keys
  /(sk_live_[0-9a-zA-Z]{24,})/g,
  /(sk_test_[0-9a-zA-Z]{24,})/g,
  /(whsec_[0-9a-zA-Z]{32,})/g,
  // Paystack Secret Key
  /(sk_live_[0-9a-zA-Z]{30,})/g,
  /(sk_test_[0-9a-zA-Z]{30,})/g,
  // AWS Secret Access Key
  /([A-Za-z0-9/+=]{40})(?=\s|$|['"])/g,
  // Bearer tokens in headers
  /(Bearer\s+)[A-Za-z0-9._~+/-]+=*/gi,
  // Password in connection strings
  /(mongodb(\+srv)?:\/\/[^:]+:)([^@]+)(@)/gi,
  /(redis:\/\/[^:]*:)([^@]+)(@)/gi,
  // Generic key-value secret assignments in text
  /(password|secret|passkey|token|apiKey|access_token|consumer_secret)=([^&\s'"]+)/gi,
];

/**
 * Mask a secret value, retaining only a safe prefix/suffix indicator if appropriate,
 * or full redaction.
 */
export function maskSecret(val: string, showChars = 4): string {
  if (!val) return '[EMPTY]';
  if (val.length <= showChars * 2) {
    return '***[REDACTED]***';
  }
  return `${val.substring(0, showChars)}...[REDACTED-${val.length}-CHARS]...${val.substring(val.length - showChars)}`;
}

/**
 * Recursively sanitize an object, stripping or masking sensitive keys.
 */
export function sanitizeData(data: any, customSecrets: string[] = []): any {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    let sanitized = data;

    // Redact known custom secrets first
    for (const secret of customSecrets) {
      if (secret && secret.length > 3) {
        sanitized = sanitized.split(secret).join('[REDACTED_SECRET]');
      }
    }

    // Apply regex patterns
    for (const pattern of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, (match) => {
        if (match.toLowerCase().startsWith('bearer ')) {
          return 'Bearer [REDACTED_TOKEN]';
        }
        return '[REDACTED_CREDENTIAL]';
      });
    }

    return sanitized;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, customSecrets));
  }

  if (typeof data === 'object') {
    const cleanObj: Record<string, any> = {};
    const sensitiveKeyNames = [
      'password',
      'secret',
      'token',
      'key',
      'auth',
      'authorization',
      'cookie',
      'credential',
      'passkey',
      'private',
    ];

    for (const [k, v] of Object.entries(data)) {
      const isSensitiveKey = sensitiveKeyNames.some((sk) => k.toLowerCase().includes(sk));
      if (isSensitiveKey && typeof v === 'string') {
        cleanObj[k] = maskSecret(v);
      } else {
        cleanObj[k] = sanitizeData(v, customSecrets);
      }
    }
    return cleanObj;
  }

  return data;
}

/**
 * Sanitized log helper that prevents secrets from reaching stdout/stderr.
 */
export function safeLog(message: string, ...args: any[]): void {
  const sanitizedMsg = sanitizeData(message);
  const sanitizedArgs = args.map((arg) => sanitizeData(arg));
  console.log(`[SECURE_AUDIT] ${sanitizedMsg}`, ...sanitizedArgs);
}

/**
 * Sanitized error formatter.
 */
export function formatSafeError(err: unknown): string {
  if (err instanceof Error) {
    return sanitizeData(`${err.name}: ${err.message}`);
  }
  return sanitizeData(String(err));
}

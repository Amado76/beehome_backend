import type { Request } from 'express';

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function parseAllowlist(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((v) => normalize(v))
    .filter(Boolean);
}

// Allow only valid host header formats: hostname / IPv6-in-brackets with optional port.
const HOST_HEADER_REGEX =
  /^(?:[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*|\[[A-Fa-f0-9:]+\])(?::(?:[1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))?$/;

function parseHostHeader(value: string | undefined): string {
  const raw = value?.split(',')[0]?.trim();
  if (!raw) {
    throw new Error('Missing Host header');
  }

  // Strictly validate host header to prevent injection and encoded bypasses.
  if (!HOST_HEADER_REGEX.test(raw)) {
    throw new Error('Invalid Host header');
  }

  return raw;
}

function validateAgainstAllowlist(url: URL, allowlist: string[]): void {
  if (allowlist.length === 0) return;

  const hostname = normalize(url.hostname);
  const hostWithPort = normalize(url.host);

  const ok = allowlist.includes(hostname) || allowlist.includes(hostWithPort);
  if (!ok) {
    throw new Error(
      `Refusing to derive public base URL for non-allowlisted host (${url.host}). Set PUBLIC_BASE_URL or configure PUBLIC_BASE_HOST_ALLOWLIST.`,
    );
  }
}

/**
 * Optional override for environments where the public URL is known ahead of time
 * (e.g. staging/prod behind a reverse proxy).
 */
export function getConfiguredPublicBaseUrl(): string | undefined {
  const value = process.env.PUBLIC_BASE_URL || process.env.OPENAPI_BASE_URL;
  return value?.trim() ? value.trim().replace(/\/$/, '') : undefined;
}

/**
 * Returns a safe public base URL.
 *
 * - In non-local envs (anything except NODE_ENV=development/test), PUBLIC_BASE_URL is required.
 * - In dev/test, derives from Express request values, and validates host against an allowlist.
 * - Does NOT read x-forwarded-* headers directly; Express will only honor them when trust proxy is enabled.
 */
export function getPublicBaseUrl(req: Request): string {
  const configured = getConfiguredPublicBaseUrl();
  if (configured) return configured;

  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isLocalEnv = nodeEnv === 'development' || nodeEnv === 'test';

  if (!isLocalEnv) {
    throw new Error(
      'PUBLIC_BASE_URL is required in non-local environments to avoid host/proxy header injection',
    );
  }

  const hostHeader = parseHostHeader(req.get('host') ?? undefined);
  const protocol = req.protocol;

  const url = new URL(`${protocol}://${hostHeader}`);

  const allowlistFromEnv = parseAllowlist(process.env.PUBLIC_BASE_HOST_ALLOWLIST);
  const defaultLocalAllowlist = ['localhost', '127.0.0.1', '::1'];
  const allowlist = allowlistFromEnv.length > 0 ? allowlistFromEnv : defaultLocalAllowlist;

  validateAgainstAllowlist(url, allowlist);
  return url.toString().replace(/\/$/, '');
}

// Backwards compatible name (older call sites).
export const derivePublicBaseUrlFromRequest = getPublicBaseUrl;

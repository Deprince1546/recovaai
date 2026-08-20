/** Canonical public origin, used for absolute social-preview URLs. */
export const SITE_URL = (
  import.meta.env["VITE_SITE_URL"] ?? "https://recova.lovable.app"
).replace(/\/$/, "");

export const OG_IMAGE = `${SITE_URL}/recova-og.jpg`;

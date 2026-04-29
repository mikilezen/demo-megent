export const SESSION_COOKIE_NAME = "megent-session";

export type DemoSession = {
  email: string;
  signedInAt: string;
};

export function buildSessionCookie(session: DemoSession) {
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(session))}; Path=/; Max-Age=604800; SameSite=Lax`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
/**
 * Auth.js requires a secret for JWT/session cookies. Set `AUTH_SECRET` or
 * `NEXTAUTH_SECRET` in `.env`. In development, a placeholder is used when
 * neither is set so local `npm run dev` works without MissingSecret errors.
 */
export function getAuthSecret(): string | undefined {
  return (
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "dev-placeholder-secret-set-NEXTAUTH_SECRET-in-dotenv"
      : undefined)
  );
}

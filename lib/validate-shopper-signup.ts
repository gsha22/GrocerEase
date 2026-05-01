import { safeCallbackPath } from "@/lib/safe-callback-path";

export type ShopperSignupInput = {
  email: string;
  password: string;
  name: string;
  callbackUrl: string;
};

export type ShopperSignupValidationResult =
  | { ok: true; data: ShopperSignupInput }
  | { ok: false; errors: Record<string, string> };

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?=[^@]*\.[a-zA-Z]{2,}$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function validateShopperSignup(body: unknown): ShopperSignupValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, errors: { form: "Invalid JSON body." } };
  }

  const input = body as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const rawName = typeof input.name === "string" ? input.name.trim() : "";
  if (!rawName) {
    errors.name = "Name is required.";
  } else if (rawName.length > 120) {
    errors.name = "Name must be at most 120 characters.";
  }

  const rawEmail =
    typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (!rawEmail) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(rawEmail)) {
    errors.email = "Enter a valid email address.";
  }

  const password = typeof input.password === "string" ? input.password : "";
  if (!password) {
    errors.password = "Password is required.";
  } else {
    const pwdReqs: string[] = [];
    if (password.length < 8) pwdReqs.push("be at least 8 characters");
    if (!/[a-zA-Z]/.test(password)) pwdReqs.push("include at least one letter");
    if (!/[0-9]/.test(password)) pwdReqs.push("include at least one number");
    if (pwdReqs.length) {
      errors.password = `Password must ${pwdReqs.join(", ")}.`;
    }
  }

  const confirmPassword =
    typeof input.confirmPassword === "string" ? input.confirmPassword : "";
  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  const callbackUrl = safeCallbackPath(
    typeof input.callbackUrl === "string" ? input.callbackUrl : undefined,
    "/",
  );

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      email: rawEmail,
      password,
      name: rawName,
      callbackUrl,
    },
  };
}

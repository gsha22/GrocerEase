import { safeCallbackPath } from "@/lib/safe-callback-path";

export type OwnerSignupInput = {
  email: string;
  password: string;
  name: string;
  /** Same-origin path only; defaults to /owner-dashboard */
  callbackUrl: string;
};

export type SignupValidationResult =
  | { ok: true; data: OwnerSignupInput }
  | { ok: false; errors: Record<string, string> };

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function validateSignupInput(
  body: unknown,
  defaultCallbackPath: string = "/owner-dashboard",
): SignupValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, errors: { form: "Invalid JSON body." } };
  }

  const input = body as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const rawName =
    typeof input.name === "string" ? input.name.trim() : "";
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

  const password =
    typeof input.password === "string" ? input.password : "";
  if (!password) {
    errors.password = "Password is required.";
  } else {
    const pwdReqs: string[] = [];
    if (password.length < 8) pwdReqs.push("be at least 8 characters");
    if (!/[a-zA-Z]/.test(password)) pwdReqs.push("include at least one letter");
    if (!/[0-9]/.test(password)) pwdReqs.push("include at least one number");
    if (pwdReqs.length > 0) {
      errors.password =
        pwdReqs.length === 1
          ? `Password must ${pwdReqs[0]}.`
          : `Password must ${pwdReqs.slice(0, -1).join(", ")}, and ${pwdReqs[pwdReqs.length - 1]}.`;
    }
  }

  const confirm =
    typeof input.confirmPassword === "string" ? input.confirmPassword : "";
  if (!confirm) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password && confirm !== password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const callbackUrl = safeCallbackPath(
    typeof input.callbackUrl === "string" ? input.callbackUrl : undefined,
    defaultCallbackPath,
  );

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

// Backward-compatible alias while call sites migrate.
export const validateOwnerSignup = validateSignupInput;

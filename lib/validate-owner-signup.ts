export type OwnerSignupInput = {
  email: string;
  password: string;
  name: string;
};

export type SignupValidationResult =
  | { ok: true; data: OwnerSignupInput }
  | { ok: false; errors: Record<string, string> };

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function validateOwnerSignup(body: unknown): SignupValidationResult {
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
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    } else if (!/[a-zA-Z]/.test(password)) {
      errors.password = "Password must include at least one letter.";
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Password must include at least one number.";
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

  return {
    ok: true,
    data: {
      email: rawEmail,
      password,
      name: rawName,
    },
  };
}

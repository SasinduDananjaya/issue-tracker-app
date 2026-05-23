import { z } from "zod";

//auth DTOs for validating incoming data from auth controller
export const RegisterDTO = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long (max 100 chars)").trim(),
  email: z.string().email("Invalid email address").max(254, "Email is too long (max 254 chars)").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long (max 128 chars)")
    .refine((v) => !/\s/.test(v), "Password cannot contain spaces")
    .refine((v) => /[A-Z]/.test(v), "Password must contain at least one uppercase letter")
    .refine((v) => /[a-z]/.test(v), "Password must contain at least one lowercase letter")
    .refine((v) => /[0-9]/.test(v), "Password must contain at least one number")
    .refine((v) => /[^A-Za-z0-9]/.test(v), "Password must contain at least one special character"),
  companyCode: z.string().max(20, "Company code is too long (max 20 chars)").trim().optional(),
});

export const LoginDTO = z.object({
  email: z.string().email("Invalid email address").max(254, "Email is too long (max 254 chars)").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long (max 128 chars)")
    .refine((v) => !/\s/.test(v), "Password cannot contain spaces"),
});

export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(source === "query" ? req.query : req.body);
    if (!result.success) {
      return next(result.error);
    }
    if (source === "query") {
      Object.defineProperty(req, "query", { value: result.data, writable: true, configurable: true });
    } else {
      req.body = result.data;
    }
    next();
  };

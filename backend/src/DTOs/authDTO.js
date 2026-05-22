import { z } from "zod";

//auth DTOs for validating incoming data from auth controller
export const RegisterDTO = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginDTO = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
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

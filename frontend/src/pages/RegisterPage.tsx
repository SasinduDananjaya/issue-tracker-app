import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register as registerUser } from "@/api/authApi";
import { useAuthStore } from "@/store/authStore";
import AuthLayout from "@/layout/AuthLayout";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyCode?: string;
}

//register page with form to enter name, email, password and confirm password
const RegisterPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterFormValues>({ mode: "onChange" });

  const onSubmit = async ({ name, email, password, companyCode }: RegisterFormValues) => {
    try {
      const { user, accessToken } = await registerUser(name, email, password, companyCode || undefined);
      setAuth(user, accessToken);
      navigate("/issues");

      if (!companyCode) {
        toast.success("Account created!", {
          description: `Your company code is ${user.organizationCode} - share it with teammates so they can join.`,
          duration: 10000,
          action: { label: "Copy", onClick: () => navigator.clipboard.writeText(user.organizationCode) },
          actionButtonStyle: { backgroundColor: "oklch(0.563 0.17 136.27)", color: "white" },
        });
      } else {
        toast.success("Joined team successfully!");
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Registration failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
        <h2 className="text-xl font-semibold text-primary-900 mb-6">Get started</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* name field */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              {...register("name", {
                required: "Name is required",
                maxLength: { value: 100, message: "Name is too long" },
                setValueAs: (v) => v.trim(),
              })}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* email field */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                maxLength: { value: 254, message: "Email is too long" },
                setValueAs: (v) => v.trim().toLowerCase(),
              })}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* company code field */}
          <div className="space-y-1.5">
            <Label htmlFor="companyCode">
              Company code <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="companyCode"
              type="text"
              placeholder="Your team's code or leave blank to create new"
              autoComplete="off"
              {...register("companyCode", {
                maxLength: { value: 20, message: "Company code is too long. maximum 20 characters allowed." },
                setValueAs: (v) => v?.trim(),
              })}
            />
            {errors.companyCode && <p className="text-xs text-red-500">{errors.companyCode.message}</p>}
          </div>

          {/* password field */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className="pr-10"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Minimum 8 characters" },
                  maxLength: { value: 128, message: "Password is too long" },
                  validate: (v) => {
                    if (/\s/.test(v)) return "Password cannot contain spaces";
                    if (!/[A-Z]/.test(v)) return "Must contain at least one uppercase letter";
                    if (!/[a-z]/.test(v)) return "Must contain at least one lowercase letter";
                    if (!/[0-9]/.test(v)) return "Must contain at least one number";
                    if (!/[^A-Za-z0-9]/.test(v)) return "Must contain at least one special character";
                    return true;
                  },
                })}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {/* confirm password field */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (v) => {
                  if (/\s/.test(v)) return "Password cannot contain spaces";
                  return v === watch("password") || "Passwords do not match";
                },
              })}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          {/* register btn */}
          <Button type="submit" className="w-full bg-primary hover:bg-primary-700 text-white" disabled={isSubmitting || !isValid}>
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default RegisterPage;

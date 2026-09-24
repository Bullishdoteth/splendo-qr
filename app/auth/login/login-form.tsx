"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth/auth-client";
import { Lock, Mail, Eye, EyeOff, Loader2, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      await signIn.email(
        {
          email,
          password,
          rememberMe: rememberMe,
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            setIsLoading(false);
            setSuccess("Authentication successful! Redirecting...");
            setTimeout(() => {
              router.push("/admin/overview");
            }, 600);
          },
          onError: (ctx) => {
            setIsLoading(false);
            setError(ctx.error.message || "Invalid credentials.");
          },
        }
      );
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || "An error occurred connecting to authentication services.");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto font-sans">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Splendo
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mt-1 font-medium">
          Hotel Staff Portal
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white border border-[#E2E2DC] rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Notifications */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@splendohotels.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#E2E2DC] rounded-xl text-stone-900 placeholder:text-stone-400 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-9 py-2.5 bg-[#FAF9F5] border border-[#E2E2DC] rounded-xl text-stone-900 placeholder:text-stone-400 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl text-xs tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Sign In to Portal</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#E2E2DC] text-center">
          <p className="text-[11px] text-stone-400">
            Splendo Hotel & Suites Encrypted Portal
          </p>
        </div>
      </div>
    </div>
  );
}

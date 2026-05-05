"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LookerIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8">
    <circle cx="12" cy="12" r="10" fill="#4285F4"/>
    <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" fill="none"/>
  </svg>
);

const SheetsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" fill="#0F9D58"/>
    <path d="M14 2v6h6" fill="#87CEAC"/>
    <path d="M8 13h8v1H8zm0 2h8v1H8zm0 2h5v1H8z" fill="white"/>
  </svg>
);

const BigQueryIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8">
    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#4285F4"/>
    <path d="M2 17l10 5 10-5" stroke="#4285F4" strokeWidth="2" fill="none"/>
    <path d="M2 12l10 5 10-5" stroke="#4285F4" strokeWidth="2" fill="none"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-foreground">DataProFlow</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer mb-6"
          >
            <GoogleIcon />
            <span className="font-medium text-foreground">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-muted-foreground">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="john@company.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="relative z-10 flex flex-col items-center justify-center p-12 w-full">
          {/* Connections Visual */}
          <div className="relative mb-12">
            {/* Center Logo */}
            <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center shadow-2xl">
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            
            {/* Orbiting Icons */}
            <div className="absolute -top-8 -left-8 w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center animate-pulse">
              <LookerIcon />
            </div>
            <div className="absolute -top-8 -right-8 w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center animate-pulse" style={{ animationDelay: '0.5s' }}>
              <SheetsIcon />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center animate-pulse" style={{ animationDelay: '1s' }}>
              <BigQueryIcon />
            </div>
            
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ transform: 'scale(2)' }}>
              <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="#7C3AED" strokeWidth="1" strokeDasharray="4" opacity="0.3" />
              <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="#7C3AED" strokeWidth="1" strokeDasharray="4" opacity="0.3" />
              <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#7C3AED" strokeWidth="1" strokeDasharray="4" opacity="0.3" />
            </svg>
          </div>

          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Your data, connected
            </h2>
            <p className="text-muted-foreground mb-8">
              Access all your marketing data in one place. Connect to 20+ sources and export to your favorite tools.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">20+</p>
                <p className="text-sm text-muted-foreground">Data Sources</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">10K+</p>
                <p className="text-sm text-muted-foreground">Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">99.9%</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

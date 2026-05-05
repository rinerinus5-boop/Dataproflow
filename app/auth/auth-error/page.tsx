import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-secondary/30">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Authentication Error
        </h1>
        <p className="text-muted-foreground mb-8">
          There was a problem verifying your email or logging you in. The link may have expired or already been used.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
          >
            Try Login Again
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 border border-border text-foreground font-medium rounded-xl hover:bg-secondary transition-colors"
          >
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
}

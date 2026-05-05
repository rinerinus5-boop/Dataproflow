import Link from "next/link";
import { AlertTriangle, Mail, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Account Suspended | DataProFlow",
  description: "Your account has been temporarily suspended.",
};

export default function AccountSuspendedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-900">DataProFlow</span>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-amber-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Account Temporarily On Hold
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your account has been temporarily suspended. This may be due to a billing issue, 
          policy violation, or administrative action. Please contact our support team to 
          resolve this matter.
        </p>

        {/* Contact Card */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Our support team is here to help you get back on track.
          </p>
          <a
            href="mailto:support@dataproflow.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Contact Support
          </a>
        </div>

        {/* Additional Info */}
        <div className="text-sm text-gray-500 mb-6">
          <p>Reference your account email when contacting support.</p>
          <p className="mt-1">Response time: Within 24 hours</p>
        </div>

        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

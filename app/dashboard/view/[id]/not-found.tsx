import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Dashboard Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The dashboard you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#7a71eb] text-white rounded-xl font-medium hover:bg-[#6b63d9] transition-colors cursor-pointer"
        >
          Generate New Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

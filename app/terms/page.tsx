import Link from "next/link";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Breadcrumb from "../components/ui/Breadcrumb";

export const metadata = {
  title: "Terms of Service",
  description: "DataProFlow Terms of Service - The terms and conditions for using our platform.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="pt-20 md:pt-24">
        {/* Breadcrumb */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: "Terms of Service" }]} />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: February 22, 2026</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using DataProFlow&apos;s services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                DataProFlow provides a marketing analytics platform that allows users to connect various data sources, visualize marketing data, and generate reports. Our services include data connectors, dashboard creation, and data export capabilities.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Account Registration</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You must notify us immediately of any unauthorized access to your account</li>
                <li>You must be at least 18 years old to use our services</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Subscription and Billing</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Paid subscriptions are billed in advance on a monthly or annual basis</li>
                <li>You may cancel your subscription at any time</li>
                <li>Refunds are provided in accordance with our refund policy</li>
                <li>We reserve the right to change our pricing with 30 days notice</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Use the service for any illegal purpose</li>
                <li>Violate any third-party rights</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Resell or redistribute the service without authorization</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, features, and functionality of DataProFlow are owned by us and are protected by international copyright, trademark, and other intellectual property laws. You retain ownership of your data.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Data and Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of DataProFlow is also governed by our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                . By using our services, you consent to our collection and use of data as described therein.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                DataProFlow shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account at any time for violations of these terms. Upon termination, your right to use the service will cease immediately.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about these Terms of Service, please contact us at{" "}
                <Link href="mailto:legal@dataproflow.com" className="text-primary hover:underline">
                  legal@dataproflow.com
                </Link>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

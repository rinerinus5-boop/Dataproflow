import Link from "next/link";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Breadcrumb from "../components/ui/Breadcrumb";

export const metadata = {
  title: "Privacy Policy",
  description: "DataProFlow Privacy Policy - How we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="pt-20 md:pt-24">
        {/* Breadcrumb */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: "Privacy Policy" }]} />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: February 22, 2026</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                DataProFlow (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our marketing analytics platform.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">Personal Information</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Name and email address when you create an account</li>
                <li>Billing information when you subscribe to a paid plan</li>
                <li>Profile information you choose to provide</li>
              </ul>
              <h3 className="text-xl font-medium text-foreground mb-3">Usage Data</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Log data including IP address, browser type, and pages visited</li>
                <li>Device information and operating system</li>
                <li>Analytics data about how you use our platform</li>
              </ul>
              <h3 className="text-xl font-medium text-foreground mb-3">Third-Party Data</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Marketing data from connected platforms (Meta, Google, TikTok, etc.)</li>
                <li>This data is processed according to each platform&apos;s terms of service</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>To provide and maintain our services</li>
                <li>To process your transactions and manage your account</li>
                <li>To send you service-related communications</li>
                <li>To improve our platform and develop new features</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Sharing</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell your personal information. We may share your data with:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Service providers who assist in operating our platform</li>
                <li>Legal authorities when required by law</li>
                <li>Business partners with your consent</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your data. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at{" "}
                <Link href="mailto:privacy@dataproflow.com" className="text-primary hover:underline">
                  privacy@dataproflow.com
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

import Link from "next/link";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Breadcrumb from "../components/ui/Breadcrumb";

export const metadata = {
  title: "Cookie Policy",
  description: "DataProFlow Cookie Policy - How we use cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <main className="pt-20 md:pt-24">
        {/* Breadcrumb */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: "Cookie Policy" }]} />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-foreground mb-8">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: February 22, 2026</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. What Are Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences and improve your browsing experience.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">DataProFlow uses cookies for the following purposes:</p>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Essential Cookies</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and account access.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3">Analytics Cookies</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use analytics cookies to understand how visitors interact with our website. This helps us improve our services and user experience.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3">Functional Cookies</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These cookies remember your preferences and settings to provide a more personalized experience.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3">Marketing Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">
                These cookies track your online activity to help advertisers deliver more relevant advertising or to limit how many times you see an ad.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Third-Party Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some cookies are placed by third-party services that appear on our pages. We use services from Google Analytics, Intercom, and other providers to enhance your experience.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Managing Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You can control and manage cookies in various ways:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Browser settings: Most browsers allow you to refuse or delete cookies</li>
                <li>Our cookie preferences: Use our cookie consent banner to manage preferences</li>
                <li>Third-party opt-outs: Visit individual third-party websites to opt out of their cookies</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Cookie Duration</h2>
              <p className="text-muted-foreground leading-relaxed">
                Session cookies are deleted when you close your browser. Persistent cookies remain on your device for a set period or until you delete them manually.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Updates to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about our use of cookies, please contact us at{" "}
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

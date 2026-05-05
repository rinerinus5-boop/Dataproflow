import Link from "next/link";
import { Users, Target, Zap, Globe } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Breadcrumb from "../components/ui/Breadcrumb";

export const metadata = {
  title: "About Us",
  description: "Learn about DataProFlow - Our mission, team, and values.",
};

const values = [
  {
    icon: Target,
    title: "Customer First",
    description: "We build everything with our customers in mind. Your success is our success.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "We constantly push boundaries to deliver cutting-edge analytics solutions.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "We believe in the power of teamwork, both internally and with our customers.",
  },
  {
    icon: Globe,
    title: "Transparency",
    description: "We maintain open communication and honest relationships with all stakeholders.",
  },
];

const team = [
  {
    name: "Sarah Johnson",
    role: "CEO & Co-Founder",
    image: "/team/sarah.jpg",
    initials: "SJ",
  },
  {
    name: "Michael Chen",
    role: "CTO & Co-Founder",
    image: "/team/michael.jpg",
    initials: "MC",
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Product",
    image: "/team/emily.jpg",
    initials: "ER",
  },
  {
    name: "David Kim",
    role: "Head of Engineering",
    image: "/team/david.jpg",
    initials: "DK",
  },
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "50M+", label: "Data Points Processed" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-20 md:pt-24 animate-fade-in">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: "About Us" }]} />
        </div>

        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Empowering Marketers with <span className="text-primary">Data</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              We&apos;re on a mission to make marketing analytics accessible, actionable, and affordable for businesses of all sizes.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-6">
                DataProFlow was founded in 2023 by a team of marketers and engineers who were frustrated with the complexity of existing analytics tools. We saw teams spending hours manually pulling data from different platforms, struggling to create cohesive reports, and missing out on valuable insights.
              </p>
              <p className="mb-6">
                We believed there had to be a better way. So we built DataProFlow - a platform that connects all your marketing data sources in minutes, not months. No coding required, no expensive consultants needed.
              </p>
              <p>
                Today, DataProFlow helps thousands of marketers and agencies save time, make better decisions, and prove the ROI of their marketing efforts. And we&apos;re just getting started.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</p>
                  <p className="text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <div key={value.title} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Meet Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member) => (
                <div key={member.name} className="bg-white rounded-2xl p-6 text-center border border-border">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                    {member.initials}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{member.name}</h3>
                  <p className="text-muted-foreground text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to get started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of marketers who trust DataProFlow for their analytics needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-primary rounded-full hover:bg-primary/90 transition-all duration-200 cursor-pointer"
              >
                Start Free Trial
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-foreground border border-border rounded-full hover:bg-secondary transition-all duration-200 cursor-pointer"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

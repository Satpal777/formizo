"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, HelpCircle, ArrowLeft, Sparkles, Zap, Shield, Globe, Lock, Mail, X } from "lucide-react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const plans = [
    {
      name: "Developer Free",
      description: "For developers and hobbyists building simple forms.",
      price: {
        monthly: 0,
        yearly: 0,
      },
      features: [
        "Up to 10 active forms",
        "100 submissions / month",
        "5MB maximum file upload",
        "Formizo branding on forms",
        "Standard templates & themes",
        "Community Discord support",
      ],
      cta: "Start for Free",
      href: "/",
      popular: false,
      icon: Zap,
      color: "from-gray-500 to-slate-400",
    },
    {
      name: "Pro Plan",
      description: "For teams and businesses looking for unlimited forms and branding.",
      price: {
        monthly: 19,
        yearly: 15,
      },
      features: [
        "Unlimited active forms",
        "Unlimited submissions",
        "1GB maximum file upload",
        "Complete white-label (No branding)",
        "Webhook & API integrations",
        "Custom domains (forms.yourdomain.com)",
        "Password protected forms",
        "Priority 24/7 support",
      ],
      cta: "Upgrade to Pro",
      href: "/upgrade",
      popular: true,
      icon: Sparkles,
      color: "from-blue-600 to-indigo-500",
    },
  ];

  const comparisonTable = [
    { feature: "Active Forms", free: "10 forms", pro: "Unlimited" },
    { feature: "Monthly Submissions", free: "100 / mo", pro: "Unlimited" },
    { feature: "Max File Upload Size", free: "5 MB", pro: "1 GB" },
    {
      feature: "Custom Branding",
      free: (
        <span className="flex items-center gap-1.5">
          <X className="size-4 text-[#f48771] shrink-0" />
          <span>Formizo badge</span>
        </span>
      ),
      pro: (
        <span className="flex items-center gap-1.5 text-white font-semibold">
          <Check className="size-4 text-[#89d185] shrink-0" />
          <span>Remove branding</span>
        </span>
      ),
    },
    {
      feature: "Webhooks & API",
      free: <X className="size-4 text-[#f48771] shrink-0" />,
      pro: (
        <span className="flex items-center gap-1.5 text-white font-semibold">
          <Check className="size-4 text-[#89d185] shrink-0" />
          <span>Unlimited endpoints</span>
        </span>
      ),
    },
    {
      feature: "Custom Domains",
      free: <X className="size-4 text-[#f48771] shrink-0" />,
      pro: (
        <span className="flex items-center gap-1.5 text-white font-semibold">
          <Check className="size-4 text-[#89d185] shrink-0" />
          <span>Enabled</span>
        </span>
      ),
    },
    {
      feature: "Password Protection",
      free: <X className="size-4 text-[#f48771] shrink-0" />,
      pro: (
        <span className="flex items-center gap-1.5 text-white font-semibold">
          <Check className="size-4 text-[#89d185] shrink-0" />
          <span>Enabled</span>
        </span>
      ),
    },
    { feature: "Support", free: "Community Discord", pro: "24/7 Priority Support" },
  ];

  const faqs = [
    {
      q: "What happens if I exceed 10 forms on the Free Plan?",
      a: "You won't be able to create new forms beyond the 10-form limit. You can delete old forms or upgrade to the Pro plan to lift all restrictions.",
    },
    {
      q: "How does the custom domain feature work?",
      a: "Pro users can link their custom domains (e.g., forms.mycompany.com) by adding a CNAME record to their DNS settings. All forms will then serve from your own branded URL.",
    },
    {
      q: "Can I cancel my plan at any time?",
      a: "Yes, you can cancel your subscription at any time from your account settings page. You will retain Pro features until the end of your billing cycle.",
    },
    {
      q: "Are submissions stored securely?",
      a: "Absolutely. All submissions are encrypted at rest and in transit. Pro users can also enable end-to-end password protection on their forms.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#121214] text-[#cccccc] selection:bg-[#264f78]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#2b2b2b] bg-[#1a1a1c]/80 px-6 backdrop-blur-md">
        <Link
          href="/"
          className="flex items-center gap-2 text-[12px] font-medium text-[#9d9d9d] transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to Workspace
        </Link>
        <span className="text-[13px] font-bold tracking-wider text-white uppercase">Formizo Pricing</span>
        <div className="w-24" /> {/* Spacer */}
      </header>

      {/* Main Pricing Content */}
      <main className="mx-auto max-w-5xl px-6 py-12 md:py-20">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-[36px] font-semibold text-white md:text-[44px]">
            Simple, Developer-First Pricing
          </h1>
          <p className="mt-3 text-[14px] text-[#9d9d9d] md:text-[16px] max-w-xl mx-auto">
            Build markdown-backed forms instantly. Start for free and upgrade as your projects grow.
          </p>

          {/* Toggle Billing */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#2b2b2b] bg-[#1e1e20] p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-full px-4 py-1.5 text-[12px] font-semibold transition ${
                billingCycle === "monthly"
                  ? "bg-[#0e639c] text-white"
                  : "text-[#858585] hover:text-[#cccccc]"
              }`}
              type="button"
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`relative rounded-full px-4 py-1.5 text-[12px] font-semibold transition ${
                billingCycle === "yearly"
                  ? "bg-[#0e639c] text-white"
                  : "text-[#858585] hover:text-[#cccccc]"
              }`}
              type="button"
            >
              Yearly (Save 20%)
              <span className="absolute -top-3 -right-6 rounded-full bg-[#89d185]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#89d185] border border-[#89d185]/30">
                Discount
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 max-w-3xl mx-auto items-stretch">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = billingCycle === "yearly" ? plan.price.yearly : plan.price.monthly;

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-[8px] border bg-[#1a1a1c] p-6 transition duration-200 hover:border-[#4c4c4c] ${
                  plan.popular
                    ? "border-[#0078d4] ring-1 ring-[#0078d4]/30 shadow-[0_0_24px_rgba(0,120,212,0.15)]"
                    : "border-[#2b2b2b]"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-6 rounded-full bg-[#0078d4]/20 border border-[#0078d4]/30 px-2.5 py-0.5 text-[10px] font-semibold text-[#3794ff]">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-3">
                    <div className={`rounded-md bg-gradient-to-br ${plan.color} p-2 text-white`}>
                      <Icon className="size-5" />
                    </div>
                    <h2 className="text-[18px] font-semibold text-white">{plan.name}</h2>
                  </div>

                  <p className="mt-3 text-[12px] leading-relaxed text-[#9d9d9d]">{plan.description}</p>

                  <div className="mt-5 flex items-baseline gap-1 text-white">
                    <span className="text-[36px] font-semibold">$</span>
                    <span className="text-[48px] font-bold tracking-tight">{price}</span>
                    <span className="text-[12px] text-[#858585]">
                      {plan.price.monthly === 0 ? "" : billingCycle === "yearly" ? "/ mo, billed yearly" : "/ mo"}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="my-6 border-b border-[#2b2b2b]" />

                  {/* Features */}
                  <ul className="space-y-3.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-[12px] text-[#cfcfcf]">
                        <Check className="size-4 shrink-0 text-[#89d185]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => {
                      const selectedPlan = plan.name.toLowerCase().includes("pro") ? "pro" : "free";
                      localStorage.setItem("formizo_plan", selectedPlan);
                      window.location.href = "/";
                    }}
                    className={`block w-full rounded-[4px] py-2.5 text-center text-[12px] font-semibold transition cursor-pointer ${
                      plan.popular
                        ? "bg-[#0e639c] text-white hover:bg-[#1177bb] shadow-lg shadow-[#0e639c]/20"
                        : "border border-[#3c3c3c] text-white hover:bg-[#2a2d2e]"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Section */}
        <section className="mt-20 border-t border-[#2b2b2b] pt-16">
          <h2 className="text-center text-[22px] font-semibold text-white">Compare Plan Features</h2>
          <p className="mt-2 text-center text-[13px] text-[#9d9d9d]">Detailed breakdown of plan capabilities.</p>

          <div className="mt-10 overflow-hidden rounded-[8px] border border-[#2b2b2b]">
            <table className="w-full border-collapse text-left text-[12px]">
              <thead>
                <tr className="bg-[#1a1a1c] border-b border-[#2b2b2b]">
                  <th className="py-3 px-4 font-bold text-white uppercase text-[10px] tracking-wider">Features</th>
                  <th className="py-3 px-4 font-bold text-white uppercase text-[10px] tracking-wider w-1/3">Free</th>
                  <th className="py-3 px-4 font-bold text-white uppercase text-[10px] tracking-wider w-1/3">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2b2b2b]">
                {comparisonTable.map((row) => (
                  <tr key={row.feature} className="odd:bg-[#151517] even:bg-[#121214] hover:bg-[#1a1a1c] transition">
                    <td className="py-3 px-4 text-white font-medium">{row.feature}</td>
                    <td className="py-3 px-4 text-[#9d9d9d]">{row.free}</td>
                    <td className="py-3 px-4 text-[#d4d4d4] font-semibold">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20 border-t border-[#2b2b2b] pt-16">
          <h2 className="text-center text-[22px] font-semibold text-white">Frequently Asked Questions</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-[8px] border border-[#2b2b2b] bg-[#1a1a1c] p-5">
                <h3 className="flex items-start gap-2 text-[13px] font-semibold text-white leading-relaxed">
                  <HelpCircle className="size-4 shrink-0 text-[#3794ff] mt-0.5" />
                  {faq.q}
                </h3>
                <p className="mt-2.5 pl-6 text-[12px] leading-relaxed text-[#9d9d9d]">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2b2b2b] bg-[#1a1a1c] py-8 text-center text-[11px] text-[#858585]">
        <p>© {new Date().getFullYear()} Formizo SaaS. All rights reserved.</p>
        <p className="mt-1 text-[#555555]">Built for developers who value performance and accessibility.</p>
      </footer>
    </div>
  );
}

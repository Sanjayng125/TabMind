import Link from "next/link";
import { FEATURES, PLANS, STEPS } from "@/lib/constants";

export default async function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0D] text-white">
      <main className="pt-14">
        {/* HERO */}
        <section className="max-w-6xl mx-auto px-6 pt-28 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-xs text-zinc-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            AI-powered tab management
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white leading-tight mb-6">
            You have 47 tabs open.
            <br />
            <span className="text-zinc-500">We'll remember them all.</span>
          </h1>

          <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            TabMind saves every browser tab, summarises it with AI, and lets you
            find anything instantly — even weeks later.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signin"
              className="bg-white text-black font-medium px-6 py-3 rounded-xl hover:bg-zinc-100 transition text-sm w-full sm:w-auto text-center"
            >
              Get started free →
            </Link>
            <a
              href="#how-it-works"
              className="text-zinc-400 hover:text-white px-6 py-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition text-sm w-full sm:w-auto text-center"
            >
              See how it works
            </a>
          </div>

          {/* Hero visual */}
          <div className="mt-16 relative">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl mx-auto text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <div className="flex-1 bg-zinc-800 rounded-md h-6 ml-2" />
              </div>
              {[
                {
                  tag: "nextjs",
                  title: "Next.js App Router docs",
                  summary:
                    "Official docs for Next.js 14 App Router, layouts, and server components",
                },
                {
                  tag: "design",
                  title: "Linear – Issue tracking",
                  summary:
                    "Project management tool built for modern software teams",
                },
                {
                  tag: "ai",
                  title: "Gemini API – Google AI Studio",
                  summary:
                    "Free AI API with 1500 requests/day for generative AI features",
                },
              ].map((tab, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 py-3 border-b border-zinc-800 last:border-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm shrink-0">
                    🌐
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">
                      {tab.title}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5 truncate">
                      {tab.summary}
                    </div>
                  </div>
                  <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded-full shrink-0">
                    {tab.tag}
                  </span>
                </div>
              ))}
            </div>
            {/* Glow */}
            <div className="absolute inset-0 bg-indigo-600/5 rounded-2xl blur-3xl -z-10" />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="border-t border-zinc-900 py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">
                How it works
              </p>
              <h2 className="text-3xl font-bold text-white">
                Up and running in 60 seconds
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((step) => (
                <div key={step.number} className="relative">
                  <div className="text-4xl font-black text-zinc-800 mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-white font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="border-t border-zinc-900 py-24" id="features">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">
                Features
              </p>
              <h2 className="text-3xl font-bold text-white">
                Everything you need
              </h2>
              <p className="text-zinc-500 text-sm mt-3 max-w-md mx-auto">
                No clutter, no complexity. Just the tools that actually help you
                stay organised.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-900">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="bg-[#0A0A0D] p-8 hover:bg-zinc-900/50 transition"
                >
                  <div className="text-2xl mb-4">{f.icon}</div>
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="border-t border-zinc-900 py-24" id="pricing">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">
                Pricing
              </p>
              <h2 className="text-3xl font-bold text-white">
                Simple, honest pricing
              </h2>
              <p className="text-zinc-500 text-sm mt-3">
                Start free. Upgrade when you need more.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-8 flex flex-col justify-between gap-6 ${
                    plan.highlight
                      ? "bg-white text-black"
                      : "bg-zinc-900 border border-zinc-800 text-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-semibold ${plan.highlight ? "text-black" : "text-white"}`}
                      >
                        {plan.name}
                      </span>
                      {plan.highlight && (
                        <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-3">
                      <span className="text-4xl font-black">{plan.price}</span>
                      <span
                        className={`text-sm ${plan.highlight ? "text-zinc-600" : "text-zinc-500"}`}
                      >
                        /{plan.period}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-1 ${plan.highlight ? "text-zinc-600" : "text-zinc-500"}`}
                    >
                      {plan.desc}
                    </p>
                  </div>

                  <ul className="flex flex-col gap-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <svg
                          className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-black" : "text-indigo-400"}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`text-center text-sm font-medium py-2.5 rounded-xl transition ${
                      plan.highlight
                        ? "bg-black text-white hover:bg-zinc-800"
                        : "bg-zinc-800 text-white hover:bg-zinc-700"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-zinc-900 py-24">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Stop losing tabs forever.
            </h2>
            <p className="text-zinc-500 mb-8">
              Join developers, designers, and researchers who never lose a tab
              again.
            </p>
            <Link
              href="/signin"
              className="inline-block bg-white text-black font-medium px-8 py-3 rounded-xl hover:bg-zinc-100 transition text-sm"
            >
              Get started free →
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <span>🔗</span>
            <span>TabMind</span>
          </div>
          <p className="text-zinc-700 text-xs">
            © {new Date().getFullYear()} TabMind. Built with ❤️ in India.
          </p>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Code, 
  Terminal, 
  Globe, 
  Database, 
  Webhook, 
  Lock, 
  Github, 
  Check, 
  ChevronRight, 
  Star,
  Layers,
  LayoutTemplate
} from "lucide-react";
import { FormizoLogo } from "~/components/layout/vscode-shell/vscode-logo";
import { useMe } from "~/hooks/api/use-auth";

type TemplateKey = "rsvp" | "contact" | "feedback";

interface Template {
  name: string;
  description: string;
  markdown: string;
  fields: Array<{
    type: "text" | "email" | "checkboxes" | "dropdown" | "textarea" | "rating";
    label: string;
    placeholder?: string;
    options?: string[];
    required?: boolean;
  }>;
}

const TEMPLATES: Record<TemplateKey, Template> = {
  rsvp: {
    name: "Event RSVP",
    description: "Perfect for meetups, hackathons, and product launches.",
    markdown: `# Launch RSVP
Join us for the Formizo v1.0 launch party!

---
type: text
label: Full Name
placeholder: Jane Doe
required: true

---
type: email
label: Developer Email
placeholder: jane@example.com
required: true

---
type: checkboxes
label: Tech Stack
options:
  - React / Next.js
  - Vue / Nuxt
  - Angular
  - Solid / Svelte`,
    fields: [
      { type: "text", label: "Full Name", placeholder: "Jane Doe", required: true },
      { type: "email", label: "Developer Email", placeholder: "jane@example.com", required: true },
      { type: "checkboxes", label: "Tech Stack", options: ["React / Next.js", "Vue / Nuxt", "Angular", "Solid / Svelte"] }
    ]
  },
  contact: {
    name: "Contact Sales",
    description: "Sleek business contact form with structured fields.",
    markdown: `# Contact Sales
Let's talk about scaling Formizo at your team.

---
type: text
label: Company Name
placeholder: Acme Corp
required: true

---
type: dropdown
label: Team Size
options:
  - 1-10 developers
  - 11-50 developers
  - 50+ developers

---
type: textarea
label: Message
placeholder: Tell us about your needs...`,
    fields: [
      { type: "text", label: "Company Name", placeholder: "Acme Corp", required: true },
      { type: "dropdown", label: "Team Size", options: ["1-10 developers", "11-50 developers", "50+ developers"] },
      { type: "textarea", label: "Message", placeholder: "Tell us about your needs..." }
    ]
  },
  feedback: {
    name: "Product Feedback",
    description: "Gather feedback with standard ratings and message fields.",
    markdown: `# Product Feedback
Help us make Formizo even better.

---
type: rating
label: How would you rate the editor?
required: true

---
type: textarea
label: What is your favorite feature?
placeholder: Markdown backing, VS Code shell, webhooks...
required: false`,
    fields: [
      { type: "rating", label: "How would you rate the editor?", required: true },
      { type: "textarea", label: "What is your favorite feature?", placeholder: "Markdown backing, VS Code shell, webhooks...", required: false }
    ]
  }
};

export default function LandingPage() {
  const meQuery = useMe();
  const isAuthenticated = meQuery.data?.authenticated === true;
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>("rsvp");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [rating, setRating] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentTemplate = TEMPLATES[activeTemplate];

  const handleCheckboxChange = (fieldLabel: string, option: string) => {
    setSelectedOptions((prev) => {
      const current = prev[fieldLabel] ?? [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [fieldLabel]: updated };
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#d4d4d8] antialiased selection:bg-[#007acc]/30 selection:text-white">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-1/4 w-[500px] h-[500px] rounded-full bg-[#007acc]/10 blur-[120px]" />
        <div className="absolute top-[-10%] right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      {/* Navigation Header Wrapper */}
      <div className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? "px-4 pt-3" : "px-0 pt-0"}`}>
        <header className={`mx-auto max-w-7xl px-6 h-16 flex items-center justify-between transition-all duration-300 ${
          isScrolled 
            ? "border border-zinc-800 bg-[#09090b] rounded-t-2xl shadow-[0_10px_30px_rgba(0,122,204,0.1)]" 
            : "border-b border-zinc-900 bg-[#09090b]/80 backdrop-blur-md rounded-none"
        }`}>
          <div className="flex items-center gap-3">
            <FormizoLogo className="size-6 shrink-0" />
            <span className="text-[15px] font-bold tracking-tight text-white">Formizo</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#interactive-demo" className="hover:text-white transition">Live Demo</a>
            <Link href="/pricing" className="hover:text-white transition">Pricing & Plans</Link>
            <a href="https://github.com/Satpal777/formizo" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition">
              <Github className="size-4" />
              GitHub
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/editor"
              className="inline-flex h-9 items-center justify-center rounded-[6px] bg-[#007acc] px-4 text-[13px] font-semibold text-white shadow-lg shadow-[#007acc]/20 hover:bg-[#008ae6] hover:shadow-xl hover:shadow-[#007acc]/30 transition-all cursor-pointer"
            >
              {isAuthenticated ? "Go to Workspace" : "Launch Workspace"}
              <ArrowRight className="size-4 ml-1.5 shrink-0" />
            </Link>
          </div>
        </header>
      </div>

      {/* Main Container */}
      <main className="relative z-10">
        
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 pt-16 pb-20 text-center md:pt-24 md:pb-28">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-3 py-1 text-[11px] font-medium text-indigo-400 mb-6 animate-pulse">
            <Sparkles className="size-3.5" />
            <span>Formizo v1.0 is now live</span>
          </div>

          {/* Heading */}
          <h1 className="text-[40px] leading-[1.1] font-extrabold tracking-tight text-white sm:text-[56px] md:text-[68px] max-w-4xl mx-auto">
            Build beautiful forms <br />
            <span className="bg-gradient-to-r from-[#00bcf2] via-[#007acc] to-indigo-400 bg-clip-text text-transparent">
              like you write code.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-[15px] leading-relaxed text-zinc-400 sm:text-[17px] max-w-2xl mx-auto">
            An interactive, VS Code-like workspace where you author surveys and forms in clean Markdown. Connect webhooks, configure custom domains, and inspect responses instantly.
          </p>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/editor"
              className="inline-flex h-11 items-center justify-center rounded-[6px] bg-[#007acc] px-6 text-[14px] font-bold text-white shadow-xl shadow-[#007acc]/20 hover:bg-[#008ae6] hover:scale-[1.02] transition-all cursor-pointer"
            >
              Open Free Editor
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center justify-center rounded-[6px] border border-zinc-800 bg-zinc-900/50 px-6 text-[14px] font-bold text-white hover:bg-zinc-800/80 transition-all"
            >
              View Pricing
            </Link>
          </div>

          {/* Interactive Feature Highlights */}
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4 max-w-4xl mx-auto text-left">
            <div className="rounded-[8px] border border-zinc-900 bg-zinc-950/40 p-4">
              <div className="text-[#00bcf2] font-semibold text-[14px] flex items-center gap-1.5">
                <Code className="size-4" />
                <span>Markdown Format</span>
              </div>
              <p className="text-[12px] text-zinc-500 mt-1">Fields defined inside plain markdown files.</p>
            </div>
            <div className="rounded-[8px] border border-zinc-900 bg-zinc-950/40 p-4">
              <div className="text-emerald-400 font-semibold text-[14px] flex items-center gap-1.5">
                <Terminal className="size-4" />
                <span>VS Code UI</span>
              </div>
              <p className="text-[12px] text-zinc-500 mt-1">Familiar editor theme with file tree & terminals.</p>
            </div>
            <div className="rounded-[8px] border border-zinc-900 bg-zinc-950/40 p-4">
              <div className="text-purple-400 font-semibold text-[14px] flex items-center gap-1.5">
                <Webhook className="size-4" />
                <span>Webhooks Ready</span>
              </div>
              <p className="text-[12px] text-zinc-500 mt-1">Post submissions to any REST endpoint live.</p>
            </div>
            <div className="rounded-[8px] border border-zinc-900 bg-zinc-950/40 p-4">
              <div className="text-amber-400 font-semibold text-[14px] flex items-center gap-1.5">
                <Lock className="size-4" />
                <span>Fully Secure</span>
              </div>
              <p className="text-[12px] text-zinc-500 mt-1">Password protected forms with encryption.</p>
            </div>
          </div>
        </section>

        {/* Interactive Workspace Mockup Section */}
        <section id="interactive-demo" className="mx-auto max-w-6xl px-6 pb-24 relative">
          <div className="text-center mb-8">
            <h2 className="text-[24px] font-bold text-white tracking-tight">Interactive Live Playground</h2>
            <p className="text-zinc-500 text-[13px] mt-1">Click a template below to see how writing markdown updates the live form.</p>
            
            {/* Template Selector Tabs */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 p-1">
              {(Object.keys(TEMPLATES) as TemplateKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTemplate(key);
                    setSelectedOptions({});
                    setRating(0);
                  }}
                  className={`rounded-full px-4 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                    activeTemplate === key
                      ? "bg-[#007acc] text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {TEMPLATES[key].name}
                </button>
              ))}
            </div>
          </div>

          {/* Browser Frame */}
          <div className="relative rounded-[12px] border border-zinc-800 bg-[#1e1e1e] shadow-[0_20px_50px_rgba(0,122,204,0.15)] overflow-hidden">
            {/* Window Header */}
            <div className="flex h-10 items-center justify-between border-b border-zinc-900 bg-[#181818] px-4">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-rose-500/80" />
                <span className="size-3 rounded-full bg-amber-500/80" />
                <span className="size-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-500">
                <LayoutTemplate className="size-3.5 text-zinc-500" />
                <span>formizo-workspace - {currentTemplate.name}.form</span>
              </div>
              <div className="w-16" />
            </div>

            {/* Editor Workspace Split */}
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-900 h-[480px]">
              
              {/* Left pane: Markdown Code */}
              <div className="flex flex-col h-full bg-[#1e1e1e] font-mono text-[12px] overflow-hidden">
                {/* Title tab */}
                <div className="flex h-8 items-center border-b border-zinc-900 bg-[#181818] px-4 text-[11px] text-zinc-400">
                  <span className="text-[#3794ff] font-bold mr-1.5">F</span>
                  <span className="italic">{currentTemplate.name.toLowerCase().replace(" ", "-")}.form</span>
                  <span className="ml-auto size-2 rounded-full bg-amber-500" />
                </div>
                {/* Code body */}
                <div className="flex-1 p-5 overflow-auto text-left text-zinc-300 leading-relaxed relative">
                  <div className="absolute right-3 top-3 text-[9px] uppercase tracking-wider text-zinc-600 bg-zinc-900/60 border border-zinc-800 rounded px-1.5 py-0.5">
                    Markdown Schema
                  </div>
                  <pre className="whitespace-pre-wrap select-none">
                    {currentTemplate.markdown.split("\n").map((line, idx) => {
                      if (line.startsWith("#")) {
                        return <span key={idx} className="text-[#9cdcfe] font-bold">{line}{"\n"}</span>;
                      }
                      if (line.startsWith("type:") || line.startsWith("label:") || line.startsWith("placeholder:") || line.startsWith("required:") || line.startsWith("options:") || line.startsWith("max:")) {
                        const parts = line.split(":");
                        return (
                          <span key={idx}>
                            <span className="text-[#569cd6]">{parts[0]}</span>:
                            <span className="text-[#ce9178]">{parts.slice(1).join(":")}</span>
                            {"\n"}
                          </span>
                        );
                      }
                      if (line.startsWith("  -")) {
                        return <span key={idx} className="text-[#b5cea8]">{line}{"\n"}</span>;
                      }
                      if (line === "---") {
                        return <span key={idx} className="text-zinc-600 font-semibold">{line}{"\n"}</span>;
                      }
                      return <span key={idx}>{line}{"\n"}</span>;
                    })}
                  </pre>
                  {/* Blinking Cursor */}
                  <span className="inline-block w-1.5 h-4 bg-zinc-400 animate-pulse ml-0.5" />
                </div>
              </div>

              {/* Right pane: Live Form Preview */}
              <div className="flex flex-col h-full bg-[#121214] overflow-hidden">
                {/* Title tab */}
                <div className="flex h-8 items-center border-b border-zinc-900 bg-[#1a1a1c] px-4 text-[11px] text-zinc-400">
                  <Globe className="size-3.5 text-emerald-500 mr-1.5" />
                  <span>Live Form Preview</span>
                  <span className="ml-2 rounded bg-emerald-500/10 border border-emerald-500/20 px-1 text-[9px] text-emerald-400 uppercase font-semibold">Active</span>
                </div>
                {/* Form preview body */}
                <div className="flex-1 p-6 md:p-8 overflow-auto text-left flex flex-col justify-between">
                  <div className="space-y-5">
                    {/* Dynamic Heading & Description */}
                    <div>
                      <h3 className="text-[20px] font-bold text-white tracking-tight">
                        {(currentTemplate.markdown.split("\n")[0] ?? "").replace("# ", "")}
                      </h3>
                      <p className="text-[12px] text-zinc-400 mt-1">
                        {currentTemplate.markdown.split("\n")[1] ?? ""}
                      </p>
                    </div>

                    {/* Rendered Inputs */}
                    <div className="space-y-4">
                      {currentTemplate.fields.map((field, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <label className="block text-[11px] font-semibold text-zinc-300">
                            {field.label}
                            {field.required && <span className="text-rose-400 ml-0.5">*</span>}
                          </label>

                          {field.type === "text" && (
                            <input
                              type="text"
                              placeholder={field.placeholder}
                              className="w-full h-8 rounded-[4px] border border-zinc-800 bg-[#1e1e20] px-2.5 text-[12px] text-white outline-none focus:border-[#007acc] transition"
                              disabled
                            />
                          )}

                          {field.type === "email" && (
                            <input
                              type="email"
                              placeholder={field.placeholder}
                              className="w-full h-8 rounded-[4px] border border-zinc-800 bg-[#1e1e20] px-2.5 text-[12px] text-white outline-none focus:border-[#007acc] transition"
                              disabled
                            />
                          )}

                          {field.type === "textarea" && (
                            <textarea
                              placeholder={field.placeholder}
                              rows={2.5}
                              className="w-full rounded-[4px] border border-zinc-800 bg-[#1e1e20] p-2 text-[12px] text-white outline-none focus:border-[#007acc] transition resize-none"
                              disabled
                            />
                          )}

                          {field.type === "dropdown" && (
                            <div className="relative">
                              <select
                                className="w-full h-8 rounded-[4px] border border-zinc-800 bg-[#1e1e20] px-2.5 text-[12px] text-white outline-none focus:border-[#007acc] transition cursor-pointer appearance-none"
                                defaultValue=""
                              >
                                <option value="" disabled>Select option...</option>
                                {field.options?.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                                <ChevronRight className="size-3.5 rotate-90" />
                              </div>
                            </div>
                          )}

                          {field.type === "checkboxes" && (
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {field.options?.map((opt) => {
                                const isChecked = selectedOptions[field.label]?.includes(opt) ?? false;
                                return (
                                  <label
                                    key={opt}
                                    onClick={() => handleCheckboxChange(field.label, opt)}
                                    className={`flex items-center gap-2 rounded-[4px] border px-3 py-2 text-[11px] transition cursor-pointer ${
                                      isChecked
                                        ? "border-[#007acc] bg-[#007acc]/5 text-white"
                                        : "border-zinc-800 bg-[#1e1e20] text-zinc-400 hover:border-zinc-700"
                                    }`}
                                  >
                                    <span className={`size-3.5 rounded-sm border flex items-center justify-center shrink-0 transition ${
                                      isChecked ? "border-[#007acc] bg-[#007acc]" : "border-zinc-700 bg-zinc-800"
                                    }`}>
                                      {isChecked && <Check className="size-2.5 text-white stroke-[3px]" />}
                                    </span>
                                    <span>{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {field.type === "rating" && (
                            <div className="flex items-center gap-1.5 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setRating(star)}
                                  className="text-zinc-600 hover:text-amber-400 transition"
                                  type="button"
                                >
                                  <Star
                                    className={`size-6 ${
                                      star <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"
                                    }`}
                                  />
                                </button>
                              ))}
                              {rating > 0 && (
                                <span className="text-[11px] font-semibold text-amber-400 ml-1">
                                  {rating} / 5
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Footer */}
                  <div className="mt-8 flex items-center justify-between border-t border-zinc-900 pt-4">
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <FormizoLogo className="size-3" />
                      Powered by Formizo
                    </span>
                    <button
                      className="inline-flex h-8 items-center justify-center rounded-[4px] bg-[#007acc] px-4 text-[11px] font-semibold text-white shadow hover:bg-[#008ae6] transition cursor-pointer"
                      onClick={() => alert("This is a live landing page preview! Try the full editor by clicking 'Launch Workspace' above.")}
                    >
                      Submit Response
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="features" className="bg-[#0b0c10] border-y border-zinc-900 py-20 md:py-28 relative">
          <div className="mx-auto max-w-7xl px-6">
            
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
              <h2 className="text-[28px] font-bold text-white tracking-tight sm:text-[36px]">
                Built for Developers. <br />
                Loved by Teams.
              </h2>
              <p className="mt-4 text-[14px] text-zinc-400">
                Formizo removes the bloat from standard online form builders, providing a fast, schema-driven environment where your keyboard does all the work.
              </p>
            </div>

            {/* Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="rounded-[10px] border border-zinc-900 bg-zinc-950/40 p-6 hover:border-zinc-800 transition duration-200">
                <div className="size-10 rounded-[6px] bg-[#007acc]/10 border border-[#007acc]/20 flex items-center justify-center text-[#00bcf2]">
                  <Layers className="size-5" />
                </div>
                <h3 className="text-[16px] font-semibold text-white mt-4">VS Code Theme Interface</h3>
                <p className="text-[13px] text-zinc-400 mt-2 leading-relaxed">
                  A gorgeous, immersive editor inspired by Visual Studio Code. Work with explorer trees, tabs, command palettes, and custom markdown shortcuts.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-[10px] border border-zinc-900 bg-zinc-950/40 p-6 hover:border-zinc-800 transition duration-200">
                <div className="size-10 rounded-[6px] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Webhook className="size-5" />
                </div>
                <h3 className="text-[16px] font-semibold text-white mt-4">Live Webhook Pipelines</h3>
                <p className="text-[13px] text-zinc-400 mt-2 leading-relaxed">
                  Forward form responses directly to your web servers, serverless functions, or automation tools (Zapier, Make) instantly via custom webhook URLs.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-[10px] border border-zinc-900 bg-zinc-950/40 p-6 hover:border-zinc-800 transition duration-200">
                <div className="size-10 rounded-[6px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Globe className="size-5" />
                </div>
                <h3 className="text-[16px] font-semibold text-white mt-4">Custom Domains & Branding</h3>
                <p className="text-[13px] text-zinc-400 mt-2 leading-relaxed">
                  Serve published surveys directly from your custom domain (e.g. forms.mycompany.com) and easily toggle Formizo badges to white-label your forms.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-[10px] border border-zinc-900 bg-zinc-950/40 p-6 hover:border-zinc-800 transition duration-200">
                <div className="size-10 rounded-[6px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Lock className="size-5" />
                </div>
                <h3 className="text-[16px] font-semibold text-white mt-4">Protected & Passworded</h3>
                <p className="text-[13px] text-zinc-400 mt-2 leading-relaxed">
                  Protect sensitive surveys with custom passwords, restrict submissions to specific email networks, or keep forms unlisted from search indexing.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="rounded-[10px] border border-zinc-900 bg-zinc-950/40 p-6 hover:border-zinc-800 transition duration-200">
                <div className="size-10 rounded-[6px] bg-[#3794ff]/10 border border-[#3794ff]/20 flex items-center justify-center text-[#3794ff]">
                  <Database className="size-5" />
                </div>
                <h3 className="text-[16px] font-semibold text-white mt-4">Structured Responses</h3>
                <p className="text-[13px] text-zinc-400 mt-2 leading-relaxed">
                  View individual form entries in JSON format, query data via APIs, or look at aggregate summary graphs built right into the VS Code dashboard.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="rounded-[10px] border border-zinc-900 bg-zinc-950/40 p-6 hover:border-zinc-800 transition duration-200">
                <div className="size-10 rounded-[6px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Zap className="size-5" />
                </div>
                <h3 className="text-[16px] font-semibold text-white mt-4">Zero Compilation Lag</h3>
                <p className="text-[13px] text-zinc-400 mt-2 leading-relaxed">
                  Edit markdown and watch form preview render synchronously in milliseconds. Zero deploy waits, zero page refreshes, 100% reactive state.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Call To Action Section */}
        <section className="mx-auto max-w-5xl px-6 py-20 md:py-28 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[#007acc]/5 blur-[80px] pointer-events-none" />
          <h2 className="text-[26px] font-bold text-white sm:text-[36px] tracking-tight">
            Ready to design forms like a pro?
          </h2>
          <p className="mt-4 text-[14px] text-zinc-400 max-w-md mx-auto leading-relaxed">
            Create up to 10 forms on our developer tier completely free. Switch to the Pro tier for custom domains, password locks, and integrations.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/editor"
              className="inline-flex h-11 items-center justify-center rounded-[6px] bg-[#007acc] px-6 text-[14px] font-bold text-white shadow-xl shadow-[#007acc]/20 hover:bg-[#008ae6] hover:scale-[1.02] transition-all cursor-pointer"
            >
              Open Editor Workspace
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center justify-center rounded-[6px] border border-zinc-800 bg-zinc-900/50 px-6 text-[14px] font-bold text-white hover:bg-zinc-800/80 transition-all"
            >
              View pricing page
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/40 py-12 text-center text-[12px] text-zinc-500">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FormizoLogo className="size-4" />
            <span className="font-semibold text-zinc-300">Formizo SaaS</span>
            <span className="text-zinc-600">|</span>
            <span>Developer-First Form Workspace</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-zinc-300 transition">Pricing</Link>
            <a href="https://github.com/Satpal777/formizo" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition">GitHub</a>
            <a href="#" className="hover:text-zinc-300 transition">Privacy Policy</a>
          </div>
          <div>
            <p>© 2026 Formizo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

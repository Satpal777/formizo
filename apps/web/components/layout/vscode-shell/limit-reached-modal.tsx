import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Sparkles, Check, ArrowRight } from "lucide-react";

export function LimitReachedModal({
  isOpen,
  onClose,
  onUpgrade,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[440px] translate-x-[-50%] translate-y-[-50%] rounded-[8px] border border-[#3c3c3c] bg-[#1e1e1e] p-0 shadow-[0_24px_60px_rgba(0,0,0,0.65)] focus:outline-none overflow-hidden animate-scale-in">
          {/* Header Graphic */}
          <div className="relative h-28 bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/20 p-2.5 backdrop-blur-sm">
                <Sparkles className="size-6 text-white" />
              </div>
              <div>
                <Dialog.Title className="text-[18px] font-bold text-white leading-tight">
                  Unlock Pro Features
                </Dialog.Title>
                <p className="text-[11px] text-blue-100 mt-1 font-medium">Get unlimited forms, branding & domains</p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="text-white/60 hover:text-white transition absolute top-4 right-4 cursor-pointer">
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <div className="text-[12.5px] leading-relaxed text-[#cccccc] mb-6">
              You have created <span className="font-semibold text-white">10/10 forms</span>. Under the Developer Free plan, you've reached the form limit. Upgrade to Pro to get the following benefits:
            </div>

            {/* Benefits List */}
            <ul className="space-y-3.5 mb-8">
              {[
                ["Unlimited Forms & Submissions", "Build as many forms as you want without caps."],
                ["Remove Formizo Branding", "Completely white-label your forms for customers."],
                ["Custom Domains Support", "Host forms on your own subdomain (forms.domain.com)."],
                ["Webhook & API Integrations", "Send submissions instantly to Slack, Discord, or your API."],
                ["Password Protection", "Encrypt and password-protect sensitive forms."],
              ].map(([title, desc]) => (
                <li key={title} className="flex items-start gap-3">
                  <div className="rounded-full bg-[#89d185]/10 p-0.5 mt-0.5 shrink-0">
                    <Check className="size-3.5 text-[#89d185]" />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-semibold text-white leading-none">{title}</h4>
                    <p className="text-[11px] text-[#9d9d9d] mt-1">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={onUpgrade}
                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] bg-[#0e639c] text-[12px] font-semibold text-white hover:bg-[#1177bb] shadow-lg shadow-[#0e639c]/20 transition cursor-pointer"
              >
                <span>Upgrade to Pro Plan</span>
                <ArrowRight className="size-3.5" />
              </button>
              <button
                onClick={onClose}
                className="h-9 w-full rounded-[4px] border border-[#3c3c3c] text-[12px] font-medium text-[#cccccc] hover:bg-[#2a2d2e] transition cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

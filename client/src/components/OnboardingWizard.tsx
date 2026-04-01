/*
 * OnboardingWizard — 5-step SaaS form wizard
 * Left stepper + right content area
 * Steps: Shopify → Zendesk → SOP Upload → Configure Rep → Choose Mode
 */
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Check, Circle, AlertTriangle, ChevronRight, Upload, Link2, FileText,
  Loader2, Eye, Zap, Lock, ExternalLink, ShieldCheck, PlugZap,
  Store, Headphones, BookOpen, UserPlus, Rocket,
} from "lucide-react";
import { toast } from "sonner";

/* ── Step definitions ── */
const STEPS = [
  { id: 1, label: "Connect Shopify", icon: Store },
  { id: 2, label: "Connect Zendesk", icon: Headphones },
  { id: 3, label: "Import Policies", icon: BookOpen },
  { id: 4, label: "Configure Rep", icon: UserPlus },
  { id: 5, label: "Go Live", icon: Rocket },
];

/* ── Stepper ── */
function Stepper({ current, statuses, onStepClick }: {
  current: number;
  statuses: Record<number, string>;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="w-[220px] border-r border-border bg-white px-5 py-6 flex flex-col gap-1">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Setup Progress</p>
      {STEPS.map((step, idx) => {
        const status = statuses[step.id] || "pending";
        const isCurrent = step.id === current;
        const canClick = status === "complete" || status === "skipped" || isCurrent;
        const Icon = step.icon;

        return (
          <button
            key={step.id}
            disabled={!canClick}
            onClick={() => canClick && onStepClick(step.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group",
              isCurrent && "bg-[#f0edff] border border-[#6c47ff]/20",
              !isCurrent && canClick && "hover:bg-[#fafafa]",
              !canClick && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors",
              status === "complete" && "bg-emerald-100 text-emerald-600",
              status === "skipped" && "bg-amber-100 text-amber-600",
              isCurrent && status === "pending" && "bg-[#6c47ff] text-white",
              !isCurrent && status === "pending" && "bg-[#f0f0f0] text-muted-foreground"
            )}>
              {status === "complete" ? <Check size={14} /> :
               status === "skipped" ? <AlertTriangle size={12} /> :
               <Icon size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-[12px] font-medium truncate",
                isCurrent ? "text-[#6c47ff]" : "text-foreground"
              )}>{step.label}</p>
              {status === "complete" && !isCurrent && (
                <p className="text-[10px] text-emerald-600">Complete</p>
              )}
              {status === "skipped" && !isCurrent && (
                <p className="text-[10px] text-amber-600">Skipped</p>
              )}
            </div>
            {isCurrent && <ChevronRight size={14} className="text-[#6c47ff] shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 1: Connect Shopify
   ═══════════════════════════════════════════════════════════ */
function ShopifyStep({ onNext }: { onNext: () => void }) {
  const { shopifyConnected, setShopifyConnected, setStepStatus } = useApp();
  // Demo toggle to test both branches
  const [demoBranch, setDemoBranch] = useState<"connected" | "not-connected">(
    shopifyConnected ? "connected" : "not-connected"
  );

  const handleContinue = () => {
    if (demoBranch === "connected") {
      setShopifyConnected(true);
      setStepStatus(1, "complete");
    } else {
      setShopifyConnected(false);
      setStepStatus(1, "skipped");
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold text-foreground">Connect Shopify</h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          Your AI Rep needs access to Shopify to look up orders, shipping status, and customer info.
        </p>
      </div>

      {/* Demo branch toggle */}
      <div className="flex items-center gap-2 p-2.5 bg-[#f8f9fa] rounded-lg border border-dashed border-border">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Demo:</span>
        <button
          onClick={() => setDemoBranch("connected")}
          className={cn("px-2.5 py-1 rounded text-[11px] font-medium transition-colors",
            demoBranch === "connected" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "text-muted-foreground hover:bg-white"
          )}
        >Connected</button>
        <button
          onClick={() => setDemoBranch("not-connected")}
          className={cn("px-2.5 py-1 rounded text-[11px] font-medium transition-colors",
            demoBranch === "not-connected" ? "bg-amber-100 text-amber-700 border border-amber-200" : "text-muted-foreground hover:bg-white"
          )}
        >Not Connected</button>
      </div>

      {demoBranch === "connected" ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
            <Check size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-emerald-800">Shopify is connected</p>
            <p className="text-[12px] text-emerald-700 mt-0.5">alexsong.myshopify.com</p>
            <p className="text-[12px] text-emerald-600/80 mt-1">
              Your AI Rep can look up orders, shipping status, and customer info.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-amber-800">Shopify is not connected</p>
              <p className="text-[12px] text-amber-700 mt-1 leading-relaxed">
                We currently support Shopify as the order management system. If you're using a different platform,
                please contact your Seel point of contact for setup assistance.
              </p>
              <p className="text-[12px] text-amber-600/80 mt-2">
                You can continue without order data, but your Rep will escalate all order-related queries.
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 ml-11">
            <Button size="sm" variant="outline" className="text-[12px] h-8" onClick={() => toast.info("Contact support flow would open here.")}>
              Contact Support
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          className="text-[13px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white"
          onClick={handleContinue}
        >
          {demoBranch === "connected" ? "Continue" : "Continue without order data"}
          <ChevronRight size={14} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 2: Connect Zendesk
   ═══════════════════════════════════════════════════════════ */
function ZendeskStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const { zendeskConnected, setZendeskConnected, setStepStatus } = useApp();
  const [demoBranch, setDemoBranch] = useState<"connected" | "not-connected">(
    zendeskConnected ? "connected" : "not-connected"
  );
  const [subStep, setSubStep] = useState(1);
  const [authStatus, setAuthStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [seatVerified, setSeatVerified] = useState(false);
  const [routingDone, setRoutingDone] = useState(false);

  const handleContinueConnected = () => {
    setZendeskConnected(true);
    setStepStatus(2, "complete");
    onNext();
  };

  const handleSkip = () => {
    setZendeskConnected(false);
    setStepStatus(2, "skipped");
    onSkip();
  };

  const handleAuthorize = () => {
    setAuthStatus("loading");
    setTimeout(() => setAuthStatus("success"), 1500);
  };

  const handleAuthRetry = () => {
    setAuthStatus("idle");
  };

  const handleVerifySeat = () => {
    setSeatVerified(true);
  };

  const handleRoutingDone = () => {
    setRoutingDone(true);
    setZendeskConnected(true);
    setStepStatus(2, "complete");
    setTimeout(onNext, 300);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold text-foreground">Connect Zendesk AI Support Access</h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          Set up Zendesk so your AI Rep can read and respond to support tickets.
        </p>
      </div>

      {/* Demo branch toggle */}
      <div className="flex items-center gap-2 p-2.5 bg-[#f8f9fa] rounded-lg border border-dashed border-border">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Demo:</span>
        <button
          onClick={() => setDemoBranch("connected")}
          className={cn("px-2.5 py-1 rounded text-[11px] font-medium transition-colors",
            demoBranch === "connected" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "text-muted-foreground hover:bg-white"
          )}
        >Already Connected</button>
        <button
          onClick={() => setDemoBranch("not-connected")}
          className={cn("px-2.5 py-1 rounded text-[11px] font-medium transition-colors",
            demoBranch === "not-connected" ? "bg-amber-100 text-amber-700 border border-amber-200" : "text-muted-foreground hover:bg-white"
          )}
        >Not Connected</button>
      </div>

      {demoBranch === "connected" ? (
        <>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
              <Check size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-emerald-800">Zendesk AI Support Access is set up</p>
              <p className="text-[12px] text-emerald-700 mt-0.5">coastalliving.zendesk.com</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button className="text-[13px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white" onClick={handleContinueConnected}>
              Continue <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "h-1.5 rounded-full flex-1 transition-colors",
                  s < subStep ? "bg-emerald-400" : s === subStep ? "bg-[#6c47ff]" : "bg-[#e5e7eb]"
                )} />
              </div>
            ))}
            <span className="text-[11px] text-muted-foreground font-medium ml-1">{subStep}/3</span>
          </div>

          {/* Sub-step 1: Authorize API */}
          {subStep === 1 && (
            <div className="bg-white border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#6c47ff] text-white flex items-center justify-center text-[11px] font-bold">1</div>
                <h3 className="text-[14px] font-semibold">Authorize Zendesk API Access</h3>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Grant Seel read and write access to your Zendesk instance via OAuth.
              </p>

              {authStatus === "idle" && (
                <div className="flex gap-2">
                  <Button className="text-[12px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white" onClick={handleAuthorize}>
                    <PlugZap size={14} className="mr-1.5" /> Authorize Zendesk
                  </Button>
                  {/* Demo: simulate failure */}
                  <Button variant="outline" size="sm" className="text-[11px] text-muted-foreground border-dashed" onClick={() => setAuthStatus("error")}>
                    Demo: Simulate Failure
                  </Button>
                </div>
              )}
              {authStatus === "loading" && (
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" /> Connecting to Zendesk...
                </div>
              )}
              {authStatus === "success" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-[12px] text-emerald-700 font-medium">Connected to coastalliving.zendesk.com</span>
                </div>
              )}
              {authStatus === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-red-500" />
                    <span className="text-[12px] text-red-700 font-medium">Authorization failed</span>
                  </div>
                  <p className="text-[11px] text-red-600 mb-2">Please check your Zendesk admin permissions and try again.</p>
                  <Button size="sm" variant="outline" className="text-[11px] h-7 border-red-300 text-red-600" onClick={handleAuthRetry}>
                    Retry
                  </Button>
                </div>
              )}

              {authStatus === "success" && (
                <div className="flex justify-end">
                  <Button className="text-[12px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white" onClick={() => setSubStep(2)}>
                    Next <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Sub-step 2: Create Agent Seat */}
          {subStep === 2 && (
            <div className="bg-white border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#6c47ff] text-white flex items-center justify-center text-[11px] font-bold">2</div>
                <h3 className="text-[14px] font-semibold">Create an Agent Seat</h3>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Add a new Agent in Zendesk (e.g., "Seel AI Rep"). This gives your AI Rep its own identity in Zendesk.
              </p>

              {!seatVerified ? (
                <div className="flex gap-2">
                  <Button variant="outline" className="text-[12px]" onClick={() => toast.info("This would open Zendesk Admin in a new tab.")}>
                    <ExternalLink size={12} className="mr-1.5" /> Open Zendesk Admin
                  </Button>
                  <Button className="text-[12px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white" onClick={handleVerifySeat}>
                    I've done this — verify
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-[12px] text-emerald-700 font-medium">Agent seat verified — "Seel AI Rep"</span>
                  </div>
                  <div className="flex justify-end">
                    <Button className="text-[12px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white" onClick={() => setSubStep(3)}>
                      Next <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-step 3: Configure Routing */}
          {subStep === 3 && (
            <div className="bg-white border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#6c47ff] text-white flex items-center justify-center text-[11px] font-bold">3</div>
                <h3 className="text-[14px] font-semibold">Configure Ticket Routing</h3>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Set up a Zendesk Trigger to route incoming tickets to the AI Rep agent seat.
              </p>

              {!routingDone ? (
                <div className="flex gap-2">
                  <Button variant="outline" className="text-[12px]" onClick={() => toast.info("Routing guide would open here.")}>
                    See Guide
                  </Button>
                  <Button variant="outline" className="text-[12px]" onClick={() => toast.info("This would open Zendesk Admin in a new tab.")}>
                    <ExternalLink size={12} className="mr-1.5" /> Open Zendesk Admin
                  </Button>
                  <Button className="text-[12px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white" onClick={handleRoutingDone}>
                    I've done this — continue
                  </Button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-[12px] text-emerald-700 font-medium">Ticket routing configured</span>
                </div>
              )}
            </div>
          )}

          {/* Skip option */}
          <div className="flex justify-between items-center pt-2">
            <button onClick={handleSkip} className="text-[12px] text-muted-foreground hover:text-foreground underline underline-offset-2">
              Skip for now
            </button>
            <div />
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 3: Upload SOP Documents
   ═══════════════════════════════════════════════════════════ */
interface ExtractedRule {
  name: string;
  summary: string;
}

interface Conflict {
  id: number;
  topic: string;
  optionA: { label: string; source: string };
  optionB: { label: string; source: string };
  resolved: boolean;
  choice?: string;
}

function SOPStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const { setSopUploaded, setStepStatus } = useApp();
  const [phase, setPhase] = useState<"upload" | "analyzing" | "results">("upload");
  const [demoBranch, setDemoBranch] = useState<"normal" | "conflict" | "empty">("normal");
  const [showAllRules, setShowAllRules] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([
    { id: 1, topic: "Return window duration", optionA: { label: "30 days", source: "Return Policy v2.pdf" }, optionB: { label: "14 days", source: "CS Handbook.docx" }, resolved: false },
    { id: 2, topic: "Refund method", optionA: { label: "Original payment method", source: "Return Policy v2.pdf" }, optionB: { label: "Store credit only", source: "CS Handbook.docx" }, resolved: false },
  ]);

  const extractedRules: ExtractedRule[] = [
    { name: "WISMO (Where Is My Order)", summary: "Look up order + tracking via Shopify, provide ETA, offer to notify on delivery." },
    { name: "Return Request", summary: "Check eligibility (30-day window), initiate return label, confirm refund timeline." },
    { name: "Cancellation & Refund", summary: "Cancel if within 2h of placement; otherwise escalate. Refund to original method." },
    { name: "Damaged / Wrong Item", summary: "Collect photos, file Seel claim if protected, otherwise escalate to human." },
    { name: "Shipping Address Change", summary: "Edit address if order not yet dispatched; otherwise inform customer." },
    { name: "Product Inquiry", summary: "Look up product details from Shopify catalog, provide specs and availability." },
    { name: "Seel Protection Inquiry", summary: "Check Seel protection status, explain coverage, guide claim process." },
    { name: "VIP Customer Handling", summary: "Flag VIP customers, prioritize response, offer courtesy discount if frustrated." },
  ];

  const handleUpload = () => {
    setPhase("analyzing");
    setTimeout(() => setPhase("results"), 2000);
  };

  const handleSample = () => {
    setPhase("analyzing");
    setTimeout(() => setPhase("results"), 2000);
  };

  const resolveConflict = (conflictId: number, choice: string) => {
    setConflicts((prev) => prev.map((c) => c.id === conflictId ? { ...c, resolved: true, choice } : c));
  };

  const handleContinue = () => {
    setSopUploaded(true);
    setStepStatus(3, "complete");
    onNext();
  };

  const handleSkip = () => {
    setSopUploaded(false);
    setStepStatus(3, "skipped");
    onSkip();
  };

  const allConflictsResolved = conflicts.every((c) => c.resolved);
  const visibleRules = showAllRules ? extractedRules : extractedRules.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold text-foreground">Import Policies</h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          Upload your customer service SOP documents. We'll extract rules and knowledge from them.
        </p>
      </div>

      {phase === "upload" && (
        <>
          {/* Demo branch toggle */}
          <div className="flex items-center gap-2 p-2.5 bg-[#f8f9fa] rounded-lg border border-dashed border-border">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Demo result:</span>
            <button onClick={() => setDemoBranch("normal")} className={cn("px-2.5 py-1 rounded text-[11px] font-medium transition-colors", demoBranch === "normal" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "text-muted-foreground hover:bg-white")}>
              8 Rules
            </button>
            <button onClick={() => setDemoBranch("conflict")} className={cn("px-2.5 py-1 rounded text-[11px] font-medium transition-colors", demoBranch === "conflict" ? "bg-amber-100 text-amber-700 border border-amber-200" : "text-muted-foreground hover:bg-white")}>
              With Conflicts
            </button>
            <button onClick={() => setDemoBranch("empty")} className={cn("px-2.5 py-1 rounded text-[11px] font-medium transition-colors", demoBranch === "empty" ? "bg-red-100 text-red-700 border border-red-200" : "text-muted-foreground hover:bg-white")}>
              0 Rules
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Upload files */}
            <div
              className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-[#6c47ff]/40 hover:bg-[#fafafe] transition-colors cursor-pointer group"
              onClick={handleUpload}
            >
              <Upload size={24} className="mx-auto text-muted-foreground group-hover:text-[#6c47ff] transition-colors mb-2" />
              <p className="text-[13px] font-medium text-foreground">Upload files</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Drag & drop or click to upload. PDF, DOCX, TXT — up to 10MB, max 10 files.
              </p>
            </div>

            {/* Paste URL */}
            <div className="border border-border rounded-xl p-4 flex items-center gap-3">
              <Link2 size={18} className="text-muted-foreground shrink-0" />
              <Input placeholder="Paste a public URL to your SOP document..." className="text-[12px] flex-1" />
              <Button size="sm" variant="outline" className="text-[12px] shrink-0" onClick={handleUpload}>
                Import
              </Button>
            </div>

            {/* Sample document */}
            <button
              onClick={handleSample}
              className="border border-border rounded-xl p-4 flex items-center gap-3 text-left hover:bg-[#fafafe] transition-colors"
            >
              <FileText size={18} className="text-[#6c47ff] shrink-0" />
              <div>
                <p className="text-[13px] font-medium text-foreground">Try with a sample document</p>
                <p className="text-[11px] text-muted-foreground">Seel Return & Shipping Guidelines</p>
              </div>
            </button>
          </div>

          <button onClick={handleSkip} className="text-[12px] text-muted-foreground hover:text-foreground underline underline-offset-2">
            Skip — I'll teach my Rep through conversation later
          </button>
        </>
      )}

      {phase === "analyzing" && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 size={32} className="animate-spin text-[#6c47ff]" />
          <p className="text-[14px] font-medium text-foreground">Analyzing your documents...</p>
          <p className="text-[12px] text-muted-foreground">Extracting rules and knowledge. This usually takes 1-2 minutes.</p>
        </div>
      )}

      {phase === "results" && (
        <>
          {demoBranch === "empty" ? (
            <div className="bg-[#fafafa] border border-border rounded-xl p-6 text-center">
              <FileText size={32} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-[14px] font-medium text-foreground">No rules extracted</p>
              <p className="text-[12px] text-muted-foreground mt-1 max-w-md mx-auto">
                We couldn't extract any rules from this document. You can upload a different one, or teach your Rep through conversation after setup.
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" className="text-[12px]" onClick={() => setPhase("upload")}>
                  Upload another
                </Button>
                <Button size="sm" className="text-[12px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white" onClick={handleContinue}>
                  Continue anyway <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Check size={16} className="text-emerald-600" />
                  <p className="text-[13px] font-semibold text-emerald-800">
                    Extracted {extractedRules.length} rules from your documents
                  </p>
                </div>
                <p className="text-[12px] text-emerald-600/80 ml-6">
                  Document content has been loaded into the knowledge base.
                </p>
              </div>

              {/* Rules list */}
              <div className="space-y-1.5">
                {visibleRules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-3 px-3 py-2.5 bg-white border border-border rounded-lg">
                    <ShieldCheck size={14} className="text-[#6c47ff] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[12px] font-medium text-foreground">{rule.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{rule.summary}</p>
                    </div>
                  </div>
                ))}
                {!showAllRules && extractedRules.length > 5 && (
                  <button
                    onClick={() => setShowAllRules(true)}
                    className="text-[12px] text-[#6c47ff] hover:underline ml-3"
                  >
                    +{extractedRules.length - 5} more rules
                  </button>
                )}
              </div>

              {/* Conflicts */}
              {demoBranch === "conflict" && (
                <div className="space-y-3">
                  <p className="text-[13px] font-semibold text-amber-700 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> {conflicts.filter((c) => !c.resolved).length} conflicts need resolution
                  </p>
                  {conflicts.map((conflict) => (
                    <div key={conflict.id} className={cn(
                      "border rounded-xl p-4 transition-colors",
                      conflict.resolved ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/50"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        {conflict.resolved ? (
                          <Check size={14} className="text-emerald-600" />
                        ) : (
                          <AlertTriangle size={14} className="text-amber-600" />
                        )}
                        <p className="text-[12px] font-semibold text-foreground">{conflict.topic}</p>
                      </div>
                      {conflict.resolved ? (
                        <p className="text-[12px] text-emerald-700 ml-6">
                          Resolved: <span className="font-medium">{conflict.choice}</span>
                        </p>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-2 mb-2 ml-6">
                            <div className="bg-white border border-border rounded-lg p-2.5">
                              <p className="text-[11px] text-muted-foreground">{conflict.optionA.source}</p>
                              <p className="text-[12px] font-medium text-foreground mt-0.5">{conflict.optionA.label}</p>
                            </div>
                            <div className="bg-white border border-border rounded-lg p-2.5">
                              <p className="text-[11px] text-muted-foreground">{conflict.optionB.source}</p>
                              <p className="text-[12px] font-medium text-foreground mt-0.5">{conflict.optionB.label}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-6">
                            <Button size="sm" variant="outline" className="text-[11px] h-7" onClick={() => resolveConflict(conflict.id, conflict.optionA.label)}>
                              {conflict.optionA.label}
                            </Button>
                            <Button size="sm" variant="outline" className="text-[11px] h-7" onClick={() => resolveConflict(conflict.id, conflict.optionB.label)}>
                              {conflict.optionB.label}
                            </Button>
                            <Button size="sm" variant="ghost" className="text-[11px] h-7 text-muted-foreground" onClick={() => resolveConflict(conflict.id, "Deferred")}>
                              Decide later
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button onClick={() => toast.info("Review all rules in Playbook → Rules tab.")} className="text-[12px] text-[#6c47ff] hover:underline">
                  Review all in Playbook →
                </button>
                <Button
                  className="text-[13px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white"
                  onClick={handleContinue}
                  disabled={demoBranch === "conflict" && !allConflictsResolved}
                >
                  Continue <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 4: Configure Rep (Hire)
   ═══════════════════════════════════════════════════════════ */
function ConfigureRepStep({ onNext }: { onNext: () => void }) {
  const {
    hiredRepName, setHiredRepName,
    repPersonality, setRepPersonality,
    repCustomTone, setRepCustomTone,
    repPermissions, setRepPermissions,
    setRepHired, setStepStatus,
  } = useApp();

  const readPerms = repPermissions.filter((p) => p.type === "read");
  const writePerms = repPermissions.filter((p) => p.type === "write");

  const togglePerm = (id: string) => {
    setRepPermissions(
      repPermissions.map((p) => p.id === id && !p.locked ? { ...p, enabled: !p.enabled } : p)
    );
  };

  const handleHire = () => {
    if (!hiredRepName.trim()) return;
    setRepHired(true);
    setStepStatus(4, "complete");
    onNext();
  };

  const personalities = ["Friendly", "Professional", "Casual", "Customize"] as const;
  const personalityDescriptions: Record<string, string> = {
    Friendly: "Warm, friendly, and reassuring tone. Uses empathetic language.",
    Professional: "Professional, calm, and direct tone. Focuses on efficiency.",
    Casual: "Casual, conversational tone. Feels like chatting with a friend.",
    Customize: "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold text-foreground">Configure Your AI Rep</h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          Set up your AI support representative's identity and permissions.
        </p>
      </div>

      {/* Identity */}
      <div className="bg-white border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Identity</h3>
        <div>
          <label className="text-[12px] font-medium text-foreground mb-1 block">Name</label>
          <Input
            value={hiredRepName}
            onChange={(e) => setHiredRepName(e.target.value.slice(0, 20))}
            placeholder="Enter rep name..."
            className="text-[13px] max-w-xs"
          />
          <p className="text-[10px] text-muted-foreground mt-1">{hiredRepName.length}/20 characters</p>
        </div>
        <div>
          <label className="text-[12px] font-medium text-foreground mb-1.5 block">Personality</label>
          <div className="flex gap-2 flex-wrap">
            {personalities.map((p) => (
              <button
                key={p}
                onClick={() => setRepPersonality(p)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors",
                  repPersonality === p
                    ? "bg-[#6c47ff] text-white border-[#6c47ff]"
                    : "bg-white text-foreground border-border hover:border-[#6c47ff]/50"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          {repPersonality !== "Customize" && personalityDescriptions[repPersonality] && (
            <p className="text-[11px] text-muted-foreground mt-2 italic">{personalityDescriptions[repPersonality]}</p>
          )}
          {repPersonality === "Customize" && (
            <textarea
              value={repCustomTone}
              onChange={(e) => setRepCustomTone(e.target.value)}
              placeholder="Describe the tone and style you want..."
              className="mt-2 w-full h-20 px-3 py-2 rounded-lg border border-border bg-white text-[12px] focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/30 resize-none"
            />
          )}
        </div>
      </div>

      {/* Action Permissions */}
      <div className="bg-white border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Action Permissions</h3>

        {/* Read */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Eye size={13} className="text-blue-500" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Read Actions</span>
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-[#f8f9fa]">
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Action</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">System</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground w-16">Enabled</th>
                </tr>
              </thead>
              <tbody>
                {readPerms.map((perm) => (
                  <tr key={perm.id} className="border-t border-border/50">
                    <td className="px-3 py-2 text-foreground">{perm.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{perm.system}</td>
                    <td className="px-3 py-2 text-right">
                      <Switch checked={perm.enabled} onCheckedChange={() => togglePerm(perm.id)} disabled={perm.locked} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Write */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={13} className="text-amber-500" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Write Actions</span>
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-[#f8f9fa]">
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Action</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">System</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground w-16">Enabled</th>
                </tr>
              </thead>
              <tbody>
                {writePerms.map((perm) => (
                  <tr key={perm.id} className="border-t border-border/50">
                    <td className="px-3 py-2 text-foreground">
                      <div className="flex items-center gap-1.5">
                        {perm.name}
                        {perm.locked && <Lock size={10} className="text-muted-foreground" />}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{perm.system}</td>
                    <td className="px-3 py-2 text-right">
                      <Switch checked={perm.enabled} onCheckedChange={() => togglePerm(perm.id)} disabled={perm.locked} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          className="text-[13px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white"
          onClick={handleHire}
          disabled={!hiredRepName.trim()}
        >
          <UserPlus size={14} className="mr-1.5" /> Hire {hiredRepName || "Rep"}
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 5: Choose Go-Live Mode
   ═══════════════════════════════════════════════════════════ */
function GoLiveModeStep({ onComplete }: { onComplete: () => void }) {
  const { goLiveMode, setGoLiveMode, hiredRepName, setStepStatus } = useApp();
  const [confirmProdOpen, setConfirmProdOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"training" | "production">(goLiveMode);

  const handleSelect = (mode: "training" | "production") => {
    setSelectedMode(mode);
    if (mode === "production") {
      setConfirmProdOpen(true);
    } else {
      setGoLiveMode(mode);
    }
  };

  const confirmProduction = () => {
    setGoLiveMode("production");
    setConfirmProdOpen(false);
  };

  const handleComplete = () => {
    setStepStatus(5, "complete");
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold text-foreground">Choose Go-Live Mode</h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          How should {hiredRepName} handle incoming tickets?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => handleSelect("training")}
          className={cn(
            "border rounded-xl p-5 text-left transition-all",
            (selectedMode === "training" && goLiveMode === "training")
              ? "border-[#6c47ff] bg-[#f8f6ff] ring-1 ring-[#6c47ff]/20"
              : "border-border hover:border-[#6c47ff]/30 bg-white"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              (selectedMode === "training" && goLiveMode === "training") ? "bg-[#6c47ff] text-white" : "bg-[#f0f0f0] text-muted-foreground"
            )}>
              <Eye size={18} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-foreground">Training Mode</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">Review before sending</p>
            </div>
          </div>
          <p className="text-[12px] text-muted-foreground mt-3 leading-relaxed">
            {hiredRepName} drafts replies and adds them as Internal Notes in Zendesk. You review and send manually.
            Best for building confidence before going fully autonomous.
          </p>
        </button>

        <button
          onClick={() => handleSelect("production")}
          className={cn(
            "border rounded-xl p-5 text-left transition-all",
            goLiveMode === "production"
              ? "border-[#6c47ff] bg-[#f8f6ff] ring-1 ring-[#6c47ff]/20"
              : "border-border hover:border-[#6c47ff]/30 bg-white"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              goLiveMode === "production" ? "bg-[#6c47ff] text-white" : "bg-[#f0f0f0] text-muted-foreground"
            )}>
              <Zap size={18} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-foreground">Production Mode</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">Reply directly to customers</p>
            </div>
          </div>
          <p className="text-[12px] text-muted-foreground mt-3 leading-relaxed">
            {hiredRepName} replies directly to customers via Zendesk. Escalates to human when uncertain.
            You can switch to Training mode anytime from Settings.
          </p>
        </button>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          className="text-[13px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white"
          onClick={handleComplete}
        >
          <Rocket size={14} className="mr-1.5" /> Complete Setup
        </Button>
      </div>

      {/* Production confirmation dialog */}
      <Dialog open={confirmProdOpen} onOpenChange={setConfirmProdOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Enable Production Mode?</DialogTitle>
            <DialogDescription className="text-[13px]">
              {hiredRepName} will reply directly to customers. You can switch to Training mode anytime from the Rep profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="text-[12px]" onClick={() => setConfirmProdOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" className="text-[12px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white" onClick={confirmProduction}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN WIZARD
   ═══════════════════════════════════════════════════════════ */
export default function OnboardingWizard() {
  const {
    setupStep, setSetupStep, stepStatuses, setStepStatus,
    setSetupComplete, setAgentMode,
  } = useApp();

  const goToStep = (step: number) => {
    setSetupStep(step);
  };

  const nextStep = () => {
    const next = setupStep + 1;
    if (next > 5) {
      // Complete
      setSetupComplete(true);
      setAgentMode("normal");
      toast.success("Setup complete!", { description: "Your AI support team is ready." });
      return;
    }
    setSetupStep(next);
  };

  const skipStep = () => {
    setStepStatus(setupStep, "skipped");
    nextStep();
  };

  const handleComplete = () => {
    setSetupComplete(true);
    setAgentMode("normal");
    toast.success("Setup complete!", { description: "Your AI support team is ready." });
  };

  return (
    <div className="flex h-full bg-[#fafafa]">
      <Stepper current={setupStep} statuses={stepStatuses} onStepClick={goToStep} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[640px] mx-auto px-6 py-8">
          {setupStep === 1 && <ShopifyStep onNext={nextStep} />}
          {setupStep === 2 && <ZendeskStep onNext={nextStep} onSkip={skipStep} />}
          {setupStep === 3 && <SOPStep onNext={nextStep} onSkip={skipStep} />}
          {setupStep === 4 && <ConfigureRepStep onNext={nextStep} />}
          {setupStep === 5 && <GoLiveModeStep onComplete={handleComplete} />}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Check, AlertTriangle, ChevronRight, Loader2, RefreshCw,
  Globe, Upload, FileText, Link2, Sparkles, Bot,
  Shield, ArrowRight, ArrowLeft, ExternalLink, Mail,
  MessageSquare, Smartphone, Tag, Users, UserCheck, AlertCircle, Info,
  Zap, ChevronDown, HelpCircle, Eye, EyeOff,
} from "lucide-react";

/* ================================================================
   TOOLTIP — lightweight hover tooltip for permission descriptions
   ================================================================ */
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 rounded-lg bg-gray-900 text-white text-[11px] leading-snug whitespace-normal max-w-[240px] shadow-lg pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
}

/* ================================================================
   STEPPER — left rail
   In wizard mode: 3 steps (Zendesk, Import, Configure)
   In settings mode: 2 steps only (Zendesk, Configure) — no Import
   ================================================================ */
const WIZARD_STEPS = [
  { id: 1, label: "Connect Zendesk", icon: Globe },
  { id: 2, label: "Import Policies", icon: FileText },
  { id: 3, label: "Configure Agent", icon: Bot },
];

const SETTINGS_STEPS = [
  { id: 1, label: "Connect Zendesk", icon: Globe },
  { id: 3, label: "Configure Agent", icon: Bot },
];

function Stepper({ current, statuses, onSelect, isWizard }: {
  current: number;
  statuses: Record<number, string>;
  onSelect: (step: number) => void;
  isWizard: boolean;
}) {
  const steps = isWizard ? WIZARD_STEPS : SETTINGS_STEPS;
  return (
    <div className="flex flex-col gap-1 w-56 shrink-0">
      {steps.map((step, idx) => {
        const status = statuses[step.id] || "pending";
        const isCurrent = current === step.id;
        const canClick = !isWizard || status === "complete" || status === "skipped" || isCurrent;
        const Icon = step.icon;

        return (
          <button
            key={step.id}
            onClick={() => canClick && onSelect(step.id)}
            disabled={!canClick}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all text-sm
              ${isCurrent ? "bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium" : ""}
              ${!isCurrent && status === "complete" ? "text-green-700 hover:bg-green-50" : ""}
              ${!isCurrent && status === "skipped" ? "text-amber-600 hover:bg-amber-50" : ""}
              ${!isCurrent && status === "pending" ? "text-gray-400" : ""}
              ${canClick && !isCurrent ? "cursor-pointer" : ""}
              ${!canClick ? "cursor-not-allowed opacity-50" : ""}
            `}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold
              ${isCurrent ? "bg-indigo-600 text-white" : ""}
              ${!isCurrent && status === "complete" ? "bg-green-100 text-green-700" : ""}
              ${!isCurrent && status === "skipped" ? "bg-amber-100 text-amber-600" : ""}
              ${!isCurrent && status === "pending" ? "bg-gray-100 text-gray-400" : ""}
            `}>
              {status === "complete" ? <Check className="w-3.5 h-3.5" /> :
               status === "skipped" ? <AlertTriangle className="w-3.5 h-3.5" /> :
               idx + 1}
            </div>
            <div className="flex flex-col">
              <span>{step.label}</span>
              {status === "skipped" && !isCurrent && (
                <span className="text-xs text-amber-500">Skipped</span>
              )}
              {status === "complete" && !isCurrent && (
                <span className="text-xs text-green-600">Complete</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ================================================================
   STEP 1 — Connect Zendesk
   Wizard mode: step-by-step reveal, single CTA per step, auto-advance
   Settings mode: vertical layout, all sections visible, no flow buttons
   ================================================================ */
function ZendeskStep({ isWizard }: { isWizard: boolean }) {
  const {
    zendesk, setZendesk, zendeskConnected,
    stepStatuses, setStepStatus, setSetupStep,
  } = useApp();

  const [demoBranch, setDemoBranch] = useState<"success" | "error">("success");

  // Determine which sub-step we're on (only relevant for wizard)
  const currentSubStep = useMemo(() => {
    if (zendesk.triggerStatus === "verified") return 3;
    if (zendesk.seatStatus === "verified") return 3;
    if (zendesk.authStatus === "success") return 2;
    return 1;
  }, [zendesk.authStatus, zendesk.seatStatus, zendesk.triggerStatus]);

  /* Sub-step 1: Authorize */
  const handleAuthorize = () => {
    if (!zendesk.subdomain.trim()) {
      setZendesk({ authError: "Please enter your Zendesk subdomain" });
      return;
    }
    setZendesk({ authStatus: "loading", authError: "" });
    setTimeout(() => {
      if (demoBranch === "success") {
        setZendesk({
          authStatus: "success", authError: "",
          availableSeats: [
            { id: "seat-1", name: "Seel AI Agent", email: "seel-ai@" + zendesk.subdomain + ".zendesk.com" },
            { id: "seat-2", name: "Support Bot", email: "bot@" + zendesk.subdomain + ".zendesk.com" },
            { id: "seat-3", name: "CS Automation", email: "cs-auto@" + zendesk.subdomain + ".zendesk.com" },
          ],
        });
        toast.success("Zendesk API authorized successfully");
      } else {
        setZendesk({
          authStatus: "error",
          authError: "Unable to connect. Please check your subdomain and ensure API access is enabled in Zendesk Admin → Apps and integrations → APIs.",
        });
      }
    }, 1500);
  };

  /* Sub-step 2: Bind seat */
  const handleBindSeat = () => {
    if (!zendesk.selectedSeat) {
      setZendesk({ seatError: "Please select an agent seat" });
      return;
    }
    setZendesk({ seatStatus: "loading", seatError: "" });
    setTimeout(() => {
      if (demoBranch === "success") {
        setZendesk({ seatStatus: "verified", seatError: "" });
        toast.success("Agent seat bound successfully");
      } else {
        setZendesk({
          seatStatus: "error",
          seatError: "This seat does not have the required permissions. The agent seat needs 'Tickets: Read/Write' and 'Users: Read' permissions.",
        });
      }
    }, 1200);
  };

  /* Sub-step 3: Verify connection */
  const handleVerifyConnection = () => {
    setZendesk({ triggerStatus: "loading", triggerError: "" });
    setTimeout(() => {
      if (demoBranch === "success") {
        setZendesk({ triggerStatus: "verified", triggerError: "" });
        if (isWizard) {
          setStepStatus(1, "complete");
          setSetupStep(2);
          toast.success("Zendesk connection verified! Moving to next step.");
        } else {
          toast.success("Connection verified");
        }
      } else {
        setZendesk({
          triggerStatus: "error",
          triggerError: "No ticket received yet. Please assign a test ticket to the AI Agent seat in Zendesk and try again.",
        });
      }
    }, 1200);
  };

  const handleRefreshSeats = () => {
    setZendesk({ seatStatus: "loading" });
    setTimeout(() => {
      setZendesk({
        seatStatus: "idle",
        availableSeats: [
          { id: "seat-1", name: "Seel AI Agent", email: "seel-ai@" + zendesk.subdomain + ".zendesk.com" },
          { id: "seat-2", name: "Support Bot", email: "bot@" + zendesk.subdomain + ".zendesk.com" },
          { id: "seat-3", name: "CS Automation", email: "cs-auto@" + zendesk.subdomain + ".zendesk.com" },
          { id: "seat-4", name: "New Agent", email: "new@" + zendesk.subdomain + ".zendesk.com" },
        ],
      });
      toast.success("Seat list refreshed");
    }, 1000);
  };

  const allDone = zendesk.authStatus === "success" && zendesk.seatStatus === "verified" && zendesk.triggerStatus === "verified";

  /* ── Status indicator for each sub-step ── */
  function SubStepStatus({ done }: { done: boolean }) {
    return done ? (
      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
        <Check className="w-3 h-3 text-green-600" />
      </div>
    ) : null;
  }

  /* In wizard mode, show steps sequentially. In settings mode, show all. */
  const showStep1 = !isWizard || currentSubStep >= 1;
  const showStep2 = !isWizard || currentSubStep >= 2;
  const showStep3 = !isWizard || currentSubStep >= 3;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Connect Zendesk</h2>
        <p className="text-sm text-gray-500 mt-1">
          {isWizard
            ? "Set up Zendesk AI Support Access so your AI Rep can read and respond to tickets."
            : "Manage your Zendesk integration and connection settings."
          }
        </p>
      </div>

      {/* Unified setup guide link */}
      <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-4 h-4 text-blue-500 shrink-0" />
        <p className="text-xs text-blue-700 flex-1">
          Need help? Follow our step-by-step guide to connect Zendesk.
        </p>
        <a href="#" className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1 shrink-0">
          View Setup Guide <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Demo branch toggle */}
      <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs">
        <span className="text-amber-700 font-medium">DEMO:</span>
        <button onClick={() => setDemoBranch("success")} className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${demoBranch === "success" ? "bg-green-100 text-green-700" : "text-gray-500 hover:bg-gray-100"}`}>Success Path</button>
        <button onClick={() => setDemoBranch("error")} className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${demoBranch === "error" ? "bg-red-100 text-red-700" : "text-gray-500 hover:bg-gray-100"}`}>Error Path</button>
      </div>

      {/* ── Sub-step 1: Authorize API ── */}
      {showStep1 && (
        <div className={`p-4 rounded-lg border space-y-3 transition-all ${
          zendesk.authStatus === "success"
            ? "border-green-200 bg-green-50/30"
            : "border-gray-200 bg-gray-50"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isWizard && <span className="text-xs font-semibold text-gray-400 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center">1</span>}
              <h3 className="text-sm font-semibold text-gray-800">Authorize Zendesk API</h3>
            </div>
            <SubStepStatus done={zendesk.authStatus === "success"} />
          </div>

          {zendesk.authStatus !== "success" ? (
            <>
              <p className="text-xs text-gray-500">
                Enter your Zendesk subdomain to authorize API access.
                <span className="font-mono ml-1 text-gray-600">https://<strong>your-subdomain</strong>.zendesk.com</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">https://</span>
                <Input
                  value={zendesk.subdomain}
                  onChange={(e) => setZendesk({ subdomain: e.target.value, authError: "" })}
                  placeholder="your-subdomain"
                  className="max-w-xs font-mono text-sm"
                />
                <span className="text-sm text-gray-500">.zendesk.com</span>
              </div>
              {zendesk.authStatus === "error" && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-700">{zendesk.authError}</p>
                </div>
              )}
              <Button
                size="sm"
                onClick={handleAuthorize}
                disabled={zendesk.authStatus === "loading"}
              >
                {zendesk.authStatus === "loading" ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Connecting...</>
                ) : "Connect"}
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs text-green-700">
              <Check className="w-3.5 h-3.5" />
              <span>Connected to <strong>{zendesk.subdomain}.zendesk.com</strong></span>
              {!isWizard && (
                <button
                  onClick={() => setZendesk({ authStatus: "idle", seatStatus: "idle", triggerStatus: "idle", selectedSeat: "" })}
                  className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
                >
                  Reconnect
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Sub-step 2: Bind Agent Seat ── */}
      {showStep2 && (
        <div className={`p-4 rounded-lg border space-y-3 transition-all ${
          zendesk.seatStatus === "verified"
            ? "border-green-200 bg-green-50/30"
            : zendesk.authStatus === "success"
              ? "border-gray-200 bg-gray-50"
              : "border-gray-100 bg-gray-50/50 opacity-50"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isWizard && <span className="text-xs font-semibold text-gray-400 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center">2</span>}
              <h3 className="text-sm font-semibold text-gray-800">Bind Agent Seat</h3>
            </div>
            <SubStepStatus done={zendesk.seatStatus === "verified"} />
          </div>

          {zendesk.seatStatus !== "verified" ? (
            <>
              <p className="text-xs text-gray-500">
                Select which Zendesk agent seat your AI Rep will use to read and write tickets.
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={zendesk.selectedSeat}
                  onChange={(e) => setZendesk({ selectedSeat: e.target.value, seatError: "" })}
                  className="flex-1 max-w-sm h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                >
                  <option value="">Select an agent seat...</option>
                  {zendesk.availableSeats.map((seat) => (
                    <option key={seat.id} value={seat.id}>{seat.name} ({seat.email})</option>
                  ))}
                </select>
                <button
                  onClick={handleRefreshSeats}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Refresh seat list"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${zendesk.seatStatus === "loading" ? "animate-spin" : ""}`} />
                </button>
              </div>
              {zendesk.seatError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-700">{zendesk.seatError}</p>
                </div>
              )}
              <Button size="sm" onClick={handleBindSeat} disabled={zendesk.seatStatus === "loading" || !zendesk.selectedSeat}>
                {zendesk.seatStatus === "loading" ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Verifying...</>
                ) : "Bind Seat"}
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs text-green-700">
              <Check className="w-3.5 h-3.5" />
              <span>Bound to <strong>{zendesk.availableSeats.find(s => s.id === zendesk.selectedSeat)?.name || zendesk.selectedSeat}</strong></span>
              {!isWizard && (
                <button
                  onClick={() => setZendesk({ seatStatus: "idle", triggerStatus: "idle" })}
                  className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
                >
                  Change
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Sub-step 3: Verify Connection ── */}
      {showStep3 && (
        <div className={`p-4 rounded-lg border space-y-3 transition-all ${
          zendesk.triggerStatus === "verified"
            ? "border-green-200 bg-green-50/30"
            : zendesk.seatStatus === "verified"
              ? "border-gray-200 bg-gray-50"
              : "border-gray-100 bg-gray-50/50 opacity-50"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isWizard && <span className="text-xs font-semibold text-gray-400 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center">3</span>}
              <h3 className="text-sm font-semibold text-gray-800">Verify Connection</h3>
            </div>
            <SubStepStatus done={zendesk.triggerStatus === "verified"} />
          </div>

          {zendesk.triggerStatus !== "verified" ? (
            <>
              <p className="text-xs text-gray-500">
                Assign a test ticket to <strong>{zendesk.availableSeats.find(s => s.id === zendesk.selectedSeat)?.name || "your AI Agent"}</strong> in your Zendesk dashboard, then click Verify to confirm we can receive it.
              </p>
              <div className="flex items-center gap-2">
                <a href="#" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                  Open Zendesk Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {zendesk.triggerStatus === "error" && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-700">{zendesk.triggerError}</p>
                </div>
              )}
              <Button size="sm" onClick={handleVerifyConnection} disabled={zendesk.triggerStatus === "loading"}>
                {zendesk.triggerStatus === "loading" ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Checking...</>
                ) : "Verify"}
              </Button>
            </>
          ) : (
            <div className="text-xs text-green-700 space-y-1">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5" />
                <span>Connection verified — test ticket received successfully</span>
              </div>
              <p className="text-gray-500 ml-5">Ticket #12847 — "Test ticket for AI agent setup"</p>
            </div>
          )}
        </div>
      )}

      {/* Footer — wizard only */}
      {isWizard && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              setStepStatus(1, "skipped");
              setSetupStep(2);
            }}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip for now
          </button>
          <div />
        </div>
      )}
    </div>
  );
}

/* ================================================================
   STEP 2 — Import Policies (wizard only)
   ================================================================ */
function ImportPoliciesStep({ isWizard }: { isWizard: boolean }) {
  const {
    sopUploaded, setSopUploaded,
    extractedRuleNames, setExtractedRuleNames,
    stepStatuses, setStepStatus, setSetupStep,
  } = useApp();

  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [demoBranch, setDemoBranch] = useState<"no-conflict" | "with-conflict">("no-conflict");
  const [conflicts, setConflicts] = useState<{ id: string; question: string; optionA: string; optionB: string; choice?: string; resolved: boolean }[]>([]);

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setSopUploaded(true);
      setExtractedRuleNames([
        "30-day return policy for unused items",
        "Free return shipping for defective products",
        "Refund to original payment method within 5-7 business days",
        "Exchange available for different size/color",
        "Gift card purchases are final sale",
      ]);
      if (demoBranch === "with-conflict") {
        setConflicts([
          { id: "c1", question: "Your SOP says '30-day returns' but an existing rule says '14-day returns'. Which should apply?", optionA: "Use 30-day return window (from uploaded SOP)", optionB: "Keep 14-day return window (existing rule)", resolved: false },
          { id: "c2", question: "Should refunds include original shipping costs?", optionA: "Yes, refund shipping costs for all returns", optionB: "No, only refund product cost", resolved: false },
        ]);
      }
      toast.success("Documents analyzed successfully");
    }, 2000);
  };

  const resolveConflict = (id: string, choice: string) => {
    setConflicts((prev) => prev.map((c) => c.id === id ? { ...c, choice, resolved: true } : c));
  };

  const allConflictsResolved = conflicts.every((c) => c.resolved);

  const handleContinue = () => {
    setStepStatus(2, sopUploaded ? "complete" : "skipped");
    setSetupStep(3);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Import Policies</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload your customer service SOP documents. We'll extract rules and load them into the knowledge base.
        </p>
      </div>

      {/* Demo branch toggle */}
      <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs">
        <span className="text-amber-700 font-medium">DEMO:</span>
        <button onClick={() => setDemoBranch("no-conflict")} className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${demoBranch === "no-conflict" ? "bg-green-100 text-green-700" : "text-gray-500 hover:bg-gray-100"}`}>No Conflicts</button>
        <button onClick={() => setDemoBranch("with-conflict")} className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${demoBranch === "with-conflict" ? "bg-red-100 text-red-700" : "text-gray-500 hover:bg-gray-100"}`}>With Conflicts</button>
      </div>

      {!sopUploaded && !uploading && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">Drag & drop your SOP files here</p>
            <p className="text-xs text-gray-500 mb-4">Supports PDF, DOCX, TXT (max 10MB per file)</p>
            <Button size="sm" onClick={handleUpload}>
              <Upload className="w-3.5 h-3.5 mr-1.5" /> Choose Files
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-gray-400 shrink-0" />
            <Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="Paste a URL to your help center or knowledge base" className="text-sm" />
            <Button size="sm" variant="outline" onClick={handleUpload}>Import</Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Button variant="outline" size="sm" onClick={handleUpload} className="w-full">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Try with a sample document
          </Button>
        </div>
      )}

      {uploading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
          <p className="text-sm text-gray-600 font-medium">Analyzing documents and extracting rules...</p>
          <p className="text-xs text-gray-400 mt-1">This may take a moment</p>
        </div>
      )}

      {sopUploaded && !uploading && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">
                {extractedRuleNames.length} rules extracted from your documents
              </span>
            </div>
            <ul className="space-y-1 ml-6">
              {extractedRuleNames.map((name, i) => (
                <li key={i} className="text-xs text-green-700 flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-green-400" />
                  {name}
                </li>
              ))}
            </ul>
            <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
              <Info className="w-3 h-3" />
              You can review and edit these rules in Playbook after setup.
            </p>
          </div>

          {/* Playbook hint */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium">After setup, manage your knowledge base in Playbook</p>
              <p className="mt-0.5">You can upload additional documents, edit rules, and manage your knowledge base from the <strong>Playbook → Documents</strong> tab.</p>
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-amber-800">
                  {conflicts.length} conflict{conflicts.length > 1 ? "s" : ""} found — please resolve
                </span>
              </div>
              {conflicts.map((conflict) => (
                <div key={conflict.id} className={`p-4 rounded-lg border ${conflict.resolved ? "border-green-200 bg-green-50/50" : "border-amber-200 bg-amber-50/50"}`}>
                  <p className="text-sm font-medium text-gray-800 mb-2">{conflict.question}</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => resolveConflict(conflict.id, "A")}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors ${
                        conflict.choice === "A" ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {conflict.optionA}
                    </button>
                    <button
                      onClick={() => resolveConflict(conflict.id, "B")}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors ${
                        conflict.choice === "B" ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {conflict.optionB}
                    </button>
                    {!conflict.resolved && (
                      <button onClick={() => resolveConflict(conflict.id, "later")} className="text-xs text-gray-500 hover:text-gray-700 underline">
                        Decide later
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer — wizard only */}
      {isWizard && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSetupStep(1)}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
            </Button>
            <button
              onClick={() => {
                setStepStatus(2, "skipped");
                setSetupStep(3);
              }}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip for now
            </button>
          </div>
          <Button
            onClick={handleContinue}
            size="sm"
            disabled={conflicts.length > 0 && !allConflictsResolved && sopUploaded}
          >
            Continue <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   STEP 3 — Configure Agent
   Identity, Permissions (grouped), Channels, Escalation Handoff (flat), Go Live
   ================================================================ */
function ConfigureAgentStep({ isWizard }: { isWizard: boolean }) {
  const {
    repHired, setRepHired,
    hiredRepName, setHiredRepName,
    repPersonality, setRepPersonality,
    repCustomTone, setRepCustomTone,
    repPermissions, setRepPermissions,
    goLiveMode, setGoLiveMode,
    channels, setChannels,
    handoff, setHandoff,
    zendeskConnected,
    stepStatuses, setStepStatus, setSetupStep,
    setSetupComplete, setAgentMode,
  } = useApp();

  const [showProdConfirm, setShowProdConfirm] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    identity: true, permissions: true, channels: true, handoff: true, golive: true,
  });
  const [showReadActions, setShowReadActions] = useState(false);
  const [expandedPermGroups, setExpandedPermGroups] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const readPerms = repPermissions.filter((p) => p.type === "read");
  const writePerms = repPermissions.filter((p) => p.type === "write");

  /* Group write permissions by domain */
  const writeGroups = useMemo(() => {
    const groups: Record<string, typeof writePerms> = {};
    writePerms.forEach((p) => {
      const key = p.domain || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return groups;
  }, [writePerms]);

  const togglePerm = (name: string) => {
    setRepPermissions(
      repPermissions.map((p) => (p.name === name && !p.locked ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const canGoLive = zendeskConnected;
  const zdSkipped = stepStatuses[1] === "skipped" || !zendeskConnected;

  const handleComplete = () => {
    if (!hiredRepName.trim()) {
      toast.error("Please enter a name for your AI Rep");
      return;
    }
    if (isWizard && !canGoLive) {
      // Save config only — don't activate
      setRepHired(false);
      setStepStatus(3, "complete");
      setSetupComplete(true);
      setAgentMode("normal");
      toast.success(`Configuration saved. Complete Zendesk setup to activate ${hiredRepName}.`);
    } else {
      setRepHired(true);
      setStepStatus(3, "complete");
      setSetupComplete(true);
      setAgentMode("normal");
      toast.success(`${hiredRepName} is now live in ${goLiveMode} mode!`);
    }
  };

  /* Collapsible section header */
  function SectionHeader({ id, icon: Icon, title }: { id: string; icon: React.ElementType; title: string }) {
    return (
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-t-lg border border-gray-200 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections[id] ? "" : "-rotate-90"}`} />
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Configure Agent</h2>
        <p className="text-sm text-gray-500 mt-1">
          {isWizard
            ? "Set up your AI Rep's identity, permissions, channels, escalation rules, and go-live mode."
            : "Manage your AI Rep's configuration and behavior."
          }
        </p>
      </div>

      {/* ── Identity ── */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <SectionHeader id="identity" icon={Bot} title="Identity" />
        {expandedSections.identity && (
          <div className="p-4 border-x border-b border-gray-200 space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Rep Name</label>
              <Input
                value={hiredRepName}
                onChange={(e) => setHiredRepName(e.target.value)}
                placeholder="e.g., Ava"
                className="max-w-xs text-sm"
                maxLength={20}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">Personality</label>
              <div className="flex gap-2 flex-wrap">
                {(["Friendly", "Professional", "Casual", "Customize"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setRepPersonality(p)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      repPersonality === p
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {repPersonality === "Customize" && (
                <textarea
                  value={repCustomTone}
                  onChange={(e) => setRepCustomTone(e.target.value)}
                  placeholder="Describe the tone and style you want..."
                  className="mt-2 w-full max-w-md text-sm p-2 border border-gray-200 rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Permissions — Read / Read & Write with subcategories ── */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <SectionHeader id="permissions" icon={Shield} title="Action Permissions" />
        {expandedSections.permissions && (
          <div className="p-4 border-x border-b border-gray-200 space-y-4">

            {/* READ ACTIONS — collapsible, default all on */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Read Actions</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">{readPerms.filter(p => p.enabled).length} of {readPerms.length} enabled</span>
                  <button
                    onClick={() => setShowReadActions(!showReadActions)}
                    className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showReadActions ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showReadActions ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              {!showReadActions && (
                <p className="text-xs text-gray-400 italic">All read actions are enabled by default. Click "Show" to view and adjust.</p>
              )}
              {showReadActions && (
                <div className="space-y-1.5">
                  {readPerms.map((perm) => (
                    <div key={perm.name} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-800">{perm.label}</span>
                        <Tooltip text={perm.description}>
                          <HelpCircle className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500 cursor-help" />
                        </Tooltip>
                      </div>
                      <Switch checked={perm.enabled} onCheckedChange={() => togglePerm(perm.name)} disabled={perm.locked} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* WRITE ACTIONS — grouped by domain/subcategory */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">Read & Write Actions</p>
              <div className="space-y-2">
                {Object.entries(writeGroups).map(([domain, perms]) => {
                  const enabledCount = perms.filter(p => p.enabled).length;
                  const isExpanded = expandedPermGroups[domain] ?? true;
                  return (
                    <div key={domain} className="rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setExpandedPermGroups(prev => ({ ...prev, [domain]: !isExpanded }))}
                        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-xs font-semibold text-gray-700">{domain}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400">{enabledCount} of {perms.length} enabled</span>
                          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-gray-100">
                          {perms.map((perm) => (
                            <div key={perm.name} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-800">{perm.label}</span>
                                {perm.locked && <Badge variant="outline" className="text-[9px] h-4 px-1 text-gray-400 border-gray-300">Always on</Badge>}
                                <Tooltip text={perm.description + (perm.guardrail ? ` (Guardrail: ${perm.guardrail})` : "")}>
                                  <HelpCircle className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500 cursor-help" />
                                </Tooltip>
                              </div>
                              <Switch checked={perm.enabled} onCheckedChange={() => togglePerm(perm.name)} disabled={perm.locked} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Channels ── */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <SectionHeader id="channels" icon={MessageSquare} title="Channels" />
        {expandedSections.channels && (
          <div className="p-4 border-x border-b border-gray-200 space-y-3">
            <p className="text-xs text-gray-500">Choose which channels this AI Rep will handle.</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Email</p>
                    <p className="text-xs text-gray-500">Handle email tickets</p>
                  </div>
                </div>
                <Switch checked={channels.email} onCheckedChange={(v) => setChannels({ email: v })} />
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 opacity-60">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Live Chat</p>
                    <p className="text-xs text-gray-400">Handle live chat conversations</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs text-gray-400 border-gray-300">Coming soon</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 opacity-60">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">SMS</p>
                    <p className="text-xs text-gray-400">Handle SMS messages</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs text-gray-400 border-gray-300">Coming soon</Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Escalation Handoff — FLAT LAYOUT (no tabs) ── */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <SectionHeader id="handoff" icon={UserCheck} title="Escalation Handoff" />
        {expandedSections.handoff && (
          <div className="p-4 border-x border-b border-gray-200 space-y-5">
            <p className="text-xs text-gray-500">
              Configure how escalated tickets are handled. You can enable multiple methods simultaneously.
            </p>

            {/* Assign to Group */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-600" />
                <h4 className="text-sm font-semibold text-gray-800">Assign to Group</h4>
              </div>
              <p className="text-xs text-gray-400 ml-6">Escalated tickets will be reassigned to this Zendesk group.</p>
              <div className="ml-6">
                <select
                  value={handoff.selectedGroup}
                  onChange={(e) => setHandoff({ selectedGroup: e.target.value })}
                  className="w-full max-w-sm h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                >
                  <option value="">Select a group...</option>
                  {handoff.availableGroups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Assign to Person */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-gray-600" />
                <h4 className="text-sm font-semibold text-gray-800">Assign to Person</h4>
              </div>
              <p className="text-xs text-gray-400 ml-6">Escalated tickets will be assigned to a specific team member.</p>
              <div className="ml-6">
                <select
                  value={handoff.selectedHandoffSeat}
                  onChange={(e) => setHandoff({ selectedHandoffSeat: e.target.value })}
                  className="w-full max-w-sm h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                >
                  <option value="">Select a team member...</option>
                  {handoff.availableHandoffSeats.map((seat) => (
                    <option key={seat.id} value={seat.id}>{seat.name} ({seat.email})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Notify via Email */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-600" />
                <h4 className="text-sm font-semibold text-gray-800">Notify via Email</h4>
              </div>
              <p className="text-xs text-gray-400 ml-6">Send email notifications when a ticket is escalated.</p>
              <div className="ml-6 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Notification Email</label>
                  <Input
                    value={handoff.handoffEmail}
                    onChange={(e) => setHandoff({ handoffEmail: e.target.value })}
                    placeholder="escalations@yourcompany.com"
                    type="email"
                    className="max-w-sm text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">CC (optional)</label>
                  <Input
                    value={handoff.emailCc}
                    onChange={(e) => setHandoff({ emailCc: e.target.value })}
                    placeholder="manager@company.com, team-lead@company.com"
                    type="text"
                    className="max-w-sm text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">Email Template</label>
                  <div className="flex gap-2">
                    {([
                      { value: "default" as const, label: "Default", desc: "Ticket summary + customer info" },
                      { value: "detailed" as const, label: "Detailed", desc: "Full conversation + AI reasoning" },
                      { value: "minimal" as const, label: "Minimal", desc: "Ticket ID + reason only" },
                    ]).map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setHandoff({ emailTemplate: t.value })}
                        className={`flex-1 p-2.5 rounded-lg border text-left transition-colors ${
                          handoff.emailTemplate === t.value
                            ? "border-indigo-300 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className={`text-xs font-medium ${handoff.emailTemplate === t.value ? "text-indigo-700" : "text-gray-700"}`}>{t.label}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Add Tag */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-600" />
                <h4 className="text-sm font-semibold text-gray-800">Add Tag</h4>
              </div>
              <p className="text-xs text-gray-400 ml-6">Add a tag to escalated tickets for filtering in Zendesk Views.</p>
              <div className="ml-6 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Escalation Tag</label>
                  <Input
                    value={handoff.handoffTag}
                    onChange={(e) => setHandoff({ handoffTag: e.target.value })}
                    placeholder="seel_escalated"
                    className="max-w-sm text-sm font-mono"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 max-w-sm">
                  <div>
                    <p className="text-sm text-gray-800">Auto-set priority on escalation</p>
                    <p className="text-xs text-gray-500">Automatically set ticket priority when tag is applied.</p>
                  </div>
                  <Switch
                    checked={handoff.autoSetPriority}
                    onCheckedChange={(v) => setHandoff({ autoSetPriority: v })}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Priority — shared */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 block">Default Escalation Priority</label>
              <p className="text-xs text-gray-400">Default priority level for escalated tickets in Zendesk.</p>
              <div className="flex gap-2">
                {(["normal", "high", "urgent"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setHandoff({ priority: p })}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-colors ${
                      handoff.priority === p
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Go Live Mode ── */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <SectionHeader id="golive" icon={Zap} title="Go-Live Mode" />
        {expandedSections.golive && (
          <div className="p-4 border-x border-b border-gray-200 space-y-3">
            <p className="text-xs text-gray-500">Choose how your AI Rep handles tickets.</p>

            {/* Warning when Zendesk not connected — both modes require it */}
            {zdSkipped && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-amber-800 font-medium">Zendesk connection required</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Both Training and Production modes need a verified Zendesk connection to operate. Training mode writes internal notes, and Production mode sends replies — both require an active Zendesk seat.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                !canGoLive
                  ? "opacity-50 cursor-not-allowed border-gray-200"
                  : goLiveMode === "training"
                    ? "border-indigo-300 bg-indigo-50 cursor-pointer"
                    : "border-gray-200 hover:border-gray-300 cursor-pointer"
              }`}>
                <input
                  type="radio"
                  name="mode"
                  value="training"
                  checked={goLiveMode === "training"}
                  onChange={() => { if (canGoLive) setGoLiveMode("training"); }}
                  disabled={!canGoLive}
                  className="accent-indigo-600 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">Training Mode</p>
                  <p className="text-xs text-gray-500">AI drafts responses and writes internal notes for your review before sending. Best for getting started.</p>
                  {!canGoLive && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Requires Zendesk connection
                    </p>
                  )}
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                !canGoLive
                  ? "opacity-50 cursor-not-allowed border-gray-200"
                  : goLiveMode === "production"
                    ? "border-indigo-300 bg-indigo-50 cursor-pointer"
                    : "border-gray-200 hover:border-gray-300 cursor-pointer"
              }`}>
                <input
                  type="radio"
                  name="mode"
                  value="production"
                  checked={goLiveMode === "production"}
                  onChange={() => {
                    if (canGoLive) setShowProdConfirm(true);
                  }}
                  disabled={!canGoLive}
                  className="accent-indigo-600 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">Production Mode</p>
                  <p className="text-xs text-gray-500">AI replies directly to customers. Escalates when uncertain.</p>
                  {!canGoLive && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Requires Zendesk connection
                    </p>
                  )}
                </div>
              </label>
            </div>

            {showProdConfirm && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800 font-medium mb-2">
                  In Production mode, {hiredRepName} will reply directly to customers without human review. Are you sure?
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setShowProdConfirm(false); setGoLiveMode("training"); }}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => { setGoLiveMode("production"); setShowProdConfirm(false); }}>
                    Confirm Production
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          {isWizard && (
            <Button variant="ghost" size="sm" onClick={() => setSetupStep(2)}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
            </Button>
          )}
        </div>
        <Button onClick={handleComplete} size="sm">
          {isWizard ? (
            canGoLive ? (
              <>{repHired ? "Update & Go Live" : `Hire ${hiredRepName || "Rep"} & Go Live`} <ArrowRight className="w-3.5 h-3.5 ml-1" /></>
            ) : (
              <>Save Configuration <ArrowRight className="w-3.5 h-3.5 ml-1" /></>
            )
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN EXPORT — SetupSettings
   Wizard mode (isWizard=true): guided 3-step flow
   Settings mode (isWizard=false): only Zendesk + Configure Agent (no Import)
   ================================================================ */
export default function SetupSettings({ isWizard = true }: { isWizard?: boolean }) {
  const { setupStep, setSetupStep, stepStatuses } = useApp();

  // In settings mode, if current step is 2 (Import), redirect to step 1
  const effectiveStep = !isWizard && setupStep === 2 ? 1 : setupStep;

  return (
    <div className="flex gap-6 h-full">
      <Stepper
        current={effectiveStep}
        statuses={stepStatuses}
        onSelect={setSetupStep}
        isWizard={isWizard}
      />
      <div className="flex-1 overflow-y-auto pr-2">
        {effectiveStep === 1 && <ZendeskStep isWizard={isWizard} />}
        {effectiveStep === 2 && isWizard && <ImportPoliciesStep isWizard={isWizard} />}
        {effectiveStep === 3 && <ConfigureAgentStep isWizard={isWizard} />}
      </div>
    </div>
  );
}

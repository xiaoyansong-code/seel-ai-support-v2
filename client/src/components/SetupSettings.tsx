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
  ChevronDown, HelpCircle, Eye, EyeOff, Plus, Pen,
} from "lucide-react";

/* ================================================================
   TOOLTIP — lightweight hover tooltip
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
   PERSONALITY EXAMPLES — static sample messages per personality
   ================================================================ */
const PERSONALITY_EXAMPLES: Record<string, { description: string; sample: string }> = {
  Friendly: {
    description: "Warm, empathetic, uses casual language and emoji occasionally.",
    sample: "Hey there! 😊 I totally understand how frustrating that must be. Let me look into your order right away and get this sorted out for you!",
  },
  Professional: {
    description: "Formal, precise, maintains a business-appropriate tone.",
    sample: "Thank you for reaching out. I understand your concern regarding the order. Allow me to review the details and provide you with an update shortly.",
  },
  Casual: {
    description: "Relaxed, conversational, like chatting with a friend.",
    sample: "No worries at all! Let me pull up your order real quick — we'll get this figured out in no time.",
  },
  Customize: {
    description: "Define your own tone and style guidelines.",
    sample: "",
  },
};

/* ================================================================
   STEPPER — left rail
   ================================================================ */
const WIZARD_STEPS = [
  { id: 1, label: "Ticketing System", icon: Globe },
  { id: 2, label: "Import Policies", icon: FileText },
  { id: 3, label: "Configure Agent", icon: Bot },
];

const SETTINGS_STEPS = [
  { id: 1, label: "Ticketing System", icon: Globe },
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
   STEP 1 — Connect Ticketing System (Zendesk)
   ================================================================ */
function TicketingSystemStep({ isWizard }: { isWizard: boolean }) {
  const {
    zendesk, setZendesk, zendeskConnected,
    stepStatuses, setStepStatus, setSetupStep,
  } = useApp();

  const [demoBranch, setDemoBranch] = useState<"success" | "error">("success");

  const currentSubStep = useMemo(() => {
    if (zendesk.triggerStatus === "verified") return 3;
    if (zendesk.seatStatus === "verified") return 3;
    if (zendesk.authStatus === "success") return 2;
    return 1;
  }, [zendesk.authStatus, zendesk.seatStatus, zendesk.triggerStatus]);

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
          seatError: "This seat does not have the required permissions.",
        });
      }
    }, 1200);
  };

  const handleVerifyConnection = () => {
    setZendesk({ triggerStatus: "loading", triggerError: "" });
    setTimeout(() => {
      if (demoBranch === "success") {
        setZendesk({ triggerStatus: "verified", triggerError: "" });
        if (isWizard) {
          setStepStatus(1, "complete");
          setSetupStep(2);
          toast.success("Connection verified! Moving to next step.");
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
  const showStep1 = !isWizard || currentSubStep >= 1;
  const showStep2 = !isWizard || currentSubStep >= 2;
  const showStep3 = !isWizard || currentSubStep >= 3;

  function SubStepStatus({ done }: { done: boolean }) {
    return done ? (
      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
        <Check className="w-3 h-3 text-green-600" />
      </div>
    ) : null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {isWizard ? "Connect Ticketing System" : "Ticketing System"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isWizard
            ? "Connect your ticketing system so your AI Rep can read and respond to tickets."
            : "Manage your ticketing system integration and connection settings."
          }
        </p>
      </div>

      {/* Integration note */}
      <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
        <Info className="w-4 h-4 text-gray-400 shrink-0" />
        <p className="text-xs text-gray-600 flex-1">
          Currently supports <strong>Zendesk</strong> integration. More ticketing systems coming soon.
        </p>
      </div>

      {/* Setup guide link */}
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

      {/* Vertical sub-steps */}
      <div className="space-y-4">
        {/* Sub-step 1: Authorize API */}
        {showStep1 && (
          <div className={`rounded-lg border p-4 space-y-3 ${zendesk.authStatus === "success" && !isWizard ? "border-green-200 bg-green-50/30" : "border-gray-200"}`}>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">1</span>
              <h3 className="text-sm font-semibold text-gray-800">Authorize Zendesk API</h3>
              <SubStepStatus done={zendesk.authStatus === "success"} />
            </div>
            <p className="text-xs text-gray-500 ml-7">
              Enter your Zendesk subdomain to authorize API access. <code className="text-[11px] bg-gray-100 px-1 py-0.5 rounded">https://<strong>your-subdomain</strong>.zendesk.com</code>
            </p>
            {zendesk.authStatus !== "success" && (
              <div className="ml-7 space-y-2">
                <div className="flex items-center gap-1.5 max-w-md">
                  <span className="text-xs text-gray-500 shrink-0">https://</span>
                  <Input
                    value={zendesk.subdomain}
                    onChange={(e) => setZendesk({ subdomain: e.target.value, authError: "" })}
                    placeholder="your-subdomain"
                    className="text-sm flex-1"
                  />
                  <span className="text-xs text-gray-500 shrink-0">.zendesk.com</span>
                </div>
                {zendesk.authError && <p className="text-xs text-red-600">{zendesk.authError}</p>}
                <Button size="sm" onClick={handleAuthorize} disabled={zendesk.authStatus === "loading"}>
                  {zendesk.authStatus === "loading" ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Connecting...</> : "Connect"}
                </Button>
              </div>
            )}
            {zendesk.authStatus === "success" && (
              <p className="text-xs text-green-700 ml-7">Connected to <strong>{zendesk.subdomain}.zendesk.com</strong></p>
            )}
          </div>
        )}

        {/* Sub-step 2: Bind Agent Seat */}
        {showStep2 && (
          <div className={`rounded-lg border p-4 space-y-3 ${zendesk.seatStatus === "verified" && !isWizard ? "border-green-200 bg-green-50/30" : "border-gray-200"}`}>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">2</span>
              <h3 className="text-sm font-semibold text-gray-800">Bind Agent Seat</h3>
              <SubStepStatus done={zendesk.seatStatus === "verified"} />
            </div>
            <p className="text-xs text-gray-500 ml-7">Select which Zendesk agent seat the AI Rep will use.</p>
            <div className="ml-7 space-y-2">
              <div className="flex items-center gap-2 max-w-sm">
                <select
                  value={zendesk.selectedSeat}
                  onChange={(e) => setZendesk({ selectedSeat: e.target.value, seatError: "" })}
                  className="flex-1 h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                  disabled={zendesk.seatStatus === "verified"}
                >
                  <option value="">Select an agent seat...</option>
                  {zendesk.availableSeats.map((seat) => (
                    <option key={seat.id} value={seat.id}>{seat.name} ({seat.email})</option>
                  ))}
                </select>
                <button onClick={handleRefreshSeats} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" title="Refresh seats">
                  <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${zendesk.seatStatus === "loading" ? "animate-spin" : ""}`} />
                </button>
              </div>
              {zendesk.seatError && <p className="text-xs text-red-600">{zendesk.seatError}</p>}
              {zendesk.seatStatus !== "verified" && (
                <Button size="sm" onClick={handleBindSeat} disabled={zendesk.seatStatus === "loading" || !zendesk.selectedSeat}>
                  {zendesk.seatStatus === "loading" ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Binding...</> : "Bind Seat"}
                </Button>
              )}
              {zendesk.seatStatus === "verified" && (
                <p className="text-xs text-green-700">Seat bound: <strong>{zendesk.availableSeats.find(s => s.id === zendesk.selectedSeat)?.name}</strong></p>
              )}
            </div>
          </div>
        )}

        {/* Sub-step 3: Verify Connection */}
        {showStep3 && (
          <div className={`rounded-lg border p-4 space-y-3 ${zendesk.triggerStatus === "verified" && !isWizard ? "border-green-200 bg-green-50/30" : "border-gray-200"}`}>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">3</span>
              <h3 className="text-sm font-semibold text-gray-800">Verify Connection</h3>
              <SubStepStatus done={zendesk.triggerStatus === "verified"} />
            </div>
            <p className="text-xs text-gray-500 ml-7">
              Assign a test ticket to <strong>{zendesk.availableSeats.find(s => s.id === zendesk.selectedSeat)?.name || "the AI Agent"}</strong> in your Zendesk dashboard, then click Verify below.
            </p>
            <div className="ml-7 space-y-2">
              {zendesk.triggerError && <p className="text-xs text-red-600">{zendesk.triggerError}</p>}
              {zendesk.triggerStatus !== "verified" && (
                <Button size="sm" onClick={handleVerifyConnection} disabled={zendesk.triggerStatus === "loading"}>
                  {zendesk.triggerStatus === "loading" ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Waiting for ticket...</> : "Verify"}
                </Button>
              )}
              {zendesk.triggerStatus === "verified" && (
                <p className="text-xs text-green-700">Connection verified — tickets are being received.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* All done summary */}
      {allDone && !isWizard && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-xs text-green-700 font-medium">Zendesk integration is fully connected and verified.</p>
        </div>
      )}

      {/* Footer — wizard only */}
      {isWizard && !allDone && (
        <div className="flex items-center pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              setStepStatus(1, "skipped");
              setSetupStep(2);
            }}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip for now
          </button>
        </div>
      )}

      {/* Settings mode: save button */}
      {!isWizard && (
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button size="sm" onClick={() => toast.success("Ticketing system settings saved")}>
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   STEP 2 — Import Policies (wizard only)
   ================================================================ */
function ImportPoliciesStep() {
  const {
    sopUploaded, setSopUploaded,
    extractedRuleNames, setExtractedRuleNames,
    stepStatuses, setStepStatus, setSetupStep,
    setMainTab, setPlaybookDeepLink,
  } = useApp();

  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [demoBranch, setDemoBranch] = useState<"no-conflict" | "with-conflict">("no-conflict");
  const [conflicts, setConflicts] = useState<{ id: string; question: string; optionA: string; optionB: string; choice: string | null; resolved: boolean }[]>([]);

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setSopUploaded(true);
      setExtractedRuleNames([
        "30-day return policy for unused items",
        "Free shipping on orders over $50",
        "Seel protection claim within 30 days of delivery",
        "Auto-refund for items lost in transit",
        "VIP customers get priority escalation",
      ]);
      if (demoBranch === "with-conflict") {
        setConflicts([
          { id: "c1", question: "Conflicting return windows found:", optionA: "30-day return window (from SOP document)", optionB: "14-day return window (from existing rules)", choice: null, resolved: false },
        ]);
      }
      toast.success("Documents analyzed — 5 rules extracted");
    }, 2000);
  };

  const resolveConflict = (id: string, choice: string) => {
    setConflicts(prev => prev.map(c => c.id === id ? { ...c, choice, resolved: choice !== "later" } : c));
  };

  const allConflictsResolved = conflicts.every((c) => c.resolved);

  const handleContinue = () => {
    setStepStatus(2, sopUploaded ? "complete" : "skipped");
    setSetupStep(3);
  };

  const goToPlaybook = () => {
    setPlaybookDeepLink("documents");
    setMainTab("playbook");
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
          </div>

          {/* Playbook hint with link */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium">After setup, manage your knowledge base in Playbook</p>
              <p className="mt-0.5">
                You can upload additional documents, edit rules, and manage your knowledge base from the Playbook → Documents tab.
              </p>
              <button
                onClick={goToPlaybook}
                className="mt-1.5 text-blue-600 font-medium hover:underline flex items-center gap-1"
              >
                Go to Playbook → Documents <ArrowRight className="w-3 h-3" />
              </button>
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

      {/* Footer */}
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
    </div>
  );
}

/* ================================================================
   STEP 3 — Configure Agent
   Flat layout (no outer collapsibles): Identity, Permissions, Channels, Handoff, Email
   Go Live Mode REMOVED from here — now in Rep header (Plan B)
   Multi-agent secondary nav at top
   ================================================================ */
function ConfigureAgentStep({ isWizard }: { isWizard: boolean }) {
  const {
    repHired, setRepHired,
    hiredRepName, setHiredRepName,
    repPersonality, setRepPersonality,
    repCustomTone, setRepCustomTone,
    repPermissions, setRepPermissions,
    channels, setChannels,
    handoff, setHandoff,
    discloseAI, setDiscloseAI,
    emailSignoff, setEmailSignoff,
    zendeskConnected,
    stepStatuses, setStepStatus, setSetupStep,
    setSetupComplete, setAgentMode,
    agentsData,
  } = useApp();

  const [showReadActions, setShowReadActions] = useState(false);
  const [expandedPermGroups, setExpandedPermGroups] = useState<Record<string, boolean>>({});

  const readPerms = repPermissions.filter((p) => p.type === "read");
  const writePerms = repPermissions.filter((p) => p.type === "write");

  /* Group permissions by domain */
  const readGroups = useMemo(() => {
    const groups: Record<string, typeof readPerms> = {};
    readPerms.forEach((p) => {
      const key = p.domain || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return groups;
  }, [readPerms]);

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
  const nonLeadAgents = agentsData.filter(a => !a.isTeamLead);

  const handleComplete = () => {
    if (!hiredRepName.trim()) {
      toast.error("Please enter a name for your AI Rep");
      return;
    }
    if (isWizard && !canGoLive) {
      setRepHired(false);
      setStepStatus(3, "complete");
      setSetupComplete(true);
      setAgentMode("normal");
      toast.success(`Configuration saved. Complete ticketing system setup to activate ${hiredRepName}.`);
    } else {
      setRepHired(true);
      setStepStatus(3, "complete");
      setSetupComplete(true);
      setAgentMode("normal");
      toast.success(`${hiredRepName} configuration saved!`);
    }
  };

  /* ── Permission row ── */
  function PermRow({ perm }: { perm: typeof readPerms[0] }) {
    return (
      <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-800">{perm.label}</span>
          {perm.locked && <Badge variant="outline" className="text-[9px] h-4 px-1 text-gray-400 border-gray-300">Always on</Badge>}
          <Tooltip text={perm.description + (perm.guardrail ? ` (Guardrail: ${perm.guardrail})` : "")}>
            <HelpCircle className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500 cursor-help" />
          </Tooltip>
        </div>
        <Switch checked={perm.enabled} onCheckedChange={() => togglePerm(perm.name)} disabled={perm.locked} />
      </div>
    );
  }

  /* ── Permission group ── */
  function PermGroup({ domain, perms }: { domain: string; perms: typeof readPerms }) {
    const enabledCount = perms.filter(p => p.enabled).length;
    const isExpanded = expandedPermGroups[domain] ?? true;
    return (
      <div className="rounded-lg border border-gray-200 overflow-hidden">
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
            {perms.map((perm) => <PermRow key={perm.name} perm={perm} />)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Configure Agent</h2>
        <p className="text-sm text-gray-500 mt-1">
          {isWizard
            ? "Set up your AI Rep's identity, permissions, channels, and escalation rules."
            : "Manage your AI Rep's configuration and behavior."
          }
        </p>
      </div>

      {/* ── Multi-agent secondary nav ── */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
        {nonLeadAgents.map((agent) => (
          <button
            key={agent.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium"
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: agent.color }}>
              {agent.initials}
            </div>
            {hiredRepName || agent.name}
          </button>
        ))}
        <button
          onClick={() => toast.info("Add Agent — Create additional AI Reps with different configurations. Coming in the next release.")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-gray-400 text-sm hover:border-indigo-300 hover:text-indigo-500 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Agent
        </button>
      </div>

      {/* ── Identity — flat, no collapsible ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-800">Identity</h3>
        </div>

        <div className="ml-6 space-y-4">
          {/* Rep Name */}
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

          {/* Personality with examples */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">Personality</label>
            <div className="space-y-2">
              {(["Friendly", "Professional", "Casual", "Customize"] as const).map((p) => {
                const example = PERSONALITY_EXAMPLES[p];
                const isSelected = repPersonality === p;
                return (
                  <button
                    key={p}
                    onClick={() => setRepPersonality(p)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${isSelected ? "text-indigo-700" : "text-gray-700"}`}>{p}</span>
                    </div>
                    <p className="text-xs text-gray-500">{example.description}</p>
                    {example.sample && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-100 text-xs text-gray-600 italic">
                        "{example.sample}"
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {repPersonality === "Customize" && (
              <textarea
                value={repCustomTone}
                onChange={(e) => setRepCustomTone(e.target.value)}
                placeholder="Describe the tone and style you want..."
                className="mt-2 w-full text-sm p-2 border border-gray-200 rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            )}
          </div>

          {/* Disclose AI */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-800">Disclose AI Identity</p>
              <p className="text-xs text-gray-500 mt-0.5">Let customers know they're interacting with an AI assistant.</p>
            </div>
            <Switch checked={discloseAI} onCheckedChange={setDiscloseAI} />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* ── Action Permissions — flat, no outer collapsible ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-800">Action Permissions</h3>
        </div>

        <div className="ml-6 space-y-4">
          {/* READ ACTIONS — grouped by domain, default all on, collapsible */}
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
              <div className="space-y-2">
                {Object.entries(readGroups).map(([domain, perms]) => (
                  <PermGroup key={domain} domain={domain} perms={perms} />
                ))}
              </div>
            )}
          </div>

          {/* WRITE ACTIONS — grouped by domain */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">Read & Write Actions</p>
            <div className="space-y-2">
              {Object.entries(writeGroups).map(([domain, perms]) => (
                <PermGroup key={domain} domain={domain} perms={perms} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* ── Channels with per-channel handoff ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-800">Channels & Escalation</h3>
        </div>

        <div className="ml-6 space-y-4">
          {/* Email Channel */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-gray-50">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Email</p>
                  <p className="text-xs text-gray-500">Handle email tickets</p>
                </div>
              </div>
              <Switch checked={channels.email} onCheckedChange={(v) => setChannels({ email: v })} />
            </div>

            {channels.email && (
              <div className="p-4 border-t border-gray-200 space-y-4">
                {/* Email Sign-off */}
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Sending Sign-off</label>
                  <p className="text-xs text-gray-400 mb-2">The closing signature appended to every email reply.</p>
                  <textarea
                    value={emailSignoff}
                    onChange={(e) => setEmailSignoff(e.target.value)}
                    className="w-full max-w-md text-sm p-2 border border-gray-200 rounded-lg resize-none h-16 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Best regards,\nThe Support Team"
                  />
                </div>

                <div className="border-t border-gray-100" />

                {/* Escalation Handoff for Email */}
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-3">Escalation Handoff</p>
                  <p className="text-xs text-gray-400 mb-4">Configure how escalated email tickets are handled.</p>

                  {/* Assign to Group */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      <h4 className="text-xs font-semibold text-gray-700">Assign to Group</h4>
                    </div>
                    <select
                      value={handoff.selectedGroup}
                      onChange={(e) => setHandoff({ selectedGroup: e.target.value })}
                      className="w-full max-w-sm h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="">Select a group...</option>
                      {handoff.availableGroups.map((group) => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-gray-100 my-3" />

                  {/* Assign to Person */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-gray-500" />
                      <h4 className="text-xs font-semibold text-gray-700">Assign to Person</h4>
                    </div>
                    <select
                      value={handoff.selectedHandoffSeat}
                      onChange={(e) => setHandoff({ selectedHandoffSeat: e.target.value })}
                      className="w-full max-w-sm h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="">Select a team member...</option>
                      {handoff.availableHandoffSeats.map((seat) => (
                        <option key={seat.id} value={seat.id}>{seat.name} ({seat.email})</option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-gray-100 my-3" />

                  {/* Add Tag */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-gray-500" />
                      <h4 className="text-xs font-semibold text-gray-700">Add Tag</h4>
                    </div>
                    <Input
                      value={handoff.handoffTag}
                      onChange={(e) => setHandoff({ handoffTag: e.target.value })}
                      placeholder="e.g., ai-escalated"
                      className="max-w-sm text-sm"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <Switch checked={handoff.autoSetPriority} onCheckedChange={(v) => setHandoff({ autoSetPriority: v })} />
                      <span className="text-xs text-gray-600">Auto-set priority on escalation</span>
                    </div>
                    {handoff.autoSetPriority && (
                      <div className="flex gap-2 mt-2">
                        {(["normal", "high", "urgent"] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setHandoff({ priority: p })}
                            className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors capitalize ${
                              handoff.priority === p
                                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Chat — coming soon */}
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

          {/* SMS — coming soon */}
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
              <>{`Save & Activate ${hiredRepName || "Rep"}`} <ArrowRight className="w-3.5 h-3.5 ml-1" /></>
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
   ================================================================ */
export default function SetupSettings({ isWizard = true }: { isWizard?: boolean }) {
  const { setupStep, setSetupStep, stepStatuses } = useApp();

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
        {effectiveStep === 1 && <TicketingSystemStep isWizard={isWizard} />}
        {effectiveStep === 2 && isWizard && <ImportPoliciesStep />}
        {effectiveStep === 3 && <ConfigureAgentStep isWizard={isWizard} />}
      </div>
    </div>
  );
}

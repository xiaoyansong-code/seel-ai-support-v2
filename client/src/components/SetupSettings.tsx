import React, { useState, useEffect } from "react";
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
  Zap, ChevronDown,
} from "lucide-react";

/* ================================================================
   STEPPER — left rail, used in both wizard & settings mode
   ================================================================ */
const STEPS = [
  { id: 1, label: "Connect Zendesk", icon: Globe },
  { id: 2, label: "Import Policies", icon: FileText },
  { id: 3, label: "Configure Agent", icon: Bot },
];

function Stepper({ current, statuses, onSelect, isWizard }: {
  current: number;
  statuses: Record<number, string>;
  onSelect: (step: number) => void;
  isWizard: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 w-56 shrink-0">
      {STEPS.map((step, idx) => {
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
   STEP 1 — Connect Zendesk (3 sub-steps: Auth + Seat dropdown + Trigger)
   NO channels or handoff here — those are in Configure Agent
   ================================================================ */
function ZendeskStep({ isWizard }: { isWizard: boolean }) {
  const {
    zendesk, setZendesk, zendeskConnected,
    stepStatuses, setStepStatus, setSetupStep,
  } = useApp();

  const [subStep, setSubStep] = useState(1);
  const [demoBranch, setDemoBranch] = useState<"success" | "error">("success");

  useEffect(() => {
    if (zendesk.triggerStatus === "verified") setSubStep(3);
    else if (zendesk.seatStatus === "verified") setSubStep(3);
    else if (zendesk.authStatus === "success") setSubStep(2);
  }, []);

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
        setSubStep(2);
      } else {
        setZendesk({
          authStatus: "error",
          authError: "Unable to connect. Please check your subdomain and ensure API access is enabled in Zendesk Admin → Apps and integrations → APIs.",
        });
      }
    }, 1500);
  };

  /* Sub-step 2: Select agent seat via dropdown */
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

  const handleBindSeat = () => {
    if (!zendesk.selectedSeat) {
      setZendesk({ seatError: "Please select an agent seat" });
      return;
    }
    setZendesk({ seatStatus: "loading", seatError: "" });
    setTimeout(() => {
      if (demoBranch === "success") {
        setZendesk({ seatStatus: "verified", seatError: "" });
        setSubStep(3);
      } else {
        setZendesk({
          seatStatus: "error",
          seatError: "This seat does not have the required permissions. The agent seat needs 'Tickets: Read/Write' and 'Users: Read' permissions.",
        });
      }
    }, 1200);
  };

  /* Sub-step 3: Verify trigger */
  const handleVerifyTrigger = () => {
    setZendesk({ triggerStatus: "loading", triggerError: "" });
    setTimeout(() => {
      if (demoBranch === "success") {
        setZendesk({ triggerStatus: "verified", triggerError: "" });
      } else {
        setZendesk({
          triggerStatus: "error",
          triggerError: "No matching trigger found. Please create a trigger in Zendesk that assigns tickets to the Seel AI Agent seat.",
        });
      }
    }, 1200);
  };

  const allDone = zendesk.authStatus === "success" && zendesk.seatStatus === "verified" && zendesk.triggerStatus === "verified";

  const handleContinue = () => {
    setStepStatus(1, allDone ? "complete" : "skipped");
    setSetupStep(2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Connect Zendesk</h2>
        <p className="text-sm text-gray-500 mt-1">
          Set up Zendesk AI Support Access so your AI Rep can read and respond to tickets.
        </p>
      </div>

      {/* Demo branch toggle */}
      <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs">
        <span className="text-amber-700 font-medium">DEMO:</span>
        <button onClick={() => setDemoBranch("success")} className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${demoBranch === "success" ? "bg-green-100 text-green-700" : "text-gray-500 hover:bg-gray-100"}`}>Success Path</button>
        <button onClick={() => setDemoBranch("error")} className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${demoBranch === "error" ? "bg-red-100 text-red-700" : "text-gray-500 hover:bg-gray-100"}`}>Error Path</button>
      </div>

      {/* Sub-step progress */}
      <div className="flex items-center gap-2 text-xs">
        {[
          { n: 1, label: "Authorize API" },
          { n: 2, label: "Bind Agent Seat" },
          { n: 3, label: "Verify Routing" },
        ].map((s, i) => (
          <React.Fragment key={s.n}>
            {i > 0 && <div className="w-8 h-px bg-gray-200" />}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
              subStep === s.n ? "bg-indigo-50 text-indigo-700 font-medium" :
              subStep > s.n ? "text-green-600" : "text-gray-400"
            }`}>
              {subStep > s.n ? <Check className="w-3 h-3" /> : <span className="w-3 text-center">{s.n}</span>}
              <span>{s.label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ── Sub-step 1: Authorize ── */}
      {subStep === 1 && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Step 1: Authorize Zendesk API</h3>
          <p className="text-xs text-gray-500">
            Enter your Zendesk subdomain to authorize API access. You can find this in your Zendesk URL:
            <span className="font-mono ml-1 text-gray-700">https://<strong>your-subdomain</strong>.zendesk.com</span>
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
              <div>
                <p className="text-xs text-red-700">{zendesk.authError}</p>
                <a href="#" className="text-xs text-red-600 underline mt-1 inline-block" onClick={(e) => { e.preventDefault(); toast.info("This would link to Zendesk API setup docs"); }}>
                  How to enable API access →
                </a>
              </div>
            </div>
          )}

          {zendesk.authStatus === "success" && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Connected to {zendesk.subdomain}.zendesk.com</span>
            </div>
          )}

          <Button onClick={handleAuthorize} disabled={zendesk.authStatus === "loading"} size="sm">
            {zendesk.authStatus === "loading" && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {zendesk.authStatus === "success" ? "Re-authorize" : zendesk.authStatus === "error" ? "Retry" : "Connect"}
          </Button>
        </div>
      )}

      {/* ── Sub-step 2: Bind Agent Seat (DROPDOWN) ── */}
      {subStep === 2 && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-sm font-semibold text-gray-800">Step 2: Bind Agent Seat</h3>
          <p className="text-xs text-gray-500">
            Your AI Rep needs a dedicated agent seat in Zendesk. If you haven't created one yet, go to Zendesk Admin → People → Team members and add a new agent.
          </p>

          <div className="flex items-center gap-2">
            <a href="#" onClick={(e) => { e.preventDefault(); toast.info("This would open Zendesk Admin in a new tab"); }} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Open Zendesk Admin
            </a>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700">Select agent seat</label>
              <Button variant="ghost" size="sm" onClick={handleRefreshSeats} disabled={zendesk.seatStatus === "loading"} className="h-7 text-xs">
                <RefreshCw className={`w-3 h-3 mr-1 ${zendesk.seatStatus === "loading" ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Dropdown select instead of radio buttons */}
            <select
              value={zendesk.selectedSeat}
              onChange={(e) => setZendesk({ selectedSeat: e.target.value, seatError: "" })}
              className="w-full max-w-sm h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            >
              <option value="">Select an agent seat...</option>
              {zendesk.availableSeats.map((seat) => (
                <option key={seat.id} value={seat.id}>
                  {seat.name} ({seat.email})
                </option>
              ))}
            </select>

            {zendesk.availableSeats.length === 0 && (
              <p className="text-xs text-gray-400 italic">No agent seats found. Click Refresh after creating one in Zendesk.</p>
            )}
          </div>

          {zendesk.seatStatus === "error" && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-red-700">{zendesk.seatError}</p>
                <p className="text-xs text-red-600 mt-1">Ensure the seat has "Agent" role with ticket read/write permissions.</p>
              </div>
            </div>
          )}

          {zendesk.seatStatus === "verified" && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Agent seat verified and bound</span>
            </div>
          )}

          <Button onClick={handleBindSeat} disabled={zendesk.seatStatus === "loading" || !zendesk.selectedSeat} size="sm">
            {zendesk.seatStatus === "loading" && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {zendesk.seatStatus === "verified" ? "Re-verify" : "Verify & Bind"}
          </Button>
        </div>
      )}

      {/* ── Sub-step 3: Verify Ticket Routing (trigger only, no channels/handoff) ── */}
      {subStep === 3 && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Step 3: Verify Ticket Routing</h3>
          <p className="text-xs text-gray-500">
            Create a Zendesk Trigger to route tickets to your AI agent. In Zendesk Admin → Objects and rules → Triggers:
          </p>
          <div className="bg-white rounded-md border border-gray-200 p-3 text-xs font-mono text-gray-700 space-y-1">
            <p><strong>Conditions:</strong> Ticket is Created</p>
            <p><strong>Actions:</strong> Assignee → {zendesk.availableSeats.find(s => s.id === zendesk.selectedSeat)?.name || "Seel AI Agent"}</p>
          </div>

          <div className="flex items-center gap-2">
            <a href="#" onClick={(e) => { e.preventDefault(); toast.info("This would open the Zendesk trigger setup guide"); }} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> See Guide
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" onClick={(e) => { e.preventDefault(); toast.info("This would open Zendesk Admin"); }} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Open Zendesk Admin
            </a>
          </div>

          {zendesk.triggerStatus === "error" && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">{zendesk.triggerError}</p>
            </div>
          )}

          {zendesk.triggerStatus === "verified" && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Trigger detected and verified</span>
            </div>
          )}

          <Button onClick={handleVerifyTrigger} disabled={zendesk.triggerStatus === "loading"} size="sm">
            {zendesk.triggerStatus === "loading" && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {zendesk.triggerStatus === "verified" ? "Re-verify" : "Verify Trigger"}
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          {isWizard && (
            <Button variant="ghost" size="sm" onClick={() => {
              setStepStatus(1, "skipped");
              setSetupStep(2);
            }}>
              Skip for now
            </Button>
          )}
        </div>
        <Button onClick={handleContinue} size="sm">
          {isWizard ? (
            <>Continue <ChevronRight className="w-3.5 h-3.5 ml-1" /></>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}

/* ================================================================
   STEP 2 — Import Policies
   Settings mode: shows summary + link to Playbook
   ================================================================ */
function ImportPoliciesStep({ isWizard }: { isWizard: boolean }) {
  const {
    sopUploaded, setSopUploaded,
    extractedRuleNames, setExtractedRuleNames,
    stepStatuses, setStepStatus, setSetupStep,
    mainTab, setMainTab, setShowSettings,
  } = useApp();

  const [uploading, setUploading] = useState(false);
  const [demoBranch, setDemoBranch] = useState<"no-conflict" | "with-conflict">("no-conflict");
  const [conflicts, setConflicts] = useState<{ id: string; question: string; optionA: string; optionB: string; resolved: boolean; choice: string }[]>([]);
  const [urlInput, setUrlInput] = useState("");

  const sampleRules = [
    "WISMO — Order Tracking",
    "Refund — Standard Process",
    "Cancellation — Unfulfilled Orders",
    "Address Change — Pre-Dispatch",
    "VIP Customer Handling",
    "Damaged Item — Replacement Flow",
    "Gift Card — Balance Inquiry",
    "International Returns — Shipping",
  ];

  const sampleConflicts = [
    { id: "c1", question: "Return window duration", optionA: "30 days (Return_Policy.pdf)", optionB: "14 days (FAQ_Document.pdf)", resolved: false, choice: "" },
    { id: "c2", question: "Refund method for exchanges", optionA: "Original payment method (SOP_v2.pdf)", optionB: "Store credit only (FAQ_Document.pdf)", resolved: false, choice: "" },
  ];

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setSopUploaded(true);
      setExtractedRuleNames(sampleRules);
      if (demoBranch === "with-conflict") {
        setConflicts(sampleConflicts);
      } else {
        setConflicts([]);
      }
    }, 2000);
  };

  const resolveConflict = (id: string, choice: string) => {
    setConflicts((prev) => prev.map((c) => c.id === id ? { ...c, resolved: true, choice } : c));
  };

  const allConflictsResolved = conflicts.every((c) => c.resolved);

  const handleContinue = () => {
    setStepStatus(2, sopUploaded ? "complete" : "skipped");
    setSetupStep(3);
  };

  const goToPlaybook = () => {
    setShowSettings(false);
    setMainTab("playbook");
  };

  /* Settings mode: show summary + Playbook link */
  if (!isWizard && sopUploaded) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Import Policies</h2>
          <p className="text-sm text-gray-500 mt-1">
            Your documents have been imported and rules extracted. Manage documents and rules in the Playbook.
          </p>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-800">
              {extractedRuleNames.length} rules extracted
            </span>
          </div>
          <ul className="space-y-1 ml-6 mb-3">
            {extractedRuleNames.slice(0, 5).map((name, i) => (
              <li key={i} className="text-xs text-green-700 flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-green-400" />
                {name}
              </li>
            ))}
            {extractedRuleNames.length > 5 && (
              <li className="text-xs text-green-600">+{extractedRuleNames.length - 5} more rules</li>
            )}
          </ul>
        </div>

        <Button onClick={goToPlaybook} size="sm" variant="outline" className="gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          Manage in Playbook
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

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
                      <button
                        onClick={() => resolveConflict(conflict.id, "later")}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                      >
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
          {isWizard && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setSetupStep(1)}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
              </Button>
              <Button variant="ghost" size="sm" onClick={() => {
                setStepStatus(2, "skipped");
                setSetupStep(3);
              }}>
                Skip for now
              </Button>
            </>
          )}
        </div>
        <Button
          onClick={handleContinue}
          size="sm"
          disabled={conflicts.length > 0 && !allConflictsResolved && sopUploaded}
        >
          {isWizard ? (
            <>Continue <ChevronRight className="w-3.5 h-3.5 ml-1" /></>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}

/* ================================================================
   STEP 3 — Configure Agent
   Now includes: Identity, Permissions, Channels, Escalation Handoff, Go Live
   Go Live restricted when Zendesk not connected
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

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const readPerms = repPermissions.filter((p) => p.type === "read");
  const writePerms = repPermissions.filter((p) => p.type === "write");

  const togglePerm = (name: string) => {
    setRepPermissions(
      repPermissions.map((p) => (p.name === name && !p.locked ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const canGoProduction = zendeskConnected;
  const zdSkipped = stepStatuses[1] === "skipped";

  const handleComplete = () => {
    if (!hiredRepName.trim()) {
      toast.error("Please enter a name for your AI Rep");
      return;
    }
    setRepHired(true);
    setStepStatus(3, "complete");
    setSetupComplete(true);
    setAgentMode("normal");
    toast.success(`${hiredRepName} is now live in ${goLiveMode} mode!`);
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
          Set up your AI Rep's identity, permissions, channels, escalation rules, and go-live mode.
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

      {/* ── Permissions ── */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <SectionHeader id="permissions" icon={Shield} title="Action Permissions" />
        {expandedSections.permissions && (
          <div className="p-4 border-x border-b border-gray-200 space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">Read Actions</p>
              <div className="space-y-2">
                {readPerms.map((perm) => (
                  <div key={perm.name} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{perm.label}</p>
                      <p className="text-xs text-gray-500">{perm.description}</p>
                    </div>
                    <Switch checked={perm.enabled} onCheckedChange={() => togglePerm(perm.name)} disabled={perm.locked} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">Write Actions</p>
              <div className="space-y-2">
                {writePerms.map((perm) => (
                  <div key={perm.name} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-800">{perm.label}</p>
                        {perm.locked && <Badge variant="outline" className="text-[9px] h-4 px-1 text-gray-400 border-gray-300">Always on</Badge>}
                      </div>
                      <p className="text-xs text-gray-500">{perm.description}</p>
                    </div>
                    <Switch checked={perm.enabled} onCheckedChange={() => togglePerm(perm.name)} disabled={perm.locked} />
                  </div>
                ))}
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

      {/* ── Escalation Handoff ── */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <SectionHeader id="handoff" icon={UserCheck} title="Escalation Handoff" />
        {expandedSections.handoff && (
          <div className="p-4 border-x border-b border-gray-200 space-y-4">
            <p className="text-xs text-gray-500">
              When your AI Rep escalates a ticket, how should it be handed off?
            </p>

            {/* Method selector — now includes "seat" */}
            <div className="flex gap-2 flex-wrap">
              {([
                { value: "group" as const, label: "Assign to Group", icon: Users },
                { value: "seat" as const, label: "Assign to Person", icon: UserCheck },
                { value: "email" as const, label: "Notify via Email", icon: Mail },
                { value: "tag" as const, label: "Add Tag", icon: Tag },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setHandoff({ method: opt.value })}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    handoff.method === opt.value
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Group-based */}
            {handoff.method === "group" && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 block">Assign to Zendesk Group</label>
                <p className="text-xs text-gray-400 mb-1">Escalated tickets will be reassigned to this group.</p>
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
            )}

            {/* Seat-based (assign to specific person) */}
            {handoff.method === "seat" && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 block">Assign to Specific Person</label>
                <p className="text-xs text-gray-400 mb-1">Escalated tickets will be assigned to this team member.</p>
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
            )}

            {/* Email-based with expanded settings */}
            {handoff.method === "email" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Notification Email</label>
                  <p className="text-xs text-gray-400 mb-2">Primary email to notify when a ticket is escalated.</p>
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
                  <p className="text-xs text-gray-400 mb-2">Additional emails to CC on escalation notifications, separated by commas.</p>
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
                      { value: "detailed" as const, label: "Detailed", desc: "Full conversation history + AI reasoning" },
                      { value: "minimal" as const, label: "Minimal", desc: "Ticket ID + escalation reason only" },
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
            )}

            {/* Tag-based with expanded settings */}
            {handoff.method === "tag" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Escalation Tag</label>
                  <p className="text-xs text-gray-400 mb-2">This tag will be added to escalated tickets. Use Zendesk Views to filter by this tag.</p>
                  <Input
                    value={handoff.handoffTag}
                    onChange={(e) => setHandoff({ handoffTag: e.target.value })}
                    placeholder="seel_escalated"
                    className="max-w-sm text-sm font-mono"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div>
                    <p className="text-sm text-gray-800">Auto-set priority on escalation</p>
                    <p className="text-xs text-gray-500">Automatically set the ticket priority when the tag is applied.</p>
                  </div>
                  <Switch
                    checked={handoff.autoSetPriority}
                    onCheckedChange={(v) => setHandoff({ autoSetPriority: v })}
                  />
                </div>
              </div>
            )}

            {/* Priority — shared across all methods */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Escalation Priority</label>
              <p className="text-xs text-gray-400 mb-2">Default priority for escalated tickets in Zendesk.</p>
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

            {/* Warning when Zendesk not connected */}
            {!canGoProduction && zdSkipped && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-amber-800 font-medium">Zendesk is not connected</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Your Rep can only operate in Training mode until Zendesk is fully set up. Production mode requires a verified Zendesk connection.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                goLiveMode === "training" ? "border-indigo-300 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
              }`}>
                <input
                  type="radio"
                  name="mode"
                  value="training"
                  checked={goLiveMode === "training"}
                  onChange={() => setGoLiveMode("training")}
                  className="accent-indigo-600 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">Training Mode</p>
                  <p className="text-xs text-gray-500">AI drafts responses for your review before sending. Best for getting started.</p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                !canGoProduction
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
                    if (canGoProduction) setShowProdConfirm(true);
                  }}
                  disabled={!canGoProduction}
                  className="accent-indigo-600 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">Production Mode</p>
                  <p className="text-xs text-gray-500">AI replies directly to customers. Escalates when uncertain.</p>
                  {!canGoProduction && (
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
            <>{repHired ? "Update & Go Live" : `Hire ${hiredRepName || "Rep"} & Go Live`} <ArrowRight className="w-3.5 h-3.5 ml-1" /></>
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
   Wizard mode (isWizard=true): guided step-by-step
   Settings mode (isWizard=false): free navigation
   ================================================================ */
export default function SetupSettings({ isWizard = true }: { isWizard?: boolean }) {
  const { setupStep, setSetupStep, stepStatuses } = useApp();

  return (
    <div className="flex gap-6 h-full">
      <Stepper
        current={setupStep}
        statuses={stepStatuses}
        onSelect={setSetupStep}
        isWizard={isWizard}
      />
      <div className="flex-1 overflow-y-auto pr-2">
        {setupStep === 1 && <ZendeskStep isWizard={isWizard} />}
        {setupStep === 2 && <ImportPoliciesStep isWizard={isWizard} />}
        {setupStep === 3 && <ConfigureAgentStep isWizard={isWizard} />}
      </div>
    </div>
  );
}

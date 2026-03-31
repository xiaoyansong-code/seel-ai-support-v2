/*
 * Home — Main layout: Sidebar + Header Tabs + Content Area
 * Design: Shopify admin style — clean, warm, professional
 */
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import Sidebar from "@/components/Sidebar";
import AgentsPage from "@/pages/AgentsPage";
import PlaybookPage from "@/pages/PlaybookPage";
import PerformancePage from "@/pages/PerformancePage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UserPlus, Eye, Zap, Lock } from "lucide-react";
import { toast } from "sonner";

const tabs = [
  { id: "agents" as const, label: "Agents" },
  { id: "playbook" as const, label: "Playbook" },
  { id: "performance" as const, label: "Performance" },
];

export default function Home() {
  const { mainTab, setMainTab, agentMode, setAgentMode } = useApp();
  const [hireDialogOpen, setHireDialogOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Page header */}
        <div className="border-b border-border bg-white">
          <div className="px-6 pt-4 pb-0">
            <h1 className="text-[18px] font-bold text-foreground mb-3">AI support</h1>
            {/* Top tabs */}
            <div className="flex items-center gap-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMainTab(tab.id)}
                  className={cn(
                    "px-4 py-2 text-[13px] font-medium border-b-2 transition-colors -mb-[1px]",
                    mainTab === tab.id
                      ? "border-[#6c47ff] text-[#6c47ff]"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sub-header for Agents tab: TEST MODE + Onboarding/Normal toggle + Hire Rep */}
        {mainTab === "agents" && (
          <div className="px-5 py-2 border-b border-border bg-[#fffdf7] flex items-center gap-3">
            <Badge variant="outline" className="text-[11px] font-bold border-red-400 text-red-600 bg-red-50">
              TEST MODE
            </Badge>
            <div className="flex items-center bg-white border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setAgentMode("onboarding")}
                className={cn(
                  "px-3 py-1 text-[12px] font-medium transition-colors",
                  agentMode === "onboarding"
                    ? "bg-[#f5a623] text-white"
                    : "text-muted-foreground hover:bg-[#fafafa]"
                )}
              >
                Onboarding
              </button>
              <button
                onClick={() => setAgentMode("normal")}
                className={cn(
                  "px-3 py-1 text-[12px] font-medium transition-colors",
                  agentMode === "normal"
                    ? "bg-[#f5a623] text-white"
                    : "text-muted-foreground hover:bg-[#fafafa]"
                )}
              >
                Normal
              </button>
            </div>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              className="text-[12px] h-7 border-[#6c47ff] text-[#6c47ff] hover:bg-[#f0edff]"
              onClick={() => setHireDialogOpen(true)}
            >
              <UserPlus size={12} className="mr-1.5" />
              Hire Rep
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-[#fafafa]">
          {mainTab === "agents" && <AgentsPage />}
          {mainTab === "playbook" && <PlaybookPage />}
          {mainTab === "performance" && <PerformancePage />}
        </div>
      </div>

      {/* Hire Rep Dialog */}
      <HireRepDialog open={hireDialogOpen} onOpenChange={setHireDialogOpen} />
    </div>
  );
}

/* ── Permission row data ── */
interface HirePermission {
  name: string;
  system: string;
  defaultOn: boolean;
  locked: boolean;
}

const readActions: HirePermission[] = [
  { name: "Look up order details", system: "Shopify", defaultOn: true, locked: false },
  { name: "Track shipment", system: "Shopify", defaultOn: true, locked: false },
  { name: "Look up customer info", system: "Shopify / Zendesk", defaultOn: true, locked: false },
  { name: "Look up product info", system: "Shopify", defaultOn: true, locked: false },
  { name: "Look up Seel protection status", system: "Seel", defaultOn: true, locked: false },
];

const writeActions: HirePermission[] = [
  { name: "Reply to customer", system: "Zendesk", defaultOn: true, locked: true },
  { name: "Escalate to human", system: "Zendesk", defaultOn: true, locked: true },
  { name: "Cancel order", system: "Shopify", defaultOn: false, locked: false },
  { name: "Edit shipping address", system: "Shopify", defaultOn: false, locked: false },
];

function HireRepDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { setHiredRepName, setOnboardingStep, setOnboardingArea } = useApp();
  const [repName, setRepName] = useState("Ava");
  const [personality, setPersonality] = useState<"Friendly" | "Professional" | "Casual" | "Customize">("Friendly");
  const [customTone, setCustomTone] = useState("");
  const [readPerms, setReadPerms] = useState(() => readActions.map((a) => ({ ...a, enabled: a.defaultOn })));
  const [writePerms, setWritePerms] = useState(() => writeActions.map((a) => ({ ...a, enabled: a.defaultOn })));

  const toggleRead = (idx: number) => {
    setReadPerms((prev) => prev.map((p, i) => i === idx && !p.locked ? { ...p, enabled: !p.enabled } : p));
  };
  const toggleWrite = (idx: number) => {
    setWritePerms((prev) => prev.map((p, i) => i === idx && !p.locked ? { ...p, enabled: !p.enabled } : p));
  };

  const handleHire = () => {
    if (!repName.trim()) return;
    setHiredRepName(repName.trim());
    // Advance onboarding to step 7 (Rep readiness check) and switch to rep area
    setOnboardingStep(7);
    setOnboardingArea("rep");
    onOpenChange(false);
    toast.success(`${repName} has been hired!`, { description: "Switching to Rep area for readiness check." });
  };

  const personalities = ["Friendly", "Professional", "Casual", "Customize"] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Hire a New AI Rep</DialogTitle>
          <DialogDescription className="text-[13px]">
            Configure your new AI support representative.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Identity Section */}
          <div>
            <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Identity</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-medium text-foreground mb-1 block">Name</label>
                <Input
                  value={repName}
                  onChange={(e) => setRepName(e.target.value.slice(0, 20))}
                  placeholder="Enter rep name..."
                  className="text-[13px]"
                />
                <p className="text-[10px] text-muted-foreground mt-1">{repName.length}/20 characters</p>
              </div>
              <div>
                <label className="text-[12px] font-medium text-foreground mb-1.5 block">Personality</label>
                <div className="flex gap-2 flex-wrap">
                  {personalities.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPersonality(p)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors",
                        personality === p
                          ? "bg-[#6c47ff] text-white border-[#6c47ff]"
                          : "bg-white text-foreground border-border hover:border-[#6c47ff]/50"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {personality === "Customize" && (
                  <textarea
                    value={customTone}
                    onChange={(e) => setCustomTone(e.target.value)}
                    placeholder="Describe the tone and style you want..."
                    className="mt-2 w-full h-20 px-3 py-2 rounded-lg border border-border bg-white text-[12px] focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/30 resize-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Action Permissions Section */}
          <div>
            <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Action Permissions</h4>

            {/* Read Actions */}
            <div className="mb-4">
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
                    {readPerms.map((perm, i) => (
                      <tr key={i} className="border-t border-border/50">
                        <td className="px-3 py-2 text-foreground">{perm.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{perm.system}</td>
                        <td className="px-3 py-2 text-right">
                          <Switch checked={perm.enabled} onCheckedChange={() => toggleRead(i)} disabled={perm.locked} className="ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Write Actions */}
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
                    {writePerms.map((perm, i) => (
                      <tr key={i} className="border-t border-border/50">
                        <td className="px-3 py-2 text-foreground">
                          <div className="flex items-center gap-1.5">
                            {perm.name}
                            {perm.locked && <Lock size={10} className="text-muted-foreground" />}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{perm.system}</td>
                        <td className="px-3 py-2 text-right">
                          <Switch checked={perm.enabled} onCheckedChange={() => toggleWrite(i)} disabled={perm.locked} className="ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" className="text-[12px]" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-[12px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white"
              onClick={handleHire}
              disabled={!repName.trim()}
            >
              <UserPlus size={12} className="mr-1" /> Hire {repName || "Rep"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

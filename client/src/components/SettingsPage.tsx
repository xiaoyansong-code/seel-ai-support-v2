/*
 * SettingsPage — Integrations + Agent Config
 * Entry from ⚙️ button at bottom of agent sidebar in Agents tab
 */
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Check, AlertTriangle, ChevronLeft, Eye, Zap, Lock,
  ExternalLink, PlugZap, Store, Headphones,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const {
    setShowSettings,
    shopifyConnected, zendeskConnected,
    hiredRepName, setHiredRepName,
    repPersonality, setRepPersonality,
    repCustomTone, setRepCustomTone,
    repPermissions, setRepPermissions,
    goLiveMode, setGoLiveMode,
  } = useApp();

  const [confirmProdOpen, setConfirmProdOpen] = useState(false);

  const readPerms = repPermissions.filter((p) => p.type === "read");
  const writePerms = repPermissions.filter((p) => p.type === "write");

  const togglePerm = (id: string) => {
    setRepPermissions(
      repPermissions.map((p) => p.id === id && !p.locked ? { ...p, enabled: !p.enabled } : p)
    );
  };

  const handleModeChange = (mode: "training" | "production") => {
    if (mode === "production" && goLiveMode !== "production") {
      setConfirmProdOpen(true);
    } else {
      setGoLiveMode(mode);
    }
  };

  const personalities = ["Friendly", "Professional", "Casual", "Customize"] as const;
  const personalityDescriptions: Record<string, string> = {
    Friendly: "Warm, friendly, and reassuring tone. Uses empathetic language.",
    Professional: "Professional, calm, and direct tone. Focuses on efficiency.",
    Casual: "Casual, conversational tone. Feels like chatting with a friend.",
    Customize: "",
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fafafa]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-white flex items-center gap-3">
        <button
          onClick={() => setShowSettings(false)}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#f0f0f0] transition-colors"
        >
          <ChevronLeft size={18} className="text-muted-foreground" />
        </button>
        <h2 className="text-[15px] font-semibold text-foreground">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[640px] mx-auto px-6 py-6 space-y-8">

          {/* ── Section: Integrations ── */}
          <div>
            <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Integrations</h3>
            <div className="space-y-3">
              {/* Shopify */}
              <div className={cn(
                "border rounded-xl p-4 flex items-start gap-3",
                shopifyConnected ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/50"
              )}>
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  shopifyConnected ? "bg-emerald-100" : "bg-amber-100"
                )}>
                  <Store size={18} className={shopifyConnected ? "text-emerald-600" : "text-amber-600"} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-foreground">Shopify</p>
                    {shopifyConnected ? (
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Connected</span>
                    ) : (
                      <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Not Connected</span>
                    )}
                  </div>
                  {shopifyConnected ? (
                    <p className="text-[12px] text-muted-foreground mt-0.5">alexsong.myshopify.com</p>
                  ) : (
                    <p className="text-[12px] text-amber-700 mt-0.5">Contact support to connect your Shopify store.</p>
                  )}
                </div>
                {!shopifyConnected && (
                  <Button size="sm" variant="outline" className="text-[11px] h-7 shrink-0" onClick={() => toast.info("Contact support flow would open here.")}>
                    Connect
                  </Button>
                )}
              </div>

              {/* Zendesk */}
              <div className={cn(
                "border rounded-xl p-4 flex items-start gap-3",
                zendeskConnected ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/50"
              )}>
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  zendeskConnected ? "bg-emerald-100" : "bg-amber-100"
                )}>
                  <Headphones size={18} className={zendeskConnected ? "text-emerald-600" : "text-amber-600"} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-foreground">Zendesk AI Support Access</p>
                    {zendeskConnected ? (
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Connected</span>
                    ) : (
                      <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Not Connected</span>
                    )}
                  </div>
                  {zendeskConnected ? (
                    <p className="text-[12px] text-muted-foreground mt-0.5">coastalliving.zendesk.com — API authorized, agent seat active, routing configured</p>
                  ) : (
                    <p className="text-[12px] text-amber-700 mt-0.5">Complete the 3-step Zendesk setup to enable ticket handling.</p>
                  )}
                </div>
                {!zendeskConnected && (
                  <Button size="sm" variant="outline" className="text-[11px] h-7 shrink-0" onClick={() => {
                    setShowSettings(false);
                    toast.info("Switch to Setup mode to complete Zendesk configuration.");
                  }}>
                    Set Up
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* ── Section: Agent Config ── */}
          <div>
            <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Agent Configuration</h3>

            {/* Identity */}
            <div className="bg-white border border-border rounded-xl p-5 space-y-4 mb-3">
              <h4 className="text-[12px] font-semibold text-foreground">Identity</h4>
              <div>
                <label className="text-[12px] font-medium text-muted-foreground mb-1 block">Name</label>
                <Input
                  value={hiredRepName}
                  onChange={(e) => setHiredRepName(e.target.value.slice(0, 20))}
                  className="text-[13px] max-w-xs"
                />
                <p className="text-[10px] text-muted-foreground mt-1">{hiredRepName.length}/20 characters</p>
              </div>
              <div>
                <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Personality</label>
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

            {/* Permissions */}
            <div className="bg-white border border-border rounded-xl p-5 space-y-4 mb-3">
              <h4 className="text-[12px] font-semibold text-foreground">Action Permissions</h4>

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

            {/* Go-Live Mode */}
            <div className="bg-white border border-border rounded-xl p-5 space-y-3">
              <h4 className="text-[12px] font-semibold text-foreground">Go-Live Mode</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleModeChange("training")}
                  className={cn(
                    "border rounded-lg p-3.5 text-left transition-all",
                    goLiveMode === "training"
                      ? "border-[#6c47ff] bg-[#f8f6ff] ring-1 ring-[#6c47ff]/20"
                      : "border-border hover:border-[#6c47ff]/30"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Eye size={14} className={goLiveMode === "training" ? "text-[#6c47ff]" : "text-muted-foreground"} />
                    <p className="text-[12px] font-semibold text-foreground">Training</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Review before sending</p>
                </button>
                <button
                  onClick={() => handleModeChange("production")}
                  className={cn(
                    "border rounded-lg p-3.5 text-left transition-all",
                    goLiveMode === "production"
                      ? "border-[#6c47ff] bg-[#f8f6ff] ring-1 ring-[#6c47ff]/20"
                      : "border-border hover:border-[#6c47ff]/30"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={14} className={goLiveMode === "production" ? "text-[#6c47ff]" : "text-muted-foreground"} />
                    <p className="text-[12px] font-semibold text-foreground">Production</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Reply directly</p>
                </button>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end pb-4">
            <Button
              className="text-[13px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white"
              onClick={() => {
                toast.success("Settings saved");
                setShowSettings(false);
              }}
            >
              Save & Close
            </Button>
          </div>
        </div>
      </div>

      {/* Production confirmation dialog */}
      <Dialog open={confirmProdOpen} onOpenChange={setConfirmProdOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Enable Production Mode?</DialogTitle>
            <DialogDescription className="text-[13px]">
              {hiredRepName} will reply directly to customers. You can switch back to Training mode anytime.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="text-[12px]" onClick={() => setConfirmProdOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" className="text-[12px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white" onClick={() => {
              setGoLiveMode("production");
              setConfirmProdOpen(false);
            }}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

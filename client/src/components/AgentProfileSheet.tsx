/*
 * AgentProfileSheet — View & Edit mode for AI Rep profile
 * PRD: US2 — Rep Profile panel with Action Permissions, Mode toggle, Config History
 */
import { useState, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import type { Agent, ActionPermission } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, X, Save, Clock, GitCommit, Shield, Eye, Zap, Lock, BarChart3, Smile } from "lucide-react";
import { toast } from "sonner";

interface Props {
  agent: Agent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ProfileTab = "overview" | "permissions" | "history";

export default function AgentProfileSheet({ agent, open, onOpenChange }: Props) {
  const { updateAgent } = useApp();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [editing, setEditing] = useState(false);

  // Edit state
  const [editMode, setEditMode] = useState(agent.mode);
  const [editPersonality, setEditPersonality] = useState(agent.personality);
  const [editLanguage, setEditLanguage] = useState(agent.language);
  const [editPermissions, setEditPermissions] = useState<ActionPermission[]>(agent.actionPermissions);

  const startEdit = () => {
    setEditMode(agent.mode);
    setEditPersonality(agent.personality);
    setEditLanguage(agent.language);
    setEditPermissions([...agent.actionPermissions]);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const saveEdit = useCallback(() => {
    updateAgent(agent.id, {
      mode: editMode as Agent["mode"],
      personality: editPersonality as Agent["personality"],
      language: editLanguage,
      actionPermissions: editPermissions,
    });
    setEditing(false);
    toast.success("Profile updated", { description: `${agent.name}'s configuration has been saved.` });
  }, [agent.id, agent.name, editMode, editPersonality, editLanguage, editPermissions, updateAgent]);

  const togglePermission = (id: string) => {
    setEditPermissions((prev) =>
      prev.map((p) => (p.id === id && !p.locked ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const readPerms = (editing ? editPermissions : agent.actionPermissions).filter((p) => p.type === "read");
  const writePerms = (editing ? editPermissions : agent.actionPermissions).filter((p) => p.type === "write");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[440px] sm:max-w-[440px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: agent.color }}
              >
                {agent.initials}
              </div>
              <div>
                <SheetTitle className="text-[15px] font-semibold">{agent.name}</SheetTitle>
                <p className="text-[12px] text-muted-foreground">{agent.role}</p>
              </div>
            </div>
            {!editing ? (
              <Button variant="outline" size="sm" className="text-[12px] h-7" onClick={startEdit}>
                <Pencil size={12} className="mr-1" /> Edit
              </Button>
            ) : (
              <div className="flex gap-1.5">
                <Button variant="ghost" size="sm" className="text-[12px] h-7" onClick={cancelEdit}>
                  <X size={12} className="mr-1" /> Cancel
                </Button>
                <Button size="sm" className="text-[12px] h-7 bg-[#6c47ff] hover:bg-[#5a3ad9] text-white" onClick={saveEdit}>
                  <Save size={12} className="mr-1" /> Save
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>

        {/* Tabs */}
        <div className="flex border-b border-border px-5 mt-4">
          {(["overview", "permissions", "history"] as ProfileTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-2 text-[12px] font-medium capitalize transition-colors border-b-2 -mb-px",
                activeTab === tab
                  ? "border-[#6c47ff] text-[#6c47ff]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={<BarChart3 size={14} />} label="Resolution" value={agent.resolution ? `${agent.resolution}%` : "—"} />
                <StatCard icon={<Clock size={14} />} label="Avg Response" value={agent.avgResponse} />
                <StatCard icon={<Smile size={14} />} label="CSAT" value={agent.csat ? `${agent.csat}/5` : "—"} />
                <StatCard icon={<Zap size={14} />} label="Escalation" value={agent.escalation ? `${agent.escalation}%` : "—"} />
              </div>

              <Separator />

              {/* Configuration */}
              <div className="space-y-3">
                <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Configuration</h4>

                {/* Mode */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-foreground">Mode</span>
                  {editing ? (
                    <Select value={editMode} onValueChange={(v) => setEditMode(v as Agent["mode"])}>
                      <SelectTrigger className="w-[160px] h-8 text-[12px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Training">Training</SelectItem>
                        <SelectItem value="Production">Production</SelectItem>
                        <SelectItem value="Off">Off</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className={cn(
                      "text-[11px]",
                      agent.mode === "Production" ? "border-green-500 text-green-600" :
                      agent.mode === "Training" ? "border-amber-500 text-amber-600" :
                      "border-gray-400 text-gray-500"
                    )}>
                      {agent.mode}
                    </Badge>
                  )}
                </div>

                {/* Personality */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-foreground">Personality</span>
                  {editing ? (
                    <Select value={editPersonality} onValueChange={(v) => setEditPersonality(v as Agent["personality"])}>
                      <SelectTrigger className="w-[160px] h-8 text-[12px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Friendly">Friendly</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-[13px] text-muted-foreground">{agent.personality}</span>
                  )}
                </div>

                {/* Language */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-foreground">Language</span>
                  {editing ? (
                    <Select value={editLanguage} onValueChange={setEditLanguage}>
                      <SelectTrigger className="w-[160px] h-8 text-[12px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Auto-detect (match customer's language)">Auto-detect</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-[13px] text-muted-foreground">{agent.language}</span>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-foreground">Status</span>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", agent.status === "online" ? "bg-green-500" : "bg-gray-400")} />
                    <span className="text-[13px] text-muted-foreground capitalize">{agent.status}</span>
                  </div>
                </div>

                {/* Start Date */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-foreground">Start Date</span>
                  <span className="text-[13px] text-muted-foreground">{agent.startDate}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="space-y-5">
              {/* Read Actions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Eye size={14} className="text-blue-500" />
                  <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Read Actions</h4>
                </div>
                <div className="space-y-2">
                  {readPerms.map((perm) => (
                    <PermissionRow key={perm.id} perm={perm} editing={editing} onToggle={togglePermission} />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Write Actions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-amber-500" />
                  <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Write Actions</h4>
                </div>
                <div className="space-y-2">
                  {writePerms.map((perm) => (
                    <PermissionRow key={perm.id} perm={perm} editing={editing} onToggle={togglePermission} />
                  ))}
                </div>
              </div>

              {!editing && (
                <p className="text-[11px] text-muted-foreground italic">Click "Edit" to modify action permissions.</p>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-0">
              {agent.configHistory.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No configuration changes yet.</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                  {agent.configHistory.map((entry, i) => (
                    <div key={i} className="flex gap-3 pb-5 relative">
                      <div className="w-6 h-6 rounded-full bg-[#f0edff] border border-[#6c47ff]/20 flex items-center justify-center shrink-0 z-10">
                        <GitCommit size={12} className="text-[#6c47ff]" />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-[13px] font-medium text-foreground">{entry.summary}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{entry.diff}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                          <span>{entry.author}</span>
                          <span>·</span>
                          <span>{entry.timestamp}</span>
                          <Badge variant="secondary" className="text-[9px] h-4 font-mono">{entry.hash}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---- Helper Components ----
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[#f8f9fa] rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">{icon}<span className="text-[11px]">{label}</span></div>
      <p className="text-[16px] font-semibold text-foreground">{value}</p>
    </div>
  );
}

function PermissionRow({ perm, editing, onToggle }: { perm: ActionPermission; editing: boolean; onToggle: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#f8f9fa]">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-foreground">{perm.name}</span>
          {perm.locked && <Lock size={10} className="text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground">{perm.system}</span>
          {perm.guardrail && (
            <>
              <span className="text-[11px] text-muted-foreground">·</span>
              <span className="text-[11px] text-amber-600 flex items-center gap-0.5">
                <Shield size={10} /> {perm.guardrail}
              </span>
            </>
          )}
        </div>
      </div>
      <Switch
        checked={perm.enabled}
        onCheckedChange={() => onToggle(perm.id)}
        disabled={!editing || perm.locked}
        className="ml-3"
      />
    </div>
  );
}

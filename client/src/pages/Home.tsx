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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
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

function HireRepDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { agentsData, updateAgent } = useApp();
  const [repName, setRepName] = useState("Nova");
  const [repPersonality, setRepPersonality] = useState("Friendly");

  const handleHire = () => {
    toast.success("New Rep hired!", { description: `${repName} has been added to your team.` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Hire a New AI Rep</DialogTitle>
          <DialogDescription className="text-[13px]">
            Configure your new AI support representative. They'll start in Training mode.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-[12px] font-medium text-foreground mb-1 block">Rep Name</label>
            <Input
              value={repName}
              onChange={(e) => setRepName(e.target.value)}
              placeholder="Enter rep name..."
              className="text-[13px]"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-foreground mb-1 block">Personality</label>
            <Select value={repPersonality} onValueChange={setRepPersonality}>
              <SelectTrigger className="text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Friendly">Friendly</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Casual">Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="bg-[#f8f9fa] rounded-lg p-3">
            <p className="text-[12px] text-muted-foreground">
              New reps start in <span className="font-semibold text-amber-600">Training mode</span> — they'll draft replies for your review before sending to customers.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" className="text-[12px]" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" className="text-[12px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white" onClick={handleHire}>
              <UserPlus size={12} className="mr-1" /> Hire {repName}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

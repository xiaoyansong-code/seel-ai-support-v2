/*
 * Home — Main layout: Sidebar + Header Tabs + Content Area
 * Round 6: Ticketing System rename, playbookDeepLink support
 */
import { useApp } from "@/contexts/AppContext";
import Sidebar from "@/components/Sidebar";
import AgentsPage from "@/pages/AgentsPage";
import PlaybookPage from "@/pages/PlaybookPage";
import PerformancePage from "@/pages/PerformancePage";
import SetupSettings from "@/components/SetupSettings";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Settings, X } from "lucide-react";

const tabs = [
  { id: "agents" as const, label: "Agents" },
  { id: "playbook" as const, label: "Playbook" },
  { id: "performance" as const, label: "Performance" },
];

export default function Home() {
  const {
    mainTab, setMainTab, agentMode, setAgentMode,
    showSettings, setShowSettings,
    setupComplete, stepStatuses, zendeskConnected,
    playbookDeepLink, setPlaybookDeepLink,
  } = useApp();

  /* Only show banner for Zendesk skip (Import is managed in Playbook, not a blocking issue) */
  const zdSkipped = (stepStatuses[1] === "skipped" || (!zendeskConnected && stepStatuses[1] !== "complete"));
  const hasSkipped = zdSkipped && setupComplete;

  /* Handle tab switch — consume playbookDeepLink */
  const handleTabSwitch = (tabId: typeof mainTab) => {
    setMainTab(tabId);
    if (showSettings) setShowSettings(false);
    // Clear deep link when navigating away from playbook
    if (tabId !== "playbook" && playbookDeepLink) {
      setPlaybookDeepLink(null);
    }
  };

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
                  onClick={() => handleTabSwitch(tab.id)}
                  className={cn(
                    "px-4 py-2 text-[13px] font-medium border-b-2 transition-colors -mb-[1px]",
                    mainTab === tab.id && !showSettings
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

        {/* Sub-header for Agents tab: TEST MODE + Setup/Normal toggle */}
        {mainTab === "agents" && !showSettings && (
          <div className="px-5 py-2 border-b border-border bg-[#fffdf7] flex items-center gap-3">
            <Badge variant="outline" className="text-[11px] font-bold border-red-400 text-red-600 bg-red-50">
              TEST MODE
            </Badge>
            <div className="flex items-center bg-white border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setAgentMode("setup")}
                className={cn(
                  "px-3 py-1 text-[12px] font-medium transition-colors",
                  agentMode === "setup"
                    ? "bg-[#f5a623] text-white"
                    : "text-muted-foreground hover:bg-[#fafafa]"
                )}
              >
                Setup
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
            {agentMode === "normal" && (
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings size={14} />
                Settings
              </button>
            )}
          </div>
        )}

        {/* Persistent banner for skipped Ticketing System */}
        {hasSkipped && mainTab === "agents" && agentMode === "normal" && !showSettings && (
          <div className="px-5 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-600 shrink-0" />
            <p className="text-[12px] text-amber-800">
              Ticketing system connection was skipped. Your Rep can't operate without it.
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="text-[12px] text-[#6c47ff] hover:underline font-medium ml-1"
            >
              Complete setup
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-[#fafafa]">
          {showSettings ? (
            <div className="flex-1 h-full overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage ticketing system integration and agent configuration.</p>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <SetupSettings isWizard={false} />
              </div>
            </div>
          ) : (
            <>
              {mainTab === "agents" && <AgentsPage />}
              {mainTab === "playbook" && <PlaybookPage />}
              {mainTab === "performance" && <PerformancePage />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

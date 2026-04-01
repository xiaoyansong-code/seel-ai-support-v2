/*
 * AgentsPage — Setup Wizard + Normal mode (Team Lead + Rep views)
 * Round 6: Go Live toggle in Rep header (Plan B), status dots on sidebar, Ticketing System rename
 */
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { dailyDigest, escalationFeed } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Send, User, Crown, ChevronDown,
  ThumbsUp, ThumbsDown,
  Bot, Settings, Plus, AlertTriangle, Globe,
  BarChart3, MessageSquare, Lightbulb, TrendingUp, Clock,
  ArrowRight, CheckCircle2, Power,
} from "lucide-react";
import AgentProfileSheet from "@/components/AgentProfileSheet";
import SetupSettings from "@/components/SetupSettings";
import { toast } from "sonner";

/* AI Badge */
function AiBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0 rounded text-[9px] font-bold tracking-wider bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 border border-indigo-200/60 ml-1.5 select-none">
      <Bot size={9} className="mr-0.5" />AI
    </span>
  );
}

/* Render markdown-ish text */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} className="font-semibold mt-2 first:mt-0">{line.replace(/\*\*/g, "")}</p>;
        }
        if (line.startsWith("> ")) {
          return (
            <blockquote key={i} className="border-l-2 border-[#d4a574] pl-3 my-2 text-[12px] text-muted-foreground italic">
              {line.replace(/^> \*?/, "").replace(/\*$/, "")}
            </blockquote>
          );
        }
        if (line.match(/^\d+\./)) return <p key={i} className="ml-2">{line}</p>;
        if (line.startsWith("\u2022") || line.startsWith("- ")) return <p key={i} className="ml-2">{line}</p>;
        if (line.startsWith("+")) return <p key={i} className="ml-2 text-muted-foreground">{line}</p>;
        if (line.trim() === "") return <br key={i} />;
        return <p key={i}>{line}</p>;
      })}
    </>
  );
}

/* COLLAPSIBLE TOPIC CARD (Feishu-style) */
function TopicCard({ topic, onAccept, onReject, onReply }: {
  topic: { id: string; type: string; badge: string; confidence?: string; title: string; summary: string; ruleContent?: string; currentRuleContent?: string; sourceTickets: string[]; status: string };
  onAccept: () => void;
  onReject: () => void;
  onReply: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const badgeColor = topic.type === "proposal"
    ? "border-[#6c47ff] text-[#6c47ff] bg-[#f0edff]"
    : "border-amber-500 text-amber-600 bg-amber-50";

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden transition-all duration-200 hover:border-[#d4d4d8]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 group"
      >
        <ChevronDown
          size={14}
          className={cn(
            "text-muted-foreground transition-transform duration-200 shrink-0",
            !expanded && "-rotate-90"
          )}
        />
        <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider shrink-0 py-0 h-5", badgeColor)}>
          {topic.badge}
        </Badge>
        {topic.confidence && (
          <Badge variant="secondary" className="text-[9px] shrink-0 py-0 h-5">
            {topic.confidence}
          </Badge>
        )}
        <span className="text-[13px] font-medium text-foreground truncate flex-1">{topic.title}</span>
        {topic.status === "pending" && (
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border/50 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-[12px] text-muted-foreground leading-relaxed mt-3 mb-3">{topic.summary}</p>

          {topic.ruleContent && (
            <div className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg p-3 mb-3">
              <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                {topic.currentRuleContent ? "Proposed Change" : "Proposed Rule"}
              </p>
              <pre className="text-[11px] text-foreground whitespace-pre-wrap font-mono leading-relaxed">{topic.ruleContent}</pre>
            </div>
          )}

          {topic.currentRuleContent && (
            <div className="bg-[#fafafa] border border-[#e5e7eb] rounded-lg p-3 mb-3 opacity-70">
              <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Current Rule</p>
              <pre className="text-[11px] text-foreground whitespace-pre-wrap font-mono leading-relaxed">{topic.currentRuleContent}</pre>
            </div>
          )}

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3">
            <span>Source: {topic.sourceTickets.length} tickets</span>
            <span>&middot;</span>
            {topic.sourceTickets.slice(0, 2).map((t) => (
              <Badge key={t} variant="secondary" className="text-[9px] h-4 px-1.5">{t}</Badge>
            ))}
            {topic.sourceTickets.length > 2 && <span>+{topic.sourceTickets.length - 2} more</span>}
          </div>

          {topic.status === "pending" && (
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-[11px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white" onClick={onAccept}>
                <ThumbsUp size={11} className="mr-1" /> Accept
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onReply}>
                Reply
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-[11px] text-muted-foreground" onClick={onReject}>
                <ThumbsDown size={11} className="mr-1" /> Reject
              </Button>
            </div>
          )}
          {topic.status === "accepted" && (
            <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px]">Accepted</Badge>
          )}
          {topic.status === "rejected" && (
            <Badge className="bg-red-50 text-red-600 border-red-200 text-[10px]">Rejected</Badge>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   TEAM LEAD PREVIEW — shown when setup is incomplete
   Gives the merchant an expectation of what they'll see once active
   ================================================================ */
function TeamLeadPreview() {
  const { setShowSettings, setSetupStep, zendeskConnected, stepStatuses, hiredRepName } = useApp();

  const setupProgress: { label: string; done: boolean; step: number }[] = [
    { label: "Connect Ticketing System", done: stepStatuses[1] === "complete" || zendeskConnected, step: 1 },
    { label: "Import Policies", done: stepStatuses[2] === "complete", step: 2 },
    { label: "Configure Agent", done: stepStatuses[3] === "complete", step: 3 },
  ];

  const completedCount = setupProgress.filter(s => s.done).length;

  const previewCapabilities = [
    {
      icon: BarChart3,
      title: "Daily Digest",
      description: "Get a daily summary of ticket volume, resolution rate, CSAT score, and response time trends.",
      preview: (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Tickets handled</span>
            <span className="font-medium text-gray-700">24 <span className="text-green-600 text-[10px]">+8%</span></span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Resolution rate</span>
            <span className="font-medium text-gray-700">79% <span className="text-green-600 text-[10px]">+2%</span></span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">CSAT</span>
            <span className="font-medium text-gray-700">4.5/5 <span className="text-green-600 text-[10px]">+0.1</span></span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Avg response</span>
            <span className="font-medium text-gray-700">38s <span className="text-green-600 text-[10px]">-4s</span></span>
          </div>
        </div>
      ),
    },
    {
      icon: Lightbulb,
      title: "Rule Proposals",
      description: "Alex analyzes ticket patterns and proposes new rules or adjustments to existing ones for your approval.",
      preview: (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] border-indigo-300 text-indigo-600 bg-indigo-50 h-4 px-1.5">Proposal</Badge>
            <span className="text-[11px] text-gray-600 truncate">Extend return window for holiday orders</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-600 bg-amber-50 h-4 px-1.5">Anomaly</Badge>
            <span className="text-[11px] text-gray-600 truncate">Spike in shipping delay complaints</span>
          </div>
        </div>
      ),
    },
    {
      icon: TrendingUp,
      title: "Performance Insights",
      description: "Track ticket volume trends, CSAT over time, intent analysis, and conversation-level reasoning traces.",
      preview: (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-400" /> 7-day ticket trend</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400" /> CSAT over time</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" /> Intent breakdown</div>
          </div>
        </div>
      ),
    },
    {
      icon: MessageSquare,
      title: "Escalation Feed",
      description: `When ${hiredRepName || "your Rep"} encounters tickets it can't handle, they appear here for human review and resolution.`,
      preview: (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] border-red-200 text-red-600 bg-red-50 h-4 px-1.5">Urgent</Badge>
            <span className="text-[11px] text-gray-600 truncate">VIP customer requesting manager callback</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] border-amber-200 text-amber-600 bg-amber-50 h-4 px-1.5">High</Badge>
            <span className="text-[11px] text-gray-600 truncate">Billing dispute — amount exceeds threshold</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with setup progress */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Welcome to Your AI Support Dashboard</h2>
          <p className="text-sm text-gray-500">
            Here's what you'll see once your AI Rep is active. Complete the setup to unlock these capabilities.
          </p>
        </div>

        {/* Setup progress */}
        <div className="p-4 bg-white border border-gray-200 rounded-xl mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Setup Progress</h3>
            <span className="text-xs text-gray-500">{completedCount} of {setupProgress.length} complete</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / setupProgress.length) * 100}%` }}
            />
          </div>
          <div className="space-y-2">
            {setupProgress.map((item) => (
              <button
                key={item.step}
                onClick={() => {
                  setSetupStep(item.step);
                  setShowSettings(true);
                }}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0",
                  item.done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                )}>
                  {item.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : item.step}
                </div>
                <span className={cn("text-sm", item.done ? "text-green-700" : "text-gray-600")}>{item.label}</span>
                {!item.done && <span className="text-xs text-indigo-600 ml-auto">Complete →</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Preview capabilities */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">What you'll get</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {previewCapabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div key={cap.title} className="p-4 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800">{cap.title}</h4>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{cap.description}</p>
                {cap.preview}
                <div className="mt-2 text-center">
                  <Badge variant="outline" className="text-[9px] text-gray-400 border-gray-200">Preview</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TEAM LEAD VIEW — full view when setup is complete
   ================================================================ */
function TeamLeadView() {
  const { topicsData, updateTopic, hiredRepName } = useApp();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleAccept = (id: string) => {
    updateTopic(id, { status: "accepted" });
    toast.success("Proposal accepted and applied to Playbook");
  };
  const handleReject = (id: string) => {
    updateTopic(id, { status: "rejected" });
    toast("Proposal rejected");
  };
  const handleReply = (id: string) => {
    setReplyTo(replyTo === id ? null : id);
    setReplyText("");
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-5 py-5 space-y-6">
        {/* Daily Digest */}
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-green-600" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold">Daily Digest</h3>
              <p className="text-[10px] text-muted-foreground">{dailyDigest.date}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Tickets", value: String(dailyDigest.totalTickets), trend: dailyDigest.deltaTickets },
              { label: "Resolution", value: dailyDigest.resolutionRate, trend: dailyDigest.deltaResolution },
              { label: "CSAT", value: dailyDigest.csatScore, trend: dailyDigest.deltaCsat },
              { label: "Avg Response", value: dailyDigest.avgResponseTime, trend: dailyDigest.deltaRt },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-2 bg-[#fafafa] rounded-lg">
                <p className="text-[16px] font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                <p className={cn(
                  "text-[10px] font-medium mt-0.5",
                  stat.trend.startsWith("+") ? "text-green-600" : stat.trend.startsWith("-") ? "text-green-600" : "text-gray-500"
                )}>{stat.trend}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Topics / Proposals */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <h3 className="text-[13px] font-semibold">Topics & Proposals</h3>
            <Badge variant="secondary" className="text-[10px] h-5">
              {topicsData.filter((t) => t.status === "pending").length} pending
            </Badge>
          </div>
          <div className="space-y-2">
            {topicsData.map((topic) => (
              <div key={topic.id}>
                <TopicCard
                  topic={topic}
                  onAccept={() => handleAccept(topic.id)}
                  onReject={() => handleReject(topic.id)}
                  onReply={() => handleReply(topic.id)}
                />
                {replyTo === topic.id && (
                  <div className="mt-1 ml-6 flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type feedback for Alex..."
                      className="flex-1 h-8 px-3 rounded-lg border border-border bg-white text-[12px] focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/30"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      className="h-8 text-[11px] bg-[#6c47ff] hover:bg-[#5a3ad9]"
                      onClick={() => {
                        if (replyText.trim()) {
                          toast.success("Feedback sent to Alex");
                          setReplyTo(null);
                          setReplyText("");
                        }
                      }}
                    >
                      Send
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   REP VIEW — conversation + escalation feed for a specific Rep
   Round 6: Go Live status badge + toggle in header (Plan B)
   ================================================================ */
function RepView({ agentId }: { agentId: string }) {
  const {
    agentsData, hiredRepName,
    goLiveMode, setGoLiveMode,
    zendeskConnected, stepStatuses,
    setShowSettings,
  } = useApp();
  const agent = agentsData.find((a) => a.id === agentId)!;
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  const needsAttention = escalationFeed.filter((e) => e.status === "needs_attention");
  const resolved = escalationFeed.filter((e) => e.status === "resolved");
  const selectedCard = escalationFeed.find((e) => e.id === selectedEscalation);

  const zdOk = stepStatuses[1] === "complete" || zendeskConnected;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendChat = () => {
    if (!inputValue.trim()) return;
    const userMsg = inputValue.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInputValue("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: "agent", text: `I've noted your feedback: "${userMsg}". I'll adjust my approach accordingly. Is there anything else you'd like me to focus on?` },
      ]);
    }, 800);
  };

  /* Mode badge colors */
  const modeConfig = {
    training: { label: "Training", color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    production: { label: "Production", color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
    off: { label: "Off", color: "bg-gray-100 text-gray-500 border-gray-200", dot: "bg-gray-400" },
  };
  const currentMode = modeConfig[goLiveMode];

  const handleModeChange = (mode: "training" | "production" | "off") => {
    if ((mode === "training" || mode === "production") && !zdOk) {
      toast.error("Ticketing system connection required to activate this mode.");
      return;
    }
    setGoLiveMode(mode);
    setShowModeDropdown(false);
    if (mode === "off") {
      toast(`${hiredRepName} is now offline.`);
    } else if (mode === "training") {
      toast.success(`${hiredRepName} is now in Training mode. Responses will be written as internal notes.`);
    } else {
      toast.success(`${hiredRepName} is now in Production mode. Responding to customers directly.`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header with Go Live toggle (Plan B) */}
      <div className="px-5 py-3 border-b border-border flex items-center gap-3 bg-white">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold relative" style={{ background: agent.color }}>
          {agent.initials}
          {/* Status dot */}
          <span className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white", currentMode.dot)} />
        </div>
        <div className="flex items-center gap-1 flex-1">
          <span className="text-[13px] font-semibold">{hiredRepName}</span>
          <AiBadge />
          <span className="text-[12px] text-muted-foreground ml-2">AI Support Rep</span>
        </div>

        {/* Go Live Mode — status badge + dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowModeDropdown(!showModeDropdown)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors",
              currentMode.color
            )}
          >
            <div className={cn("w-2 h-2 rounded-full", currentMode.dot)} />
            {currentMode.label}
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </button>

          {showModeDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowModeDropdown(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 space-y-0.5">
                  <button
                    onClick={() => handleModeChange("production")}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                      goLiveMode === "production" ? "bg-green-50 text-green-700" : "hover:bg-gray-50 text-gray-700",
                      !zdOk && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!zdOk}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div className="flex-1">
                      <p className="font-medium">Production</p>
                      <p className="text-[10px] text-gray-500">Responds to customers directly</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleModeChange("training")}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                      goLiveMode === "training" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700",
                      !zdOk && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!zdOk}
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium">Training</p>
                      <p className="text-[10px] text-gray-500">Writes internal notes only</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleModeChange("off")}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                      goLiveMode === "off" ? "bg-gray-100 text-gray-600" : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium">Off</p>
                      <p className="text-[10px] text-gray-500">Agent is inactive</p>
                    </div>
                  </button>
                </div>
                {!zdOk && (
                  <div className="px-3 py-2 border-t border-gray-100 bg-amber-50">
                    <p className="text-[10px] text-amber-700">
                      Ticketing system connection required for Training and Production modes.
                      <button onClick={() => { setShowModeDropdown(false); setShowSettings(true); }} className="text-indigo-600 font-medium ml-1 hover:underline">
                        Complete setup →
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          className="text-[11px] h-7"
          onClick={() => setProfileOpen(true)}
        >
          Profile
        </Button>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {!selectedEscalation ? (
          <>
            {needsAttention.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Needs Attention ({needsAttention.length})
                </p>
                <div className="space-y-2">
                  {needsAttention.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setSelectedEscalation(card.id)}
                      className="w-full text-left bg-white border border-border rounded-xl p-3.5 hover:border-[#6c47ff]/30 transition-colors group"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="outline" className="text-[9px] font-bold border-red-200 text-red-600 bg-red-50 h-5 py-0">
                          {card.priority}
                        </Badge>
                        <span className="text-[12px] font-semibold text-foreground">{card.ticketId}</span>
                        <span className="text-[11px] text-muted-foreground ml-auto">{card.time}</span>
                      </div>
                      <p className="text-[12px] text-foreground mb-1">{card.subject}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{card.reason}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {resolved.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Recently Resolved ({resolved.length})
                </p>
                <div className="space-y-2">
                  {resolved.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setSelectedEscalation(card.id)}
                      className="w-full text-left bg-white border border-border rounded-xl p-3.5 hover:border-[#6c47ff]/30 transition-colors opacity-70"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[9px] font-bold border-green-200 text-green-600 bg-green-50 h-5 py-0">
                          Resolved
                        </Badge>
                        <span className="text-[12px] font-semibold text-foreground">{card.ticketId}</span>
                        <span className="text-[11px] text-muted-foreground ml-auto">{card.time}</span>
                      </div>
                      <p className="text-[12px] text-foreground">{card.subject}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-2 duration-200">
            <button
              onClick={() => setSelectedEscalation(null)}
              className="text-[12px] text-[#6c47ff] hover:underline mb-3 flex items-center gap-1"
            >
              &larr; Back to feed
            </button>
            {selectedCard && (
              <div className="bg-white border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className={cn(
                    "text-[9px] font-bold h-5 py-0",
                    selectedCard.status === "needs_attention" ? "border-red-200 text-red-600 bg-red-50" : "border-green-200 text-green-600 bg-green-50"
                  )}>
                    {selectedCard.priority}
                  </Badge>
                  <span className="text-[13px] font-semibold">{selectedCard.ticketId}</span>
                  <span className="text-[11px] text-muted-foreground ml-auto">{selectedCard.time}</span>
                </div>
                <h3 className="text-[14px] font-semibold mb-2">{selectedCard.subject}</h3>
                <p className="text-[12px] text-muted-foreground mb-3 leading-relaxed">{selectedCard.reason}</p>
                <div className="border-t border-border pt-3 mt-3 space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Conversation Thread</p>
                  {selectedCard.thread.map((msg, i) => (
                    <div key={i} className={cn(
                      "rounded-lg px-3 py-2 text-[12px]",
                      msg.role === "customer" ? "bg-[#f0f0f0]" : "bg-[#f0edff]"
                    )}>
                      <span className="font-semibold text-[11px]">{msg.role === "customer" ? "Customer" : hiredRepName}</span>
                      {msg.role !== "customer" && <AiBadge />}
                      <p className="mt-0.5 leading-relaxed">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {chatMessages.map((msg, i) => {
          const isUser = msg.sender === "user";
          return (
            <div key={`chat-${i}`} className={cn("flex gap-3 items-start", isUser && "flex-row-reverse")}>
              {isUser ? (
                <div className="w-8 h-8 rounded-full bg-[#e5e7eb] flex items-center justify-center text-[#6d7175] shrink-0">
                  <User size={14} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: agent.color }}>
                  {agent.initials}
                </div>
              )}
              <div className={cn(
                "max-w-[560px] rounded-xl px-4 py-3 text-[13px] leading-relaxed",
                isUser ? "bg-[#6c47ff] text-white rounded-tr-sm" : "bg-[#fffbf0] border border-[#f5e6c8] rounded-tl-sm text-foreground"
              )}>
                {!isUser && (
                  <div className="flex items-center gap-1 mb-1 -mt-0.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">{hiredRepName}</span>
                    <AiBadge />
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Input */}
      <div className="px-5 py-3 border-t border-border bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
            placeholder={`Message ${hiredRepName}...`}
            className="flex-1 h-9 px-3 rounded-lg border border-border bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/30 focus:border-[#6c47ff]"
          />
          <Button size="sm" className="h-9 w-9 p-0 bg-[#6c47ff] hover:bg-[#5a3ad9]" onClick={handleSendChat}>
            <Send size={14} />
          </Button>
        </div>
      </div>

      <AgentProfileSheet
        agent={agent}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
    </div>
  );
}

/* BLOCKED REP VIEW — shown when Zendesk setup is incomplete */
function BlockedRepView() {
  const { stepStatuses, setShowSettings, setSetupStep, zendeskConnected } = useApp();

  const missingItems: { icon: React.ElementType; label: string; step: number }[] = [];
  if (stepStatuses[1] === "skipped" || (!zendeskConnected && stepStatuses[1] !== "complete")) {
    missingItems.push({ icon: Globe, label: "Connect Ticketing System", step: 1 });
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-[#fafafa]">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Setup Incomplete</h3>
        <p className="text-sm text-gray-500 mb-4">
          Your AI Rep needs a ticketing system connection to operate. Both Training and Production modes require an active connection.
        </p>
        <div className="space-y-2 mb-6">
          {missingItems.map((item) => (
            <button
              key={item.step}
              onClick={() => {
                setSetupStep(item.step);
                setShowSettings(true);
              }}
              className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors text-left"
            >
              <item.icon className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-sm text-gray-700 font-medium">{item.label}</span>
              <span className="text-xs text-indigo-600 ml-auto">Complete →</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400">
          Once the ticketing system is connected, your Rep will be ready to handle tickets.
        </p>
      </div>
    </div>
  );
}

/* NORMAL VIEW — WRAPPER with Agent sidebar + Add Agent */
function NormalView() {
  const {
    selectedAgentId, setSelectedAgentId,
    agentsData, hiredRepName,
    setShowSettings,
    stepStatuses, zendeskConnected,
    goLiveMode,
  } = useApp();
  const nonLeadAgents = agentsData.filter((a) => !a.isTeamLead);
  const teamLead = agentsData.find((a) => a.id === "team-lead")!;

  /* Determine if rep is blocked (Zendesk not connected) */
  const zdOk = stepStatuses[1] === "complete" || zendeskConnected;
  const repBlocked = !zdOk;

  /* Determine if Team Lead should show preview (setup not fully done) */
  const setupFullyDone = zdOk; // Team Lead preview when Zendesk not connected

  /* Status dot color for sidebar */
  const modeDotColor = repBlocked ? "bg-amber-400" : goLiveMode === "production" ? "bg-green-500" : goLiveMode === "training" ? "bg-blue-500" : "bg-gray-400";

  return (
    <div className="flex-1 flex h-full">
      {/* Agent sidebar */}
      <div className="w-[60px] border-r border-border bg-[#fafafa] flex flex-col items-center py-3">
        <div className="flex flex-col items-center gap-2 flex-1">
          {/* Team Lead */}
          <button
            onClick={() => setSelectedAgentId("team-lead")}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all",
              selectedAgentId === "team-lead" && "ring-2 ring-[#6c47ff] ring-offset-2"
            )}
            style={{ background: teamLead.color }}
            title="Alex (Team Lead)"
          >
            <Crown size={16} />
          </button>
          <div className="w-6 border-t border-border my-1" />

          {/* Rep agents */}
          {nonLeadAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all relative",
                selectedAgentId === agent.id && "ring-2 ring-[#6c47ff] ring-offset-2",
                repBlocked && "opacity-50"
              )}
              style={{ background: agent.color }}
              title={`${hiredRepName}${repBlocked ? " (Setup incomplete)" : ` (${goLiveMode})`}`}
            >
              {agent.initials}
              {/* Status dot on avatar */}
              <span className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                modeDotColor
              )} />
              {repBlocked && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                  <AlertTriangle size={7} className="text-white" />
                </span>
              )}
            </button>
          ))}

          {/* Add Agent button */}
          <button
            onClick={() => toast.info("Add Agent — This feature allows you to create additional AI Reps with different configurations. Coming in the next release.")}
            className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors mt-1"
            title="Add Agent"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Settings button at bottom */}
        <button
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-[#e5e7eb] hover:text-foreground transition-colors mt-2"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Main content */}
      {selectedAgentId === "team-lead" ? (
        setupFullyDone ? <TeamLeadView /> : <TeamLeadPreview />
      ) : repBlocked ? (
        <BlockedRepView />
      ) : (
        <RepView agentId={selectedAgentId} />
      )}
    </div>
  );
}

/* MAIN AGENTS PAGE */
export default function AgentsPage() {
  const { agentMode } = useApp();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {agentMode === "setup" ? (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-gray-900">Setup Your AI Support Agent</h1>
              <p className="text-sm text-gray-500 mt-1">Complete these steps to get your AI Rep up and running.</p>
            </div>
            <SetupSettings isWizard={true} />
          </div>
        </div>
      ) : <NormalView />}
    </div>
  );
}

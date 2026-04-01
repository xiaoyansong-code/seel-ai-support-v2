/*
 * AgentsPage — Team Lead + Rep views
 * Round 7: Setup Progress is the only content when setup incomplete.
 *          No separate wizard mode. Steps link to Settings/Playbook.
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
  FileText, UserPlus, Rocket,
  CheckCircle2, Lock, ArrowRight,
} from "lucide-react";
import AgentProfileSheet from "@/components/AgentProfileSheet";
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

/* COLLAPSIBLE TOPIC CARD */
function TopicCard({ topic, onAccept, onReject, onReply }: {
  topic: { id: string; type: string; badge: string; confidence?: string; title: string; summary: string; ruleContent?: string; currentRuleContent?: string; sourceTickets: string[]; status: string };
  onAccept: () => void;
  onReject: () => void;
  onReply: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const badgeColor = topic.type === "proposal"
    ? "border-[#6c47ff] text-[#6c47ff] bg-[#f0edff]"
    : topic.type === "document-parse"
    ? "border-green-500 text-green-600 bg-green-50"
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
   SETUP PROGRESS — the only content when setup is incomplete
   ================================================================ */
function SetupProgress() {
  const {
    step1Complete, step2Complete, step3Complete, step4Complete, step4Status,
    setShowSettings, setSettingsSection,
    setMainTab, setPlaybookDeepLink,
    setSelectedAgentId, setShowGoLiveGuide, goLiveGuideShown, setGoLiveGuideShown,
    hiredRepName,
  } = useApp();

  const steps = [
    {
      id: 1,
      label: "Connect Ticketing System",
      description: "Connect your Zendesk account so your AI Rep can read and respond to tickets.",
      icon: Globe,
      complete: step1Complete,
      locked: false,
      action: () => {
        setSettingsSection("ticketing");
        setShowSettings(true);
      },
    },
    {
      id: 2,
      label: "Import Policies",
      description: "Upload your SOP documents so the AI can learn your support rules.",
      icon: FileText,
      complete: step2Complete,
      locked: false,
      action: () => {
        setPlaybookDeepLink("documents");
        setMainTab("playbook");
      },
    },
    {
      id: 3,
      label: "Configure Agent",
      description: "Set up your AI Rep's name, personality, and permissions.",
      icon: UserPlus,
      complete: step3Complete,
      locked: false,
      action: () => {
        setSettingsSection("agent");
        setShowSettings(true);
      },
    },
    {
      id: 4,
      label: "Send Rep to Work",
      description: step4Status === "locked"
        ? "Complete all previous steps first."
        : `Activate ${hiredRepName || "your Rep"} by setting the go-live mode to Training or Production.`,
      icon: Rocket,
      complete: step4Complete,
      locked: step4Status === "locked",
      action: () => {
        if (step4Status === "locked") return;
        // Switch to rep view and trigger guide
        setSelectedAgentId("agent-alpha");
        if (!goLiveGuideShown) {
          setShowGoLiveGuide(true);
          setGoLiveGuideShown(true);
        }
      },
    },
  ];

  const completedCount = steps.filter((s) => s.complete).length;

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Get Started</h2>
          <p className="text-sm text-gray-500">Complete these steps to activate your AI Support Rep.</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>{completedCount} of {steps.length} completed</span>
            <span>{Math.round((completedCount / steps.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={step.action}
                disabled={step.locked}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                  step.complete
                    ? "bg-green-50/50 border-green-200 cursor-pointer hover:bg-green-50"
                    : step.locked
                    ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                    : "bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm cursor-pointer"
                )}
              >
                {/* Status icon */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  step.complete ? "bg-green-100" : step.locked ? "bg-gray-100" : "bg-indigo-50"
                )}>
                  {step.complete ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : step.locked ? (
                    <Lock className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Icon className="w-5 h-5 text-indigo-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium",
                      step.complete ? "text-green-700" : step.locked ? "text-gray-400" : "text-gray-900"
                    )}>
                      {step.label}
                    </span>
                    {step.complete && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] h-5">Done</Badge>
                    )}
                  </div>
                  <p className={cn(
                    "text-xs mt-0.5",
                    step.complete ? "text-green-600" : step.locked ? "text-gray-400" : "text-gray-500"
                  )}>
                    {step.description}
                  </p>
                </div>

                {/* Arrow */}
                {!step.complete && !step.locked && (
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TEAM LEAD VIEW — normal mode with digest, topics, escalation
   ================================================================ */
function TeamLeadView() {
  const { topicsData, updateTopic, hiredRepName } = useApp();
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSendChat = () => {
    if (!inputValue.trim()) return;
    setChatMessages((prev) => [...prev, { sender: "user", text: inputValue }]);
    setInputValue("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: "alex", text: `I'll look into that. Let me analyze the relevant ticket data and get back to you with findings.` },
      ]);
    }, 1000);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages]);

  const teamLead = { name: "Alex", initials: "AL", color: "#6c47ff" };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border bg-white flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: teamLead.color }}>
          <Crown size={14} />
        </div>
        <div className="flex items-center gap-1 flex-1">
          <span className="text-[13px] font-semibold">{teamLead.name}</span>
          <AiBadge />
          <span className="text-[12px] text-muted-foreground ml-2">Team Lead</span>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Daily Digest */}
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
              <Crown size={12} className="text-indigo-600" />
            </div>
            <span className="text-[13px] font-semibold">Daily Digest</span>
            <span className="text-[11px] text-muted-foreground ml-auto">{dailyDigest.date}</span>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {[
              { label: "Tickets", value: String(dailyDigest.totalTickets), trend: dailyDigest.deltaTickets },
              { label: "Resolution", value: dailyDigest.resolutionRate, trend: dailyDigest.deltaResolution },
              { label: "CSAT", value: dailyDigest.csatScore, trend: dailyDigest.deltaCsat },
              { label: "Avg Response", value: dailyDigest.avgResponseTime, trend: dailyDigest.deltaRt },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#f8f9fa] rounded-lg p-2.5 text-center">
                <p className="text-[18px] font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                {stat.trend && (
                  <p className={cn("text-[10px] font-medium", stat.trend.startsWith("+") || stat.trend.startsWith("-") ? (stat.trend.startsWith("+") ? "text-green-600" : "text-red-500") : "text-gray-500")}>
                    {stat.trend}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="text-[12px] text-muted-foreground leading-relaxed">
            <p>Handled {dailyDigest.totalTickets} tickets today. Resolution rate at {dailyDigest.resolutionRate} ({dailyDigest.deltaResolution}). CSAT score: {dailyDigest.csatScore}. Average response time: {dailyDigest.avgResponseTime} ({dailyDigest.deltaRt}). Sentiment change rate: {dailyDigest.sentimentChangedRate}. Full resolution time: {dailyDigest.fullResolutionTime} ({dailyDigest.deltaFrt}).</p>
          </div>
        </div>

        {/* Topics */}
        {topicsData.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Topics & Proposals ({topicsData.filter((t) => t.status === "pending").length} pending)
            </p>
            <div className="space-y-2">
              {topicsData.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onAccept={() => { updateTopic(topic.id, { status: "accepted" }); toast.success("Accepted"); }}
                  onReject={() => { updateTopic(topic.id, { status: "rejected" }); toast.success("Rejected"); }}
                  onReply={() => toast.info("Reply thread — coming soon")}
                />
              ))}
            </div>
          </div>
        )}

        {/* Escalation Feed */}
        {escalationFeed.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Escalation Feed
            </p>
            <div className="space-y-2">
              {escalationFeed.filter((c) => c.status === "needs_attention").map((card) => (
                <div key={card.id} className="bg-white border border-border rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="outline" className="text-[9px] font-bold border-red-200 text-red-600 bg-red-50 h-5 py-0">
                      {card.priority}
                    </Badge>
                    <span className="text-[12px] font-semibold text-foreground">{card.ticketId}</span>
                    <span className="text-[11px] text-muted-foreground ml-auto">{card.time}</span>
                  </div>
                  <p className="text-[12px] text-foreground mb-1">{card.subject}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{card.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {chatMessages.map((msg, i) => {
          const isUser = msg.sender === "user";
          return (
            <div key={`chat-${i}`} className={cn("flex gap-3 items-start", isUser && "flex-row-reverse")}>
              {isUser ? (
                <div className="w-8 h-8 rounded-full bg-[#e5e7eb] flex items-center justify-center text-[#6d7175] shrink-0">
                  <User size={14} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: teamLead.color }}>
                  {teamLead.initials}
                </div>
              )}
              <div className={cn(
                "max-w-[560px] rounded-xl px-4 py-3 text-[13px] leading-relaxed",
                isUser ? "bg-[#6c47ff] text-white rounded-tr-sm" : "bg-[#fffbf0] border border-[#f5e6c8] rounded-tl-sm text-foreground"
              )}>
                {!isUser && (
                  <div className="flex items-center gap-1 mb-1 -mt-0.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">{teamLead.name}</span>
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
            placeholder="Message Alex..."
            className="flex-1 h-9 px-3 rounded-lg border border-border bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/30 focus:border-[#6c47ff]"
          />
          <Button size="sm" className="h-9 w-9 p-0 bg-[#6c47ff] hover:bg-[#5a3ad9]" onClick={handleSendChat}>
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   REP VIEW — conversation + escalation feed
   ================================================================ */
function RepView({ agentId }: { agentId: string }) {
  const {
    agentsData, hiredRepName, goLiveMode, setGoLiveMode,
    zendeskConnected,
    showGoLiveGuide, setShowGoLiveGuide,
    setShowSettings, setSettingsSection,
  } = useApp();
  const agent = agentsData.find((a) => a.id === agentId) || agentsData[1];
  const [profileOpen, setProfileOpen] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const zdOk = zendeskConnected;

  const handleSendChat = () => {
    if (!inputValue.trim()) return;
    setChatMessages((prev) => [...prev, { sender: "user", text: inputValue }]);
    setInputValue("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: "rep", text: `Got it! I'll handle that right away. Is there anything else you'd like me to focus on?` },
      ]);
    }, 1000);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages]);

  const modeConfig = {
    production: { label: "Production", color: "bg-green-50 border-green-200 text-green-700", dot: "bg-green-500" },
    training: { label: "Training", color: "bg-blue-50 border-blue-200 text-blue-700", dot: "bg-blue-500" },
    off: { label: "Off", color: "bg-gray-50 border-gray-200 text-gray-600", dot: "bg-gray-400" },
  };
  const currentMode = modeConfig[goLiveMode];

  const handleModeChange = (mode: "production" | "training" | "off") => {
    if ((mode === "production" || mode === "training") && !zdOk) return;
    setGoLiveMode(mode);
    setShowModeDropdown(false);
    if (showGoLiveGuide) setShowGoLiveGuide(false);
    toast.success(`Mode changed to ${mode}`);
  };

  const needsAttention = escalationFeed.filter((c) => c.status === "needs_attention");
  const resolved = escalationFeed.filter((c) => c.status === "resolved");
  const selectedCard = selectedEscalation ? escalationFeed.find((c) => c.id === selectedEscalation) : null;

  const displayName = hiredRepName || "AI Rep";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border bg-white flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: agent.color }}>
          {hiredRepName ? hiredRepName.slice(0, 2).toUpperCase() : agent.initials}
        </div>
        <div className="flex items-center gap-1 flex-1">
          <span className="text-[13px] font-semibold">{displayName}</span>
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

          {/* Go Live Guide spotlight */}
          {showGoLiveGuide && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-indigo-600 text-white rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="absolute -top-2 right-6 w-4 h-4 bg-indigo-600 rotate-45" />
              <p className="text-sm font-medium mb-1">Activate your Rep</p>
              <p className="text-xs opacity-90 mb-3">
                Choose Training mode to have your Rep write internal notes, or Production to respond directly to customers.
              </p>
              <button
                onClick={() => { setShowGoLiveGuide(false); setShowModeDropdown(true); }}
                className="text-xs bg-white text-indigo-600 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
              >
                Got it, let me choose →
              </button>
            </div>
          )}

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
                      <button onClick={() => { setShowModeDropdown(false); setSettingsSection("ticketing"); setShowSettings(true); }} className="text-indigo-600 font-medium ml-1 hover:underline">
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
                      <span className="font-semibold text-[11px]">{msg.role === "customer" ? "Customer" : displayName}</span>
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
                  {hiredRepName ? hiredRepName.slice(0, 2).toUpperCase() : agent.initials}
                </div>
              )}
              <div className={cn(
                "max-w-[560px] rounded-xl px-4 py-3 text-[13px] leading-relaxed",
                isUser ? "bg-[#6c47ff] text-white rounded-tr-sm" : "bg-[#fffbf0] border border-[#f5e6c8] rounded-tl-sm text-foreground"
              )}>
                {!isUser && (
                  <div className="flex items-center gap-1 mb-1 -mt-0.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">{displayName}</span>
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
            placeholder={`Message ${displayName}...`}
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

/* ================================================================
   NORMAL VIEW — Agent sidebar + main content
   ================================================================ */
function NormalView() {
  const {
    selectedAgentId, setSelectedAgentId,
    agentsData, hiredRepName,
    setShowSettings,
    zendeskConnected,
    goLiveMode,
    setupFullyComplete,
  } = useApp();
  const nonLeadAgents = agentsData.filter((a) => !a.isTeamLead);
  const teamLead = agentsData.find((a) => a.id === "team-lead")!;

  /* Status dot color for sidebar */
  const modeDotColor = goLiveMode === "production" ? "bg-green-500" : goLiveMode === "training" ? "bg-blue-500" : "bg-gray-400";

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
              )}
              style={{ background: agent.color }}
              title={`${hiredRepName || "AI Rep"} (${goLiveMode})`}
            >
              {hiredRepName ? hiredRepName.slice(0, 2).toUpperCase() : agent.initials}
              <span className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                modeDotColor
              )} />
            </button>
          ))}

          {/* Add Agent button */}
          <button
            onClick={() => toast.info("Add Agent — Create additional AI Reps with different configurations. Coming in the next release.")}
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
        setupFullyComplete ? <TeamLeadView /> : <SetupProgress />
      ) : (
        <RepView agentId={selectedAgentId} />
      )}
    </div>
  );
}

/* MAIN AGENTS PAGE */
export default function AgentsPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <NormalView />
    </div>
  );
}

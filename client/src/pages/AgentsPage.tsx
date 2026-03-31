/*
 * AgentsPage — Onboarding flow + Normal mode
 * Design: Shopify admin warm palette, conversational onboarding with Team Lead
 * PRD: US1 (Onboarding) + US2 (Normal mode — Team Lead DM + Rep Escalation Feed)
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import { onboardingSteps, dailyDigest, topics as topicsData, escalationFeed, type OnboardingStep } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Send, User, Crown, ChevronRight, AlertTriangle, CheckCircle2, MessageSquare, TrendingUp, Clock, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import AgentProfileSheet from "@/components/AgentProfileSheet";

// ============================================================
// ONBOARDING CHAT BUBBLE
// ============================================================
function ChatBubble({
  step,
  onAction,
  isLatest,
}: {
  step: OnboardingStep;
  onAction: (nextStep: number) => void;
  isLatest: boolean;
}) {
  const { agentsData } = useApp();
  const isRep = step.sender === "rep";
  const agent = isRep
    ? agentsData.find((a) => a.id === "agent-alpha")!
    : agentsData.find((a) => a.id === "team-lead")!;

  return (
    <div className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
        style={{ background: agent.color }}
      >
        {agent.isTeamLead ? <Crown size={14} /> : agent.initials}
      </div>
      <div className="flex-1 max-w-[680px]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[13px] font-semibold text-foreground">
            {isRep ? agent.name : "Alex (Team Lead)"}
          </span>
          <span className="text-[11px] text-muted-foreground">just now</span>
        </div>
        <div className="bg-[#fffbf0] border border-[#f5e6c8] rounded-xl rounded-tl-sm px-4 py-3 text-[13px] leading-relaxed text-foreground whitespace-pre-wrap">
          {step.text?.split("\n").map((line, i) => {
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <p key={i} className="font-semibold mt-2 first:mt-0">
                  {line.replace(/\*\*/g, "")}
                </p>
              );
            }
            if (line.startsWith("> ")) {
              return (
                <blockquote
                  key={i}
                  className="border-l-2 border-[#d4a574] pl-3 my-2 text-[12px] text-muted-foreground italic"
                >
                  {line.replace(/^> \*?/, "").replace(/\*$/, "")}
                </blockquote>
              );
            }
            if (line.match(/^\d+\./)) return <p key={i} className="ml-2">{line}</p>;
            if (line.startsWith("•") || line.startsWith("- ")) return <p key={i} className="ml-2">{line}</p>;
            if (line.startsWith("+")) return <p key={i} className="ml-2 text-muted-foreground">{line}</p>;
            if (line.trim() === "") return <br key={i} />;
            return <p key={i}>{line}</p>;
          })}
        </div>

        {/* Action buttons */}
        {isLatest && step.actions && step.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {step.actions.map((action, i) => (
              <Button
                key={i}
                size="sm"
                variant={action.variant === "ghost" ? "ghost" : action.variant === "outline" ? "outline" : "default"}
                className={cn(
                  "text-[13px] h-8",
                  (!action.variant || action.variant === "primary") && "bg-[#6c47ff] hover:bg-[#5a3ad9] text-white"
                )}
                onClick={() => onAction(action.nextStep)}
              >
                {action.label}
                {(!action.variant || action.variant === "primary") && <ArrowRight size={14} className="ml-1" />}
              </Button>
            ))}
          </div>
        )}

        {/* Choice options */}
        {isLatest && step.options && step.options.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {step.options.map((opt, i) => (
              <Button
                key={i}
                size="sm"
                variant="outline"
                className="text-[13px] h-8 border-[#6c47ff] text-[#6c47ff] hover:bg-[#f0edff]"
                onClick={() => onAction(opt.nextStep)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ONBOARDING VIEW
// ============================================================
function OnboardingView() {
  const { onboardingStep, setOnboardingStep, setAgentMode, setOnboardingComplete, agentsData } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const teamLead = agentsData.find((a) => a.id === "team-lead")!;

  const visibleSteps = onboardingSteps.filter((s) => s.id <= onboardingStep);

  const handleAction = useCallback(
    (nextStep: number) => {
      if (nextStep > onboardingSteps.length) {
        setOnboardingComplete(true);
        setAgentMode("normal");
        return;
      }
      setOnboardingStep(nextStep);
    },
    [setOnboardingStep, setAgentMode, setOnboardingComplete]
  );

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  }, [onboardingStep]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Agent header bar */}
      <div className="px-5 py-3 border-b border-border flex items-center gap-3 bg-white">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: teamLead.color }}
        >
          <Crown size={14} />
        </div>
        <div>
          <span className="text-[13px] font-semibold">Alex</span>
          <span className="text-[12px] text-muted-foreground ml-2">Team Lead · Setup</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {visibleSteps.map((step, idx) => (
          <ChatBubble key={step.id} step={step} onAction={handleAction} isLatest={idx === visibleSteps.length - 1} />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// NORMAL MODE — TEAM LEAD VIEW (Daily Digest + Topics)
// ============================================================
function TeamLeadView() {
  const { topicsData, updateTopic } = useApp();
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { agentsData } = useApp();
  const teamLead = agentsData.find((a) => a.id === "team-lead")!;

  // Initialize with Daily Digest
  useEffect(() => {
    setMessages([
      {
        sender: "team-lead",
        text: `📊 **Daily Digest — ${dailyDigest.date}**\n\nHere's how the team performed today:\n\n• Tickets handled: ${dailyDigest.totalTickets} (${dailyDigest.deltaTickets} vs yesterday)\n• Resolution rate: ${dailyDigest.resolutionRate} (${dailyDigest.deltaResolution})\n• CSAT: ${dailyDigest.csatScore} (${dailyDigest.deltaCsat})\n• Avg first response: ${dailyDigest.avgResponseTime} (${dailyDigest.deltaRt})\n• Sentiment-changed rate: ${dailyDigest.sentimentChangedRate} (${dailyDigest.deltaSentiment})\n\nI have ${dailyDigest.updateCount} items for your review below.`,
        time: "Just now",
      },
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg = { sender: "user", text: inputValue, time: "Just now" };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "team-lead",
          text: "Got it! I'll update the rules accordingly. You can review the changes in the Playbook tab.",
          time: "Just now",
        },
      ]);
    }, 1000);
  };

  const pendingTopics = topicsData.filter((t) => t.status === "pending");

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border flex items-center gap-3 bg-white">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: teamLead.color }}>
          <Crown size={14} />
        </div>
        <div>
          <span className="text-[13px] font-semibold">Alex (Team Lead)</span>
          <span className="text-[12px] text-muted-foreground ml-2">Team Lead</span>
        </div>
      </div>

      {/* Messages + Topics */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {messages.map((msg, i) => {
          const isUser = msg.sender === "user";
          return (
            <div key={i} className={cn("flex gap-3 items-start", isUser && "flex-row-reverse")}>
              {isUser ? (
                <div className="w-8 h-8 rounded-full bg-[#e5e7eb] flex items-center justify-center text-[#6d7175] shrink-0">
                  <User size={14} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: teamLead.color }}>
                  <Crown size={12} />
                </div>
              )}
              <div className={cn(
                "max-w-[560px] rounded-xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap",
                isUser ? "bg-[#6c47ff] text-white rounded-tr-sm" : "bg-[#fffbf0] border border-[#f5e6c8] rounded-tl-sm text-foreground"
              )}>
                {msg.text.split("\n").map((line, j) => {
                  if (line.startsWith("**") && line.endsWith("**")) return <p key={j} className="font-semibold mt-1 first:mt-0">{line.replace(/\*\*/g, "")}</p>;
                  if (line.startsWith("•")) return <p key={j} className="ml-1">{line}</p>;
                  if (line.trim() === "") return <br key={j} />;
                  return <p key={j}>{line}</p>;
                })}
              </div>
            </div>
          );
        })}

        {/* Topic Cards */}
        {pendingTopics.length > 0 && (
          <div className="space-y-3 mt-2">
            {pendingTopics.map((topic) => (
              <div key={topic.id} className="bg-white border border-border rounded-xl p-4 max-w-[600px] ml-11">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    topic.type === "proposal" ? "border-[#6c47ff] text-[#6c47ff]" : "border-amber-500 text-amber-600"
                  )}>
                    {topic.badge}
                  </Badge>
                  {topic.confidence && (
                    <Badge variant="secondary" className="text-[10px]">
                      {topic.confidence} confidence
                    </Badge>
                  )}
                </div>
                <h4 className="text-[13px] font-semibold text-foreground mb-1">{topic.title}</h4>
                <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">{topic.summary}</p>

                {topic.ruleContent && (
                  <div className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg p-3 mb-3">
                    <p className="text-[11px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">Proposed Rule</p>
                    <pre className="text-[12px] text-foreground whitespace-pre-wrap font-mono leading-relaxed">{topic.ruleContent}</pre>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3">
                  <span>Source: {topic.sourceTickets.length} tickets</span>
                  <span>·</span>
                  {topic.sourceTickets.slice(0, 2).map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px] h-5">{t}</Badge>
                  ))}
                  {topic.sourceTickets.length > 2 && <span>+{topic.sourceTickets.length - 2} more</span>}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-7 text-[12px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white"
                    onClick={() => updateTopic(topic.id, { status: "accepted" })}
                  >
                    <ThumbsUp size={12} className="mr-1" /> Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[12px]"
                    onClick={() => updateTopic(topic.id, { status: "revised" })}
                  >
                    Revise
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[12px] text-muted-foreground"
                    onClick={() => updateTopic(topic.id, { status: "rejected" })}
                  >
                    <ThumbsDown size={12} className="mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-border bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message Alex (Team Lead)..."
            className="flex-1 h-9 px-3 rounded-lg border border-border bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/30 focus:border-[#6c47ff]"
          />
          <Button size="sm" className="h-9 w-9 p-0 bg-[#6c47ff] hover:bg-[#5a3ad9]" onClick={handleSend}>
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// NORMAL MODE — REP VIEW (Escalation Feed + Chat)
// ============================================================
function RepView({ agentId }: { agentId: string }) {
  const { agentsData } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const agent = agentsData.find((a) => a.id === agentId)!;
  const needsAttention = escalationFeed.filter((e) => e.status === "needs_attention");
  const resolvedEscalations = escalationFeed.filter((e) => e.status === "resolved");

  useEffect(() => {
    setMessages([
      {
        sender: agentId,
        text: `Hi! I'm ${agent.name}, your AI support rep. I'm currently in ${agent.mode} mode.\n\nI have ${needsAttention.length} escalated tickets that need your attention. You can review them in the feed on the left, or chat with me about anything.`,
        time: "Just now",
      },
    ]);
  }, [agentId, agent.name, agent.mode, needsAttention.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: inputValue, time: "Just now" }]);
    setInputValue("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: agentId, text: "Thanks for the feedback! I've noted that and will apply it to future tickets. Is there anything specific you'd like me to handle differently?", time: "Just now" },
      ]);
    }, 1000);
  };

  return (
    <div className="flex-1 flex h-full">
      {/* Escalation Feed Sidebar */}
      <div className="w-[280px] border-r border-border bg-[#fafafa] flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-[13px] font-semibold text-foreground">Escalation Feed</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{needsAttention.length} need attention</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {needsAttention.length > 0 && (
            <div className="px-3 py-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">Needs Attention</p>
              {needsAttention.map((esc) => (
                <button
                  key={esc.ticketId}
                  onClick={() => setSelectedEscalation(selectedEscalation === esc.ticketId ? null : esc.ticketId)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg mb-1 transition-colors",
                    selectedEscalation === esc.ticketId ? "bg-[#f0edff] border border-[#6c47ff]/20" : "hover:bg-white"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle size={12} className="text-amber-500" />
                    <span className="text-[12px] font-semibold text-foreground truncate">{esc.subject}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{esc.summary}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                    <span>{esc.ticketId}</span>
                    <span>·</span>
                    <span>{esc.orderValue}</span>
                    <span>·</span>
                    <span>{esc.createdAt}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {resolvedEscalations.length > 0 && (
            <div className="px-3 py-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">Resolved</p>
              {resolvedEscalations.map((esc) => (
                <div key={esc.ticketId} className="p-3 rounded-lg mb-1 opacity-60">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 size={12} className="text-green-500" />
                    <span className="text-[12px] font-medium text-foreground truncate">{esc.subject}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span>{esc.ticketId}</span>
                    <span>·</span>
                    <span>{esc.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Agent header */}
        <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: agent.color }}>
              {agent.initials}
            </div>
            <div>
              <span className="text-[13px] font-semibold">{agent.name}</span>
              <span className="text-[12px] text-muted-foreground ml-2">{agent.role} · {agent.mode}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-[12px] text-muted-foreground" onClick={() => setProfileOpen(true)}>
            Profile <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>

        {/* Escalation Detail or Chat */}
        {selectedEscalation ? (
          <div className="flex-1 overflow-y-auto p-5">
            {(() => {
              const esc = escalationFeed.find((e) => e.ticketId === selectedEscalation);
              if (!esc) return null;
              return (
                <div className="max-w-[600px]">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-600">ESCALATED</Badge>
                    <Badge variant="secondary" className="text-[10px] capitalize">{esc.sentiment}</Badge>
                  </div>
                  <h3 className="text-[15px] font-semibold mb-1">{esc.subject}</h3>
                  <p className="text-[12px] text-muted-foreground mb-4">Ticket {esc.ticketId} · {esc.orderValue} · {esc.createdAt}</p>

                  <div className="bg-[#fffbf0] border border-[#f5e6c8] rounded-xl p-4 mb-4">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Handoff Summary</p>
                    <p className="text-[13px] text-foreground leading-relaxed">{esc.summary}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="text-[12px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white">
                      <ExternalLink size={12} className="mr-1" /> Open in Zendesk
                    </Button>
                    <Button size="sm" variant="outline" className="text-[12px]" onClick={() => setSelectedEscalation(null)}>
                      Back to chat
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <>
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {messages.map((msg, i) => {
                const isUser = msg.sender === "user";
                return (
                  <div key={i} className={cn("flex gap-3 items-start", isUser && "flex-row-reverse")}>
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
                      "max-w-[520px] rounded-xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap",
                      isUser ? "bg-[#6c47ff] text-white rounded-tr-sm" : "bg-[#fffbf0] border border-[#f5e6c8] rounded-tl-sm text-foreground"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="px-5 py-3 border-t border-border bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={`Message ${agent.name}...`}
                  className="flex-1 h-9 px-3 rounded-lg border border-border bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/30 focus:border-[#6c47ff]"
                />
                <Button size="sm" className="h-9 w-9 p-0 bg-[#6c47ff] hover:bg-[#5a3ad9]" onClick={handleSend}>
                  <Send size={14} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Profile Sheet */}
      <AgentProfileSheet agent={agent} open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
}

// ============================================================
// NORMAL VIEW — WRAPPER
// ============================================================
function NormalView() {
  const { selectedAgentId, setSelectedAgentId, agentsData } = useApp();
  const nonLeadAgents = agentsData.filter((a) => !a.isTeamLead);
  const teamLead = agentsData.find((a) => a.id === "team-lead")!;

  return (
    <div className="flex-1 flex h-full">
      {/* Agent sidebar */}
      <div className="w-[60px] border-r border-border bg-[#fafafa] flex flex-col items-center py-3 gap-2">
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
        {nonLeadAgents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setSelectedAgentId(agent.id)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all relative",
              selectedAgentId === agent.id && "ring-2 ring-[#6c47ff] ring-offset-2"
            )}
            style={{ background: agent.color }}
            title={agent.name}
          >
            {agent.initials}
            {/* Notification dot for escalations */}
            {escalationFeed.filter((e) => e.status === "needs_attention").length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {selectedAgentId === "team-lead" ? <TeamLeadView /> : <RepView agentId={selectedAgentId} />}
    </div>
  );
}

// ============================================================
// MAIN AGENTS PAGE
// ============================================================
export default function AgentsPage() {
  const { agentMode } = useApp();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {agentMode === "onboarding" ? <OnboardingView /> : <NormalView />}
    </div>
  );
}

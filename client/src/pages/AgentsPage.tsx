/*
 * AgentsPage — Onboarding flow + Normal mode
 * PRD: US1 (Onboarding) + US2 (Normal mode)
 * Round 2: Feishu-style collapsible topics, AI badges, area switching
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import { onboardingSteps, dailyDigest, escalationFeed, type OnboardingStep } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Send, User, Crown, ChevronRight, ChevronDown,
  AlertTriangle, CheckCircle2, ThumbsUp, ThumbsDown, ExternalLink,
  Bot
} from "lucide-react";
import AgentProfileSheet from "@/components/AgentProfileSheet";

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

/* Onboarding Chat Bubble */
function ChatBubble({
  step, onAction, isLatest,
}: {
  step: OnboardingStep;
  onAction: (nextStep: number, value?: string) => void;
  isLatest: boolean;
}) {
  const { agentsData, hiredRepName } = useApp();
  const isRep = step.sender === "rep";
  const agent = isRep
    ? agentsData.find((a) => a.id === "agent-alpha")!
    : agentsData.find((a) => a.id === "team-lead")!;

  const displayText = (step.text || "").replace(/\{rep_name\}/g, hiredRepName);

  return (
    <div className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
        style={{ background: agent.color }}
      >
        {agent.isTeamLead ? <Crown size={14} /> : agent.initials}
      </div>
      <div className="flex-1 max-w-[680px]">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[13px] font-semibold text-foreground">
            {isRep ? hiredRepName : "Alex (Team Lead)"}
          </span>
          <AiBadge />
          <span className="text-[11px] text-muted-foreground ml-1">just now</span>
        </div>
        <div className="bg-[#fffbf0] border border-[#f5e6c8] rounded-xl rounded-tl-sm px-4 py-3 text-[13px] leading-relaxed text-foreground whitespace-pre-wrap">
          <RichText text={displayText} />
        </div>

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

        {isLatest && step.options && step.options.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {step.options.map((opt, i) => (
              <Button
                key={i}
                size="sm"
                variant="outline"
                className="text-[13px] h-8 border-[#6c47ff] text-[#6c47ff] hover:bg-[#f0edff]"
                onClick={() => onAction(opt.nextStep, opt.value)}
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

/* Needs Adjustment inline feedback */
function NeedsAdjustmentInput({ onSubmit }: { onSubmit: (feedback: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="ml-12 mt-2 max-w-[600px] animate-in fade-in slide-in-from-bottom-2 duration-200">
      <p className="text-[12px] text-muted-foreground mb-1.5">What should be different?</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && value.trim() && onSubmit(value)}
          placeholder="e.g. Don't offer a discount code for VIP complaints..."
          className="flex-1 h-8 px-3 rounded-lg border border-border bg-white text-[12px] focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/30"
        />
        <Button size="sm" className="h-8 text-[12px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white" disabled={!value.trim()} onClick={() => onSubmit(value)}>
          Submit
        </Button>
      </div>
    </div>
  );
}

/* ONBOARDING VIEW */
function OnboardingView() {
  const {
    onboardingStep, setOnboardingStep, setAgentMode, setOnboardingComplete,
    agentsData, onboardingArea, setOnboardingArea, hiredRepName
  } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const teamLead = agentsData.find((a) => a.id === "team-lead")!;
  const rep = agentsData.find((a) => a.id === "agent-alpha")!;

  const [adjustingScenario, setAdjustingScenario] = useState<number | null>(null);
  const [needsAdjFirstTime, setNeedsAdjFirstTime] = useState(true);
  const [extraMessages, setExtraMessages] = useState<{ afterStep: number; area: "team-lead" | "rep"; messages: { sender: string; text: string }[] }[]>([]);

  const visibleSteps = onboardingSteps.filter((s) => s.id <= onboardingStep);

  const getStepArea = (step: OnboardingStep): "team-lead" | "rep" => {
    if (step.sender === "rep") return "rep";
    if (step.type === "mode-select") return "rep";
    return "team-lead";
  };

  const areaSteps = visibleSteps.filter((s) => getStepArea(s) === onboardingArea);

  const handleAction = useCallback(
    (nextStep: number, _value?: string) => {
      if (nextStep > onboardingSteps.length) {
        setOnboardingComplete(true);
        setAgentMode("normal");
        return;
      }

      const targetStep = onboardingSteps.find((s) => s.id === nextStep);
      if (targetStep) {
        const targetArea = getStepArea(targetStep);
        if (targetArea !== onboardingArea) {
          setOnboardingArea(targetArea);
        }
      }

      setOnboardingStep(nextStep);
    },
    [onboardingArea, setOnboardingStep, setAgentMode, setOnboardingComplete, setOnboardingArea]
  );

  const handleNeedsAdjustment = (scenarioStepId: number) => {
    setAdjustingScenario(scenarioStepId);
  };

  const handleAdjustmentSubmit = (feedback: string, scenarioStepId: number) => {
    setAdjustingScenario(null);

    const repConfirmText = needsAdjFirstTime
      ? "Got it. I'll let Team Lead know \u2014 they'll update the rules.\n\nBy the way \u2014 anytime after setup, if you want to adjust rules, just tell Team Lead in the Communication tab. They'll handle it."
      : "Got it. I'll let Team Lead know \u2014 they'll update the rules.";
    setNeedsAdjFirstTime(false);

    setExtraMessages((prev) => [
      ...prev,
      {
        afterStep: scenarioStepId,
        area: "rep",
        messages: [{ sender: "rep", text: repConfirmText }],
      },
    ]);

    setTimeout(() => {
      setOnboardingArea("team-lead");
      setExtraMessages((prev) => [
        ...prev,
        {
          afterStep: scenarioStepId,
          area: "team-lead",
          messages: [
            { sender: "team-lead", text: `The Rep flagged an adjustment for this scenario:\n\n"${feedback}"\n\nI'll update the relevant rule. You can review the change in Playbook.` },
            { sender: "team-lead", text: "Done! Let's continue the sanity check." },
          ],
        },
      ]);

      setTimeout(() => {
        setOnboardingArea("rep");
        const currentStep = onboardingSteps.find((s) => s.id === scenarioStepId);
        if (currentStep?.options) {
          const nextStepId = currentStep.options[0].nextStep;
          setOnboardingStep(nextStepId);
        }
      }, 800);
    }, 600);
  };

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  }, [onboardingStep, onboardingArea, extraMessages]);

  const currentAgent = onboardingArea === "team-lead" ? teamLead : rep;
  const currentLabel = onboardingArea === "team-lead" ? "Alex (Team Lead)" : `${hiredRepName} (Rep)`;

  return (
    <div className="flex-1 flex h-full">
      {/* Agent sidebar */}
      <div className="w-[60px] border-r border-border bg-[#fafafa] flex flex-col items-center py-3 gap-2">
        <button
          onClick={() => setOnboardingArea("team-lead")}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all",
            onboardingArea === "team-lead" && "ring-2 ring-[#6c47ff] ring-offset-2"
          )}
          style={{ background: teamLead.color }}
          title="Alex (Team Lead)"
        >
          <Crown size={16} />
        </button>
        {onboardingStep >= 7 && (
          <>
            <div className="w-6 border-t border-border my-1" />
            <button
              onClick={() => setOnboardingArea("rep")}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all",
                onboardingArea === "rep" && "ring-2 ring-[#6c47ff] ring-offset-2"
              )}
              style={{ background: rep.color }}
              title={hiredRepName}
            >
              {rep.initials}
            </button>
          </>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="px-5 py-3 border-b border-border flex items-center gap-3 bg-white">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: currentAgent.color }}
          >
            {onboardingArea === "team-lead" ? <Crown size={14} /> : rep.initials}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-semibold">{currentLabel}</span>
            <AiBadge />
            <span className="text-[12px] text-muted-foreground ml-2">
              {onboardingArea === "team-lead" ? "Team Lead \u00b7 Setup" : "AI Support Rep"}
            </span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {areaSteps.map((step, idx) => {
            const isLast = idx === areaSteps.length - 1 && step.id === onboardingStep;

            if (step.type === "scenario" && isLast && adjustingScenario === null) {
              return (
                <div key={step.id}>
                  <ChatBubble
                    step={step}
                    onAction={(nextStep, value) => {
                      if (value === "adjust") {
                        handleNeedsAdjustment(step.id);
                      } else {
                        handleAction(nextStep, value);
                      }
                    }}
                    isLatest={true}
                  />
                </div>
              );
            }

            return (
              <div key={step.id}>
                <ChatBubble step={step} onAction={handleAction} isLatest={isLast && adjustingScenario === null} />
                {extraMessages
                  .filter((em) => em.afterStep === step.id && em.area === onboardingArea)
                  .flatMap((em) => em.messages)
                  .map((msg, mi) => {
                    const msgAgent = msg.sender === "rep" ? rep : teamLead;
                    return (
                      <div key={`extra-${step.id}-${mi}`} className="flex gap-3 items-start mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5" style={{ background: msgAgent.color }}>
                          {msgAgent.isTeamLead ? <Crown size={14} /> : msgAgent.initials}
                        </div>
                        <div className="flex-1 max-w-[680px]">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-[13px] font-semibold">{msgAgent.isTeamLead ? "Alex (Team Lead)" : hiredRepName}</span>
                            <AiBadge />
                            <span className="text-[11px] text-muted-foreground ml-1">just now</span>
                          </div>
                          <div className="bg-[#fffbf0] border border-[#f5e6c8] rounded-xl rounded-tl-sm px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap">
                            <RichText text={msg.text} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })}

          {adjustingScenario !== null && (
            <NeedsAdjustmentInput onSubmit={(fb) => handleAdjustmentSubmit(fb, adjustingScenario)} />
          )}
        </div>
      </div>
    </div>
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

/* NORMAL MODE — TEAM LEAD VIEW */
function TeamLeadView() {
  const { topicsData, updateTopic, hiredRepName, agentsData } = useApp();
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const teamLead = agentsData.find((a) => a.id === "team-lead")!;

  useEffect(() => {
    setMessages([
      {
        sender: "team-lead",
        text: `\ud83d\udcca **Daily Digest \u2014 ${dailyDigest.date}**\n\nHere's how the team performed today:\n\n\u2022 Tickets handled: ${dailyDigest.totalTickets} (${dailyDigest.deltaTickets} vs yesterday)\n\u2022 Resolution rate: ${dailyDigest.resolutionRate} (${dailyDigest.deltaResolution})\n\u2022 CSAT: ${dailyDigest.csatScore} (${dailyDigest.deltaCsat})\n\u2022 Avg first response: ${dailyDigest.avgResponseTime} (${dailyDigest.deltaRt})\n\u2022 Sentiment-changed rate: ${dailyDigest.sentimentChangedRate} (${dailyDigest.deltaSentiment})\n\nI have ${dailyDigest.updateCount} items for your review below.`,
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
  const processedTopics = topicsData.filter((t) => t.status !== "pending");

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="px-5 py-3 border-b border-border flex items-center gap-3 bg-white">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: teamLead.color }}>
          <Crown size={14} />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[13px] font-semibold">Alex (Team Lead)</span>
          <AiBadge />
          <span className="text-[12px] text-muted-foreground ml-2">Team Lead</span>
        </div>
      </div>

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
                {!isUser && (
                  <div className="flex items-center gap-1 mb-1 -mt-0.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">Alex (Team Lead)</span>
                    <AiBadge />
                  </div>
                )}
                <RichText text={msg.text} />
              </div>
            </div>
          );
        })}

        {(pendingTopics.length > 0 || processedTopics.length > 0) && (
          <div className="space-y-2 ml-11 max-w-[600px]">
            {pendingTopics.length > 0 && (
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                {pendingTopics.length} items for review
              </p>
            )}
            {pendingTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onAccept={() => updateTopic(topic.id, { status: "accepted" })}
                onReject={() => updateTopic(topic.id, { status: "rejected" })}
                onReply={() => {}}
              />
            ))}
            {processedTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onAccept={() => {}}
                onReject={() => {}}
                onReply={() => {}}
              />
            ))}
          </div>
        )}
      </div>

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

/* NORMAL MODE — REP VIEW */
function RepView({ agentId }: { agentId: string }) {
  const { agentsData, hiredRepName } = useApp();
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
        text: `Hi! I'm ${hiredRepName}, your AI support rep. I'm currently in ${agent.mode} mode.\n\nI have ${needsAttention.length} escalated tickets that need your attention. You can review them in the feed on the left, or chat with me about anything.`,
        time: "Just now",
      },
    ]);
  }, [agentId, hiredRepName, agent.mode, needsAttention.length]);

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
                    <span>&middot;</span>
                    <span>{esc.orderValue}</span>
                    <span>&middot;</span>
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
                    <span>&middot;</span>
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
        <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: agent.color }}>
              {agent.initials}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-semibold">{hiredRepName}</span>
              <AiBadge />
              <span className="text-[12px] text-muted-foreground ml-2">{agent.role} &middot; {agent.mode}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-[12px] text-muted-foreground" onClick={() => setProfileOpen(true)}>
            Profile <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>

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
                  <p className="text-[12px] text-muted-foreground mb-4">Ticket {esc.ticketId} &middot; {esc.orderValue} &middot; {esc.createdAt}</p>
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
            <div className="px-5 py-3 border-t border-border bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={`Message ${hiredRepName}...`}
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

      <AgentProfileSheet agent={agent} open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
}

/* NORMAL VIEW — WRAPPER */
function NormalView() {
  const { selectedAgentId, setSelectedAgentId, agentsData, hiredRepName } = useApp();
  const nonLeadAgents = agentsData.filter((a) => !a.isTeamLead);
  const teamLead = agentsData.find((a) => a.id === "team-lead")!;

  return (
    <div className="flex-1 flex h-full">
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
            title={hiredRepName}
          >
            {agent.initials}
            {escalationFeed.filter((e) => e.status === "needs_attention").length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
        ))}
      </div>
      {selectedAgentId === "team-lead" ? <TeamLeadView /> : <RepView agentId={selectedAgentId} />}
    </div>
  );
}

/* MAIN AGENTS PAGE */
export default function AgentsPage() {
  const { agentMode } = useApp();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {agentMode === "onboarding" ? <OnboardingView /> : <NormalView />}
    </div>
  );
}

/*
 * ConversationLogSidebar — right-side slide-out panel for viewing ticket conversation logs.
 * Reuses the same conversation detail pattern from PerformancePage.
 * Accepts a ticketId, looks up the conversation log, and renders thread + reasoning.
 */
import { useState } from "react";
import {
  conversationLogs,
  type ConversationLog,
  type ReasoningTurn,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X, Brain, MessageSquare, Search, ArrowRight,
  Play, CheckCircle, XCircle, Shield,
} from "lucide-react";

/* ── Public API ── */
interface ConversationLogSidebarProps {
  ticketId: string | null;
  onClose: () => void;
}

export default function ConversationLogSidebar({ ticketId, onClose }: ConversationLogSidebarProps) {
  if (!ticketId) return null;

  const convo = conversationLogs.find((c) => c.ticketId === ticketId) ?? null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[560px] bg-white border-l border-border z-50 flex flex-col animate-in slide-in-from-right duration-200 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <h3 className="text-[14px] font-semibold">
            Conversation Log {ticketId && <span className="text-muted-foreground font-normal ml-1">{ticketId}</span>}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-muted-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {convo ? (
            <ConversationDetail convo={convo} />
          ) : (
            <div className="flex items-center justify-center h-full text-center px-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Conversation not found</p>
                <p className="text-xs text-muted-foreground/70">
                  No conversation log matches ticket {ticketId}.
                  This may be a ticket from a different data source.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Conversation Detail (mirrored from PerformancePage) ── */
function ConversationDetail({ convo }: { convo: ConversationLog }) {
  const [showReasoning, setShowReasoning] = useState(false);

  return (
    <div className="flex flex-col">
      {/* Meta header */}
      <div className="px-5 pt-4 pb-0">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="secondary" className="text-[10px]">{convo.ticketId}</Badge>
          <Badge variant="outline" className={cn(
            "text-[10px]",
            convo.outcome === "Resolved" ? "border-green-300 text-green-700 bg-green-50" :
            convo.outcome === "Escalated" ? "border-amber-300 text-amber-700 bg-amber-50" :
            "border-blue-300 text-blue-700 bg-blue-50"
          )}>
            {convo.outcome}
          </Badge>
          {convo.mode && <Badge variant="outline" className="text-[10px]">{convo.mode}</Badge>}
        </div>
        <h4 className="text-[15px] font-semibold">{convo.customer}</h4>
        <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{convo.summary}</p>
      </div>

      {/* Meta row */}
      <div className="px-5 py-2 flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
        <span>Intent: <span className="font-medium text-foreground">{convo.intent}</span></span>
        <span>Sentiment: <span className={cn(
          "font-medium",
          convo.sentiment === "Frustrated" ? "text-red-600" :
          convo.sentiment === "Positive" ? "text-green-600" : "text-foreground"
        )}>{convo.sentiment}</span></span>
        <span>{convo.turns} turns</span>
        <span>{convo.time}</span>
      </div>

      {/* Toggle */}
      <div className="px-5 py-2 flex items-center gap-2 border-b border-border">
        <Button
          size="sm"
          variant={!showReasoning ? "default" : "outline"}
          className={cn("text-[12px] h-7", !showReasoning && "bg-[#6c47ff] hover:bg-[#5a3ad9]")}
          onClick={() => setShowReasoning(false)}
        >
          <MessageSquare size={12} className="mr-1" /> Thread
        </Button>
        <Button
          size="sm"
          variant={showReasoning ? "default" : "outline"}
          className={cn("text-[12px] h-7", showReasoning && "bg-[#6c47ff] hover:bg-[#5a3ad9]")}
          onClick={() => setShowReasoning(true)}
        >
          <Brain size={12} className="mr-1" /> Reasoning
        </Button>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        {showReasoning ? (
          <div className="space-y-5">
            {convo.reasoning.map((turn) => (
              <ReasoningTurnView key={turn.turn} turn={turn} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {convo.thread.map((msg, i) => (
              <ThreadMessageView key={i} msg={msg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Reasoning Turn ── */
function ReasoningTurnView({ turn }: { turn: ReasoningTurn }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[12px] font-semibold text-muted-foreground">Turn {turn.turn}</h4>

      <div className="bg-[#f8f8f8] rounded-lg p-3">
        <p className="text-[11px] font-semibold text-muted-foreground mb-1">Customer Input</p>
        <p className="text-[12px] italic">"{turn.customerInput}"</p>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Search size={12} className="text-blue-600" />
          <p className="text-[11px] font-semibold text-blue-700">Context Enrichment</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {turn.contextEnrichment.map((item, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 border-0">{item}</Badge>
          ))}
        </div>
      </div>

      <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <ArrowRight size={12} className="text-purple-600" />
          <p className="text-[11px] font-semibold text-purple-700">Rule Routing</p>
        </div>
        <p className="text-[12px]">
          Intent: <span className="font-semibold">{turn.ruleRouting.intent}</span>
          <span className="text-muted-foreground ml-2">(confidence: {(turn.ruleRouting.confidence * 100).toFixed(0)}%)</span>
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {turn.ruleRouting.matchedRules.map((rule, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] bg-purple-100 text-purple-700 border-0">{rule}</Badge>
          ))}
        </div>
      </div>

      <div className="bg-green-50/50 border border-green-100 rounded-lg p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Play size={12} className="text-green-600" />
          <p className="text-[11px] font-semibold text-green-700">Actions Executed</p>
        </div>
        <div className="space-y-1.5">
          {turn.actionsExecuted.map((action, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px]">
              {action.status === "Success" ? (
                <CheckCircle size={12} className="text-green-600 shrink-0" />
              ) : (
                <XCircle size={12} className="text-red-500 shrink-0" />
              )}
              <span className="font-mono text-[11px]">{action.name}</span>
              <span className="text-muted-foreground">→ {action.result}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Shield size={12} className="text-amber-600" />
          <p className="text-[11px] font-semibold text-amber-700">Guardrail Check</p>
        </div>
        <p className="text-[12px]">{turn.guardrailCheck}</p>
      </div>

      <div className="border-t border-border my-2" />
    </div>
  );
}

/* ── Thread Message ── */
function ThreadMessageView({ msg }: { msg: { from: string; type: string; author: string; text: string; time: string; channel: string } }) {
  const isSystem = msg.from === "system";
  const isCustomer = msg.from === "customer";
  const isInternal = msg.type === "internal-note";

  if (isSystem) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <div className="flex-1 border-t border-border/50" />
        <span className="text-[11px] text-muted-foreground shrink-0">{msg.text}</span>
        <div className="flex-1 border-t border-border/50" />
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-lg p-3 text-[12px]",
      isInternal ? "bg-amber-50 border border-amber-200" :
      isCustomer ? "bg-[#f8f8f8] border border-border" :
      "bg-[#f0edff] border border-[#e0d8ff]"
    )}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-semibold text-[12px]">{msg.author}</span>
        {isInternal && (
          <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-700">Internal Note</Badge>
        )}
        <span className="text-[10px] text-muted-foreground ml-auto">{msg.time} · {msg.channel}</span>
      </div>
      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
    </div>
  );
}

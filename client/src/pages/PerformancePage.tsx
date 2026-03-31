/*
 * PerformancePage — KPI dashboard, intent analysis, conversation logs with reasoning
 * PRD: US4 — Performance monitoring with full dashboard, conversation log, and reasoning trace
 */
import { useState } from "react";
import {
  performanceDaily, intentData, conversationLogs, dailyDigest,
  type ConversationLog, type ReasoningTurn
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  TrendingUp, TrendingDown, Clock, MessageSquare, Zap,
  ChevronRight, Brain, Search, Shield,
  Play, CheckCircle, AlertTriangle, XCircle, ArrowRight, BarChart3
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from "recharts";

type SubTab = "overview" | "conversations";

export default function PerformancePage() {
  const [subTab, setSubTab] = useState<SubTab>("overview");
  const [selectedConvo, setSelectedConvo] = useState<ConversationLog | null>(null);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Sub-tabs */}
      <div className="px-5 py-0 flex items-center gap-1 border-b border-border bg-white">
        <button
          onClick={() => setSubTab("overview")}
          className={cn(
            "px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px",
            subTab === "overview"
              ? "border-[#6c47ff] text-[#6c47ff]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="flex items-center gap-1.5"><BarChart3 size={14} /> Overview</span>
        </button>
        <button
          onClick={() => setSubTab("conversations")}
          className={cn(
            "px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px",
            subTab === "conversations"
              ? "border-[#6c47ff] text-[#6c47ff]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="flex items-center gap-1.5"><MessageSquare size={14} /> Conversations</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {subTab === "overview" ? (
          <OverviewView />
        ) : (
          <ConversationsView onSelect={setSelectedConvo} />
        )}
      </div>

      {/* Conversation detail sheet */}
      <Sheet open={!!selectedConvo} onOpenChange={() => setSelectedConvo(null)}>
        <SheetContent className="w-[560px] sm:max-w-[560px] p-0 overflow-y-auto">
          {selectedConvo && <ConversationDetail convo={selectedConvo} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ============================================================
// OVERVIEW
// ============================================================
function OverviewView() {
  const d = dailyDigest;

  return (
    <div className="p-5 space-y-5">
      {/* Daily Digest Banner */}
      <div className="bg-gradient-to-r from-[#f8f6ff] to-[#fffbf0] border border-[#e8e0ff] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-[#6c47ff]" />
          <h3 className="text-[14px] font-semibold">Daily Digest — {d.date}</h3>
        </div>
        <div className="grid grid-cols-5 gap-4">
          <DigestCard label="Total Tickets" value={String(d.totalTickets)} delta={d.deltaTickets} />
          <DigestCard label="Resolution Rate" value={d.resolutionRate} delta={d.deltaResolution} />
          <DigestCard label="CSAT Score" value={d.csatScore} delta={d.deltaCsat} />
          <DigestCard label="Avg Response" value={d.avgResponseTime} delta={d.deltaRt} positive={d.deltaRt.startsWith("-")} />
          <DigestCard label="Sentiment Changed" value={d.sentimentChangedRate} delta={d.deltaSentiment} positive={d.deltaSentiment.startsWith("-")} />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-5">
        {/* Ticket Volume Chart */}
        <div className="border border-border rounded-xl p-4 bg-white">
          <h4 className="text-[13px] font-semibold mb-4">Ticket Volume (7 days)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={performanceDaily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="resolved" fill="#6c47ff" radius={[4, 4, 0, 0]} name="Resolved" />
              <Bar dataKey="escalated" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Escalated" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CSAT Trend */}
        <div className="border border-border rounded-xl p-4 bg-white">
          <h4 className="text-[13px] font-semibold mb-4">CSAT Trend (7 days)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={performanceDaily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[4, 5]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="csat" stroke="#6c47ff" strokeWidth={2} dot={{ r: 4, fill: "#6c47ff" }} name="CSAT" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intent Analysis Table */}
      <div className="border border-border rounded-xl p-4 bg-white">
        <h4 className="text-[13px] font-semibold mb-4">Intent Analysis</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground text-[12px]">Intent</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground text-[12px]">Volume</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground text-[12px]">Resolution</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground text-[12px]">CSAT</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground text-[12px]">Status</th>
              </tr>
            </thead>
            <tbody>
              {intentData.map((row) => (
                <tr key={row.intent} className="border-b border-border/50 hover:bg-[#fafafa]">
                  <td className="py-2.5 px-3 font-medium">{row.intent}</td>
                  <td className="py-2.5 px-3 text-right">{row.volume}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={cn(
                      row.resolutionRate >= 90 ? "text-green-600" :
                      row.resolutionRate >= 80 ? "text-amber-600" : "text-red-600"
                    )}>
                      {row.resolutionRate}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">{row.csat}</td>
                  <td className="py-2.5 px-3 text-right">
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      row.resolutionRate >= 90 ? "border-green-300 text-green-700 bg-green-50" :
                      row.resolutionRate >= 80 ? "border-amber-300 text-amber-700 bg-amber-50" :
                      "border-red-300 text-red-700 bg-red-50"
                    )}>
                      {row.resolutionRate >= 90 ? "Healthy" : row.resolutionRate >= 80 ? "Monitor" : "Needs Work"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DigestCard({ label, value, delta, positive }: { label: string; value: string; delta: string; positive?: boolean }) {
  const isPositive = positive !== undefined ? positive : !delta.startsWith("-");
  return (
    <div>
      <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
      <p className="text-[18px] font-bold">{value}</p>
      <p className={cn("text-[11px] flex items-center gap-0.5 mt-0.5", isPositive ? "text-green-600" : "text-red-500")}>
        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {delta}
      </p>
    </div>
  );
}

// ============================================================
// CONVERSATIONS VIEW — with filtering
// ============================================================
function ConversationsView({ onSelect }: { onSelect: (c: ConversationLog) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");

  const filtered = conversationLogs.filter((c) => {
    const matchesSearch = searchQuery === "" ||
      c.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOutcome = outcomeFilter === "all" || c.outcome === outcomeFilter;
    const matchesSentiment = sentimentFilter === "all" || c.sentiment === sentimentFilter;
    return matchesSearch && matchesOutcome && matchesSentiment;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Filters */}
      <div className="px-5 py-3 flex items-center gap-3 border-b border-border/50">
        <div className="relative flex-1 max-w-[280px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-[12px]"
          />
        </div>
        <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
          <SelectTrigger className="w-[140px] h-8 text-[12px]">
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-[140px] h-8 text-[12px]">
            <SelectValue placeholder="Sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiments</SelectItem>
            <SelectItem value="Positive">Positive</SelectItem>
            <SelectItem value="Neutral">Neutral</SelectItem>
            <SelectItem value="Frustrated">Frustrated</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-[12px] text-muted-foreground ml-auto">{filtered.length} conversations</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-2">
        {filtered.map((convo) => (
          <div
            key={convo.ticketId}
            className="border border-border rounded-xl p-4 bg-white hover:border-[#6c47ff]/30 transition-colors cursor-pointer"
            onClick={() => onSelect(convo)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] font-semibold">{convo.customer}</span>
                  <Badge variant="secondary" className="text-[10px]">{convo.ticketId}</Badge>
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    convo.outcome === "Resolved" ? "border-green-300 text-green-700 bg-green-50" : "border-amber-300 text-amber-700 bg-amber-50"
                  )}>
                    {convo.outcome}
                  </Badge>
                  {convo.mode && <Badge variant="outline" className="text-[10px]">{convo.mode}</Badge>}
                </div>
                <p className="text-[12px] text-muted-foreground line-clamp-1">{convo.summary}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                  <span>Intent: <span className="font-medium text-foreground">{convo.intent}</span></span>
                  <span>Sentiment: <span className={cn(
                    "font-medium",
                    convo.sentiment === "Frustrated" ? "text-red-600" :
                    convo.sentiment === "Positive" ? "text-green-600" : "text-foreground"
                  )}>{convo.sentiment}</span></span>
                  <span>{convo.turns} turns</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-muted-foreground">{convo.time}</span>
                <ChevronRight size={14} className="text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Search size={32} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-[14px] font-medium text-muted-foreground">No conversations found</p>
            <p className="text-[12px] text-muted-foreground mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CONVERSATION DETAIL with Reasoning
// ============================================================
function ConversationDetail({ convo }: { convo: ConversationLog }) {
  const [showReasoning, setShowReasoning] = useState(true);

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-5 pt-5 pb-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="text-[10px]">{convo.ticketId}</Badge>
          <Badge variant="outline" className={cn(
            "text-[10px]",
            convo.outcome === "Resolved" ? "border-green-300 text-green-700 bg-green-50" : "border-amber-300 text-amber-700 bg-amber-50"
          )}>
            {convo.outcome}
          </Badge>
          {convo.mode && <Badge variant="outline" className="text-[10px]">{convo.mode}</Badge>}
        </div>
        <SheetTitle className="text-[15px] font-semibold">{convo.customer}</SheetTitle>
        <p className="text-[12px] text-muted-foreground mt-1">{convo.summary}</p>
      </SheetHeader>

      {/* Meta */}
      <div className="px-5 py-2 flex items-center gap-4 text-[11px] text-muted-foreground">
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
          variant={showReasoning ? "default" : "outline"}
          className={cn("text-[12px] h-7", showReasoning && "bg-[#6c47ff] hover:bg-[#5a3ad9]")}
          onClick={() => setShowReasoning(true)}
        >
          <Brain size={12} className="mr-1" /> Reasoning
        </Button>
        <Button
          size="sm"
          variant={!showReasoning ? "default" : "outline"}
          className={cn("text-[12px] h-7", !showReasoning && "bg-[#6c47ff] hover:bg-[#5a3ad9]")}
          onClick={() => setShowReasoning(false)}
        >
          <MessageSquare size={12} className="mr-1" /> Thread
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
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

function ReasoningTurnView({ turn }: { turn: ReasoningTurn }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[12px] font-semibold text-muted-foreground">Turn {turn.turn}</h4>

      {/* Customer input */}
      <div className="bg-[#f8f8f8] rounded-lg p-3">
        <p className="text-[11px] font-semibold text-muted-foreground mb-1">Customer Input</p>
        <p className="text-[12px] italic">"{turn.customerInput}"</p>
      </div>

      {/* Context Enrichment */}
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

      {/* Rule Routing */}
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

      {/* Actions Executed */}
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

      {/* Guardrail Check */}
      <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Shield size={12} className="text-amber-600" />
          <p className="text-[11px] font-semibold text-amber-700">Guardrail Check</p>
        </div>
        <p className="text-[12px]">{turn.guardrailCheck}</p>
      </div>

      <Separator className="my-2" />
    </div>
  );
}

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

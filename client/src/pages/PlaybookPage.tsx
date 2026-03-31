/*
 * PlaybookPage — Rules + Documents
 * PRD: US3 — Playbook management with editable rules and document management
 */
import { useState, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import type { Rule, Document as DocType } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  BookOpen, FileText, Upload, Search, BarChart3, Clock, Smile,
  ChevronRight, Save, X, Trash2, Eye, History, Lightbulb, Check, Plus
} from "lucide-react";
import { toast } from "sonner";

type PlaybookTab = "rules" | "documents";

export default function PlaybookPage() {
  const [activeTab, setActiveTab] = useState<PlaybookTab>("rules");

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Sub-tabs */}
      <div className="px-5 py-0 border-b border-border bg-white flex items-center gap-1">
        {(["rules", "documents"] as PlaybookTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-[13px] font-medium capitalize transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-[#6c47ff] text-[#6c47ff]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "rules" ? (
              <span className="flex items-center gap-1.5"><BookOpen size={14} /> Rules</span>
            ) : (
              <span className="flex items-center gap-1.5"><FileText size={14} /> Documents</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "rules" ? <RulesView /> : <DocumentsView />}
    </div>
  );
}

// ============================================================
// RULES VIEW
// ============================================================
function RulesView() {
  const { rulesData, toggleRule, topicsData, updateTopic } = useApp();
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRules = rulesData.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enabledCount = rulesData.filter((r) => r.enabled).length;
  const pendingTopics = topicsData.filter((t) => t.status === "pending");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-semibold text-foreground">{rulesData.length} Rules</h3>
          <p className="text-[11px] text-muted-foreground">{enabledCount} active · {rulesData.length - enabledCount} paused</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-[200px] pl-8 text-[12px]"
            />
          </div>
          <Button size="sm" variant="outline" className="text-[12px] h-8">
            <Plus size={12} className="mr-1" /> Add Rule
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
        {/* Team Lead Proposals */}
        {pendingTopics.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb size={14} className="text-amber-500" />
              <h3 className="text-[13px] font-semibold">Team Lead Proposals ({pendingTopics.length})</h3>
            </div>
            {pendingTopics.map((topic) => (
              <div key={topic.id} className="border border-amber-200 bg-amber-50/50 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] font-semibold border-amber-400 text-amber-700 bg-amber-100">
                        {topic.badge}
                      </Badge>
                      {topic.confidence && (
                        <span className="text-[10px] text-muted-foreground">Confidence: {topic.confidence}</span>
                      )}
                    </div>
                    <h4 className="text-[13px] font-semibold">{topic.title}</h4>
                    <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2">{topic.summary}</p>
                    {topic.ruleContent && (
                      <div className="bg-white border border-amber-200 rounded-lg p-2 mt-2">
                        <pre className="text-[11px] text-foreground whitespace-pre-wrap font-mono leading-relaxed line-clamp-3">{topic.ruleContent}</pre>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                      {topic.sourceTickets.slice(0, 3).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px] h-5">{t}</Badge>
                      ))}
                      {topic.sourceTickets.length > 3 && <span>+{topic.sourceTickets.length - 3} more</span>}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600 hover:bg-green-50"
                      onClick={() => { updateTopic(topic.id, { status: "accepted" }); toast.success("Proposal accepted"); }}>
                      <Check size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                      onClick={() => { updateTopic(topic.id, { status: "rejected" }); toast.success("Proposal rejected"); }}>
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rule cards */}
        <div className="space-y-2">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className={cn(
                "border rounded-xl p-4 transition-all cursor-pointer",
                selectedRuleId === rule.id ? "border-[#6c47ff]/40 bg-[#f8f6ff]" : "border-border bg-white hover:border-[#6c47ff]/20"
              )}
              onClick={() => setSelectedRuleId(rule.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[13px] font-semibold text-foreground">{rule.name}</h4>
                    <Badge variant="outline" className={cn(
                      "text-[10px] h-5",
                      rule.enabled ? "border-green-500 text-green-600" : "border-gray-400 text-gray-500"
                    )}>
                      {rule.enabled ? "Active" : "Paused"}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] h-5">{rule.source}</Badge>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{rule.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><BarChart3 size={10} /> {rule.stats.used} uses</span>
                    <span className="flex items-center gap-1"><Smile size={10} /> {rule.stats.avgCsat} CSAT</span>
                    <span className="flex items-center gap-1"><Eye size={10} /> {rule.stats.deflection}% deflection</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="scale-90"
                  />
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rule Detail Sheet */}
      {selectedRuleId && (
        <RuleDetailSheet
          ruleId={selectedRuleId}
          open={!!selectedRuleId}
          onOpenChange={(open) => !open && setSelectedRuleId(null)}
        />
      )}
    </div>
  );
}

// ============================================================
// RULE DETAIL SHEET (Editable)
// ============================================================
function RuleDetailSheet({ ruleId, open, onOpenChange }: { ruleId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { rulesData, updateRule } = useApp();
  const rule = rulesData.find((r) => r.id === ruleId);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [detailTab, setDetailTab] = useState<"content" | "stats" | "history">("content");

  if (!rule) return null;

  const startEdit = () => {
    setEditContent(rule.content);
    setEditDescription(rule.description);
    setEditing(true);
  };

  const saveEdit = () => {
    updateRule(rule.id, {
      content: editContent,
      description: editDescription,
      lastUpdated: "Just now",
      source: "Manager edit",
    });
    setEditing(false);
    toast.success("Rule updated", { description: `"${rule.name}" has been saved.` });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px] p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={cn(
                  "text-[10px]",
                  rule.enabled ? "border-green-500 text-green-600" : "border-gray-400 text-gray-500"
                )}>
                  {rule.enabled ? "Active" : "Paused"}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">{rule.source}</Badge>
              </div>
              <SheetTitle className="text-[15px] font-semibold">{rule.name}</SheetTitle>
            </div>
            {!editing ? (
              <Button variant="outline" size="sm" className="text-[12px] h-7" onClick={startEdit}>
                Edit
              </Button>
            ) : (
              <div className="flex gap-1.5">
                <Button variant="ghost" size="sm" className="text-[12px] h-7" onClick={() => setEditing(false)}>
                  <X size={12} className="mr-1" /> Cancel
                </Button>
                <Button size="sm" className="text-[12px] h-7 bg-[#6c47ff] hover:bg-[#5a3ad9] text-white" onClick={saveEdit}>
                  <Save size={12} className="mr-1" /> Save
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>

        {/* Detail Tabs */}
        <div className="flex border-b border-border px-5 mt-3">
          {(["content", "stats", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDetailTab(tab)}
              className={cn(
                "px-3 py-2 text-[12px] font-medium capitalize transition-colors border-b-2 -mb-px",
                detailTab === tab
                  ? "border-[#6c47ff] text-[#6c47ff]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {detailTab === "content" && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
                {editing ? (
                  <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="mt-1 text-[13px] min-h-[60px]" />
                ) : (
                  <p className="mt-1 text-[13px] text-foreground leading-relaxed">{rule.description}</p>
                )}
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Rule Content</label>
                {editing ? (
                  <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="mt-1 text-[13px] min-h-[240px] font-mono" />
                ) : (
                  <div className="mt-1 bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg p-4">
                    <pre className="text-[12px] text-foreground whitespace-pre-wrap font-mono leading-relaxed">{rule.content}</pre>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Clock size={10} /> Updated: {rule.lastUpdated}</span>
                <span>Source: {rule.source}</span>
              </div>
            </div>
          )}

          {detailTab === "stats" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#f8f9fa] rounded-lg p-3 text-center">
                  <p className="text-[20px] font-bold text-foreground">{rule.stats.used}</p>
                  <p className="text-[11px] text-muted-foreground">Times Used</p>
                </div>
                <div className="bg-[#f8f9fa] rounded-lg p-3 text-center">
                  <p className="text-[20px] font-bold text-foreground">{rule.stats.avgCsat}</p>
                  <p className="text-[11px] text-muted-foreground">Avg CSAT</p>
                </div>
                <div className="bg-[#f8f9fa] rounded-lg p-3 text-center">
                  <p className="text-[20px] font-bold text-foreground">{rule.stats.deflection}%</p>
                  <p className="text-[11px] text-muted-foreground">Deflection</p>
                </div>
              </div>
              <Separator />
              <p className="text-[12px] text-muted-foreground">Performance data is based on the last 7 days of ticket handling.</p>
            </div>
          )}

          {detailTab === "history" && (
            <div className="space-y-0">
              {rule.versionHistory.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No version history.</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                  {rule.versionHistory.map((v, i) => (
                    <div key={i} className="flex gap-3 pb-4 relative">
                      <div className="w-6 h-6 rounded-full bg-[#f0edff] border border-[#6c47ff]/20 flex items-center justify-center shrink-0 z-10">
                        <History size={12} className="text-[#6c47ff]" />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-[13px] font-medium text-foreground">Version {v.version}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{v.diff}</p>
                        <p className="text-[11px] text-muted-foreground">{v.source} · {v.timestamp}</p>
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

// ============================================================
// DOCUMENTS VIEW
// ============================================================
function DocumentsView() {
  const { docsData, addDocument, removeDocument, toggleDocInUse } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = docsData.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const newDoc: DocType = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: file.name.split(".").pop()?.toUpperCase() || "FILE",
        size: `${(file.size / 1024).toFixed(0)} KB`,
        uploadedAt: "Just now",
        status: "Processing",
        inUse: false,
        extractedRules: "",
      };
      addDocument(newDoc);
      toast.success("File uploaded", { description: `${file.name} is being processed.` });
    }
  }, [addDocument]);

  const simulateUpload = () => {
    const newDoc: DocType = {
      id: `doc-${Date.now()}`,
      name: `New_Document_${Date.now().toString().slice(-4)}.pdf`,
      type: "PDF",
      size: "1.2 MB",
      uploadedAt: "Just now",
      status: "Processing",
      inUse: false,
      extractedRules: "",
    };
    addDocument(newDoc);
    toast.success("File uploaded", { description: `${newDoc.name} is being processed.` });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-semibold text-foreground">{docsData.length} Documents</h3>
          <p className="text-[11px] text-muted-foreground">{docsData.filter((d) => d.status === "Processed").length} processed</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-[200px] pl-8 text-[12px]"
            />
          </div>
          <Button size="sm" className="h-8 text-[12px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white" onClick={simulateUpload}>
            <Upload size={12} className="mr-1" /> Upload
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {/* Drop zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-6 mb-4 text-center transition-colors",
            dragOver ? "border-[#6c47ff] bg-[#f8f6ff]" : "border-border bg-[#fafafa]"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-[13px] text-muted-foreground">Drag & drop files here, or click Upload</p>
          <p className="text-[11px] text-muted-foreground mt-1">Supports PDF, DOCX, TXT, CSV</p>
        </div>

        {/* Document list */}
        <div className="space-y-2">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="border border-border rounded-xl p-4 bg-white flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0",
                doc.type === "PDF" ? "bg-red-500" : doc.type === "DOC" ? "bg-blue-500" : "bg-gray-500"
              )}>
                {doc.type}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-[13px] font-medium text-foreground truncate">{doc.name}</h4>
                  <Badge variant="outline" className={cn(
                    "text-[10px] h-5 shrink-0",
                    doc.status === "Processed" ? "border-green-500 text-green-600" :
                    doc.status === "Processing" ? "border-amber-500 text-amber-600" :
                    "border-red-500 text-red-600"
                  )}>
                    {doc.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                  <span>{doc.size}</span>
                  <span>·</span>
                  <span>Uploaded {doc.uploadedAt}</span>
                  {doc.extractedRules && (
                    <>
                      <span>·</span>
                      <span className="text-[#6c47ff]">{doc.extractedRules}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {doc.status === "Processed" && (
                  <Switch
                    checked={doc.inUse}
                    onCheckedChange={() => toggleDocInUse(doc.id)}
                    className="scale-90"
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                  onClick={() => { removeDocument(doc.id); toast.success("Document removed"); }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

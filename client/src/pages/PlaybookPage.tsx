/*
 * PlaybookPage — Rules + Documents
 * Round 7: Documents tab has empty state with guided upload + "Try sample document".
 *          First successful import triggers a Team Lead topic message.
 *          Consumes playbookDeepLink to auto-switch to Documents tab.
 */
import { useState, useCallback, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import type { Rule, Document as DocType, Topic } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  BookOpen, FileText, Upload, Search, BarChart3, Clock, Smile,
  ChevronRight, Save, X, Trash2, Eye, History, Lightbulb, Check, Plus,
  Sparkles, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

type PlaybookTab = "rules" | "documents";

export default function PlaybookPage() {
  const { playbookDeepLink, setPlaybookDeepLink } = useApp();
  const [activeTab, setActiveTab] = useState<PlaybookTab>("rules");

  /* Consume deep-link from Setup Progress */
  useEffect(() => {
    if (playbookDeepLink === "documents") {
      setActiveTab("documents");
      setPlaybookDeepLink(null);
    }
  }, [playbookDeepLink, setPlaybookDeepLink]);

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

      {activeTab === "rules" ? <RulesView /> : <DocumentsView onSwitchToRules={() => setActiveTab("rules")} />}
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
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-[15px]">{rule.name}</SheetTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn(
                "text-[10px]",
                rule.enabled ? "border-green-500 text-green-600" : "border-gray-400 text-gray-500"
              )}>
                {rule.enabled ? "Active" : "Paused"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            {(["content", "stats", "history"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setDetailTab(tab)}
                className={cn(
                  "px-3 py-1.5 text-[12px] font-medium rounded-lg capitalize transition-colors",
                  detailTab === tab ? "bg-[#f0edff] text-[#6c47ff]" : "text-muted-foreground hover:bg-[#f5f5f5]"
                )}
              >
                {tab === "content" && <BookOpen size={12} className="inline mr-1" />}
                {tab === "stats" && <BarChart3 size={12} className="inline mr-1" />}
                {tab === "history" && <History size={12} className="inline mr-1" />}
                {tab}
              </button>
            ))}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {detailTab === "content" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description</p>
                  {!editing && (
                    <Button size="sm" variant="ghost" className="h-6 text-[11px]" onClick={startEdit}>
                      Edit
                    </Button>
                  )}
                </div>
                {editing ? (
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full text-[12px] p-2 border border-border rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/30"
                  />
                ) : (
                  <p className="text-[12px] text-muted-foreground leading-relaxed">{rule.description}</p>
                )}
              </div>

              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rule Logic</p>
                {editing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full text-[12px] p-3 border border-border rounded-lg font-mono resize-none h-40 focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/30"
                  />
                ) : (
                  <pre className="text-[12px] text-foreground whitespace-pre-wrap font-mono leading-relaxed bg-[#f8f9fa] p-3 rounded-lg border border-border">{rule.content}</pre>
                )}
              </div>

              {editing && (
                <div className="flex gap-2">
                  <Button size="sm" className="h-8 text-[12px] bg-[#6c47ff] hover:bg-[#5a3ad9] text-white" onClick={saveEdit}>
                    <Save size={12} className="mr-1" /> Save Changes
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-2 border-t border-border">
                <span className="flex items-center gap-1"><Clock size={10} /> Updated {rule.lastUpdated}</span>
                <span>Source: {rule.source}</span>
              </div>
            </div>
          )}

          {detailTab === "stats" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#f8f9fa] rounded-lg p-3 text-center">
                  <p className="text-[20px] font-bold text-foreground">{rule.stats.used}</p>
                  <p className="text-[10px] text-muted-foreground">Times Used</p>
                </div>
                <div className="bg-[#f8f9fa] rounded-lg p-3 text-center">
                  <p className="text-[20px] font-bold text-foreground">{rule.stats.avgCsat}</p>
                  <p className="text-[10px] text-muted-foreground">Avg CSAT</p>
                </div>
                <div className="bg-[#f8f9fa] rounded-lg p-3 text-center">
                  <p className="text-[20px] font-bold text-foreground">{rule.stats.deflection}%</p>
                  <p className="text-[10px] text-muted-foreground">Deflection</p>
                </div>
              </div>
            </div>
          )}

          {detailTab === "history" && (
            <div className="space-y-3">
              {rule.versionHistory.length > 0 ? (
                rule.versionHistory.map((entry: { version: number; timestamp: string; source: string; diff: string }, i: number) => (
                  <div key={i} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-foreground">v{entry.version}</span>
                      <span className="text-[10px] text-muted-foreground">{entry.timestamp}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Source: {entry.source}</p>
                    {entry.diff && (
                      <pre className="text-[10px] text-muted-foreground mt-2 bg-[#f8f9fa] p-2 rounded font-mono whitespace-pre-wrap">{entry.diff}</pre>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[12px] text-muted-foreground text-center py-8">No history yet</p>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================
// DOCUMENTS VIEW — with empty state + Try Sample Document
// ============================================================
function DocumentsView({ onSwitchToRules }: { onSwitchToRules: () => void }) {
  const {
    docsData, addDocument, removeDocument, toggleDocInUse,
    updateDocument, addTopic, setSopUploaded, setExtractedRuleNames,
  } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [processing, setProcessing] = useState(false);

  const filteredDocs = docsData.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEmpty = docsData.length === 0;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      handleUploadFile(file.name, `${(file.size / 1024).toFixed(0)} KB`);
    }
  }, []);

  const handleUploadFile = (name: string, size: string) => {
    const newDoc: DocType = {
      id: `doc-${Date.now()}`,
      name,
      type: name.split(".").pop()?.toUpperCase() || "FILE",
      size,
      uploadedAt: "Just now",
      status: "Processing",
      inUse: false,
      extractedRules: "",
    };
    addDocument(newDoc);
    setProcessing(true);
    toast.success("File uploaded", { description: `${name} is being processed.` });

    // Simulate processing
    setTimeout(() => {
      const ruleNames = [
        "Return Window Policy",
        "Seel Protection Claim Process",
        "Shipping Delay Compensation",
      ];
      updateDocument(newDoc.id, {
        status: "Processed",
        inUse: true,
        extractedRules: `${ruleNames.length} rules extracted`,
      });
      setSopUploaded(true);
      setExtractedRuleNames(ruleNames);
      setProcessing(false);

      // Redirect to Rules tab after successful extraction
      onSwitchToRules();

      // Create a Team Lead topic for the first import
      const newTopic: Topic = {
        id: `topic-doc-${Date.now()}`,
        type: "document-parse",
        badge: "Document Import",
        confidence: "High",
        title: `${ruleNames.length} rules extracted from "${name}"`,
        summary: `Your document has been processed and ${ruleNames.length} support rules were identified. Review and accept them to add to your playbook.`,
        ruleContent: ruleNames.map((r, i) => `${i + 1}. ${r}`).join("\n"),
        sourceTickets: [],
        status: "pending",
      };
      addTopic(newTopic);
      toast.success(`${ruleNames.length} rules extracted`, {
        description: "Check the Team Lead view for details.",
      });
    }, 2500);
  };

  const simulateUpload = () => {
    handleUploadFile(`Document_${Date.now().toString().slice(-4)}.pdf`, "1.2 MB");
  };

  const trySampleDocument = () => {
    handleUploadFile("Seel_Support_SOP_Sample.pdf", "842 KB");
  };

  /* ── Empty state ── */
  if (isEmpty) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5">
            <FileText className="w-7 h-7 text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Your Support Documents</h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Upload your SOP documents, FAQ sheets, or policy files. We'll automatically extract support rules
            that your AI Rep can follow when handling customer tickets.
          </p>

          {/* Upload drop zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 mb-4 transition-colors cursor-pointer",
              dragOver ? "border-indigo-400 bg-indigo-50" : "border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={simulateUpload}
          >
            <Upload size={28} className="mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 font-medium">Drag & drop files here, or click to upload</p>
            <p className="text-xs text-gray-400 mt-1">Supports PDF, DOCX, TXT, CSV</p>
          </div>

          {/* Try sample document */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#fafafa] px-3 text-xs text-gray-400">or</span>
            </div>
          </div>

          <button
            onClick={trySampleDocument}
            disabled={processing}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            Try with a sample document
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <p className="text-xs text-gray-400 mt-2">
            We'll use a sample SOP to show you how rule extraction works.
          </p>
        </div>
      </div>
    );
  }

  /* ── Normal documents list ── */
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

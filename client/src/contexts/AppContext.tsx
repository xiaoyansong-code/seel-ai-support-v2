import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  agents as defaultAgents,
  rules as defaultRules,
  topics as defaultTopics,
  documents as defaultDocs,
  defaultReadActions,
  defaultWriteActions,
  type Agent,
  type Rule,
  type Topic,
  type Document,
  type ActionPermission,
} from "@/lib/data";

/* ── Navigation ── */
type MainTab = "agents" | "playbook" | "performance";
type AgentMode = "setup" | "normal";
type StepStatus = "pending" | "complete" | "skipped";
type GoLiveMode = "training" | "production";

/* ── Zendesk sub-step state machine ── */
type ZdAuthStatus = "idle" | "loading" | "success" | "error";
type ZdSeatStatus = "idle" | "loading" | "verified" | "error";
type ZdTriggerStatus = "idle" | "loading" | "verified" | "error";

interface ZendeskState {
  subdomain: string;
  authStatus: ZdAuthStatus;
  authError: string;
  // Seat
  seatStatus: ZdSeatStatus;
  seatError: string;
  selectedSeat: string;
  availableSeats: { id: string; name: string; email: string }[];
  // Trigger / Routing
  triggerStatus: ZdTriggerStatus;
  triggerError: string;
}

/* ── Channel / Handoff config (now on Agent side) ── */
interface ChannelConfig {
  email: boolean;
  liveChat: boolean;
  sms: boolean;
}

interface HandoffConfig {
  method: "group" | "seat" | "email" | "tag";
  // Group-based
  selectedGroup: string;
  availableGroups: string[];
  // Seat-based (assign to specific person)
  selectedHandoffSeat: string;
  availableHandoffSeats: { id: string; name: string; email: string }[];
  // Email-based
  handoffEmail: string;
  emailCc: string;
  emailTemplate: "default" | "detailed" | "minimal";
  // Tag-based
  handoffTag: string;
  autoSetPriority: boolean;
  // Priority
  priority: "normal" | "high" | "urgent";
}

/* ── Context shape ── */
interface AppState {
  mainTab: MainTab;
  setMainTab: (tab: MainTab) => void;

  agentMode: AgentMode;
  setAgentMode: (mode: AgentMode) => void;

  /* 3-step wizard: 1=Zendesk, 2=Import, 3=Configure+GoLive */
  setupStep: number;
  setSetupStep: (step: number) => void;
  setupComplete: boolean;
  setSetupComplete: (v: boolean) => void;
  stepStatuses: Record<number, StepStatus>;
  setStepStatus: (step: number, status: StepStatus) => void;

  /* Zendesk state machine */
  zendesk: ZendeskState;
  setZendesk: (updates: Partial<ZendeskState>) => void;
  zendeskConnected: boolean;

  /* Channel config */
  channels: ChannelConfig;
  setChannels: (updates: Partial<ChannelConfig>) => void;

  /* Handoff config */
  handoff: HandoffConfig;
  setHandoff: (updates: Partial<HandoffConfig>) => void;

  /* SOP */
  sopUploaded: boolean;
  setSopUploaded: (v: boolean) => void;
  extractedRuleNames: string[];
  setExtractedRuleNames: (names: string[]) => void;

  /* Rep config */
  repHired: boolean;
  setRepHired: (v: boolean) => void;
  hiredRepName: string;
  setHiredRepName: (name: string) => void;
  repPersonality: "Friendly" | "Professional" | "Casual" | "Customize";
  setRepPersonality: (p: "Friendly" | "Professional" | "Casual" | "Customize") => void;
  repCustomTone: string;
  setRepCustomTone: (t: string) => void;
  repPermissions: ActionPermission[];
  setRepPermissions: (perms: ActionPermission[]) => void;
  goLiveMode: GoLiveMode;
  setGoLiveMode: (m: GoLiveMode) => void;

  /* Settings/Setup unified view */
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
  settingsSection: string | null;
  setSettingsSection: (s: string | null) => void;

  /* Agent selection (Normal mode) */
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;

  /* Data collections */
  agentsData: Agent[];
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  rulesData: Rule[];
  updateRule: (id: string, updates: Partial<Rule>) => void;
  toggleRule: (id: string) => void;
  topicsData: Topic[];
  updateTopic: (id: string, updates: Partial<Topic>) => void;
  docsData: Document[];
  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
  toggleDocInUse: (id: string) => void;

  /* Helpers */
  incompleteItems: string[];
}

const AppContext = createContext<AppState | null>(null);

/* ── Default Zendesk state ── */
const defaultZendesk: ZendeskState = {
  subdomain: "",
  authStatus: "idle",
  authError: "",
  seatStatus: "idle",
  seatError: "",
  selectedSeat: "",
  availableSeats: [],
  triggerStatus: "idle",
  triggerError: "",
};

const defaultChannels: ChannelConfig = { email: true, liveChat: false, sms: false };

const defaultHandoff: HandoffConfig = {
  method: "group",
  selectedGroup: "",
  availableGroups: ["Tier 2 Support", "Escalations", "VIP Team", "Billing", "Returns"],
  selectedHandoffSeat: "",
  availableHandoffSeats: [
    { id: "hs-1", name: "Sarah Chen", email: "sarah@company.com" },
    { id: "hs-2", name: "Mike Johnson", email: "mike@company.com" },
    { id: "hs-3", name: "Emily Davis", email: "emily@company.com" },
    { id: "hs-4", name: "James Wilson", email: "james@company.com" },
  ],
  handoffEmail: "",
  emailCc: "",
  emailTemplate: "default",
  handoffTag: "",
  autoSetPriority: false,
  priority: "normal",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [mainTab, setMainTab] = useState<MainTab>("agents");
  const [agentMode, setAgentMode] = useState<AgentMode>("setup");

  /* 3 steps: 1=Zendesk, 2=Import Policies, 3=Configure Agent + Go Live */
  const [setupStep, setSetupStep] = useState(1);
  const [setupComplete, setSetupComplete] = useState(false);
  const [stepStatuses, setStepStatuses] = useState<Record<number, StepStatus>>({
    1: "pending", 2: "pending", 3: "pending",
  });

  const [selectedAgentId, setSelectedAgentId] = useState("team-lead");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsSection, setSettingsSection] = useState<string | null>(null);

  /* Zendesk */
  const [zendesk, setZendeskRaw] = useState<ZendeskState>(defaultZendesk);
  const setZendesk = useCallback((updates: Partial<ZendeskState>) => {
    setZendeskRaw((prev) => ({ ...prev, ...updates }));
  }, []);
  const zendeskConnected = zendesk.authStatus === "success" && zendesk.seatStatus === "verified" && zendesk.triggerStatus === "verified";

  /* Channels */
  const [channels, setChannelsRaw] = useState<ChannelConfig>(defaultChannels);
  const setChannels = useCallback((updates: Partial<ChannelConfig>) => {
    setChannelsRaw((prev) => ({ ...prev, ...updates }));
  }, []);

  /* Handoff */
  const [handoff, setHandoffRaw] = useState<HandoffConfig>(defaultHandoff);
  const setHandoff = useCallback((updates: Partial<HandoffConfig>) => {
    setHandoffRaw((prev) => ({ ...prev, ...updates }));
  }, []);

  /* SOP */
  const [sopUploaded, setSopUploaded] = useState(false);
  const [extractedRuleNames, setExtractedRuleNames] = useState<string[]>([]);

  /* Rep config */
  const [repHired, setRepHired] = useState(false);
  const [hiredRepName, setHiredRepName] = useState("Ava");
  const [repPersonality, setRepPersonality] = useState<"Friendly" | "Professional" | "Casual" | "Customize">("Friendly");
  const [repCustomTone, setRepCustomTone] = useState("");
  const [repPermissions, setRepPermissions] = useState<ActionPermission[]>([
    ...defaultReadActions, ...defaultWriteActions,
  ]);
  const [goLiveMode, setGoLiveMode] = useState<GoLiveMode>("training");

  /* Data */
  const [agentsData, setAgentsData] = useState<Agent[]>(defaultAgents);
  const [rulesData, setRulesData] = useState<Rule[]>(defaultRules);
  const [topicsData, setTopicsData] = useState<Topic[]>(defaultTopics);
  const [docsData, setDocsData] = useState<Document[]>(defaultDocs);

  const setStepStatus = useCallback((step: number, status: StepStatus) => {
    setStepStatuses((prev) => ({ ...prev, [step]: status }));
  }, []);

  const updateAgent = useCallback((id: string, updates: Partial<Agent>) => {
    setAgentsData((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  }, []);
  const updateRule = useCallback((id: string, updates: Partial<Rule>) => {
    setRulesData((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);
  const toggleRule = useCallback((id: string) => {
    setRulesData((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }, []);
  const updateTopic = useCallback((id: string, updates: Partial<Topic>) => {
    setTopicsData((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);
  const addDocument = useCallback((doc: Document) => {
    setDocsData((prev) => [...prev, doc]);
  }, []);
  const removeDocument = useCallback((id: string) => {
    setDocsData((prev) => prev.filter((d) => d.id !== id));
  }, []);
  const toggleDocInUse = useCallback((id: string) => {
    setDocsData((prev) => prev.map((d) => (d.id === id ? { ...d, inUse: !d.inUse } : d)));
  }, []);

  /* Incomplete items for banner */
  const incompleteItems: string[] = [];
  if (!zendeskConnected && stepStatuses[1] === "skipped") incompleteItems.push("zendesk");
  if (!sopUploaded && stepStatuses[2] === "skipped") incompleteItems.push("policies");

  return (
    <AppContext.Provider
      value={{
        mainTab, setMainTab,
        agentMode, setAgentMode,
        setupStep, setSetupStep,
        setupComplete, setSetupComplete,
        stepStatuses, setStepStatus,
        zendesk, setZendesk, zendeskConnected,
        channels, setChannels,
        handoff, setHandoff,
        sopUploaded, setSopUploaded,
        extractedRuleNames, setExtractedRuleNames,
        repHired, setRepHired,
        hiredRepName, setHiredRepName,
        repPersonality, setRepPersonality,
        repCustomTone, setRepCustomTone,
        repPermissions, setRepPermissions,
        goLiveMode, setGoLiveMode,
        showSettings, setShowSettings,
        settingsSection, setSettingsSection,
        selectedAgentId, setSelectedAgentId,
        agentsData, updateAgent,
        rulesData, updateRule, toggleRule,
        topicsData, updateTopic,
        docsData, addDocument, removeDocument, toggleDocInUse,
        incompleteItems,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

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

type MainTab = "agents" | "playbook" | "performance";
type AgentMode = "setup" | "normal";
type StepStatus = "pending" | "complete" | "skipped";
type GoLiveMode = "training" | "production";

interface AppState {
  // Navigation
  mainTab: MainTab;
  setMainTab: (tab: MainTab) => void;

  // Agent mode (setup = wizard, normal = operational)
  agentMode: AgentMode;
  setAgentMode: (mode: AgentMode) => void;

  // Setup Wizard
  setupStep: number;
  setSetupStep: (step: number) => void;
  setupComplete: boolean;
  setSetupComplete: (v: boolean) => void;
  stepStatuses: Record<number, StepStatus>;
  setStepStatus: (step: number, status: StepStatus) => void;

  // Integration states
  shopifyConnected: boolean;
  setShopifyConnected: (v: boolean) => void;
  zendeskConnected: boolean;
  setZendeskConnected: (v: boolean) => void;

  // SOP
  sopUploaded: boolean;
  setSopUploaded: (v: boolean) => void;

  // Rep config
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

  // Settings page visibility
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;

  // Agent selection (Normal mode)
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;

  // Agents data
  agentsData: Agent[];
  updateAgent: (id: string, updates: Partial<Agent>) => void;

  // Rules data
  rulesData: Rule[];
  updateRule: (id: string, updates: Partial<Rule>) => void;
  toggleRule: (id: string) => void;

  // Topics data
  topicsData: Topic[];
  updateTopic: (id: string, updates: Partial<Topic>) => void;

  // Documents data
  docsData: Document[];
  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
  toggleDocInUse: (id: string) => void;

  // Helper: check if there are skipped/incomplete items
  incompleteItems: string[];
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mainTab, setMainTab] = useState<MainTab>("agents");
  const [agentMode, setAgentMode] = useState<AgentMode>("setup");
  const [setupStep, setSetupStep] = useState(1);
  const [setupComplete, setSetupComplete] = useState(false);
  const [stepStatuses, setStepStatuses] = useState<Record<number, StepStatus>>({
    1: "pending",
    2: "pending",
    3: "pending",
    4: "pending",
    5: "pending",
  });
  const [selectedAgentId, setSelectedAgentId] = useState("team-lead");
  const [showSettings, setShowSettings] = useState(false);

  // Integration states
  const [shopifyConnected, setShopifyConnected] = useState(true); // default connected for demo
  const [zendeskConnected, setZendeskConnected] = useState(false);
  const [sopUploaded, setSopUploaded] = useState(false);

  // Rep config
  const [repHired, setRepHired] = useState(false);
  const [hiredRepName, setHiredRepName] = useState("Ava");
  const [repPersonality, setRepPersonality] = useState<"Friendly" | "Professional" | "Casual" | "Customize">("Friendly");
  const [repCustomTone, setRepCustomTone] = useState("");
  const [repPermissions, setRepPermissions] = useState<ActionPermission[]>([
    ...defaultReadActions,
    ...defaultWriteActions,
  ]);
  const [goLiveMode, setGoLiveMode] = useState<GoLiveMode>("training");

  // Mutable data
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

  // Compute incomplete items for persistent banner
  const incompleteItems: string[] = [];
  if (!shopifyConnected && stepStatuses[1] === "skipped") incompleteItems.push("shopify");
  if (!zendeskConnected && stepStatuses[2] === "skipped") incompleteItems.push("zendesk");
  if (!sopUploaded && stepStatuses[3] === "skipped") incompleteItems.push("sop");

  return (
    <AppContext.Provider
      value={{
        mainTab, setMainTab,
        agentMode, setAgentMode,
        setupStep, setSetupStep,
        setupComplete, setSetupComplete,
        stepStatuses, setStepStatus,
        shopifyConnected, setShopifyConnected,
        zendeskConnected, setZendeskConnected,
        sopUploaded, setSopUploaded,
        repHired, setRepHired,
        hiredRepName, setHiredRepName,
        repPersonality, setRepPersonality,
        repCustomTone, setRepCustomTone,
        repPermissions, setRepPermissions,
        goLiveMode, setGoLiveMode,
        showSettings, setShowSettings,
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

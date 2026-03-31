import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { agents as defaultAgents, rules as defaultRules, topics as defaultTopics, documents as defaultDocs, type Agent, type Rule, type Topic, type Document } from "@/lib/data";

type MainTab = "agents" | "playbook" | "performance";
type AgentMode = "onboarding" | "normal";
/** Which area the onboarding chat is showing: team-lead or rep */
type OnboardingArea = "team-lead" | "rep";

interface AppState {
  // Navigation
  mainTab: MainTab;
  setMainTab: (tab: MainTab) => void;

  // Agent mode
  agentMode: AgentMode;
  setAgentMode: (mode: AgentMode) => void;

  // Onboarding
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  advanceOnboarding: () => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;
  onboardingArea: OnboardingArea;
  setOnboardingArea: (area: OnboardingArea) => void;

  // Hired rep name (set during onboarding hire flow)
  hiredRepName: string;
  setHiredRepName: (name: string) => void;

  // Agent selection
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;

  // Agents data (mutable for profile editing)
  agentsData: Agent[];
  updateAgent: (id: string, updates: Partial<Agent>) => void;

  // Rules data (mutable for editing)
  rulesData: Rule[];
  updateRule: (id: string, updates: Partial<Rule>) => void;
  toggleRule: (id: string) => void;

  // Topics data (mutable for accept/reject)
  topicsData: Topic[];
  updateTopic: (id: string, updates: Partial<Topic>) => void;

  // Documents data
  docsData: Document[];
  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
  toggleDocInUse: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mainTab, setMainTab] = useState<MainTab>("agents");
  const [agentMode, setAgentMode] = useState<AgentMode>("onboarding");
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedAgentId, setSelectedAgentId] = useState("team-lead");
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [onboardingArea, setOnboardingArea] = useState<OnboardingArea>("team-lead");
  const [hiredRepName, setHiredRepName] = useState("Ava");

  // Mutable data
  const [agentsData, setAgentsData] = useState<Agent[]>(defaultAgents);
  const [rulesData, setRulesData] = useState<Rule[]>(defaultRules);
  const [topicsData, setTopicsData] = useState<Topic[]>(defaultTopics);
  const [docsData, setDocsData] = useState<Document[]>(defaultDocs);

  const advanceOnboarding = useCallback(() => {
    setOnboardingStep((s) => s + 1);
  }, []);

  const updateAgent = useCallback((id: string, updates: Partial<Agent>) => {
    setAgentsData((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const updateRule = useCallback((id: string, updates: Partial<Rule>) => {
    setRulesData((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }, []);

  const toggleRule = useCallback((id: string) => {
    setRulesData((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }, []);

  const updateTopic = useCallback((id: string, updates: Partial<Topic>) => {
    setTopicsData((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const addDocument = useCallback((doc: Document) => {
    setDocsData((prev) => [...prev, doc]);
  }, []);

  const removeDocument = useCallback((id: string) => {
    setDocsData((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const toggleDocInUse = useCallback((id: string) => {
    setDocsData((prev) =>
      prev.map((d) => (d.id === id ? { ...d, inUse: !d.inUse } : d))
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        mainTab,
        setMainTab,
        agentMode,
        setAgentMode,
        onboardingStep,
        setOnboardingStep,
        advanceOnboarding,
        selectedAgentId,
        setSelectedAgentId,
        onboardingComplete,
        setOnboardingComplete,
        onboardingArea,
        setOnboardingArea,
        hiredRepName,
        setHiredRepName,
        agentsData,
        updateAgent,
        rulesData,
        updateRule,
        toggleRule,
        topicsData,
        updateTopic,
        docsData,
        addDocument,
        removeDocument,
        toggleDocInUse,
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

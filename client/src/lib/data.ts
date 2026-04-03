// ============================================================
// DEMO DATA — Seel AI Support Agent MVP
// ============================================================

// --- AGENT TYPES ---
export interface ActionPermission {
  id: string;
  name: string;
  label: string;
  description: string;
  system: string;
  domain: string;
  type: "read" | "write";
  enabled: boolean;
  locked: boolean;
  guardrail?: string;
}

export interface ConfigEntry {
  hash: string;
  timestamp: string;
  author: string;
  summary: string;
  diff: string;
}

export interface Agent {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  mode: "Training" | "Production" | "Off" | "Not Ready" | "N/A";
  isTeamLead: boolean;
  personality: "Friendly" | "Professional" | "Casual" | "Customize";
  customTone?: string;
  language: string;
  status: string;
  startDate: string;
  tickets: { total: number; today: number };
  resolution: number | null;
  csat: number | null;
  avgResponse: string;
  escalation: number | null;
  actionPermissions: ActionPermission[];
  configHistory: ConfigEntry[];
}

// --- TICKET / THREAD ---
export interface PlanStep {
  action: string;
  label: string;
  tool: string;
  duration: number;
  type: string;
  executionStatus: string;
}

export interface ThreadMessage {
  from: string;
  type: string;
  author: string;
  text: string;
  time: string;
  channel: string;
}

export interface Ticket {
  id: string;
  customer: string;
  email: string;
  vip: boolean;
  subject: string;
  category: string;
  status: string;
  priority: string;
  channel: string;
  agentId: string;
  time: string;
  escalationReason?: string;
  orderData: {
    id: string;
    items: string[];
    total: string;
    status: string;
    carrier?: string;
    tracking?: string;
    estimatedDelivery?: string;
  };
  plan: PlanStep[];
  thread: ThreadMessage[];
}

// --- ESCALATION FEED ---
export interface EscalationCard {
  id: string;
  ticketId: string;
  subject: string;
  summary: string;
  reason: string;
  customer: string;
  email: string;
  intent: string;
  sentiment: "frustrated" | "neutral" | "urgent";
  outcome: "Escalated" | "Resolved";
  mode: "Production" | "Training";
  priority: "High" | "Medium" | "Low";
  orderValue: string;
  turns: number;
  time: string;
  createdAt: string;
  startedAt: string;
  status: "needs_attention" | "resolved";
  thread: { role: "customer" | "rep"; content: string }[];
}

// --- RULE ---
export interface Rule {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  content: string;
  source: string;
  lastUpdated: string;
  stats: { used: number; avgCsat: number; deflection: number };
  versionHistory: { version: number; timestamp: string; source: string; diff: string }[];
}

// --- DOCUMENT ---
export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  status: "Processed" | "Processing" | "Error";
  inUse: boolean;
  extractedRules: string;
}

// --- PERFORMANCE ---
export interface PerformanceDaily {
  date: string;
  tickets: number;
  resolved: number;
  escalated: number;
  csat: number;
  firstResponseTime: number;
  fullResolutionTime: number;
}

export interface IntentRow {
  intent: string;
  volume: number;
  resolutionRate: number;
  csat: number;
}

// --- CONVERSATION LOG ---
export interface ReasoningTurn {
  turn: number;
  customerInput: string;
  contextEnrichment: string[];
  ruleRouting: { intent: string; confidence: number; matchedRules: string[] };
  knowledgeRetrieval: { query: string; results: number; topSimilarity?: number };
  actionsExecuted: { name: string; params?: string; status: string; result: string }[];
  guardrailCheck: string;
  repOutput: string;
}

export interface ConversationLog {
  ticketId: string;
  customer: string;
  email: string;
  intent: string;
  sentiment: string;
  outcome: "Resolved" | "Escalated" | "Handling";
  mode: "Production" | "Training";
  turns: number;
  duration: string;
  summary: string;
  time: string;
  startedAt: string;
  escalationReason?: string;
  handoffNotes?: string;
  suggestedReply?: string;
  thread: ThreadMessage[];
  reasoning: ReasoningTurn[];
}

// --- TOPIC ---
export interface Topic {
  id: string;
  type: "proposal" | "question" | "document-parse";
  badge: string;

  title: string;
  summary: string;
  ruleContent?: string;
  currentRuleContent?: string;
  newRuleContent?: string;
  sourceTickets: string[];
  status: "pending" | "accepted" | "rejected" | "revised";
}

// --- ONBOARDING ---
export interface OnboardingStep {
  id: number;
  type: "message" | "action" | "choice" | "upload" | "hire" | "scenario" | "mode-select";
  sender?: string;
  text?: string;
  actions?: { label: string; nextStep: number; variant?: string }[];
  options?: { label: string; value: string; nextStep: number }[];
}

// ============================================================
// DEFAULT ACTION PERMISSIONS
// ============================================================
export const defaultReadActions: ActionPermission[] = [
  { id: "lookup_order", name: "lookup_order", label: "Look up order details", description: "Retrieve order status, items, and shipping info from Shopify", system: "Shopify", domain: "Orders", type: "read", enabled: true, locked: false },
  { id: "track_shipment", name: "track_shipment", label: "Track shipment", description: "Get real-time tracking and carrier info for shipped orders", system: "Shopify", domain: "Orders", type: "read", enabled: true, locked: false },
  { id: "lookup_customer", name: "lookup_customer", label: "Look up customer info", description: "Retrieve customer profile, order history, and contact details", system: "Shopify / Zendesk", domain: "Customers", type: "read", enabled: true, locked: false },
  { id: "lookup_product", name: "lookup_product", label: "Look up product info", description: "Search product catalog for availability, pricing, and variants", system: "Shopify", domain: "Products", type: "read", enabled: true, locked: false },
  { id: "lookup_seel", name: "lookup_seel", label: "Look up Seel protection status", description: "Check if order has active Seel shipping protection", system: "Seel", domain: "Insurance", type: "read", enabled: true, locked: false },
  { id: "read_ticket_history", name: "read_ticket_history", label: "Read ticket history", description: "Access past tickets and interactions for the customer", system: "Zendesk", domain: "Tickets", type: "read", enabled: true, locked: false },
  { id: "lookup_return_status", name: "lookup_return_status", label: "Look up return status", description: "Check status of existing return or exchange requests", system: "Shopify", domain: "Returns", type: "read", enabled: true, locked: false },
];

export const defaultWriteActions: ActionPermission[] = [
  { id: "reply_customer", name: "reply_customer", label: "Reply to customer", description: "Send responses directly to customer tickets", system: "Zendesk", domain: "Tickets", type: "write", enabled: true, locked: true },
  { id: "escalate_ticket", name: "escalate_ticket", label: "Escalate to human", description: "Transfer ticket to human agent when AI cannot resolve", system: "Zendesk", domain: "Tickets", type: "write", enabled: true, locked: true },
  { id: "cancel_order", name: "cancel_order", label: "Cancel order", description: "Cancel unfulfilled orders in Shopify", system: "Shopify", domain: "Orders", type: "write", enabled: false, locked: false, guardrail: "Within 2 hours of order placement" },
  { id: "edit_address", name: "edit_address", label: "Edit shipping address", description: "Modify shipping address on unfulfilled orders", system: "Shopify", domain: "Orders", type: "write", enabled: false, locked: false, guardrail: "Before dispatch only" },
  { id: "file_seel_claim", name: "file_seel_claim", label: "File insurance claim", description: "Submit shipping protection claims through Seel", system: "Seel", domain: "Insurance", type: "write", enabled: false, locked: false, guardrail: "Active protection plan required" },
  { id: "initiate_return", name: "initiate_return", label: "Initiate return", description: "Create return/exchange requests in Shopify", system: "Shopify", domain: "Returns", type: "write", enabled: false, locked: false, guardrail: "Within return window only" },
  { id: "issue_refund", name: "issue_refund", label: "Issue refund", description: "Process refunds for eligible orders", system: "Shopify", domain: "Orders", type: "write", enabled: false, locked: false, guardrail: "Manager approval required for > $100" },
  { id: "add_internal_note", name: "add_internal_note", label: "Add internal note", description: "Add internal notes to Zendesk tickets", system: "Zendesk", domain: "Tickets", type: "write", enabled: true, locked: false },
];

// ============================================================
// AGENTS
// ============================================================
export const agents: Agent[] = [
  {
    id: "team-lead",
    name: "Alex",
    initials: "TL",
    color: "linear-gradient(135deg, #059669, #10b981)",
    role: "Team Lead",
    mode: "N/A",
    isTeamLead: true,
    personality: "Professional",
    language: "English",
    status: "online",
    startDate: "Always available",
    tickets: { total: 0, today: 0 },
    resolution: null,
    csat: null,
    avgResponse: "instant",
    escalation: null,
    actionPermissions: [],
    configHistory: [],
  },
  {
    id: "agent-alpha",
    name: "Ava",
    initials: "A",
    color: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    role: "AI Support Rep",
    mode: "Training",
    isTeamLead: false,
    personality: "Friendly",
    language: "Auto-detect (match customer's language)",
    status: "online",
    startDate: "Mar 10, 2026",
    tickets: { total: 1247, today: 43 },
    resolution: 89,
    csat: 4.6,
    avgResponse: "5.8s",
    escalation: 11,
    actionPermissions: [
      ...defaultReadActions,
      ...defaultWriteActions.map(a => a.id === "cancel_order" ? { ...a, enabled: true } : a),
    ],
    configHistory: [
      { hash: "c4a1e7b", timestamp: "Mar 12, 2026, 11:20 AM", author: "Sarah Chen", summary: "Promoted to Production", diff: "mode: Training → Production" },
      { hash: "7f2b9d3", timestamp: "Mar 11, 2026, 03:45 PM", author: "Sarah Chen", summary: "Enabled cancel_order action", diff: "cancel_order: Disabled → Autonomous" },
      { hash: "a98d1c0", timestamp: "Mar 10, 2026, 02:30 PM", author: "Sarah Chen", summary: "Switched personality to Friendly", diff: "personality: Professional → Friendly" },
      { hash: "e3f0b82", timestamp: "Mar 10, 2026, 02:10 PM", author: "System", summary: "Agent onboarded — initial config", diff: "mode: Onboarding → Training" },
    ],
  },
];

// ============================================================
// RULES
// ============================================================
export const rules: Rule[] = [
  {
    id: "r1",
    name: "WISMO — Order Tracking",
    enabled: true,
    description: "When a customer asks about order status, look up the order in Shopify and provide tracking information.",
    content: "When a customer asks about order status or shipping:\n1. Look up the order in Shopify using order ID or customer email\n2. Retrieve tracking information from the carrier API\n3. Reply with: order status, tracking number, carrier name, estimated delivery date\n4. If the package is delayed beyond the estimated date, apologize and offer to escalate\n5. If no tracking info is available, explain the order is being processed and provide expected ship date",
    source: "Document",
    lastUpdated: "Mar 24, 2026",
    stats: { used: 487, avgCsat: 4.8, deflection: 97 },
    versionHistory: [
      { version: 2, timestamp: "Mar 24, 2026", source: "Document", diff: "Added carrier API lookup step" },
      { version: 1, timestamp: "Mar 20, 2026", source: "Document", diff: "Initial extraction from SOP" },
    ],
  },
  {
    id: "r2",
    name: "Refund — Standard Process",
    enabled: true,
    description: "Handle refund requests for delivered items within the return window.",
    content: "When a customer requests a refund:\n1. Verify the order is within the 30-day return window\n2. Check if the item has been returned or is a damaged item (no return required)\n3. If refund amount ≤ agent refund cap, process the refund\n4. If refund amount > cap, escalate to L2 with full context\n5. For VIP customers, skip store credit offer and process direct refund\n6. Confirm refund method and timeline (5-7 business days)",
    source: "Document",
    lastUpdated: "Mar 24, 2026",
    stats: { used: 312, avgCsat: 4.5, deflection: 88 },
    versionHistory: [
      { version: 1, timestamp: "Mar 20, 2026", source: "Document", diff: "Initial extraction from SOP" },
    ],
  },
  {
    id: "r3",
    name: "Cancellation — Unfulfilled Orders",
    enabled: true,
    description: "Cancel orders that have not yet been fulfilled and issue full refund.",
    content: "When a customer requests order cancellation:\n1. Look up the order in Shopify\n2. Verify the order status is 'Unfulfilled' or 'Processing'\n3. If unfulfilled: cancel the order and issue a full refund to original payment method\n4. If already shipped: inform customer the order cannot be cancelled and offer return instructions\n5. Confirm cancellation and refund details to customer",
    source: "Document",
    lastUpdated: "Mar 24, 2026",
    stats: { used: 198, avgCsat: 4.6, deflection: 92 },
    versionHistory: [
      { version: 1, timestamp: "Mar 20, 2026", source: "Document", diff: "Initial extraction from SOP" },
    ],
  },
  {
    id: "r4",
    name: "Address Change — Pre-Dispatch",
    enabled: true,
    description: "Update shipping address for orders not yet dispatched.",
    content: "When a customer requests an address change:\n1. Look up the order in Shopify\n2. Verify the order has not been dispatched\n3. If pre-dispatch: update the shipping address in Shopify\n4. If already dispatched: inform customer the address cannot be changed and suggest contacting the carrier\n5. Confirm the updated address to the customer",
    source: "Document",
    lastUpdated: "Mar 24, 2026",
    stats: { used: 145, avgCsat: 4.7, deflection: 95 },
    versionHistory: [
      { version: 1, timestamp: "Mar 20, 2026", source: "Document", diff: "Initial extraction from SOP" },
    ],
  },
  {
    id: "r5",
    name: "VIP Customer Handling",
    enabled: true,
    description: "Special handling rules for VIP customers including priority routing and direct refunds.",
    content: "For customers tagged as VIP (or 5+ orders, or LTV > $500):\n1. Always prioritize their tickets\n2. Skip store credit offer — process direct refund\n3. Use empathetic, personalized tone\n4. If complaint: escalate immediately to L2\n5. Proactively offer compensation (discount code) for any inconvenience",
    source: "Manager edit",
    lastUpdated: "Mar 25, 2026",
    stats: { used: 89, avgCsat: 4.9, deflection: 85 },
    versionHistory: [
      { version: 2, timestamp: "Mar 25, 2026", source: "Manager edit", diff: "Added compensation step" },
      { version: 1, timestamp: "Mar 20, 2026", source: "Document", diff: "Initial extraction from SOP" },
    ],
  },
  {
    id: "r6",
    name: "Escalation — Sentiment Trigger",
    enabled: true,
    description: "Escalate when customer sentiment is frustrated or angry.",
    content: "Escalate to human agent when:\n1. Customer sentiment is detected as 'angry' or 'threatening'\n2. Customer explicitly requests a human agent\n3. Customer mentions legal action, lawyer, or trading standards\n4. 3 consecutive turns without resolution\n5. When escalating: leave Internal Note with handoff summary, sentiment analysis, and suggested reply",
    source: "Document",
    lastUpdated: "Mar 24, 2026",
    stats: { used: 67, avgCsat: 4.2, deflection: 0 },
    versionHistory: [
      { version: 1, timestamp: "Mar 20, 2026", source: "Document", diff: "Initial extraction from SOP" },
    ],
  },
  {
    id: "r7",
    name: "Seel Protection — Claim Filing",
    enabled: false,
    description: "Handle Seel protection plan claims for damaged or lost items.",
    content: "When a customer has a Seel protection plan and reports damage or loss:\n1. Verify the Seel protection status via Seel API\n2. If covered: file an insurance claim through Seel\n3. Inform customer of the claim process and expected timeline\n4. If not covered: explain the protection plan terms and offer alternative solutions",
    source: "Team Lead",
    lastUpdated: "Mar 26, 2026",
    stats: { used: 23, avgCsat: 4.4, deflection: 78 },
    versionHistory: [
      { version: 1, timestamp: "Mar 26, 2026", source: "Team Lead", diff: "Created from Team Lead proposal" },
    ],
  },
];

// ============================================================
// DOCUMENTS
// ============================================================
export const documents: Document[] = [
  { id: "doc-1", name: "CS_Playbook_2025.pdf", type: "PDF", size: "2.4 MB", uploadedAt: "Mar 24, 2026", status: "Processed", inUse: true, extractedRules: "18 prompt rules, 8 guardrails, 6 actions" },
  { id: "doc-2", name: "Refund_Policy_v3.docx", type: "DOC", size: "890 KB", uploadedAt: "Mar 24, 2026", status: "Processed", inUse: true, extractedRules: "4 guardrails, 3 actions" },
  { id: "doc-3", name: "Escalation_Matrix.pdf", type: "PDF", size: "1.1 MB", uploadedAt: "Mar 24, 2026", status: "Processed", inUse: true, extractedRules: "8 escalation triggers" },
  { id: "doc-4", name: "FAQ_International_Shipping.txt", type: "TXT", size: "45 KB", uploadedAt: "Mar 26, 2026", status: "Processed", inUse: true, extractedRules: "3 knowledge entries" },
  { id: "doc-5", name: "Holiday_Returns_Update.pdf", type: "PDF", size: "320 KB", uploadedAt: "Mar 27, 2026", status: "Processing", inUse: false, extractedRules: "" },
];

// ============================================================
// TICKETS
// ============================================================
export const tickets: Ticket[] = [
  {
    id: "TK-4891",
    customer: "Emma Thompson",
    email: "emma.t@gmail.com",
    vip: true,
    subject: "Where is my order?",
    category: "WISMO",
    status: "solved",
    priority: "normal",
    channel: "email",
    agentId: "agent-alpha",
    time: "2 min ago",
    orderData: { id: "#DBH-29174", items: ["Cashmere Blend Scarf — Navy (x1)", "Leather Gloves — Size M (x1)"], total: "$127.00", status: "Shipped", carrier: "USPS Priority", tracking: "9400111899223456789012", estimatedDelivery: "March 26, 2026" },
    plan: [
      { action: "lookup_order", label: "Look up order #DBH-29174 on Shopify", tool: "Shopify API", duration: 1200, type: "read", executionStatus: "executed" },
      { action: "get_tracking", label: "Retrieve tracking details from USPS", tool: "Shipping API", duration: 800, type: "read", executionStatus: "executed" },
      { action: "reply_customer", label: "Compose and send reply with tracking info", tool: "Zendesk API", duration: 600, type: "write", executionStatus: "executed" },
    ],
    thread: [
      { from: "system", type: "system-event", author: "System", text: "Ticket assigned to Ava", time: "Today 9:41 AM", channel: "internal" },
      { from: "customer", type: "public", author: "Emma Thompson", text: "Hi, I placed order #DBH-29174 three days ago and still haven't received any shipping confirmation. Can you check the status please?", time: "Today 9:41 AM", channel: "email" },
      { from: "agent", type: "public", author: "Ava", text: "Hello Emma! Thanks for reaching out. I've checked your order #DBH-29174 and great news — it was shipped yesterday via USPS Priority.\n\nHere are your tracking details:\n- Tracking Number: 9400111899223456789012\n- Carrier: USPS Priority\n- Estimated Delivery: March 26, 2026\n\nYou can track your parcel at usps.com. If it hasn't arrived by the 27th, please don't hesitate to get back to us and we'll sort it out right away.\n\nBest wishes,\nAva — Support Team", time: "Today 9:42 AM", channel: "email" },
    ],
  },
  {
    id: "TK-4892",
    customer: "James Wright",
    email: "j.wright@outlook.com",
    vip: false,
    subject: "I want to cancel my order",
    category: "Cancellation",
    status: "solved",
    priority: "normal",
    channel: "email",
    agentId: "agent-alpha",
    time: "5 min ago",
    orderData: { id: "#DBH-29201", items: ["Men's Quilted Jacket — Black (x1)"], total: "$89.00", status: "Unfulfilled" },
    plan: [
      { action: "lookup_order", label: "Look up order #DBH-29201 on Shopify", tool: "Shopify API", duration: 1000, type: "read", executionStatus: "executed" },
      { action: "check_fulfillment", label: "Verify order is unfulfilled (cancellable)", tool: "Guardrails", duration: 600, type: "read", executionStatus: "executed" },
      { action: "cancel_order", label: "Cancel order #DBH-29201", tool: "Shopify API", duration: 1400, type: "write", executionStatus: "executed" },
      { action: "initiate_refund", label: "Initiate refund of $89.00 to Visa ending 4242", tool: "Stripe API", duration: 1000, type: "write", executionStatus: "executed" },
      { action: "reply_customer", label: "Confirm cancellation and refund to customer", tool: "Zendesk API", duration: 600, type: "write", executionStatus: "executed" },
    ],
    thread: [
      { from: "system", type: "system-event", author: "System", text: "Ticket assigned to Ava", time: "Today 9:35 AM", channel: "internal" },
      { from: "customer", type: "public", author: "James Wright", text: "Please cancel order #DBH-29201. I found the same jacket cheaper elsewhere. I want a full refund.", time: "Today 9:35 AM", channel: "email" },
      { from: "agent", type: "internal-note", author: "Ava", text: "Order #DBH-29201 is still unfulfilled. Cancellation is straightforward per SOP. Processing cancellation and full refund of $89.00 to Visa ending 4242.", time: "Today 9:36 AM", channel: "internal" },
      { from: "agent", type: "public", author: "Ava", text: "Hi James,\n\nI've processed your request right away. Here's what's been done:\n\n✓ Order #DBH-29201 has been cancelled\n✓ A full refund of $89.00 has been initiated to your Visa ending in 4242\n\nPlease allow 5-7 business days for the refund to appear in your account.\n\nKind regards,\nAva — Support Team", time: "Today 9:37 AM", channel: "email" },
    ],
  },
  {
    id: "TK-4893",
    customer: "Priya Patel",
    email: "priya.p@yahoo.com",
    vip: true,
    subject: "Wrong item received",
    category: "Complaint",
    status: "open",
    priority: "high",
    channel: "email",
    agentId: "agent-alpha",
    time: "8 min ago",
    escalationReason: "Customer sentiment: frustrated + item mismatch requires warehouse verification",
    orderData: { id: "#DBH-28990", items: ["Floral Midi Dress — Red (x1)"], total: "$65.00", status: "Delivered" },
    plan: [
      { action: "lookup_order", label: "Look up order #DBH-28990", tool: "Shopify API", duration: 1000, type: "read", executionStatus: "executed" },
      { action: "analyze_sentiment", label: "Detect customer sentiment: FRUSTRATED", tool: "Guardrails", duration: 400, type: "read", executionStatus: "executed" },
      { action: "escalate", label: "Escalate to human agent — sentiment + item mismatch", tool: "Zendesk API", duration: 800, type: "write", executionStatus: "executed" },
    ],
    thread: [
      { from: "system", type: "system-event", author: "System", text: "Ticket assigned to Ava", time: "Today 8:50 AM", channel: "internal" },
      { from: "customer", type: "public", author: "Priya Patel", text: "I ordered a red dress (order #DBH-28990) but received a blue one instead. This is really frustrating as I needed it for an event this weekend!", time: "Today 8:50 AM", channel: "email" },
      { from: "agent", type: "public", author: "Ava", text: "Dear Priya,\n\nI'm truly sorry about this mix-up — I completely understand how frustrating this must be. I've flagged this as urgent and I'm escalating to our senior support team right now.\n\nThank you for your patience.\n\nAva — Support Team", time: "Today 8:51 AM", channel: "email" },
      { from: "agent", type: "internal-note", author: "Ava", text: "Escalating to L2 — wrong item received. Customer sentiment is frustrated, VIP customer with high LTV. Requires warehouse check.\n\nSuggested reply: Offer expedited replacement + return label for wrong item.", time: "Today 8:51 AM", channel: "internal" },
      { from: "system", type: "system-event", author: "System", text: "Ava escalated ticket to L2 — Escalations team.", time: "Today 8:52 AM", channel: "internal" },
    ],
  },
  {
    id: "TK-4894",
    customer: "Oliver Bennett",
    email: "oliver.b@icloud.com",
    vip: false,
    subject: "Change delivery address",
    category: "Address Change",
    status: "solved",
    priority: "normal",
    channel: "chat",
    agentId: "agent-alpha",
    time: "12 min ago",
    orderData: { id: "#DBH-29210", items: ["Cotton T-Shirt Pack (3) — White (x1)", "Slim Fit Chinos — Navy (x1)"], total: "$74.50", status: "Unfulfilled" },
    plan: [
      { action: "lookup_order", label: "Look up order #DBH-29210", tool: "Shopify API", duration: 900, type: "read", executionStatus: "executed" },
      { action: "update_address", label: "Update shipping address to 45 Baker Street", tool: "Shopify API", duration: 1200, type: "write", executionStatus: "executed" },
      { action: "reply_customer", label: "Confirm address update to customer", tool: "Zendesk API", duration: 600, type: "write", executionStatus: "executed" },
    ],
    thread: [
      { from: "system", type: "system-event", author: "System", text: "Ticket assigned to Ava", time: "Today 9:15 AM", channel: "internal" },
      { from: "customer", type: "public", author: "Oliver Bennett", text: "Hi, I just placed order #DBH-29210 and realised I put the wrong address. Can you change it to 45 Baker Street, New York, NY 10001?", time: "Today 9:15 AM", channel: "chat" },
      { from: "agent", type: "public", author: "Ava", text: "Hi Oliver! I've updated the shipping address for order #DBH-29210 to 45 Baker Street, New York, NY 10001. You'll get a shipping confirmation when it dispatches.\n\nBest,\nAva — Support Team", time: "Today 9:16 AM", channel: "chat" },
    ],
  },
  {
    id: "TK-4895",
    customer: "Sophie Williams",
    email: "sophie.w@gmail.com",
    vip: false,
    subject: "Refund not received",
    category: "Refund",
    status: "solved",
    priority: "normal",
    channel: "email",
    agentId: "agent-alpha",
    time: "18 min ago",
    orderData: { id: "#DBH-29050", items: ["Silk Blouse — Ivory (x1)"], total: "$45.00", status: "Returned" },
    plan: [
      { action: "lookup_order", label: "Look up order #DBH-29050", tool: "Shopify API", duration: 1000, type: "read", executionStatus: "executed" },
      { action: "check_refund_status", label: "Check refund processing status", tool: "Stripe API", duration: 800, type: "read", executionStatus: "executed" },
      { action: "reply_customer", label: "Inform customer about refund timeline", tool: "Zendesk API", duration: 600, type: "write", executionStatus: "executed" },
    ],
    thread: [
      { from: "system", type: "system-event", author: "System", text: "Ticket assigned to Ava", time: "Today 9:00 AM", channel: "internal" },
      { from: "customer", type: "public", author: "Sophie Williams", text: "I returned my silk blouse a week ago and haven't received my refund yet. Order #DBH-29050.", time: "Today 9:00 AM", channel: "email" },
      { from: "agent", type: "public", author: "Ava", text: "Hi Sophie! I've checked your refund status for order #DBH-29050. The refund of $45.00 was processed on March 24 and should appear in your account within 5-7 business days.\n\nBest wishes,\nAva — Support Team", time: "Today 9:01 AM", channel: "email" },
    ],
  },
];

// ============================================================
// ESCALATION FEED
// ============================================================
export const escalationFeed: EscalationCard[] = [
  {
    id: "esc-1",
    ticketId: "#4501",
    subject: "Refund to PayPal request",
    summary: "Customer requesting refund to PayPal instead of original credit card. Current rules only cover refunds to original payment method.",
    reason: "No rule covers PayPal-specific refund routing. Escalated for human decision.",
    customer: "Mike Torres",
    email: "mike.t@email.com",
    intent: "Cross-Payment Refund",
    sentiment: "frustrated",
    outcome: "Escalated",
    mode: "Production",
    priority: "High",
    orderValue: "$129.00",
    turns: 4,
    time: "2h ago",
    createdAt: "2h ago",
    startedAt: "2026/3/29 00:10:00",
    status: "needs_attention",
    thread: [
      { role: "customer", content: "Hi, I paid with PayPal and would like my refund back to PayPal, not my credit card." },
      { role: "rep", content: "I understand you'd like the refund to your PayPal account. Let me look into this for you." },
      { role: "customer", content: "Yes please, I don't use that credit card anymore." },
      { role: "rep", content: "I see — our current policy processes refunds to the original payment method. Let me escalate this to ensure we handle it correctly for you." },
    ],
  },
  {
    id: "esc-2",
    ticketId: "#4498",
    subject: "International return — customs duty",
    summary: "Customer in UK asking about customs duty refund on returned item. No rule covers international customs duty handling.",
    reason: "International customs duty refund not covered by any existing rule.",
    customer: "Sarah Chen",
    email: "sarah.c@email.com",
    intent: "International Return",
    sentiment: "neutral",
    outcome: "Escalated",
    mode: "Production",
    priority: "Medium",
    orderValue: "$215.00",
    turns: 4,
    time: "3h ago",
    createdAt: "3h ago",
    startedAt: "2026/3/29 01:25:00",
    status: "needs_attention",
    thread: [
      { role: "customer", content: "I returned my order but I also paid customs duty. Will I get that refunded too?" },
      { role: "rep", content: "Thank you for reaching out. I'm checking on the customs duty refund policy for international returns." },
      { role: "customer", content: "It was about £35 in customs fees." },
      { role: "rep", content: "I understand. This requires a specialist review — let me escalate this to our team for a proper resolution." },
    ],
  },
  {
    id: "esc-3",
    ticketId: "#4495",
    subject: "Gift card balance dispute",
    summary: "Customer claims gift card balance is incorrect after partial use. Need to verify transaction history.",
    reason: "Gift card balance discrepancy requires manual transaction audit.",
    customer: "James Wilson",
    email: "j.wilson@email.com",
    intent: "Gift Card Inquiry",
    sentiment: "frustrated",
    outcome: "Resolved",
    mode: "Production",
    priority: "Low",
    orderValue: "$50.00",
    turns: 3,
    time: "5h ago",
    createdAt: "5h ago",
    startedAt: "2026/3/28 22:45:00",
    status: "resolved",
    thread: [
      { role: "customer", content: "My gift card should have $50 left but it's showing $12." },
      { role: "rep", content: "I can see your gift card was used for a $38 purchase on March 15th. The remaining balance of $12 is correct." },
      { role: "customer", content: "Oh I see, I forgot about that purchase. Thank you!" },
    ],
  },
  {
    id: "esc-4",
    ticketId: "#4490",
    subject: "Damaged item — photo evidence",
    summary: "Customer sent photos of damaged packaging. Item appears intact but customer insists on replacement.",
    reason: "Photo evidence assessment needed — packaging damaged but item may be intact.",
    customer: "Lisa Park",
    email: "lisa.p@email.com",
    intent: "Damaged Item Claim",
    sentiment: "neutral",
    outcome: "Resolved",
    mode: "Training",
    priority: "Medium",
    orderValue: "$89.00",
    turns: 4,
    time: "6h ago",
    createdAt: "6h ago",
    startedAt: "2026/3/28 21:30:00",
    status: "resolved",
    thread: [
      { role: "customer", content: "The box arrived completely crushed. I want a replacement." },
      { role: "rep", content: "I'm sorry about the packaging damage. Could you check if the item inside is also damaged?" },
      { role: "customer", content: "The item looks fine but I'm worried it might have internal damage." },
      { role: "rep", content: "I understand your concern. Based on the photos, the item appears intact. We've issued a 15% discount on your next order as a goodwill gesture." },
    ],
  },
];

// ============================================================
// PERFORMANCE DATA
// ============================================================
export const performanceDaily: PerformanceDaily[] = [
  { date: "Mar 18", tickets: 50, resolved: 44, escalated: 6, csat: 4.5, firstResponseTime: 52, fullResolutionTime: 840 },
  { date: "Mar 19", tickets: 57, resolved: 51, escalated: 6, csat: 4.6, firstResponseTime: 48, fullResolutionTime: 780 },
  { date: "Mar 20", tickets: 63, resolved: 57, escalated: 6, csat: 4.5, firstResponseTime: 45, fullResolutionTime: 720 },
  { date: "Mar 21", tickets: 73, resolved: 67, escalated: 6, csat: 4.7, firstResponseTime: 42, fullResolutionTime: 690 },
  { date: "Mar 22", tickets: 58, resolved: 53, escalated: 5, csat: 4.6, firstResponseTime: 44, fullResolutionTime: 750 },
  { date: "Mar 23", tickets: 42, resolved: 38, escalated: 4, csat: 4.8, firstResponseTime: 40, fullResolutionTime: 660 },
  { date: "Mar 24", tickets: 61, resolved: 55, escalated: 6, csat: 4.6, firstResponseTime: 38, fullResolutionTime: 700 },
];

export const intentData: IntentRow[] = [
  { intent: "WISMO", volume: 156, resolutionRate: 97, csat: 4.8 },
  { intent: "Refund", volume: 98, resolutionRate: 88, csat: 4.5 },
  { intent: "Cancellation", volume: 72, resolutionRate: 92, csat: 4.6 },
  { intent: "Address Change", volume: 45, resolutionRate: 95, csat: 4.7 },
  { intent: "Complaint", volume: 33, resolutionRate: 62, csat: 4.2 },
];

// ============================================================
// CONVERSATION LOGS
// ============================================================
export const conversationLogs: ConversationLog[] = [
  {
    ticketId: "TK-4891", customer: "Emma Thompson", email: "emma.t@gmail.com",
    intent: "WISMO", sentiment: "Neutral", outcome: "Resolved", mode: "Production",
    turns: 1, duration: "1m 12s", summary: "Customer asked about order #DBH-29174 shipping status.", time: "Today 9:42 AM", startedAt: "Today 9:41 AM",
    thread: tickets[0].thread,
    reasoning: [{
      turn: 1, customerInput: "Hi, I placed order #DBH-29174 three days ago and still haven't received any shipping confirmation.",
      contextEnrichment: ["order_id: #DBH-29174", "customer: Emma Thompson (VIP)", "order_status: Shipped"],
      ruleRouting: { intent: "WISMO", confidence: 0.96, matchedRules: ["WISMO — Order Tracking"] },
      knowledgeRetrieval: { query: "order tracking shipping status", results: 3, topSimilarity: 0.92 },
      actionsExecuted: [
        { name: "lookup_order", params: "order_id=#DBH-29174", status: "Success", result: "Order #DBH-29174 — Shipped via USPS Priority" },
        { name: "get_tracking", params: "carrier=USPS", status: "Success", result: "Tracking: 9400111899223456789012, ETA: Mar 26" },
      ],
      guardrailCheck: "Passed — all actions within policy",
      repOutput: "Hello Emma! Thanks for reaching out. I've checked your order #DBH-29174 and great news — it was shipped yesterday via USPS Priority...",
    }],
  },
  {
    ticketId: "TK-4892", customer: "James Wright", email: "j.wright@outlook.com",
    intent: "Cancellation", sentiment: "Neutral", outcome: "Resolved", mode: "Production",
    turns: 1, duration: "2m 05s", summary: "Customer requested cancellation of unfulfilled order #DBH-29201.", time: "Today 9:37 AM", startedAt: "Today 9:35 AM",
    thread: tickets[1].thread,
    reasoning: [{
      turn: 1, customerInput: "Please cancel order #DBH-29201. I found the same jacket cheaper elsewhere.",
      contextEnrichment: ["order_id: #DBH-29201", "customer: James Wright", "order_status: Unfulfilled"],
      ruleRouting: { intent: "Cancellation", confidence: 0.94, matchedRules: ["Cancellation — Unfulfilled Orders"] },
      knowledgeRetrieval: { query: "order cancellation unfulfilled", results: 2, topSimilarity: 0.89 },
      actionsExecuted: [
        { name: "lookup_order", params: "order_id=#DBH-29201", status: "Success", result: "Order #DBH-29201 — Unfulfilled, $89.00" },
        { name: "cancel_order", params: "order_id=#DBH-29201", status: "Success", result: "Order cancelled" },
        { name: "initiate_refund", params: "amount=$89.00, method=Visa 4242", status: "Success", result: "Refund of $89.00 initiated" },
      ],
      guardrailCheck: "Passed — order within cancellation window",
      repOutput: "Hi James, I've processed your request right away...",
    }],
  },
  {
    ticketId: "TK-4893", customer: "Priya Patel", email: "priya.p@yahoo.com",
    intent: "Complaint", sentiment: "Frustrated", outcome: "Escalated", mode: "Production",
    turns: 1, duration: "0m 45s", summary: "Wrong item received — escalated due to frustrated sentiment.", time: "Today 8:52 AM", startedAt: "Today 8:50 AM",
    escalationReason: "Customer sentiment: frustrated + item mismatch requires warehouse verification",
    handoffNotes: "Wrong item received. Customer ordered red dress, received blue. VIP customer with high LTV. Requires warehouse check for inventory mismatch.",
    suggestedReply: "Dear Priya, I sincerely apologize for this error. We're sending a replacement red dress via express shipping today, and I've emailed you a prepaid return label for the incorrect item. You should receive the replacement within 2 business days.",
    thread: tickets[2].thread,
    reasoning: [{
      turn: 1, customerInput: "I ordered a red dress but received a blue one instead. This is really frustrating!",
      contextEnrichment: ["order_id: #DBH-28990", "customer: Priya Patel (VIP)", "item_mismatch: true"],
      ruleRouting: { intent: "Complaint", confidence: 0.91, matchedRules: ["Escalation — Sentiment Trigger", "VIP Customer Handling"] },
      knowledgeRetrieval: { query: "wrong item received complaint", results: 1, topSimilarity: 0.78 },
      actionsExecuted: [
        { name: "lookup_order", params: "order_id=#DBH-28990", status: "Success", result: "Order #DBH-28990 — Delivered" },
        { name: "analyze_sentiment", params: "text=customer_message", status: "Success", result: "Sentiment: Frustrated (0.87)" },
        { name: "escalate_ticket", params: "reason=sentiment+mismatch", status: "Success", result: "Escalated to L2" },
      ],
      guardrailCheck: "Passed — escalation triggered by sentiment rule",
      repOutput: "Dear Priya, I'm truly sorry about this mix-up...",
    }],
  },
  {
    ticketId: "TK-4894", customer: "Oliver Bennett", email: "oliver.b@icloud.com",
    intent: "Address Change", sentiment: "Neutral", outcome: "Resolved", mode: "Training",
    turns: 1, duration: "0m 55s", summary: "Customer requested address change for unfulfilled order.", time: "Today 9:16 AM", startedAt: "Today 9:15 AM",
    thread: tickets[3].thread,
    reasoning: [{
      turn: 1, customerInput: "I just placed order #DBH-29210 and realised I put the wrong address.",
      contextEnrichment: ["order_id: #DBH-29210", "customer: Oliver Bennett", "order_status: Unfulfilled"],
      ruleRouting: { intent: "Address Change", confidence: 0.97, matchedRules: ["Address Change — Pre-Dispatch"] },
      knowledgeRetrieval: { query: "address change pre-dispatch", results: 2, topSimilarity: 0.91 },
      actionsExecuted: [
        { name: "lookup_order", params: "order_id=#DBH-29210", status: "Success", result: "Order #DBH-29210 — Unfulfilled" },
        { name: "edit_address", params: "address=45 Baker Street, NY", status: "Success", result: "Address updated" },
      ],
      guardrailCheck: "Passed — order not yet dispatched",
      repOutput: "Hi Oliver! I've updated the shipping address for order #DBH-29210...",
    }],
  },
  {
    ticketId: "TK-4895", customer: "Sophie Williams", email: "sophie.w@gmail.com",
    intent: "Refund", sentiment: "Neutral", outcome: "Resolved", mode: "Production",
    turns: 1, duration: "1m 30s", summary: "Customer inquired about refund status for returned item.", time: "Today 9:01 AM", startedAt: "Today 9:00 AM",
    thread: tickets[4].thread,
    reasoning: [{
      turn: 1, customerInput: "I returned my silk blouse a week ago and haven't received my refund yet.",
      contextEnrichment: ["order_id: #DBH-29050", "customer: Sophie Williams", "return_status: Received"],
      ruleRouting: { intent: "Refund", confidence: 0.93, matchedRules: ["Refund — Standard Process"] },
      knowledgeRetrieval: { query: "refund status timeline", results: 2, topSimilarity: 0.88 },
      actionsExecuted: [
        { name: "lookup_order", params: "order_id=#DBH-29050", status: "Success", result: "Order #DBH-29050 — Returned" },
        { name: "check_refund_status", params: "order_id=#DBH-29050", status: "Success", result: "Refund processed Mar 24, pending" },
      ],
      guardrailCheck: "Passed — read-only operation",
      repOutput: "Hi Sophie! I've checked your refund status for order #DBH-29050...",
    }],
  },
];

// ============================================================
// ONBOARDING STEPS
// ============================================================
export const onboardingSteps: OnboardingStep[] = [
  // Step 1: Welcome
  {
    id: 1, type: "message", sender: "team-lead",
    text: "Hi, I'm Alex — your AI team lead.\n\nI'll help you set up your first AI support rep. Here's what we'll do:\n\n1. Connect your tools (Shopify & Zendesk)\n2. Upload your support docs so I can learn your policies\n3. Configure your Rep's identity and permissions\n4. Run a quick sanity check\n5. Choose how you want your Rep to work\n\nLet's get started.",
    actions: [{ label: "Let's go", nextStep: 2 }],
  },
  // Step 2: Shopify check
  {
    id: 2, type: "message", sender: "team-lead",
    text: "✅ Shopify is connected — alexsong.myshopify.com\n\nYour AI Rep can look up orders, shipping status, and customer info.",
    actions: [{ label: "Continue", nextStep: 3 }],
  },
  // Step 3: Zendesk connect
  {
    id: 3, type: "message", sender: "team-lead",
    text: "To let your Rep read and respond to tickets, we need to set up Zendesk AI Support Access. This is a 3-step process you'll complete in the Integrations page.\n\nTicket routing — including which channels (email, chat, web form) and which ticket types are assigned to your AI Rep — is configured through Zendesk Triggers. This keeps all routing logic in one place and avoids conflicts between Zendesk and Seel settings.",
    actions: [
      { label: "Open Integrations →", nextStep: 4, variant: "primary" },
      { label: "Skip for now", nextStep: 4, variant: "ghost" },
    ],
  },
  // Step 4: Upload SOP
  {
    id: 4, type: "message", sender: "team-lead",
    text: "Now let's teach your Rep. Upload your customer service SOP documents — I'll extract rules and knowledge from them.",
    actions: [
      { label: "Upload files", nextStep: 5, variant: "primary" },
      { label: "Try with a sample document", nextStep: 5, variant: "outline" },
      { label: "Skip — I'll teach my Rep through conversation later", nextStep: 6, variant: "ghost" },
    ],
  },
  // Step 5: Parse results
  {
    id: 5, type: "message", sender: "team-lead",
    text: "Done! I extracted 8 rules from your documents. Document content has been loaded into the knowledge base.\n\n1. WISMO — Order Tracking\n2. Refund — Standard Process\n3. Cancellation — Unfulfilled Orders\n4. Address Change — Pre-Dispatch\n5. VIP Customer Handling\n\n+3 more rules\n\nReview all in Playbook →",
    actions: [{ label: "Continue", nextStep: 6 }],
  },
  // Step 6: Hire Rep
  {
    id: 6, type: "message", sender: "team-lead",
    text: "Your playbook is ready. Let's hire your first AI support rep.",
    actions: [{ label: "Hire Rep", nextStep: 7, variant: "primary" }],
  },
  // Step 7: Readiness Check (Rep area)
  {
    id: 7, type: "message", sender: "rep",
    text: "Hi! I'm Ava, your new AI support rep.\n\nBefore I start handling real tickets, let me show you how I'd handle a few scenarios. I'll walk you through 3 tests one at a time — tell me if each response looks right.",
    actions: [{ label: "Start test", nextStep: 8 }],
  },
  // Step 8: Scenario 1 — WISMO
  {
    id: 8, type: "scenario", sender: "rep",
    text: "**Scenario 1 — \"Where is my order?\"**\n\nCustomer writes: *\"Where is my order #DBH-29174? It's been a week and I haven't received anything.\"*\n\nHere's what I'd do:\n1. Look up #DBH-29174 in Shopify\n2. I see it's **shipped** via USPS Priority, tracking 9400111899223456789012, expected Mar 25\n3. I'd reply:\n\n> *Hi Emma! Your order #DBH-29174 shipped via USPS Priority (tracking: 9400111899223456789012) and is expected to arrive by March 25th. You can track it here: [link]. Let me know if you need anything else!*\n\nThis is read-only — I'm just looking up info and replying. Does this look right?",
    options: [
      { label: "Looks good", value: "approve", nextStep: 9 },
      { label: "Needs adjustment", value: "adjust", nextStep: 9 },
    ],
  },
  // Step 9: Scenario 2 — Cancellation
  {
    id: 9, type: "scenario", sender: "rep",
    text: "**Scenario 2 — Cancellation + refund**\n\nCustomer writes: *\"I ordered a jacket (#DBH-29210, $74.50) but I changed my mind. Can you cancel it?\"*\n\nHere's what I'd do:\n1. Look up #DBH-29210 in Shopify — it's still **Processing**, hasn't shipped\n2. Your cancellation policy says unfulfilled orders get a full refund\n3. I'd **cancel the order** in Shopify\n4. I'd **issue a $74.50 refund** to the original payment method\n5. I'd reply confirming the cancellation and refund\n\nThis is a write action — I'm actually cancelling and refunding. Is this how you'd want me to handle it?",
    options: [
      { label: "Exactly right", value: "approve", nextStep: 10 },
      { label: "Needs adjustment", value: "adjust", nextStep: 10 },
    ],
  },
  // Step 10: Scenario 3 — Escalation
  {
    id: 10, type: "scenario", sender: "rep",
    text: "**Scenario 3 — Escalation**\n\nCustomer writes: *\"I received a completely wrong item and I'm furious! This is unacceptable!\"*\n\nHere's what I'd do:\n1. Detect sentiment: **Frustrated/Angry**\n2. This triggers my escalation rule — angry sentiment + item mismatch\n3. I'd **escalate to human agent** with an Internal Note containing:\n   - Handoff summary\n   - Customer sentiment analysis\n   - Suggested reply draft\n4. I'd send an empathetic response acknowledging the issue\n\nDoes this escalation approach look right?",
    options: [
      { label: "Looks good", value: "approve", nextStep: 11 },
      { label: "Needs adjustment", value: "adjust", nextStep: 11 },
    ],
  },
  // Step 11: Mode selection (back to Team Lead)
  {
    id: 11, type: "mode-select", sender: "team-lead",
    text: "All scenarios reviewed! Your Rep is ready.\n\nOne last thing — how do you want Ava to work?",
    options: [
      { label: "Training — review before sending", value: "training", nextStep: 12 },
      { label: "Production — reply directly", value: "production", nextStep: 12 },
    ],
  },
  // Step 12: Complete
  {
    id: 12, type: "message", sender: "rep",
    text: "I'm now live in Training mode. Here's how our team works:\n\n**Come to me (Rep) when you want to:**\n• Check on tickets I've escalated to you\n• View or change my settings (click Profile)\n\n**Talk to Team Lead when you want to:**\n• Tell them about policy changes — they'll update my rules\n• Review their improvement suggestions\n• Upload new SOP documents\n\nIn Zendesk, look for my Internal Notes on tickets:\n• When I handle a ticket, I leave an Internal Note with my reasoning\n• When I escalate, the Internal Note includes my handoff summary and a suggested reply you can use",
  },
  // Step 13: Final Team Lead message
  {
    id: 13, type: "message", sender: "team-lead",
    text: "Setup is complete! Ava is ready to work. 🎉\n\nYou can find me here in the Communication tab anytime you need to chat.",
  },
];

// ============================================================
// DAILY DIGEST
// ============================================================
export const dailyDigest = {
  date: "Mar 30, 2026",
  totalTickets: 24,
  deltaTickets: "+8%",
  resolutionRate: "79%",
  deltaResolution: "+2%",
  csatScore: "4.5/5",
  deltaCsat: "+0.1",
  avgResponseTime: "38s",
  deltaRt: "-4s",
  sentimentChangedRate: "6%",
  deltaSentiment: "-1%",
  fullResolutionTime: "11m 40s",
  deltaFrt: "-1m 20s",
  escalationRate: "58%",
  deltaEscalation: "-2%",
  updateCount: 3,
};

// ============================================================
// TOPIC PROPOSALS
// ============================================================
export const topics: Topic[] = [
  {
    id: "topic-1",
    type: "proposal",
    badge: "NEW RULE",
    title: "International Returns — Customs Duty Refund",
    summary: "18 tickets about international customs duties were escalated this week. Customers are confused about whether customs duties are refundable. Recommend adding a rule to handle this automatically.",
    ruleContent: "When a customer asks about customs duty refund for international returns:\n1. Inform customer that customs duties are non-refundable by the retailer\n2. Advise customer to contact their local customs office for duty reclaim\n3. Process the product refund as normal\n4. If customer insists on full refund including duties, escalate to L2",
    sourceTickets: ["TK-4891", "TK-4892", "TK-4893"],
    status: "pending",
  },

  {
    id: "topic-3",
    type: "proposal",
    badge: "RULE UPDATE",
    title: "Extend return window for VIP customers",
    summary: "VIP customers have a 15% higher return rate but 40% higher LTV. Extending their return window from 30 to 45 days could improve satisfaction without significant cost impact.",
    ruleContent: "Update VIP Customer Handling rule:\n- Extend return window from 30 days to 45 days for VIP customers\n- Apply to customers tagged VIP, or with 5+ orders, or LTV > $500",
    currentRuleContent: "For customers tagged as VIP (or 5+ orders, or LTV > $500):\n1. Always prioritize their tickets\n2. Skip store credit offer — process direct refund\n3. Use empathetic, personalized tone\n4. If complaint: escalate immediately to L2\n5. Proactively offer compensation (discount code) for any inconvenience",
    newRuleContent: "For customers tagged as VIP (or 5+ orders, or LTV > $500):\n1. Always prioritize their tickets\n2. Extend return window from 30 days to 45 days\n3. Skip store credit offer — process direct refund\n4. Use empathetic, personalized tone\n5. If complaint: escalate immediately to L2\n6. Proactively offer compensation (discount code) for any inconvenience",
    sourceTickets: ["TK-4891"],
    status: "pending",
  },
];

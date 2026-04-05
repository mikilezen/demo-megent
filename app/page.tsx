"use client";

import React, { useState, useEffect } from "react";
import {
  Grid, Activity, FileText, User, List, PieChart, Search,
  Bell, Zap, Settings as SettingsIcon, Plus, ShieldAlert,
  Database, Shield, Lock, ChevronRight, MoreHorizontal, AlertTriangle,
  CheckCircle2, XCircle, Download, Play, Square, RefreshCw, LogOut
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type ClassValue =
  | string
  | number
  | null
  | undefined
  | boolean
  | ClassValue[]
  | { [key: string]: boolean | null | undefined };

function flattenClassValue(input: ClassValue): string[] {
  if (!input) return [];
  if (typeof input === "string" || typeof input === "number") return [String(input)];
  if (Array.isArray(input)) return input.flatMap(flattenClassValue);
  if (typeof input === "object") {
    return Object.entries(input)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key);
  }
  return [];
}

function cn(...inputs: ClassValue[]) {
  return twMerge(inputs.flatMap(flattenClassValue).join(" "));
}

const SPARK_DATA = Array.from({ length: 30 }, (_, i) => ({ value: 40 + Math.sin(i / 2) * 20 + Math.random() * 10 }));
const ANOMALY_DATA = Array.from({ length: 50 }, (_, i) => {
  const isAnomaly = i === 15 || i === 35 || i === 42;
  const base = 20 + Math.random() * 10;
  return { 
    time: i, 
    normal: isAnomaly ? base : base + Math.random() * 5, 
    anomaly: isAnomaly ? base + 40 + Math.random() * 20 : null 
  };
});

const SESSION_LOGS = [
  { id: 1, time: "14:02:31", agent: "Financial-Bot-1", verified: true, tool: "stripe.process_refund", toolIcon: Activity, args: '{amount: 1500, customer_id: "cus_123"}', decision: "ALLOWED", rule: "policy: finan-ops-v1" },
  { id: 2, time: "14:02:39", agent: "Financial-Bot-1", verified: true, tool: "sql.select_users", toolIcon: Database, args: '{query: "select * from users_pii", parameters: "***"}', decision: "MASKED (PII)", rule: "policy: finan-ops-v1" },
  { id: 3, time: "14:02:37", agent: "Financial-Bot-1", verified: true, tool: "sql.select_users", toolIcon: Database, args: '{query: "select * from users_pii", parameters: "***"}', decision: "MASKED (PII)", rule: "policy: finan-ops-v1" },
  { id: 4, time: "14:02:33", agent: "Financial-Bot-1", verified: true, tool: "stripe.process_refund", toolIcon: Lock, args: '{query: "select * from users_pii", parameters: "***"}', decision: "BLOCKED", rule: "policy: finan-ops-v1" },
];

function Badge({ type }: { type: string }) {
  if (type === "ALLOWED") return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />{type}</span>;
  if (type === "MASKED (PII)") return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{type}</span>;
  return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{type}</span>;
}

function formatLatencyFromId(id: number) {
  const seed = Math.abs(id) % 90;
  return `0.${seed + 10}ms`;
}

function getSeriesBounds(values: Array<number | null>) {
  const numericValues = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  if (numericValues.length === 0) {
    return { min: 0, max: 1 };
  }

  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  return min === max ? { min: min - 1, max: max + 1 } : { min, max };
}

function buildSeriesPath(values: Array<number | null>, width: number, height: number, padding: number) {
  const { min, max } = getSeriesBounds(values);
  const usableWidth = Math.max(width - padding * 2, 1);
  const usableHeight = Math.max(height - padding * 2, 1);
  const step = values.length > 1 ? usableWidth / (values.length - 1) : 0;
  const points: Array<{ x: number; y: number; value: number }> = [];

  values.forEach((value, index) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return;
    }

    const x = padding + step * index;
    const y = padding + (1 - (value - min) / (max - min)) * usableHeight;
    points.push({ x, y, value });
  });

  const path = points.reduce((acc, point, index) => {
    const segment = `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    return `${acc} ${segment}`.trim();
  }, "");

  return { path, points, min, max };
}

function buildAreaPath(values: number[], width: number, height: number, padding: number) {
  const { min, max } = getSeriesBounds(values);
  const usableWidth = Math.max(width - padding * 2, 1);
  const usableHeight = Math.max(height - padding * 2, 1);
  const step = values.length > 1 ? usableWidth / (values.length - 1) : 0;
  const baseline = height - padding;
  const points = values.map((value, index) => {
    const x = padding + step * index;
    const y = padding + (1 - (value - min) / (max - min)) * usableHeight;
    return { x, y };
  });

  if (points.length === 0) {
    return "";
  }

  return `${points.reduce((acc, point, index) => `${acc}${index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`}`, "")} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`;
}

function SparklineChart({ data, stroke }: { data: Array<{ value: number }>; stroke: string }) {
  const width = 256;
  const height = 96;
  const padding = 8;
  const values = data.map((entry) => entry.value);
  const { path } = buildSeriesPath(values, width, height, padding);
  const areaPath = buildAreaPath(values, width, height, padding);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparklineFill)" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AnomalyChart({ data }: { data: Array<{ time: number; normal: number; anomaly: number | null }> }) {
  const width = 640;
  const height = 160;
  const padding = 16;
  const normalValues = data.map((entry) => entry.normal);
  const anomalyValues = data.map((entry) => entry.anomaly);
  const normalSeries = buildSeriesPath(normalValues, width, height, padding);
  const anomalySeries = buildSeriesPath(anomalyValues, width, height, padding);
  const gridLines = [0.25, 0.5, 0.75].map((ratio) => padding + (height - padding * 2) * ratio);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" aria-hidden="true">
      {gridLines.map((y) => (
        <line key={y} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="4 6" />
      ))}

      <path d={normalSeries.path} fill="none" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {data.map((entry, index) => {
        if (entry.anomaly == null) {
          return null;
        }

        const point = anomalySeries.points.find((candidate) => candidate.value === entry.anomaly && Math.round(candidate.x) === Math.round(padding + (width - padding * 2) / Math.max(data.length - 1, 1) * index));
        if (!point) {
          return null;
        }

        return (
          <g key={entry.time}>
            <line x1={point.x} x2={point.x} y1={height - padding} y2={point.y} stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            <circle cx={point.x} cy={point.y} r="3.5" fill="#ef4444" />
          </g>
        );
      })}
    </svg>
  );
}

function PolicyBarChart({
  data,
  height = 256,
}: {
  data: Array<{ name: string; allowed: number; blocked: number }>;
  height?: number;
}) {
  const width = 640;
  const padding = 24;
  const maxValue = Math.max(...data.flatMap((entry) => [entry.allowed, entry.blocked]));
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  const columnWidth = chartWidth / data.length;
  const barWidth = Math.min(36, columnWidth * 0.28);
  const gridLines = [0.25, 0.5, 0.75].map((ratio) => padding + chartHeight * ratio);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" aria-hidden="true">
      {gridLines.map((y) => (
        <line key={y} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="4 6" />
      ))}

      {data.map((entry, index) => {
        const groupX = padding + columnWidth * index + columnWidth / 2;
        const allowedHeight = Math.max((entry.allowed / maxValue) * chartHeight, 4);
        const blockedHeight = Math.max((entry.blocked / maxValue) * chartHeight, 4);
        const allowedX = groupX - barWidth - 4;
        const blockedX = groupX + 4;

        return (
          <g key={entry.name}>
            <rect x={allowedX} y={height - padding - allowedHeight} width={barWidth} height={allowedHeight} rx="4" fill="#3b82f6" />
            <rect x={blockedX} y={height - padding - blockedHeight} width={barWidth} height={blockedHeight} rx="4" fill="#ef4444" />
            <text x={groupX} y={height - 6} textAnchor="middle" fill="#6b7280" fontSize="11">
              {entry.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [isLockdown, setIsLockdown] = useState(false);
  const [logs, setLogs] = useState(SESSION_LOGS);
  const [isStreaming, setIsStreaming] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [reportTimeRange, setReportTimeRange] = useState("24h");
  const [skills, setSkills] = useState([
    { id: 1, name: "Financial Operations", status: "active", rules: 12 },
    { id: 2, name: "Customer Support", status: "active", rules: 8 },
    { id: 3, name: "Data Analysis", status: "inactive", rules: 4 },
  ]);
  const [agents, setAgents] = useState([
    { id: "A723", name: "Financial-Bot-1", status: "active", risk: "low", calls: "1.2M" },
    { id: "B911", name: "Support-Agent", status: "paused", risk: "high", calls: "450K" },
    { id: "C404", name: "Data-Crawler", status: "active", risk: "medium", calls: "890K" },
  ]);
  const [isCreatePolicyOpen, setIsCreatePolicyOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(0);
  const [logFilter, setLogFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [enforcementMode, setEnforcementMode] = useState<"BLOCKING" | "MONITORING">("BLOCKING");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isSidebarResizing, setIsSidebarResizing] = useState(false);

  const notifications = [
    { id: 1, title: "New Threat Detected", desc: "Anomalous spike in Support-Agent", time: "2m ago", type: "alert" },
    { id: 2, title: "Policy Updated", desc: "Financial Operations v2 deployed", time: "15m ago", type: "info" },
    { id: 3, title: "Agent Quarantined", desc: "Data-Crawler access revoked", time: "1h ago", type: "warning" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      toast.info(`Search results for "${searchQuery}"`, {
        description: "Found 12 related audit logs and 2 active agents."
      });
    }, 800);
  };

  const incidents = [
    {
      title: "High Risk Deviation Flagged",
      agent: "Support-Agent",
      deviation: "High Write-to-Read ratio (4:1) with mismatched prompt context (User Lookup only). Suggests Hallucination or Injection attack.",
      action: "Execution Paused, Session Identity revoked in < 1ms",
      risk: "high"
    },
    {
      title: "PII Exfiltration Attempt",
      agent: "Financial-Bot-1",
      deviation: "Attempted to access 'credit_card_number' field in non-masked environment. Policy 'finan-ops-v1' triggered.",
      action: "Field Masked, Security Event Logged",
      risk: "medium"
    },
    {
      title: "Unauthorized Tool Access",
      agent: "Data-Crawler",
      deviation: "Agent attempted to call 'shell_exec' which is restricted for this passport scope.",
      action: "Action Blocked, Agent Quarantined",
      risk: "high"
    }
  ];

  // Cycle incidents
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedIncident(prev => (prev + 1) % incidents.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [incidents.length]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isSidebarResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      const minWidth = 220;
      const maxWidth = Math.min(420, Math.floor(window.innerWidth * 0.45));
      const nextWidth = Math.min(maxWidth, Math.max(minWidth, event.clientX));
      setSidebarWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsSidebarResizing(false);
    };

    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isSidebarResizing]);

  // Simulate live data stream
  useEffect(() => {
    if (!isStreaming || isLockdown) return;
    const interval = setInterval(() => {
      const agentsList = ["Financial-Bot-1", "Support-Agent", "Data-Crawler"];
      const toolsList = ["stripe.process_refund", "sql.select_users", "api.fetch_data", "email.send", "auth.verify_token"];
      const iconsList = [Activity, Database, Grid, FileText, Lock];
      const decisions = ["ALLOWED", "MASKED (PII)", "BLOCKED"];
      
      const randomAgent = agentsList[Math.floor(Math.random() * agentsList.length)];
      const randomTool = toolsList[Math.floor(Math.random() * toolsList.length)];
      const randomIcon = iconsList[Math.floor(Math.random() * iconsList.length)];
      const randomDecision = decisions[Math.floor(Math.random() * decisions.length)];

      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        agent: randomAgent,
        verified: true,
        tool: randomTool,
        toolIcon: randomIcon,
        args: randomTool.includes('sql') ? '{query: "SELECT * FROM...", params: "***"}' : '{id: "req_923", status: "pending"}',
        decision: randomDecision,
        rule: `policy: ${randomAgent.toLowerCase().split('-')[0]}-v${Math.floor(Math.random() * 3) + 1}`
      };
      setLogs(prev => [newLog, ...prev].slice(0, 50));
    }, 2500);
    return () => clearInterval(interval);
  }, [isStreaming, isLockdown]);

  const toggleLockdown = () => {
    setIsLockdown(!isLockdown);
    if (!isLockdown) {
      toast.error("GLOBAL LOCKDOWN INITIATED", {
        description: "All agent actions are currently blocked.",
        duration: 5000,
      });
    } else {
      toast.success("Lockdown Lifted", {
        description: "Normal operations resumed.",
      });
    }
  };

  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Generating report...',
        success: 'Report exported successfully',
        error: 'Failed to export report',
      }
    );
  };

  const toggleSkill = (id: number) => {
    setSkills(skills.map(s => {
      if (s.id === id) {
        const newStatus = s.status === 'active' ? 'inactive' : 'active';
        toast.info(`Skill ${s.name} ${newStatus}`);
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  const toggleAgentStatus = (id: string) => {
    setAgents(agents.map(a => {
      if (a.id === id) {
        const newStatus = a.status === 'active' ? 'paused' : 'active';
        toast.success(`Agent ${a.name} access ${newStatus === 'active' ? 'restored' : 'revoked'}`);
        return { ...a, status: newStatus };
      }
      return a;
    }));
  };

  const handleSettingsClick = () => {
    setActiveNav("Policy Editor");
    toast.info("Opened Policy & Skill Editor");
  };

  const handleMarkAllNotificationsRead = () => {
    setShowNotifications(false);
    toast.success("All notifications marked as read");
  };

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    setActiveNav("Logs");
    toast.info("Opened audit logs");
  };

  const handleProfileMenuAction = (action: "profile" | "security" | "api" | "signout") => {
    setShowProfileMenu(false);

    if (action === "profile") {
      setActiveNav("Agent Passports");
      toast.info("Profile settings opened");
      return;
    }

    if (action === "security") {
      toast.info("Security keys panel opened");
      return;
    }

    if (action === "api") {
      setActiveNav("Agent Passports");
      toast.info("API access panel opened");
      return;
    }

    toast.error("Signed out (demo)");
  };

  const handleIssueNewPassport = () => {
    const newId = `N${Math.floor(Math.random() * 900 + 100)}`;
    const newAgent = {
      id: newId,
      name: `New-Agent-${newId}`,
      status: "active",
      risk: "low",
      calls: "0",
    };

    setAgents(prev => [newAgent, ...prev].slice(0, 8));
    toast.success(`Issued passport for ${newAgent.name}`);
  };

  const handleSidebarResizeStart = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (window.innerWidth < 1024) return;
    setIsSidebarResizing(true);
  };

  return (
    <div className={cn(
      "flex h-screen w-full text-gray-700 font-sans overflow-hidden selection:bg-blue-500/30 transition-colors duration-500",
      isLockdown ? "bg-[#fff1f2]" : "bg-[#f5f7fb]"
    )}>
      {/* SIDEBAR */}
      <div className={cn(
        "fixed inset-y-0 left-0 relative max-w-[85vw] flex-shrink-0 border-r flex flex-col z-50 transition-all duration-300 lg:static lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        isLockdown ? "border-red-900/30 bg-[#fff5f5]" : "border-[#d1d5db] bg-[#ffffff]"
      )}
      style={{ width: sidebarWidth }}>
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
        {/* isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        isLockdown ? "border-red-900/30 bg-[#fff5f5]" : "border-[#d1d5db] bg-[#ffffff]" */}
            {/* <Zap size={18} className="fill-current" /> */}
            <img src="/ll.png" alt="" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">Megent</span>
          <p className='bg-white/20'>demo</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {[
            { icon: Grid, label: "Overview" },
            { icon: Activity, label: "Live Interceptor" },
            { icon: FileText, label: "Policy Editor" },
            { icon: Activity, label: "Anomalies" },
            { icon: List, label: "Logs" },
            { icon: PieChart, label: "Reports" },
            { icon: User, label: "Agent Passports" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col">
              <button
                onClick={() => {
                  setActiveNav(item.label);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left",
                  activeNav === item.label 
                    ? "bg-[#e5e7eb] text-gray-900" 
                    : "text-gray-600 hover:text-gray-200 hover:bg-[#f3f4f6]"
                )}
              >
                <item.icon size={18} className={activeNav === item.label ? "text-gray-900" : "text-gray-500"} />
                {item.label}
              </button>
              
              {/* JWT Passport Chain Sub-menu (Visible when Agent Passports is active or just as a visual element) */}
              {/* {item.label === "Agent Passports" && (
                <div className="ml-4 mt-2 mb-2 p-3 rounded-lg border border-[#d1d5db] bg-[#f8fafc]">
                  <div className="text-xs text-gray-600 mb-2 font-medium">JWT Passport Chain:</div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-blue-400">
                      <div className="w-2 h-2 rounded-full bg-blue-500" /> Okta Issuer
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 pl-1">
                      <ChevronRight size={12} /> App: Fin-Service
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 pl-1">
                      <ChevronRight size={12} /> Agent: Fin-Bot-1
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 pl-1">
                      <ChevronRight size={12} /> Megent Runtime
                    </div>
                    <div className="flex items-center gap-2 text-green-400 mt-2 font-medium">
                      <CheckCircle2 size={14} /> Verified
                    </div>
                  </div>
                </div>
              )} */}
            </div>
          ))}
        </nav>

        <div className={cn(
          "p-4 border-t space-y-4 transition-colors duration-500",
          isLockdown ? "border-red-900/30" : "border-[#d1d5db]"
        )}>
          <button
            onClick={handleSettingsClick}
            className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 w-full px-2 font-medium transition-colors"
          >
            <SettingsIcon size={18} /> Setting
          </button>
          <div className="flex items-center gap-2 px-2 text-xs font-medium text-gray-600">
            <div className={cn(
              "w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse",
              isLockdown ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
            )} />
            In-Process Guard: <span className={isLockdown ? "text-red-400 font-bold" : "text-green-400"}>{isLockdown ? "LOCKDOWN" : "ACTIVE"}</span>
          </div>
        </div>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          onMouseDown={handleSidebarResizeStart}
          className="absolute top-0 right-0 hidden h-full w-1 cursor-col-resize lg:block"
        >
          <div className={cn(
            "h-full w-full transition-colors",
            isSidebarResizing ? "bg-blue-500/40" : "hover:bg-blue-500/30"
          )} />
        </div>
      </div>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* <div className="hidden lg:block flex-shrink-0" style={{ width: sidebarWidth }} /> */}

      {/* MAIN CONTENT */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 min-h-0 transition-colors duration-500",
        isLockdown ? "bg-[#fff1f2]" : "bg-[#f5f7fb]"
      )}>
        {/* TOP BAR */}
        <header className={cn(
          "min-h-14 flex flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 border-b transition-colors duration-500 relative",
          isLockdown ? "border-red-900/30 bg-[#fff1f2]" : "border-[#d1d5db] bg-[#f5f7fb]"
        )}>
          <div className="flex flex-1 items-center gap-3 min-w-0 lg:max-w-xl">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#d1d5db] bg-[#ffffff] text-black hover:bg-gray-100 lg:hidden"
            >
              <List size={18} />
            </button>
            <div className="relative flex-1">
              <form onSubmit={handleSearch}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search agents, policies, or audit logs..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full bg-[#ffffff] border border-[#d1d5db] rounded-lg py-2 pl-10 pr-4 text-sm text-gray-700 focus:outline-none focus:border-blue-500/50 transition-all",
                    isLockdown ? "bg-[#ffe4e6] border-red-900/50" : "bg-[#ffffff] border-[#d1d5db]"
                  )}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={toggleLockdown}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold border transition-all duration-300",
                isLockdown 
                  ? "bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse" 
                  : "bg-transparent text-red-500 border-red-500/30 hover:bg-red-500/10"
              )}
            >
              <ShieldAlert size={14} />
              {isLockdown ? "LIFT LOCKDOWN" : "GLOBAL LOCKDOWN"}
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#f5f7fb]" />
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] bg-[#ffffff] border border-[#d1d5db] rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-[#d1d5db] flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                        <button onClick={handleMarkAllNotificationsRead} className="text-[10px] text-blue-400 hover:underline">Mark all as read</button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map(n => (
                          <div key={n.id} className="p-4 border-b border-[#d1d5db]/50 hover:bg-[#f3f4f6] transition-colors cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "mt-1 w-2 h-2 rounded-full shrink-0",
                                n.type === 'alert' ? "bg-red-500" : n.type === 'warning' ? "bg-amber-500" : "bg-blue-500"
                              )} />
                              <div className="space-y-1">
                                <div className="text-xs font-semibold text-gray-900">{n.title}</div>
                                <div className="text-[11px] text-gray-500 leading-tight">{n.desc}</div>
                                <div className="text-[10px] text-gray-600">{n.time}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={handleViewAllNotifications} className="w-full p-3 text-xs text-gray-500 hover:text-gray-900 hover:bg-[#f3f4f6] transition-colors text-center font-medium">
                        View all notifications
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 pr-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-[18px] bg-black from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                  D
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-gray-900">Demo</div>
                  <div className="text-[10px] text-gray-500">Enterprise Admin</div>
                </div>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-[min(14rem,calc(100vw-2rem))] bg-[#ffffff] border border-[#d1d5db] rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-[#d1d5db]">
                        <div className="text-xs font-semibold text-gray-900">mikilezen@gmail.com</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Organization: Megent Corp</div>
                      </div>
                      <div className="p-2">
                        <button onClick={() => handleProfileMenuAction("profile")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-[#f3f4f6] rounded-lg transition-colors">
                          <User size={14} /> Profile Settings
                        </button>
                        <button onClick={() => handleProfileMenuAction("security")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-[#f3f4f6] rounded-lg transition-colors">
                          <Shield size={14} /> Security Keys
                        </button>
                        <button onClick={() => handleProfileMenuAction("api")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-[#f3f4f6] rounded-lg transition-colors">
                          <Grid size={14} /> API Access
                        </button>
                      </div>
                      <div className="p-2 border-t border-[#d1d5db]">
                        <button onClick={() => handleProfileMenuAction("signout")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeNav === "Overview" && (
            <>
            {/* HEADER */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Overview & Command Center</h1>
              <button 
                onClick={() => setIsCreatePolicyOpen(true)}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                <Plus size={16} /> Create Policy
              </button>
            </div>

            {/* METRIC CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "border rounded-xl p-5 relative overflow-hidden transition-all duration-500 cursor-pointer",
                  isLockdown ? "bg-[#ffe4e6] border-red-900/50 shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]" : "bg-[#ffffff] border-[#d1d5db] shadow-[0_0_30px_-10px_rgba(59,130,246,0.15)]"
                )}
              >
                <div className={cn(
                  "absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r to-transparent",
                  isLockdown ? "from-red-500/50" : "from-blue-500/50"
                )} />
                <div className="text-sm font-medium text-gray-600 mb-2">Live Interceptions (24h)</div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-4xl font-bold text-gray-900 tracking-tight">2.3M</div>
                    <div className="text-xs text-gray-500 mt-1">$&lt; 1ms avg. latency</div>
                  </div>
                  <div className="w-32 h-12">
                    <SparklineChart data={SPARK_DATA} stroke={isLockdown ? "#ef4444" : "#3b82f6"} />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "border rounded-xl p-5 relative overflow-hidden transition-all duration-500 cursor-pointer",
                  isLockdown ? "bg-[#ffe4e6] border-red-900/50" : "bg-[#ffffff] border-[#d1d5db]"
                )}
              >
                <div className={cn(
                  "absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r to-transparent",
                  isLockdown ? "from-red-500/50" : "from-blue-500/50"
                )} />
                <div className="text-sm font-medium text-gray-600 mb-2">Active Agent Passports</div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 tracking-tight">842</div>
                  <div className="text-xs text-gray-500 mt-1">100% JWT Verified</div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-[#fff1f2] border border-[#371f1f] rounded-xl p-5 relative overflow-hidden shadow-[0_0_30px_-10px_rgba(239,68,68,0.15)] cursor-pointer"
              >
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500/50 to-transparent" />
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-600">Total Blocked Actions</div>
                  <span className="text-[10px] font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20">BLOCK</span>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 tracking-tight">314</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Policy Violations
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ENFORCEMENT STREAM TABLE */}
            <div className={cn(
              "border rounded-xl resize-y overflow-auto min-h-[22rem] max-h-[80vh] flex flex-col transition-colors duration-500",
              isLockdown ? "bg-[#ffe4e6] border-red-900/50" : "bg-[#ffffff] border-[#d1d5db]"
            )}>
              <div className={cn(
                "px-4 py-3 border-b flex items-center justify-between transition-colors duration-500",
                isLockdown ? "border-red-900/50" : "border-[#d1d5db]"
              )}>
                <h2 className="text-sm font-semibold text-gray-900">Real-time Grouped Enforcement Stream</h2>
                <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                  <div className={cn(
                    "flex items-center border rounded px-2 py-1 transition-colors duration-500",
                    isLockdown ? "bg-[#fff1f2] border-red-900/50" : "bg-[#f5f7fb] border-[#d1d5db]"
                  )}>
                    <Search size={14} className="text-gray-500 mr-2" />
                    <input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-xs text-gray-700 w-24 sm:w-32" />
                  </div>
                  <div className={cn(
                    "text-[10px] font-medium text-gray-600 border rounded px-2 py-1.5 transition-colors duration-500",
                    isLockdown ? "bg-[#fff1f2] border-red-900/50" : "bg-[#f5f7fb] border-[#d1d5db]"
                  )}>
                    DECISION: <span className="text-gray-900">BLOCKS ONLY</span>
                  </div>
                  <div className={cn(
                    "text-[10px] font-medium text-gray-600 border rounded px-2 py-1.5 transition-colors duration-500",
                    isLockdown ? "bg-[#fff1f2] border-red-900/50" : "bg-[#f5f7fb] border-[#d1d5db]"
                  )}>
                    INTENT: <span className="text-gray-900">DATA MODIFICATION</span>
                  </div>
                  <button onClick={() => toast.info("Opened stream options")} className="text-gray-500 hover:text-gray-900"><MoreHorizontal size={16} /></button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={cn(
                      "text-xs text-gray-500 border-b transition-colors duration-500",
                      isLockdown ? "border-red-900/50 bg-[#fff1f2]/50" : "border-[#d1d5db] bg-[#f5f7fb]/50"
                    )}>
                      <th className="font-medium px-4 py-2 w-24">Time</th>
                      <th className="font-medium px-4 py-2 w-64">Agent Identity (JWT)</th>
                      <th className="font-medium px-4 py-2 w-56">Tool Call</th>
                      <th className="font-medium px-4 py-2">Arguments</th>
                      <th className="font-medium px-4 py-2 w-32">Decision</th>
                      <th className="font-medium px-4 py-2 w-40">Match Rule</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Group Header */}
                    <tr className={cn(
                      "border-b transition-colors duration-500",
                      isLockdown ? "bg-[#ffe4e6] border-red-900/50" : "bg-[#f3f4f6] border-[#d1d5db]"
                    )}>
                      <td colSpan={6} className="px-4 py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">SESSION [A723] -</span>
                            <span className="text-gray-900 font-semibold">Financial-Bot-1</span>
                            <span className="text-green-400 text-xs font-medium">[Verified]</span>
                          </div>
                          <button onClick={() => toast.info("Opened session actions for A723")} className="text-gray-500 hover:text-gray-900"><MoreHorizontal size={16} /></button>
                        </div>
                      </td>
                    </tr>
                    {/* Rows */}
                    <AnimatePresence initial={false}>
                      {logs.slice(0, 5).map((row, idx) => (
                        <motion.tr 
                          key={row.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={cn(
                            "border-b transition-colors",
                            isLockdown ? "border-red-900/30 hover:bg-[#ffe4e6]/50" : "border-[#d1d5db]/50 hover:bg-[#f3f4f6]/50"
                          )}
                        >
                          <td className="px-4 py-3 text-xs text-gray-500 font-mono">{row.time}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="relative flex flex-col items-center justify-center w-4 h-full">
                                {idx !== 0 && <div className="absolute top-[-12px] w-[1px] h-3 bg-[#333]" />}
                                <div className={cn("w-4 h-4 rounded-full flex items-center justify-center border", 
                                  row.decision === "ALLOWED" ? "border-green-500/50 bg-green-500/10 text-green-500" : 
                                  row.decision === "BLOCKED" ? "border-red-500/50 bg-red-500/10 text-red-500" : 
                                  "border-amber-500/50 bg-amber-500/10 text-amber-500"
                                )}>
                                  {row.decision === "ALLOWED" ? <span className="text-[8px]">$</span> : 
                                   row.decision === "BLOCKED" ? <Lock size={8} /> : 
                                   <Shield size={8} />}
                                </div>
                                {idx !== logs.slice(0, 5).length - 1 && <div className="absolute bottom-[-12px] w-[1px] h-3 bg-[#333]" />}
                              </div>
                              <span className="text-xs text-gray-700">{row.agent}</span>
                              <span className="text-green-400 text-[10px] font-medium">[Verified]</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
                              <row.toolIcon size={14} className="text-gray-500" /> {row.tool}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 font-mono truncate max-w-[250px]">{row.args}</td>
                          <td className="px-4 py-3"><Badge type={row.decision} /></td>
                          <td className="px-4 py-3 text-xs text-blue-400 hover:underline cursor-pointer">{row.rule}</td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PREDICTIVE INTELLIGENCE */}
            <div className="bg-transparent">
              <div className={cn(
                "inline-block border border-b-0 rounded-t-lg px-4 py-2 text-sm font-semibold text-gray-900 transition-colors duration-500",
                isLockdown ? "bg-[#ffe4e6] border-red-900/50" : "bg-[#ffffff] border-[#d1d5db]"
              )}>
                Multi-Dimensional Predictive Intelligence
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Anomalies Chart */}
                <div className={cn(
                  "xl:col-span-2 border rounded-b-xl rounded-tr-xl p-5 transition-colors duration-500",
                  isLockdown ? "bg-[#ffe4e6] border-red-900/50" : "bg-[#ffffff] border-[#d1d5db]"
                )}>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Anomalies & Deviations</h3>
                  <div className="flex h-auto md:h-40 flex-col md:flex-row gap-6">
                    <div className={cn(
                      "w-full md:w-1/3 min-h-[10rem] relative flex items-center justify-center md:border-r md:pr-6 transition-colors duration-500",
                      isLockdown ? "border-red-900/50" : "border-[#d1d5db]"
                    )}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="w-24 h-24 rounded-full border border-dashed border-gray-300 flex items-center justify-center"
                        >
                          <div className="w-16 h-16 rounded-full border border-gray-300 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 blur-sm" />
                          </div>
                        </motion.div>
                      </div>
                      <div className="absolute w-2 h-2 rounded-full bg-red-500 top-10 left-10 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      <div className="absolute w-1.5 h-1.5 rounded-full bg-red-500/60 bottom-12 right-8" />
                      <div className="absolute w-2 h-2 rounded-full bg-red-500 top-20 right-12 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      <div className="absolute w-1.5 h-1.5 rounded-full bg-gray-500 bottom-8 left-16" />
                      <div className="mt-auto text-xs text-gray-500">Normal Behavior</div>
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-end gap-4 mb-2 text-[10px] text-gray-600">
                        <div className="flex items-center gap-1"><div className="w-2 h-0.5 bg-gray-600" /> Normal Tool Volume</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-0.5 bg-red-500" /> Anomalous Spikes</div>
                      </div>
                      <div className="flex-1">
                        <AnomalyChart data={ANOMALY_DATA} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reasoning Card */}
                <div className={cn(
                  "border rounded-xl p-5 relative transition-colors duration-500",
                  isLockdown ? "bg-[#ffe4e6] border-red-900/50" : "bg-[#ffffff] border-[#d1d5db]"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900">Reasoning Card</h3>
                    <div className="flex gap-1">
                      {incidents.map((_, i) => (
                        <div key={i} className={cn("w-1.5 h-1.5 rounded-full", selectedIncident === i ? "bg-white" : "bg-gray-700")} />
                      ))}
                    </div>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={selectedIncident}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-3"
                    >
                      <div className={cn(
                        "flex items-center gap-2 font-semibold text-sm",
                        incidents[selectedIncident].risk === 'high' ? "text-red-400" : "text-amber-400"
                      )}>
                        <AlertTriangle size={16} /> {incidents[selectedIncident].title}
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="text-gray-500">Agent:</span> <span className="text-gray-700">{incidents[selectedIncident].agent}</span>
                      </div>
                      <div className="text-xs text-gray-600 leading-relaxed">
                        <span className="text-gray-500">Deviation:</span> {incidents[selectedIncident].deviation}
                      </div>
                      <div className={cn(
                        "text-xs text-gray-600 mt-4 pt-4 border-t transition-colors duration-500",
                        isLockdown ? "border-red-900/50" : "border-[#d1d5db]"
                      )}>
                        <span className="text-gray-500">ACTION:</span> {incidents[selectedIncident].action}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  
                  <div className="absolute bottom-4 right-4 text-gray-700 opacity-50">
                    <Zap size={20} />
                  </div>
                </div>
              </div>
            </div>

            </>
          )}

          {activeNav === "Anomalies" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Anomalies & Threat Detection</h1>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-[#ffffff] border border-[#d1d5db] px-3 py-1.5 rounded">
                  <Activity size={14} className="text-red-500 animate-pulse" />
                  Monitoring 842 Agents
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                <div className="xl:col-span-3 bg-[#ffffff] border border-[#d1d5db] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-medium text-gray-900">Threat Distribution Map</h3>
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Critical</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> Warning</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Info</div>
                    </div>
                  </div>
                  <div className="h-80 relative flex items-center justify-center">
                    {/* Complex visual: concentric circles with dots */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      {[100, 200, 300, 400].map(size => (
                        <div key={size} className="absolute rounded-full border border-gray-500" style={{ width: size, height: size }} />
                      ))}
                    </div>
                    <AnimatePresence>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div 
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={cn(
                            "absolute w-3 h-3 rounded-full cursor-pointer hover:ring-4 ring-white/20 transition-all",
                            i % 3 === 0 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : 
                            i % 3 === 1 ? "bg-amber-500" : "bg-blue-500"
                          )}
                          style={{ 
                            left: `${50 + Math.cos(i) * 35}%`, 
                            top: `${50 + Math.sin(i) * 35}%` 
                          }}
                          onClick={() => toast.info(`Threat ID: TH-00${i} - Details available in Reasoning Card`)}
                        />
                      ))}
                    </AnimatePresence>
                    <div className="text-center z-10">
                      <div className="text-3xl font-bold text-gray-900">12</div>
                      <div className="text-xs text-gray-500">Active Threats</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-[#ffffff] border border-[#d1d5db] rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Top Threat Vector</div>
                    <div className="text-lg font-bold text-gray-900">Prompt Injection</div>
                    <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full w-[65%]" />
                    </div>
                  </div>
                  <div className="bg-[#ffffff] border border-[#d1d5db] rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Avg. Response Time</div>
                    <div className="text-lg font-bold text-gray-900">0.84ms</div>
                    <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[90%]" />
                    </div>
                  </div>
                  <div className="bg-[#ffffff] border border-[#d1d5db] rounded-xl p-4 flex-1">
                    <h4 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">Recent Alerts</h4>
                    <div className="space-y-3">
                      {[
                        { time: "10:02", msg: "Auth Bypass Attempt", risk: "high" },
                        { time: "09:58", msg: "Data Leakage Blocked", risk: "med" },
                        { time: "09:45", msg: "Passport Revoked", risk: "low" },
                      ].map((alert, i) => (
                        <div key={i} className="flex items-start gap-2 text-[10px]">
                          <span className="text-gray-600 font-mono">{alert.time}</span>
                          <span className={cn(
                            "px-1 rounded",
                            alert.risk === 'high' ? "bg-red-500/10 text-red-400" : 
                            alert.risk === 'med' ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                          )}>{alert.msg}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeNav === "Logs" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">System Audit Logs</h1>
                <div className="flex w-full sm:w-auto flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex w-full sm:w-auto items-center bg-[#ffffff] border border-[#d1d5db] rounded px-3 py-1.5">
                    <Search size={14} className="text-gray-500 mr-2" />
                    <input type="text" placeholder="Filter by Agent, Tool, or ID" className="bg-transparent border-none outline-none text-xs text-gray-700 w-full sm:w-64" />
                  </div>
                  <select 
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                    className="bg-[#ffffff] border border-[#d1d5db] text-xs text-gray-700 px-3 py-1.5 rounded outline-none"
                  >
                    <option value="ALL">All Decisions</option>
                    <option value="ALLOWED">Allowed Only</option>
                    <option value="BLOCKED">Blocked Only</option>
                    <option value="MASKED (PII)">Masked Only</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#ffffff] border border-[#d1d5db] rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-[#d1d5db] bg-[#f5f7fb]/50">
                      <th className="font-medium px-4 py-3">Timestamp</th>
                      <th className="font-medium px-4 py-3">Agent</th>
                      <th className="font-medium px-4 py-3">Operation</th>
                      <th className="font-medium px-4 py-3">Decision</th>
                      <th className="font-medium px-4 py-3">Policy ID</th>
                      <th className="font-medium px-4 py-3 text-right">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {logs.filter(l => logFilter === "ALL" || l.decision === logFilter).map((log) => (
                      <tr key={log.id} className="border-b border-[#d1d5db]/30 hover:bg-[#f3f4f6] transition-colors">
                        <td className="px-4 py-3 text-gray-500 font-mono">{log.time}</td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{log.agent}</td>
                        <td className="px-4 py-3 text-gray-600 font-mono">{log.tool}</td>
                        <td className="px-4 py-3"><Badge type={log.decision} /></td>
                        <td className="px-4 py-3 text-blue-400 font-mono">{log.rule}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{formatLatencyFromId(log.id)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {logs.length === 0 && (
                  <div className="p-12 text-center text-gray-600 italic">No logs found matching criteria.</div>
                )}
              </div>
            </motion.div>
          )}

          {activeNav === "Live Interceptor" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Live Interceptor Terminal</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button 
                    onClick={() => setIsStreaming(!isStreaming)}
                    className="flex items-center gap-2 bg-[#f3f4f6] border border-[#d1d5db] text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-[#222] transition-colors"
                  >
                    {isStreaming ? <><Square size={14} className="text-red-400" /> Pause Stream</> : <><Play size={14} className="text-green-400" /> Resume Stream</>}
                  </button>
                  <button 
                    onClick={() => setLogs([])}
                    className="flex items-center gap-2 bg-[#f3f4f6] border border-[#d1d5db] text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-[#222] transition-colors"
                  >
                    <RefreshCw size={14} /> Clear
                  </button>
                </div>
              </div>
              <div className="flex-1 resize-y min-h-[18rem] max-h-[70vh] bg-[#f8fafc] border border-[#d1d5db] rounded-xl p-4 font-mono text-xs overflow-y-auto">
                <AnimatePresence>
                  {logs.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mb-2 pb-2 border-b border-[#d1d5db] last:border-0"
                    >
                      <span className="text-gray-600">[{log.time}]</span>{' '}
                      <span className="text-blue-400">{log.agent}</span>{' '}
                      <span className="text-gray-600">called</span>{' '}
                      <span className="text-purple-400">{log.tool}</span>{' '}
                      <span className="text-gray-500">{log.args}</span>{' '}
                      <span className="text-gray-600">-&gt;</span>{' '}
                      <span className={cn(
                        "font-bold",
                        log.decision === "ALLOWED" ? "text-green-500" : 
                        log.decision === "BLOCKED" ? "text-red-500" : "text-amber-500"
                      )}>{log.decision}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {logs.length === 0 && (
                  <div className="text-gray-600 italic">Waiting for incoming requests...</div>
                )}
              </div>
            </motion.div>
          )}

          {activeNav === "Agent Passports" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Agent Passport Registry</h1>
                <button onClick={handleIssueNewPassport} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors">
                  <Plus size={16} /> Issue New Passport
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-4">
                  {agents.map((agent) => (
                    <motion.div 
                      key={agent.id}
                      layout
                      className="bg-[#ffffff] border border-[#d1d5db] rounded-xl p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between group hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center border",
                          agent.status === 'active' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                        )}>
                          <Shield size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-gray-900 font-semibold">{agent.name}</h3>
                            <span className="text-[10px] text-gray-500 font-mono">ID: {agent.id}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                              <Activity size={10} /> {agent.calls} calls
                            </div>
                            <div className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                              agent.risk === 'low' ? "bg-green-500/10 text-green-500" : 
                              agent.risk === 'medium' ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-500"
                            )}>
                              {agent.risk} risk
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toast.info(`Viewing passport details for ${agent.name}`)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                          <FileText size={18} />
                        </button>
                        <button 
                          onClick={() => toggleAgentStatus(agent.id)}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                            agent.status === 'active' 
                              ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" 
                              : "bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white"
                          )}
                        >
                          {agent.status === 'active' ? 'Revoke Access' : 'Restore Access'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <div className="bg-[#ffffff] border border-[#d1d5db] rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">JWT Passport Chain</h3>
                    <div className="space-y-4 relative">
                      <div className="absolute left-3 top-4 bottom-4 w-[1px] bg-[#d1d5db]" />
                      {[
                        { label: "Okta Issuer", desc: "Identity Provider", icon: Lock, color: "text-blue-400" },
                        { label: "App: Fin-Service", desc: "Application Context", icon: Grid, color: "text-purple-400" },
                        { label: "Agent: Financial-Bot-1", desc: "Agent Identity", icon: Shield, color: "text-green-400" },
                        { label: "Megent Runtime", desc: "Enforcement Layer", icon: Activity, color: "text-gray-900" },
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-4 relative z-10">
                          <div className={cn("w-6 h-6 rounded-full bg-[#f5f7fb] border border-[#d1d5db] flex items-center justify-center", step.color)}>
                            <step.icon size={12} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900">{step.label}</div>
                            <div className="text-[10px] text-gray-500">{step.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#d1d5db] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-green-500">VERIFIED</span>
                      </div>
                      <span className="text-[10px] text-gray-600 font-mono">exp: 2026-04-03T12:00Z</span>
                    </div>
                  </div>

                  <div className="bg-[#ffffff] border border-[#d1d5db] rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Security Posture</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500">Compliance Score</span>
                        <span className="text-gray-900 font-bold">98.4%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full w-[98%]" />
                      </div>
                      <div className="flex justify-between text-[10px] pt-2">
                        <span className="text-gray-500">Revocation Latency</span>
                        <span className="text-gray-900 font-bold">&lt; 1ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeNav === "Reports" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Enforcement Reports</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="bg-[#f8fafc] border border-[#d1d5db] rounded-md p-1 flex text-sm">
                    <button 
                      onClick={() => setReportTimeRange("24h")}
                      className={cn("px-3 py-1 rounded", reportTimeRange === "24h" ? "bg-[#e5e7eb] text-gray-900" : "text-gray-600 hover:text-gray-900")}
                    >
                      24h
                    </button>
                    <button 
                      onClick={() => setReportTimeRange("7d")}
                      className={cn("px-3 py-1 rounded", reportTimeRange === "7d" ? "bg-[#e5e7eb] text-gray-900" : "text-gray-600 hover:text-gray-900")}
                    >
                      7d
                    </button>
                  </div>
                  <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
                  >
                    <Download size={16} /> Export CSV
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-[#ffffff] border border-[#d1d5db] rounded-xl p-5">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Actions by Policy</h3>
                  <div className="h-64">
                    <PolicyBarChart
                      data={[
                        { name: 'Fin-Ops', allowed: reportTimeRange === '24h' ? 4000 : 28000, blocked: reportTimeRange === '24h' ? 240 : 1680 },
                        { name: 'Support', allowed: reportTimeRange === '24h' ? 3000 : 21000, blocked: reportTimeRange === '24h' ? 139 : 973 },
                        { name: 'Data', allowed: reportTimeRange === '24h' ? 2000 : 14000, blocked: reportTimeRange === '24h' ? 980 : 6860 },
                      ]}
                    />
                  </div>
                </div>
                <div className="bg-[#ffffff] border border-[#d1d5db] rounded-xl p-5">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Block Reasons</h3>
                  <div className="space-y-4">
                    {[
                      { reason: "PII Access Attempt", count: reportTimeRange === '24h' ? 452 : 3164, percent: 45 },
                      { reason: "Unauthorized Tool", count: reportTimeRange === '24h' ? 312 : 2184, percent: 31 },
                      { reason: "Rate Limit Exceeded", count: reportTimeRange === '24h' ? 145 : 1015, percent: 14 },
                      { reason: "Prompt Injection Detected", count: reportTimeRange === '24h' ? 98 : 686, percent: 10 },
                    ].map(item => (
                      <div key={item.reason}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{item.reason}</span>
                          <span className="text-gray-500">{item.count}</span>
                        </div>
                        <div className="w-full bg-[#e5e7eb] rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeNav === "Policy Editor" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Policy & Skill Editor</h1>
                <button 
                  onClick={() => {
                    toast.success("New skill draft created");
                  }}
                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  <Plus size={16} /> Add Skill
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map(skill => (
                  <div key={skill.id} className="bg-[#ffffff] border border-[#d1d5db] rounded-xl p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{skill.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{skill.rules} active rules</p>
                      </div>
                      <button 
                        onClick={() => toggleSkill(skill.id)}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          skill.status === 'active' ? 'bg-blue-600' : 'bg-gray-600'
                        )}
                      >
                        <span className={cn(
                          "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                          skill.status === 'active' ? 'translate-x-5' : 'translate-x-1'
                        )} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => toast.info(`Editing ${skill.name}`)}
                        className="text-xs bg-[#f3f4f6] hover:bg-[#222] text-gray-700 px-3 py-1.5 rounded border border-[#d1d5db] transition-colors"
                      >
                        Edit Rules
                      </button>
                      <button 
                        onClick={() => {
                          setSkills(skills.filter(s => s.id !== skill.id));
                          toast.success(`${skill.name} deleted`);
                        }}
                        className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded border border-red-500/30 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </main>
      </div>

      {/* CREATE POLICY MODAL */}
      <AnimatePresence>
        {isCreatePolicyOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreatePolicyOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#ffffff] border border-[#d1d5db] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#d1d5db] flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Create Security Policy</h2>
                <button onClick={() => setIsCreatePolicyOpen(false)} className="text-gray-500 hover:text-gray-900"><XCircle size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Policy Name</label>
                  <input type="text" placeholder="e.g. Financial Data Protection" className="w-full bg-[#f5f7fb] border border-[#d1d5db] rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Target Agent Scope</label>
                  <select className="w-full bg-[#f5f7fb] border border-[#d1d5db] rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors">
                    <option>All Agents</option>
                    <option>Financial-Bot-1</option>
                    <option>Support-Agent</option>
                    <option>Data-Crawler</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Enforcement Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setEnforcementMode("BLOCKING")}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors",
                        enforcementMode === "BLOCKING"
                          ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                          : "border-[#d1d5db] bg-[#f5f7fb] text-gray-500 hover:text-gray-700"
                      )}
                    >
                      <Shield size={20} />
                      <span className="text-xs font-bold">BLOCKING</span>
                    </button>
                    <button
                      onClick={() => setEnforcementMode("MONITORING")}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors",
                        enforcementMode === "MONITORING"
                          ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                          : "border-[#d1d5db] bg-[#f5f7fb] text-gray-500 hover:text-gray-700"
                      )}
                    >
                      <Activity size={20} />
                      <span className="text-xs font-bold">MONITORING</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-[#f5f7fb]/50 flex gap-3">
                <button 
                  onClick={() => setIsCreatePolicyOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#d1d5db] text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setIsCreatePolicyOpen(false);
                    toast.success("Policy Created Successfully", {
                      description: `The new ${enforcementMode.toLowerCase()} policy is now being propagated to the edge.`
                    });
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors"
                >
                  Deploy Policy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

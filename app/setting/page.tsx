"use client";

import React from "react";
import Link from "next/link";
import { Activity, CheckCircle2, Database, LogOut, Lock, Settings, Shield } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../theme-provider";

const apiKeys = [
  {
    name: "Primary Deploy Key",
    key: "mg_live_2f31c3b1d7a84e1a9d7c",
    created: "Mar 12, 2026",
    lastUsed: "Today, 14:06",
    status: "active",
  },
  {
    name: "Analytics Export",
    key: "mg_live_9c1a48f3d0d2470b2fae",
    created: "Feb 02, 2026",
    lastUsed: "Apr 24, 2026",
    status: "active",
  },
  {
    name: "Legacy Partner",
    key: "mg_live_b47c2c8f2bdf4f6782e1",
    created: "Jan 17, 2026",
    lastUsed: "Mar 08, 2026",
    status: "revoked",
  },
];

const auditEvents = [
  {
    title: "API key rotated",
    detail: "Primary Deploy Key",
    time: "2h ago",
  },
  {
    title: "SAML enforcement enabled",
    detail: "Security policy",
    time: "Yesterday",
  },
  {
    title: "New workspace member",
    detail: "amaralee@megent.dev",
    time: "Apr 22",
  },
];

export default function SettingPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("API key copied", { description: "Paste it into your runtime config." });
    } catch {
      toast.error("Copy failed", { description: "Clipboard access was blocked." });
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("megent-session");
    }
    toast.success("Signed out", { description: "Demo session cleared locally." });
  };

  return (
    <main className="min-h-screen w-full bg-[#f5f4ed] text-[#141413]">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8e6dc] bg-[#e8e6dc] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4d4c48]">
              <Settings size={12} /> Settings
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-[#141413]" style={{ fontFamily: "var(--font-display)" }}>
              Workspace settings
            </h1>
            <p className="mt-2 text-sm text-[#87867f]">
              Manage API access, security posture, and appearance for your Megent workspace.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-[12px] border border-[#e8e6dc] bg-[#faf9f5] px-4 py-2 text-xs font-semibold text-[#4d4c48] shadow-[0_0_0_1px_#d1cfc5] transition-colors hover:bg-[#f0eee6]"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <div className="rounded-[18px] border border-[#f0eee6] bg-[#faf9f5] p-6 shadow-[0_4px_24px_rgba(20,20,19,0.06)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#87867f]">API keys</div>
                  <h2 className="mt-2 text-lg font-semibold text-[#141413]" style={{ fontFamily: "var(--font-display)" }}>
                    Runtime access keys
                  </h2>
                  <p className="mt-1 text-xs text-[#87867f]">Keys are scoped to this workspace and logged.</p>
                </div>
                <button
                  onClick={() => toast.info("Key creation is mocked in this demo")}
                  className="inline-flex items-center justify-center rounded-[12px] bg-[#c96442] px-4 py-2 text-xs font-semibold text-[#faf9f5] shadow-[0_0_0_1px_#c96442] transition-colors hover:bg-[#d97757]"
                >
                  Create key
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.name} className="rounded-[14px] border border-[#e8e6dc] bg-[#faf9f5] px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[#141413]">{key.name}</div>
                        <div className="mt-1 text-xs text-[#87867f]">Created {key.created}</div>
                      </div>
                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                          key.status === "active"
                            ? "border-[#e8e6dc] bg-[#e8e6dc] text-[#4d4c48]"
                            : "border-[#b53333]/30 bg-[#f5eaea] text-[#b53333]"
                        }`}
                      >
                        {key.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="rounded-[10px] border border-dashed border-[#e8e6dc] bg-[#f0eee6] px-3 py-2 text-[11px] font-mono text-[#4d4c48]">
                        {key.key}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#87867f]">
                        <span>Last used {key.lastUsed}</span>
                        <button
                          onClick={() => handleCopy(key.key)}
                          className="rounded-[10px] border border-[#e8e6dc] bg-[#faf9f5] px-3 py-1.5 text-[11px] font-semibold text-[#4d4c48] hover:bg-[#f0eee6]"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-[#f0eee6] bg-[#faf9f5] p-6 shadow-[0_4px_24px_rgba(20,20,19,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#87867f]">Security</div>
                  <h2 className="mt-2 text-lg font-semibold text-[#141413]" style={{ fontFamily: "var(--font-display)" }}>
                    Workspace security
                  </h2>
                  <p className="mt-1 text-xs text-[#87867f]">Control sign-in, SSO, and access posture.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e8e6dc] bg-[#e8e6dc] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4d4c48]">
                  <Shield size={12} /> Protected
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  { title: "SAML + SSO", detail: "Okta · Enforced" },
                  { title: "2FA", detail: "Required for admins" },
                  { title: "IP allowlist", detail: "3 networks" },
                  { title: "Session timeout", detail: "8 hours" },
                ].map((item) => (
                  <div key={item.title} className="rounded-[14px] border border-[#e8e6dc] bg-[#faf9f5] p-4">
                    <div className="text-sm font-semibold text-[#141413]">{item.title}</div>
                    <div className="mt-1 text-xs text-[#87867f]">{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[18px] border border-[#f0eee6] bg-[#faf9f5] p-6 shadow-[0_4px_24px_rgba(20,20,19,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#87867f]">Appearance</div>
                  <h2 className="mt-2 text-lg font-semibold text-[#141413]" style={{ fontFamily: "var(--font-display)" }}>
                    Theme preference
                  </h2>
                  <p className="mt-1 text-xs text-[#87867f]">Sync with your system or choose a fixed mode.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e8e6dc] bg-[#e8e6dc] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4d4c48]">
                  <CheckCircle2 size={12} /> {resolvedTheme}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {([
                  { value: "system", label: "System" },
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`flex w-full items-center justify-between rounded-[12px] border px-3 py-2 text-xs font-semibold transition-colors ${
                      theme === option.value
                        ? "border-[#30302e] bg-[#30302e] text-[#faf9f5]"
                        : "border-[#e8e6dc] bg-[#faf9f5] text-[#5e5d59] hover:border-[#d1cfc5]"
                    }`}
                  >
                    <span>{option.label}</span>
                    <span className="text-[10px] uppercase tracking-[0.18em]">
                      {option.value === "system" ? "Auto" : option.value}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-[#f0eee6] bg-[#faf9f5] p-6 shadow-[0_4px_24px_rgba(20,20,19,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#87867f]">Audit log</div>
                  <h2 className="mt-2 text-lg font-semibold text-[#141413]" style={{ fontFamily: "var(--font-display)" }}>
                    Recent activity
                  </h2>
                  <p className="mt-1 text-xs text-[#87867f]">Operator actions captured in the last 24h.</p>
                </div>
                <Database size={18} className="text-[#87867f]" />
              </div>

              <div className="mt-4 space-y-3">
                {auditEvents.map((event) => (
                  <div key={event.title} className="flex items-start gap-3 rounded-[12px] border border-[#e8e6dc] bg-[#faf9f5] px-3 py-2">
                    <div className="mt-1 h-7 w-7 rounded-full border border-[#e8e6dc] bg-[#f0eee6] flex items-center justify-center">
                      <Activity size={12} className="text-[#5e5d59]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#141413]">{event.title}</div>
                      <div className="text-[11px] text-[#87867f]">{event.detail} · {event.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-[#f0eee6] bg-[#faf9f5] p-6 shadow-[0_4px_24px_rgba(20,20,19,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#87867f]">Session</div>
                  <h2 className="mt-2 text-lg font-semibold text-[#141413]" style={{ fontFamily: "var(--font-display)" }}>
                    Sign out
                  </h2>
                  <p className="mt-1 text-xs text-[#87867f]">Clear the locally stored demo session.</p>
                </div>
                <Lock size={18} className="text-[#87867f]" />
              </div>

              <button
                onClick={handleLogout}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#b53333]/30 bg-[#f5eaea] px-4 py-2 text-xs font-semibold text-[#b53333] transition-colors hover:bg-[#f1dede]"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

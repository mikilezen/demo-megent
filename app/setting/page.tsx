"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Activity, CheckCircle2, Database, LogOut, Lock, Settings, Shield } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../theme-provider";

const apiKey = {
  name: "Primary workspace key",
  publicKey: "mg_pub_7a2d1f4b7c9e2a3d",
  secretKey: "mg_sec_2f31c3b1d7a84e1a9d7c",
  created: "Mar 12, 2026",
  lastUsed: "Today, 14:06",
};

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
  const [isRevoked, setIsRevoked] = useState(false);

  const handleCopy = async (value: string, label: string) => {
    if (isRevoked) {
      toast.error("Key revoked", { description: "Create a new key to copy values." });
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`, { description: "Paste it into your runtime config." });
    } catch {
      toast.error("Copy failed", { description: "Clipboard access was blocked." });
    }
  };

  const handleRevoke = () => {
    if (isRevoked) {
      toast.info("Key already revoked");
      return;
    }
    setIsRevoked(true);
    toast.success("API key revoked", { description: "Requests signed with this key are blocked." });
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("megent-session");
    }
    toast.success("Signed out", { description: "Demo session cleared locally." });
  };

  return (
    <main className="min-h-screen w-full bg-[#f5f4ed] text-[#141413]">
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
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

        <div className="mt-10 space-y-12">
          <section className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#87867f]">API keys</div>
                <h2 className="mt-2 text-lg font-semibold text-[#141413]" style={{ fontFamily: "var(--font-display)" }}>
                  Runtime access key
                </h2>
                <p className="mt-1 text-xs text-[#87867f]">Single workspace key pair for this demo.</p>
              </div>
              <button
                onClick={handleRevoke}
                className={`inline-flex items-center justify-center rounded-[12px] px-4 py-2 text-xs font-semibold transition-colors ${
                  isRevoked
                    ? "bg-[#e8e6dc] text-[#4d4c48]"
                    : "bg-[#b53333] text-[#faf9f5] hover:bg-[#9d2a2a]"
                }`}
              >
                {isRevoked ? "Revoked" : "Revoke key"}
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[#5e5d59]">Key name</span>
                <span className="font-semibold text-[#141413]">{apiKey.name}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[#5e5d59]">Public key</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#141413]">{apiKey.publicKey}</span>
                  <button
                    onClick={() => handleCopy(apiKey.publicKey, "Public key")}
                    disabled={isRevoked}
                    className={`text-xs font-semibold ${
                      isRevoked ? "text-[#87867f] cursor-not-allowed" : "text-[#c96442] hover:underline"
                    }`}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[#5e5d59]">Secret key</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#141413]">
                    {isRevoked ? "revoked" : apiKey.secretKey}
                  </span>
                  <button
                    onClick={() => handleCopy(apiKey.secretKey, "Secret key")}
                    disabled={isRevoked}
                    className={`text-xs font-semibold ${
                      isRevoked ? "text-[#87867f] cursor-not-allowed" : "text-[#c96442] hover:underline"
                    }`}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[#5e5d59]">Created</span>
                <span className="text-[#141413]">{apiKey.created}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[#5e5d59]">Last used</span>
                <span className="text-[#141413]">{apiKey.lastUsed}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[#5e5d59]">Status</span>
                <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${isRevoked ? "text-[#b53333]" : "text-[#4d4c48]"}`}>
                  {isRevoked ? "revoked" : "active"}
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#87867f]">Security</div>
                <h2 className="mt-2 text-lg font-semibold text-[#141413]" style={{ fontFamily: "var(--font-display)" }}>
                  Workspace security
                </h2>
                <p className="mt-1 text-xs text-[#87867f]">Control sign-in, SSO, and access posture.</p>
              </div>
              <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4d4c48]">
                <Shield size={12} /> Protected
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {[
                { title: "SAML + SSO", detail: "Okta · Enforced" },
                { title: "2FA", detail: "Required for admins" },
                { title: "IP allowlist", detail: "3 networks" },
                { title: "Session timeout", detail: "8 hours" },
              ].map((item) => (
                <div key={item.title} className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[#5e5d59]">{item.title}</span>
                  <span className="font-semibold text-[#141413]">{item.detail}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#87867f]">Appearance</div>
                <h2 className="mt-2 text-lg font-semibold text-[#141413]" style={{ fontFamily: "var(--font-display)" }}>
                  Theme preference
                </h2>
                <p className="mt-1 text-xs text-[#87867f]">Sync with your system or choose a fixed mode.</p>
              </div>
              <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4d4c48]">
                <CheckCircle2 size={12} /> {resolvedTheme}
              </div>
            </div>

            <div className="space-y-2">
              {([
                { value: "system", label: "System" },
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`flex w-full items-center justify-between rounded-[10px] px-2 py-2 text-xs font-semibold transition-colors ${
                    theme === option.value
                      ? "bg-[#30302e] text-[#faf9f5]"
                      : "text-[#5e5d59] hover:bg-[#f0eee6]"
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em]">
                    {option.value === "system" ? "Auto" : option.value}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
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

            <div className="space-y-3 text-sm">
              {auditEvents.map((event) => (
                <div key={event.title} className="flex items-start gap-3">
                  <div className="mt-1 h-7 w-7 rounded-full bg-[#f0eee6] flex items-center justify-center">
                    <Activity size={12} className="text-[#5e5d59]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#141413]">{event.title}</div>
                    <div className="text-[11px] text-[#87867f]">{event.detail} · {event.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
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
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#b53333] hover:text-[#9d2a2a]"
            >
              <LogOut size={14} /> Sign out
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

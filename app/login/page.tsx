"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Activity, ChevronRight, Grid, Lock, Shield, User } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { SiAuth0 } from "react-icons/si";
import { RiShieldUserLine } from "react-icons/ri";
const DEMO_EMAIL = "demo@megent.dev";
const DEMO_PASSWORD = "megent123";

type StatusState = {
  type: "success" | "error" | "info";
  message: string;
} | null;

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("megent-remember-email") ?? "";
  });
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<StatusState>(null);
  const [hasSession, setHasSession] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem("megent-session"));
  });

  const handleProviderClick = (provider: string) => {
    setStatus({
      type: "info",
      message: `${provider} sign-in is mocked for this demo.`,
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);

    if (mode === "login") {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        const session = {
          email,
          signedInAt: new Date().toISOString(),
        };
        window.localStorage.setItem("megent-session", JSON.stringify(session));
        if (remember) {
          window.localStorage.setItem("megent-remember-email", email);
        } else {
          window.localStorage.removeItem("megent-remember-email");
        }
        setHasSession(true);
        setStatus({
          type: "success",
          message: "Welcome back. Your session is stored locally.",
        });
      } else {
        setStatus({
          type: "error",
          message: "That email or password does not match the demo account.",
        });
      }
      return;
    }

    if (!fullName || !email || !password) {
      setStatus({
        type: "error",
        message: "Add your name, email, and password to continue.",
      });
      return;
    }

    const signupPayload = {
      fullName,
      email,
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem("megent-signup", JSON.stringify(signupPayload));
    if (remember) {
      window.localStorage.setItem("megent-remember-email", email);
    }
    setStatus({
      type: "success",
      message: "Signup saved locally. You can sign in now.",
    });
    setMode("login");
  };

  return (
    <main className="min-h-screen w-full bg-[#f5f4ed] text-[#141413]">
      <div className="mx-auto flex min-h-screen w-full mx-w-6xl flex-col justify-center gap-10 px-6 py-16 lg:flex-row lg:items-center">
        <section className="max-w-xl space-y-6">
          <div className="rounded-[24px] bordr borer-[#e8e6dc] bg-[#faf9f5] p-5 shadow-[0_4px_24px_rgba(20,20,19,0.06)]">
            <div className="rounded-[20px] bg-[#f0eee6] p-6">
              <Image
                src="/Rectangle.svg"
                alt="Operator workspace"
                width={420}
                height={260}
                className="h-auto w-full"
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              {/* <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#e8e6dc] shadow-[0_0_0_1px_#d1cfc5] flex items-center justify-center">
                  <Image src="/Rectangle.svg" alt="User" width={20} height={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#141413]" style={{ fontFamily: "var(--font-display)" }}>Amara Lee</div>
                  <div className="text-xs text-[#87867f]">Compliance lead</div>
              {/* </div>
              <span className="rounded-full border border-[#e8e6dc] bg-[#e8e6dc] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4d4c48]">
                Active
              </span>
                </div> */}
            </div> 
          </div>

          {/* <div className="inline-flex items-center gap-2 rounded-full border border-[#f0eee6] bg-[#faf9f5] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5e5d59] shadow-[0_0_0_1px_#f0eee6]">
            Secure access
          </div>
          <h1
            className="text-4xl font-medium leading-tight text-[#141413] sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your first step into the Megent command layer.
          </h1>
          <p className="text-base text-[#5e5d59] sm:text-lg">
            Sign in with email or bring your own identity provider. The demo saves state locally, so your next visit picks up where you left off.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Policy-ready", desc: "Surface allow and block logic before launch." },
              { title: "Budget aware", desc: "Every workflow carries a real spend cap." },
              { title: "Feedback loop", desc: "Inline notes reach the review queue fast." },
              { title: "Stop control", desc: "Freeze tools in one click." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#f0eee6] bg-[#faf9f5] p-4 shadow-[0_4px_24px_rgba(20,20,19,0.06)]">
                <div className="text-sm font-semibold text-[#141413]" style={{ fontFamily: "var(--font-display)" }}>{item.title}</div>
                <div className="mt-1 text-xs text-[#87867f]">{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#5e5d59]">
            <Shield size={14} className="text-[#4d4c48]" />
            Local-only demo storage. No credentials leave your device.
          </div> */}
        </section>

        <section className="w-full max-w-md rounded-[32px] boder border-[#e8e6dc] bg-[#faf9f5] p- shadow-[0_20px_60px_rgba(20,20,19,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-grey" style={{ fontFamily: "var(--font-display)" }}>{mode === "login" ? "Welcome back" : "Create your workspace"}</div>
              {/* <div className="text-xs text-[#5e5d59]">{mode === "login" ? "Sign in to continue" : "Set up your operator profile"}</div> */}
            </div>
            <div className="rounded-full border border-[#e8e6dc] bg-[#e8e6dc] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4d4c48]">
              {mode}
            </div>
          </div>

          <div className="m-5 flex gap-2 rounded-full border border-[#e8e6dc] bg-[#e8e6dc] p-1 shadow-[0_0_0_1px_#d1cfc5]">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                mode === "login" ? "bg-[#141413] text-[#faf9f5]" : "text-[#5e5d59] hover:text-[#141413]"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                mode === "signup" ? "bg-[#141413] text-[#faf9f5]" : "text-[#5e5d59] hover:text-[#141413]"
              }`}
            >
              Sign up
            </button>
          </div>
<hr /><br />
          <div className="mt5 grid gap-3">
            <button
              type="button"
              onClick={() => handleProviderClick("Google")}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#e8e6dc] bg-[#e8e6dc] px-4 py-2 text-sm font-semibold text-[#4d4c48] shadow-[0_0_0_1px_#d1cfc5] transition-colors hover:bg-[#f0eee6]"
            ><FcGoogle size={18} /> Continue with Google
            </button>
            <button
              type="button"
              onClick={() => handleProviderClick("SSO")}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#e8e6dc] bg-[#e8e6dc] px-4 py-2 text-sm font-semibold text-[#4d4c48] shadow-[0_0_0_1px_#d1cfc5] transition-colors hover:bg-[#f0eee6]"
            ><RiShieldUserLine size={18} /> Continue with SSO
            </button>
          </div>

          <div className="my-6 flex items-center gap-4 text-[11px] text-[#87867f]">
            <div className="h-px flex-1 bg-[#e8e6dc]" />
            or use email
            <div className="h-px flex-1 bg-[#e8e6dc]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="text-xs font-semibold uppercase text-[#5e5d59]">Full name</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#e8e6dc] bg-[#faf9f5] px-4 py-2.5 text-sm text-[#141413] outline-none transition-colors focus:border-[#3898ec]"
                  placeholder="Alex Morgan"
                />
              </label>
            )}

            <label className="block">
              <span className="text-xs font-semibold uppercase text-[#5e5d59]">Email</span>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#e8e6dc] bg-[#faf9f5] px-3 py-2 transition-colors focus-within:border-[#3898ec]">
                <User size={16} className="text-[#87867f]" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-transparent text-sm text-[#141413] outline-none"
                  placeholder="name@company.com"
                  type="email"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase text-[#5e5d59]">Password</span>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#e8e6dc] bg-[#faf9f5] px-3 py-2 transition-colors focus-within:border-[#3898ec]">
                <Lock size={16} className="text-[#87867f]" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent text-sm text-[#141413] outline-none"
                  placeholder="Enter password"
                  type="password"
                />
              </div>
            </label>

            <div className="flex items-center justify-between text-xs text-[#5e5d59]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded border-[#d1cfc5]"
                />
                Remember this device
              </label>
              <button type="button" className="text-[#c96442] hover:text-[#d97757]">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c96442] px-4 py-2.5 text-sm font-semibold text-[#faf9f5] shadow-[0_0_0_1px_#c96442] transition-colors hover:bg-[#d97757]"
            >
              {mode === "login" ? "Sign in" : "Create account"}
              <ChevronRight size={16} />
            </button>
          </form>

          {status && (
            <div
              role="status"
              className={`mt-4 rounded-xl border px-4 py-3 text-xs font-medium ${
                status.type === "success"
                  ? "border-[#e8e6dc] bg-[#faf9f5] text-[#3d3d3a]"
                  : status.type === "error"
                    ? "border-[#b53333] bg-[#f5eaea] text-[#b53333]"
                    : "border-[#e8e6dc] bg-[#f5f4ed] text-[#5e5d59]"
              }`}
            >
              {status.message}
            </div>
          )}

          {hasSession && (
            <Link
              href="/"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[#e8e6dc] bg-[#faf9f5] px-4 py-2 text-xs font-semibold text-[#4d4c48] shadow-[0_0_0_1px_#e8e6dc] transition-colors hover:bg-[#f0eee6]"
            >
              Continue to console
              <ChevronRight size={14} />
            </Link>
          )}

          <div className="mt-6 text-[11px] text-[#87867f]">
            By continuing, you agree to the Megent demo terms and the local storage policy.
          </div>
        </section>
      </div>
    </main>
  );
}

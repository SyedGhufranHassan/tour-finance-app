import { FormEvent, useEffect, useState } from "react";
import { LockKeyhole, Sparkles } from "lucide-react";
import { supabase } from "./lib/supabase";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [sessionReady, setSessionReady] = useState(!supabase);
  const [authenticated, setAuthenticated] = useState(!supabase);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(Boolean(data.session));
      setSessionReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setAuthenticated(Boolean(session)));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !email || !password) return;
    setBusy(true); setMessage("");
    const result = mode === "login" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    setMessage(result.error?.message ?? (mode === "signup" ? "Account created. Check your email if confirmation is enabled." : ""));
    setBusy(false);
  }

  if (!sessionReady) return <div className="auth-loading">Loading secure workspace...</div>;
  if (authenticated) return <>{children}</>;
  return <main className="auth-page"><section className="auth-card"><div className="auth-brand"><div className="brand-mark"><Sparkles size={18} /></div><div><strong>Kumrat</strong><span>Finance Manager</span></div></div><p className="eyebrow">Private tour workspace</p><h1>{mode === "login" ? "Welcome back" : "Create your workspace"}</h1><p className="auth-copy">Keep every contribution and expense accountable with secure tour-scoped access.</p><form onSubmit={submit}><label className="form-field"><span>Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label><label className="form-field"><span>Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} /></label>{message && <p className="auth-message">{message}</p>}<button className="save-button" disabled={busy}><LockKeyhole size={17} />{busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button></form><button className="auth-switch" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>{mode === "login" ? "Need an account? Sign up" : "Already registered? Sign in"}</button></section></main>;
}

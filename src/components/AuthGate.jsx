import { createContext, useContext, useEffect, useRef, useState } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { Lock, LogOut, RefreshCw } from "lucide-react";
import { db, isFirebaseConfigured, signInWithGoogle, signOutUser, watchAuth } from "../lib/firebase";

const AuthContext = createContext({ user: null, signOut: () => {} });

export function useAuth() {
  return useContext(AuthContext);
}

async function probeAccess() {
  try {
    await getDocs(query(collection(db, "households/main/profiles"), limit(1)));
    return true;
  } catch (error) {
    // Only a rules rejection means "not on the allowlist". Network problems
    // fail open: the UI loads and the rules still protect the data itself.
    return error?.code !== "permission-denied";
  }
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function GateShell({ children }) {
  return (
    <div className="grid min-h-screen place-items-center bg-cream-100 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-black/5 bg-white p-8 text-center shadow-[0_18px_55px_rgba(11,31,58,0.12)]">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-100 text-forest-900">
          <svg viewBox="0 0 32 32" className="size-8 fill-none stroke-current stroke-[2.2] [stroke-linecap:round] [stroke-linejoin:round]" aria-hidden="true">
            <path d="M9.5 25h14a5.5 5.5 0 0 0 .7-10.96A8.5 8.5 0 0 0 8.08 12.6 6.25 6.25 0 0 0 9.5 25Z" />
          </svg>
        </span>
        {children}
      </div>
    </div>
  );
}

export default function AuthGate({ children }) {
  const [phase, setPhase] = useState(isFirebaseConfigured ? "loading" : "local");
  const [user, setUser] = useState(null);
  const [signInError, setSignInError] = useState("");
  const checkToken = useRef(0);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    return watchAuth(async (nextUser) => {
      const token = ++checkToken.current;
      setUser(nextUser);
      if (!nextUser) {
        setPhase("signedOut");
        return;
      }
      setPhase("checking");
      const allowed = await probeAccess();
      if (token !== checkToken.current) return;
      setPhase(allowed ? "ready" : "denied");
    });
  }, []);

  if (phase === "local") {
    if (import.meta.env.DEV) {
      // No Firebase config during local development: run in local-only mode.
      return <AuthContext.Provider value={{ user: null, signOut: signOutUser }}>{children}</AuthContext.Provider>;
    }
    return (
      <GateShell>
        <h1 className="mt-5 text-lg font-bold text-ink-900">Cloud sync isn&apos;t set up yet</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          This site was deployed without a Firebase configuration, so sign-in is unavailable.
          Follow SETUP.md in the repository, then redeploy.
        </p>
      </GateShell>
    );
  }

  if (phase === "loading" || phase === "checking") {
    return (
      <GateShell>
        <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
          <RefreshCw className="size-4 animate-spin" />
          {phase === "loading" ? "Waking up Cloud…" : "Checking your access…"}
        </div>
      </GateShell>
    );
  }

  if (phase === "signedOut") {
    const handleSignIn = async () => {
      setSignInError("");
      try {
        await signInWithGoogle();
      } catch (error) {
        if (error?.code !== "auth/popup-closed-by-user" && error?.code !== "auth/cancelled-popup-request") {
          setSignInError("Sign-in didn't complete. Check that pop-ups are allowed and try again.");
        }
      }
    };
    return (
      <GateShell>
        <h1 className="mt-5 text-lg font-bold text-ink-900">Welcome to Cloud</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          This is a private household budget. Sign in with an invited Google account to continue.
        </p>
        <button
          type="button"
          onClick={handleSignIn}
          className="interactive-button mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-black/8 bg-white px-4 py-3 text-sm font-semibold text-ink-900 hover:border-forest-700/25 hover:bg-forest-50"
        >
          <GoogleMark /> Sign in with Google
        </button>
        {signInError && <p className="mt-3 text-xs font-semibold text-rose-500">{signInError}</p>}
      </GateShell>
    );
  }

  if (phase === "denied") {
    return (
      <GateShell>
        <h1 className="mt-5 flex items-center justify-center gap-2 text-lg font-bold text-ink-900">
          <Lock className="size-4" /> This budget is private
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          <span className="font-semibold text-ink-900">{user?.email}</span> isn&apos;t on the household list.
          Ask the owner to add your email to the Firestore rules, then sign in again.
        </p>
        <button
          type="button"
          onClick={() => signOutUser()}
          className="interactive-button mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-black/8 bg-white px-4 py-3 text-sm font-semibold text-ink-900 hover:border-forest-700/25 hover:bg-forest-50"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </GateShell>
    );
  }

  return <AuthContext.Provider value={{ user, signOut: signOutUser }}>{children}</AuthContext.Provider>;
}

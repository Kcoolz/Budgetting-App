import { useEffect, useRef, useState } from "react";
import { collection, doc, onSnapshot, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { normalizeProfileStore } from "./profiles";

// Firestore layout (everything lives under one household so the security
// rules can allowlist the whole subtree in a single match block):
//   households/main/profiles/{profileId}          profile metadata + budget without transactions
//   households/main/txchunks/{profileId}__{month} that month's transactions for that profile
// Chunking by month keeps every document far below Firestore's 1 MiB limit
// no matter how many years of history accumulate.
const HOUSEHOLD_PATH = "households/main";
const CHUNK_SEPARATOR = "__";
const PRESYNC_BACKUP_KEY = "cloud-budget-presync-backup-v1";
const SAVE_DEBOUNCE_MS = 1200;
const BATCH_LIMIT = 400;

function sanitize(value) {
  return JSON.parse(JSON.stringify(value));
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function monthKeyFor(transaction) {
  const month = typeof transaction?.date === "string" ? transaction.date.slice(0, 7) : "";
  return /^\d{4}-\d{2}$/.test(month) ? month : "undated";
}

export function stateToDocs(profileState) {
  const docs = new Map();
  profileState.profiles.forEach((profile, index) => {
    const { transactions = [], ...budget } = profile.budget;
    docs.set(`profiles/${profile.id}`, sanitize({
      id: profile.id,
      name: profile.name,
      type: profile.type,
      color: profile.color,
      createdAt: profile.createdAt,
      order: index,
      budget
    }));
    const byMonth = new Map();
    for (const transaction of transactions) {
      const key = monthKeyFor(transaction);
      if (!byMonth.has(key)) byMonth.set(key, []);
      byMonth.get(key).push(transaction);
    }
    for (const [month, monthTransactions] of byMonth) {
      docs.set(`txchunks/${profile.id}${CHUNK_SEPARATOR}${month}`, sanitize({
        profileId: profile.id,
        month,
        transactions: monthTransactions
      }));
    }
  });
  return docs;
}

export function docsToState(docs, activeProfileId) {
  const profiles = [];
  const chunks = [];
  for (const [path, data] of docs) {
    if (path.startsWith("profiles/")) profiles.push(data);
    else if (path.startsWith("txchunks/")) chunks.push(data);
  }
  profiles.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.id).localeCompare(String(b.id)));
  chunks.sort((a, b) => String(a.month).localeCompare(String(b.month)));
  const rebuilt = profiles.map(({ order, ...profile }) => ({
    ...profile,
    budget: {
      ...profile.budget,
      transactions: chunks
        .filter((chunk) => chunk.profileId === profile.id)
        .flatMap((chunk) => Array.isArray(chunk.transactions) ? chunk.transactions : [])
    }
  }));
  return normalizeProfileStore({ activeProfileId, profiles: rebuilt });
}

// Keeps the local profile state and Firestore in sync while a user is signed in.
// localStorage stays the instant, offline-first copy; this hook mirrors it to the
// cloud (debounced, per-document diffs) and applies remote changes live.
// Conflict policy: last write wins per document; unsynced local edits survive
// incoming snapshots because dirty documents are preserved during the merge.
export function useCloudSync({ user, profileState, setProfileState }) {
  const [status, setStatus] = useState("local");
  const sessionRef = useRef(null);
  const stateRef = useRef(profileState);
  stateRef.current = profileState;

  useEffect(() => {
    if (!user || !db) {
      sessionRef.current = null;
      setStatus("local");
      return undefined;
    }

    const session = {
      remote: { profiles: null, txchunks: null },
      fromCache: { profiles: true, txchunks: true },
      lastSynced: new Map(),
      ready: false,
      cancelled: false,
      flushTimer: null
    };
    sessionRef.current = session;
    setStatus("connecting");

    const flush = async () => {
      if (session.cancelled || !session.ready) return;
      const localDocs = stateToDocs(stateRef.current);
      const writes = [];
      const deletes = [];
      for (const [path, data] of localDocs) {
        if (stableStringify(data) !== session.lastSynced.get(path)) writes.push([path, data]);
      }
      for (const path of session.lastSynced.keys()) {
        if (!localDocs.has(path)) deletes.push(path);
      }
      if (!writes.length && !deletes.length) {
        setStatus("synced");
        return;
      }
      setStatus("saving");
      try {
        const ops = [
          ...writes.map(([path, data]) => ({ path, data })),
          ...deletes.map((path) => ({ path, remove: true }))
        ];
        for (let start = 0; start < ops.length; start += BATCH_LIMIT) {
          const batch = writeBatch(db);
          for (const op of ops.slice(start, start + BATCH_LIMIT)) {
            const ref = doc(db, `${HOUSEHOLD_PATH}/${op.path}`);
            if (op.remove) batch.delete(ref);
            else batch.set(ref, op.data);
          }
          await batch.commit();
        }
        if (session.cancelled) return;
        for (const [path, data] of writes) session.lastSynced.set(path, stableStringify(data));
        for (const path of deletes) session.lastSynced.delete(path);
        setStatus("synced");
      } catch (error) {
        console.error("Cloud sync write failed", error);
        if (!session.cancelled) setStatus("error");
      }
    };
    session.flush = flush;

    const applyRemote = () => {
      if (session.cancelled || !session.remote.profiles || !session.remote.txchunks) return;
      const remoteDocs = new Map([...session.remote.profiles, ...session.remote.txchunks]);
      const remoteStrings = new Map([...remoteDocs].map(([path, data]) => [path, stableStringify(data)]));
      const firstLoad = !session.ready;

      if (firstLoad && remoteDocs.size === 0) {
        // Nothing in the cloud yet. Only trust an answer confirmed by the
        // server (an empty local cache while offline must not trigger a seed
        // that could overwrite real data). Seed the cloud from this device.
        if (session.fromCache.profiles || session.fromCache.txchunks) return;
        session.ready = true;
        void flush();
        return;
      }

      if (!firstLoad) {
        // Skip no-op snapshots (metadata-only changes, echoes of our own writes).
        if (remoteStrings.size === session.lastSynced.size &&
          [...remoteStrings].every(([path, text]) => session.lastSynced.get(path) === text)) {
          return;
        }
      }

      const merged = new Map(remoteDocs);
      if (firstLoad) {
        // The cloud copy wins on first load; keep a backup of whatever this
        // device had locally in case sign-in order ever replaces real data.
        try {
          localStorage.setItem(PRESYNC_BACKUP_KEY, JSON.stringify(stateRef.current));
        } catch {
          // Backup is best-effort only.
        }
      } else {
        // Preserve local edits that have not been written yet: any document
        // whose local content differs from the last synced version stays local.
        const localDocs = stateToDocs(stateRef.current);
        for (const [path, data] of localDocs) {
          if (stableStringify(data) !== session.lastSynced.get(path)) merged.set(path, data);
        }
      }

      session.lastSynced = remoteStrings;
      session.ready = true;
      setProfileState(docsToState(merged, stateRef.current.activeProfileId));
      setStatus("synced");
      // If dirty local documents were preserved, the debounced save effect
      // re-runs after setProfileState and writes them out.
    };

    const subscribe = (name) => onSnapshot(
      collection(db, `${HOUSEHOLD_PATH}/${name}`),
      { includeMetadataChanges: true },
      (snapshot) => {
        session.remote[name] = new Map(snapshot.docs.map((item) => [`${name}/${item.id}`, item.data()]));
        session.fromCache[name] = snapshot.metadata.fromCache;
        applyRemote();
      },
      (error) => {
        console.error(`Cloud sync listener failed (${name})`, error);
        if (!session.cancelled) setStatus("error");
      }
    );

    const unsubscribes = [subscribe("profiles"), subscribe("txchunks")];
    return () => {
      session.cancelled = true;
      clearTimeout(session.flushTimer);
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [user, setProfileState]);

  useEffect(() => {
    const session = sessionRef.current;
    if (!session || session.cancelled || !session.ready) return undefined;
    clearTimeout(session.flushTimer);
    session.flushTimer = setTimeout(() => void session.flush(), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(session.flushTimer);
  }, [profileState]);

  useEffect(() => {
    // Push any pending edits immediately when the tab is backgrounded or
    // closed so the debounce window cannot swallow the last change.
    const flushNow = () => {
      const session = sessionRef.current;
      if (session && !session.cancelled && session.ready) void session.flush();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushNow();
    };
    window.addEventListener("pagehide", flushNow);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", flushNow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return status;
}

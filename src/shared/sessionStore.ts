import type { Session, SessionStatus } from './types';

// ── internal state ────────────────────────────────────────────────────────────

let _sessions: Session[] = [];
let _nextId = 1;

type Listener = (sessions: Session[]) => void;
const _listeners: Set<Listener> = new Set();

function _notify() {
  const snapshot = [..._sessions];
  _listeners.forEach((fn) => fn(snapshot));
}

// ── public API ────────────────────────────────────────────────────────────────

/** Subscribe to any change. Returns an unsubscribe function. */
export function onSessionsChange(listener: Listener): () => void {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

/** Return a shallow copy of all sessions. */
export function getSessions(): Session[] {
  return [..._sessions];
}

/** Find one session by id, or undefined. */
export function getSession(id: string): Session | undefined {
  return _sessions.find((s) => s.id === id);
}

/** Create a new session. Returns the created session. */
export function addSession(name: string, agentId: string): Session {
  const session: Session = {
    id: String(_nextId++),
    name: name.trim(),
    agentId,
    status: 'idle',
  };
  _sessions = [..._sessions, session];
  _notify();
  return session;
}

/** Rename an existing session. No-op if id not found. */
export function renameSession(id: string, name: string): void {
  const idx = _sessions.findIndex((s) => s.id === id);
  if (idx === -1) return;
  _sessions = _sessions.map((s) => (s.id === id ? { ...s, name: name.trim() } : s));
  _notify();
}

/** Update the status of an existing session. No-op if id not found. */
export function setSessionStatus(id: string, status: SessionStatus): void {
  const idx = _sessions.findIndex((s) => s.id === id);
  if (idx === -1) return;
  _sessions = _sessions.map((s) => (s.id === id ? { ...s, status } : s));
  _notify();
}

/** Remove a session by id. No-op if id not found. */
export function deleteSession(id: string): void {
  const before = _sessions.length;
  _sessions = _sessions.filter((s) => s.id !== id);
  if (_sessions.length !== before) _notify();
}

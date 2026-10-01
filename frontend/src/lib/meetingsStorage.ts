// lib/meetingsStorage.ts
//wurde für die DB komplett überarbeitet.
import type { Meeting } from "@/types/meeting";

const API_BASE = "http://localhost:8000";

export async function getMeetings(): Promise<Meeting[]> {
  const res = await fetch(`${API_BASE}/meetings`);
  if (!res.ok) throw new Error("Meetings konnten nicht geladen werden.");
  return res.json();
}

export async function getMeetingById(id: string): Promise<Meeting | undefined> {
  const res = await fetch(`${API_BASE}/meetings/${id}`);
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error("Meeting konnte nicht geladen werden.");
  return res.json();
}

export interface NewMeetingInput {
  title: string;
  audioFileName: string;
  date: string;
  type: "online" | "praesenz";
  transcript: string;
  summary: string;
  keyPoints?: string;
}

export async function saveMeeting(meeting: NewMeetingInput): Promise<Meeting> {
  const res = await fetch(`${API_BASE}/meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(meeting),
  });
  if (!res.ok) throw new Error("Meeting konnte nicht gespeichert werden.");
  const saved = await res.json();
  window.dispatchEvent(new Event("meetingsUpdated"));
  return saved;
}

export async function deleteMeeting(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/meetings/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Meeting konnte nicht gelöscht werden.");
  window.dispatchEvent(new Event("meetingsUpdated"));
}

// lib/meetingsStorage.ts
import type { Meeting } from "@/types/meeting";

const STORAGE_KEY = "meetings";

export function getMeetings(): Meeting[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveMeeting(meeting: Meeting): void {
  const meetings = getMeetings();
  meetings.unshift(meeting);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));

  // Navbar über Änderungen informieren, damit die Anzahl der Meetings aktualisiert wird
  window.dispatchEvent(new Event("meetingsUpdated"));
}

export function getMeetingById(id: string): Meeting | undefined {
  return getMeetings().find((meeting) => meeting.id === id);
}

export function deleteMeeting(id: string): void {
  const meetings = getMeetings().filter((meeting) => meeting.id !== id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));

  window.dispatchEvent(new Event("meetingsUpdated"));
}

export function updateMeeting(meeting: Meeting): void {
  const meetings = getMeetings();

  const updatedMeetings = meetings.map((existingMeeting) =>
    existingMeeting.id === meeting.id ? meeting : existingMeeting,
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMeetings));

  window.dispatchEvent(new Event("meetingsUpdated"));
}

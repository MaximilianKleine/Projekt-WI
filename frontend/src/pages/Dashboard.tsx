import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Meeting } from "@/types/meeting";
import { getMeetings } from "@/lib/meetingsStorage";

function Dashboard() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    setMeetings(getMeetings());
  }, []);

  const totalMeetings = meetings.length;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <header>
        <p className="text-lg font-medium">Übersicht</p>
        <p className="text-xs text-gray-500">Willkommen zurück</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        <Card className="w-fit">
          <CardContent className="space-y-1">
            <p className="text-xs text-gray-500">Meetings gesamt</p>
            <p className="text-3xl font-bold">{totalMeetings}</p>
            <p className="text-xs text-gray-500">
              {totalMeetings === 0
                ? "Noch keine Meetings erstellt"
                : `gespeicherte Meetings`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Zuletzt verarbeitet (wie vorher: Liste) */}
      <Card className="overflow-hidden">
        <p className="px-5 pt-4 pb-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
          Zuletzt verarbeitet
        </p>

        {meetings.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-500">
            Noch keine Meetings vorhanden.
          </p>
        ) : (
          meetings.slice(0, 5).map((meeting, index) => (
            <div
              key={meeting.id}
              className={`flex items-center gap-3.5 px-5 py-3 hover:bg-muted/50 transition-colors ${
                index < meetings.slice(0, 5).length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{meeting.title}</p>

                <p className="text-xs text-muted-foreground">
                  {meeting.date} ·{" "}
                  {meeting.type === "online" ? "Online" : "Präsenz"}
                </p>
              </div>

              <span className="text-xs font-medium px-2.5 py-1 rounded-full text-green-700 bg-green-100">
                Fertig
              </span>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

export default Dashboard;

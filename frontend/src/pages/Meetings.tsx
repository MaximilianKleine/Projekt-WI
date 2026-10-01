import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NewMeetingDialog } from "@/components/NewMeetingDialog";
import type { Meeting } from "@/types/meeting";
import { getMeetings, deleteMeeting } from "@/lib/meetingsStorage";
import { Trash2, Calendar, Globe, Building2, FileAudio } from "lucide-react";
import { toast } from "sonner";

function Meetings() {
  // Speichert alle vorhandenen Meetings im Komponentenstatus
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  /**
   * Lädt alle gespeicherten Meetings aus dem lokalen Speicher
   * und aktualisiert den Zustand der Komponente.
   */
  function loadMeetings() {
    setMeetings(getMeetings());
  }

  const filteredMeetings = meetings.filter((meeting) =>
    meeting.title.toLowerCase().includes(search.toLowerCase()),
  );

  /**
   * Wird einmal beim ersten Rendern der Komponente ausgeführt,
   * um die vorhandenen Meetings zu laden.
   */
  useEffect(() => {
    loadMeetings();
  }, []);

  function handleDelete(id: string) {
    if (!window.confirm("Meeting wirklich löschen?")) {
      return;
    }

    deleteMeeting(id);
    loadMeetings();

    toast.success("Meeting wurde gelöscht.");
  }

  return (
    <div className="p-4 space-y-6">
      {/* Kopfbereich mit Titel, Anzahl der Meetings und Upload-Button */}
      <header className="flex justify-between items-stretch">
        <div>
          <p className="text-lg font-medium">Alle Meetings</p>

          {/* Dynamische Anzeige der Anzahl gespeicherter Meetings */}
          <p className="text-xs text-gray-500">
            {meetings.length} Aufnahme
            {meetings.length !== 1 ? "n" : ""}
          </p>
        </div>

        <input
          type="text"
          placeholder="Meeting suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Dialog zum Erstellen bzw. Hochladen eines neuen Meetings.
            Nach erfolgreicher Erstellung wird die Meetingliste aktualisiert. */}
        <NewMeetingDialog onMeetingCreated={loadMeetings}>
          <Button
            variant="outline"
            className="h-full bg-blue-400 hover:bg-blue-500 text-white rounded-xl p-2"
          >
            Meeting erstellen
          </Button>
        </NewMeetingDialog>
      </header>

      {/* Hauptbereich mit der Liste aller Meetings */}
      <main className="max-w-4xl">
        <Card className="overflow-hidden">
          {filteredMeetings.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-500">
              Noch keine Meetings vorhanden.
            </p>
          ) : (
            filteredMeetings.map((meeting, index) => (
              <div
                key={meeting.id}
                onClick={() => navigate(`/meetings/${meeting.id}`)}
                className={`flex cursor-pointer items-center gap-3.5 px-5 py-3.5
                  transition-all duration-200
                  hover:bg-white hover:shadow-sm hover:scale-[1.01]
                  ${index < filteredMeetings.length - 1 ? "border-b" : ""}
                  `}
              >
                <div
                  className={`w-1 self-stretch rounded-full mr-2 ${
                    meeting.type === "online" ? "bg-blue-400" : "bg-green-400"
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {meeting.title}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {meeting.date}
                    </span>

                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                        meeting.type === "online"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {meeting.type === "online" ? (
                        <Globe className="h-3.5 w-3.5" />
                      ) : (
                        <Building2 className="h-3.5 w-3.5" />
                      )}

                      {meeting.type === "online" ? "Online" : "Präsenz"}
                    </span>

                    <span className="flex items-center gap-1">
                      <FileAudio className="h-3.5 w-3.5" />
                      {meeting.audioFileName}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(meeting.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </Card>
      </main>
    </div>
  );
}

export default Meetings;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import type { Meeting } from "@/types/meeting";
import { getMeetingById } from "@/lib/meetingsStorage";
import {
  Calendar,
  Globe,
  Building2,
  FileAudio,
  //FileText,
  //ScrollText,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Download } from "lucide-react";
import { toast } from "sonner";

/**
 * meeting -> useState<Meeting keine variable mehr sondern ein state
 *
 */

function MeetingDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }

    const meetingId = id;
    let ignore = false;

    async function load() {
      const result = await getMeetingById(meetingId);
      if (!ignore) {
        setMeeting(result ?? null);
        setLoading(false);
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [id]);

  async function copyToClipboard(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch {
      toast.error("Kopieren fehlgeschlagen.");
    }
  }

  function downloadText(filename: string, text: string) {
    try {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();

      URL.revokeObjectURL(url);
      toast.success(`${filename} heruntergeladen`);
    } catch {
      toast.error("Download fehlgeschlagen.");
    }
  }

  if (!id) {
    return (
        <div className="p-6">
          <p>Keine Meeting-ID angegeben.</p>
        </div>
    );
  }

  if (loading) {
    return (
        <div className="p-6">
          <p>Meeting wird geladen...</p>
        </div>
    );
  }

  if (!meeting) {
    return (
        <div className="p-6">
          <p>Meeting wurde nicht gefunden.</p>
        </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Titel */}
      <div className="space-y-4">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zu den Meetings
        </Button>
        <h1 className="text-3xl font-bold">{meeting.title}</h1>

        {/* Meetinginformationen */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>{meeting.date}</span>
            </div>

            <div className="flex items-center gap-2">
              {meeting.type === "online" ? (
                <Globe className="h-4 w-4 text-blue-500" />
              ) : (
                <Building2 className="h-4 w-4 text-blue-500" />
              )}

              <span>{meeting.type === "online" ? "Online" : "Präsenz"}</span>
            </div>

            <div className="flex items-center gap-2">
              <FileAudio className="h-4 w-4 text-blue-500" />
              <span>{meeting.audioFileName}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Zusammenfassung */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Zusammenfassung</h2>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                copyToClipboard(meeting.summary, "Zusammenfassung kopiert")
              }
            >
              <>
                <Copy className="h-4 w-4 mr-2" />
                Kopieren
              </>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadText(
                  `${meeting.title}-Zusammenfassung.txt`,
                  meeting.summary,
                )
              }
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="prose max-w-none leading-7">
          <ReactMarkdown>{meeting.summary}</ReactMarkdown>
        </div>
      </Card>

      {/* Transkript */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Transkript</h2>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                copyToClipboard(meeting.transcript, "Transkript kopiert")
              }
            >
              <>
                <Copy className="h-4 w-4 mr-2" />
                Kopieren
              </>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadText(
                  `${meeting.title}-Transkript.txt`,
                  meeting.transcript,
                )
              }
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="whitespace-pre-wrap leading-7">
          {meeting.transcript}
        </div>
      </Card>
    </div>
  );
}

export default MeetingDetails;

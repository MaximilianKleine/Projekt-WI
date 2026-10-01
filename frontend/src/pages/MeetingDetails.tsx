import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getMeetingById, updateMeeting } from "@/lib/meetingsStorage";
import {
  Calendar,
  Globe,
  Building2,
  FileAudio,
  Copy,
  Download,
  ArrowLeft,
  Plus,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CollapsibleText } from "@/components/CollapsibleText";
import kreisLippeLogo from "@/assets/KreisLippeLogo.png";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ImageRun,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
} from "docx";

type LoadedImage = {
  buffer: ArrayBuffer;
  width: number;
  height: number;
};

// Lädt ein PNG als ArrayBuffer (für ImageRun) und ermittelt zusätzlich
// die natürlichen Bildmaße, damit das Seitenverhältnis im Word-Dokument
// nicht verzerrt wird.
async function loadImageAsArrayBuffer(url: string): Promise<LoadedImage> {
  const [response, dimensions] = await Promise.all([
    fetch(url),
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () =>
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () =>
        reject(new Error(`Bild konnte nicht geladen werden: ${url}`));
      img.src = url;
    }),
  ]);

  if (!response.ok) {
    throw new Error(`Bild konnte nicht geladen werden: ${url}`);
  }

  const buffer = await response.arrayBuffer();

  return {
    buffer,
    width: dimensions.width || 1,
    height: dimensions.height || 1,
  };
}

// Entfernt einfache Markdown-Syntax für die Word-Darstellung
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/`{1,3}([^`]*)`{1,3}/g, "$1")
    .replace(/^[-*]\s+/gm, "• ");
}

// Wandelt einen Textblock in mehrere Word-Paragraph-Objekte um (ein Absatz pro Zeile)
function textToParagraphs(text: string): Paragraph[] {
  return text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map(
      (line) =>
        new Paragraph({
          children: [new TextRun({ text: line, size: 22 })], // 11pt
          spacing: { after: 120 },
        }),
    );
}

function MeetingDetails() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [meeting, setMeeting] = useState(() => {
    if (!id) {
      return undefined;
    }

    return getMeetingById(id);
  });

  const [newParticipant, setNewParticipant] = useState("");

  useEffect(() => {
    if (!id) {
      setMeeting(undefined);
      return;
    }

    setMeeting(getMeetingById(id));
  }, [id]);

  if (!meeting) {
    return (
      <div className="p-6">
        <p>Meeting wurde nicht gefunden.</p>
      </div>
    );
  }

  const participants = meeting.participants ?? [];

  const [logoImage, setLogoImage] = useState<LoadedImage | null>(null);

  useEffect(() => {
    loadImageAsArrayBuffer(kreisLippeLogo)
      .then(setLogoImage)
      .catch((err) => {
        console.error("Logo konnte nicht geladen werden:", err);
        setLogoImage(null);
      });
  }, []);

  if (!id) {
    return (
      <div className="p-6">
        <p>Keine Meeting-ID angegeben.</p>
      </div>
    );
  }

  meeting;

  // Debug: einmal prüfen, was tatsächlich aus dem Storage kommt.
  // Danach wieder entfernen.
  console.log("meeting:", meeting);

  if (!meeting) {
    return (
      <div className="p-6">
        <p>Meeting wurde nicht gefunden.</p>
      </div>
    );
  }

  function addParticipant() {
    const name = newParticipant.trim();

    if (!name) {
      toast.error("Bitte einen Namen eingeben.");
      return;
    }

    const alreadyExists = participants.some(
      (participant) => participant.toLowerCase() === name.toLowerCase(),
    );

    if (alreadyExists) {
      toast.error("Diese Person ist bereits als Teilnehmer eingetragen.");
      return;
    }

    const updatedMeeting = {
      ...meeting,
      participants: [...participants, name],
    };

    updateMeeting(updatedMeeting);
    setMeeting(updatedMeeting);
    setNewParticipant("");

    toast.success("Teilnehmer hinzugefügt.");
  }

  function removeParticipant(participantToRemove: string) {
    const updatedMeeting = {
      ...meeting,
      participants: participants.filter(
        (participant) => participant !== participantToRemove,
      ),
    };

    updateMeeting(updatedMeeting);
    setMeeting(updatedMeeting);

    toast.success("Teilnehmer entfernt.");
  }

  async function copyToClipboard(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch {
      toast.error("Kopieren fehlgeschlagen.");
    }
  }

  async function downloadMeetingWord() {
    try {
      const headerChildren: Paragraph[] = [];

      if (logoImage) {
        const displayWidth = 90;
        const displayHeight = Math.round(
          (logoImage.height / logoImage.width) * displayWidth,
        );

        headerChildren.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new ImageRun({
                data: logoImage.buffer,
                type: "png",
                transformation: {
                  width: displayWidth,
                  height: displayHeight,
                },
              }),
            ],
          }),
        );
      }

      const metaText = `${meeting.date}  •  ${
        meeting.type === "online" ? "Online" : "Präsenz"
      }  •  ${meeting.audioFileName}`;

      const summaryPlain = stripMarkdown(meeting.summary);
      const hasKeyPoints =
        meeting.keyPoints && meeting.keyPoints.trim().length > 0;
      const keyPointsPlain = hasKeyPoints
        ? stripMarkdown(meeting.keyPoints)
        : "";

      const bodyChildren: Paragraph[] = [
        new Paragraph({
          text: meeting.title,
          heading: HeadingLevel.TITLE,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: metaText,
              italics: true,
              size: 20,
              color: "666666",
            }),
          ],
          spacing: { after: 300 },
        }),
        new Paragraph({
          text: "Zusammenfassung",
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 150 },
        }),
        ...textToParagraphs(summaryPlain),
      ];

      if (hasKeyPoints) {
        bodyChildren.push(
          new Paragraph({
            text: "Wichtigste Punkte",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 150 },
          }),
          ...textToParagraphs(keyPointsPlain),
        );
      }

      bodyChildren.push(
        new Paragraph({
          text: "Transkript",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 150 },
        }),
        ...textToParagraphs(meeting.transcript),
      );

      const doc = new Document({
        sections: [
          {
            headers: {
              default: new Header({ children: headerChildren }),
            },
            footers: {
              default: new Footer({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: "Seite " }),
                      new TextRun({ children: [PageNumber.CURRENT] }),
                      new TextRun({ text: " von " }),
                      new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
                    ],
                  }),
                ],
              }),
            },
            children: bodyChildren,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${meeting.title}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Word-Datei heruntergeladen");
    } catch (err) {
      console.error("Word-Export-Fehler:", err);
      toast.error("Word-Download fehlgeschlagen.");
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Titel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zu den Meetings
          </Button>

          <Button variant="default" size="sm" onClick={downloadMeetingWord}>
            <Download className="h-4 w-4 mr-2" />
            Word-Datei herunterladen
          </Button>
        </div>

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

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Teilnehmer</h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {participants.length > 0 ? (
            participants.map((participant) => (
              <div
                key={participant}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm"
              >
                <span>{participant}</span>

                <button
                  type="button"
                  onClick={() => removeParticipant(participant)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title={`${participant} entfernen`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              Keine Teilnehmer
            </span>
          )}
        </div>

        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={newParticipant}
            onChange={(event) => setNewParticipant(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addParticipant();
              }
            }}
            placeholder="Teilnehmer hinzufügen..."
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />

          <Button type="button" size="sm" onClick={addParticipant}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Zusammenfassung & Keypoints */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Zusammenfassung & Keypoints</h2>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                copyToClipboard(
                  meeting.keyPoints && meeting.keyPoints.trim().length > 0
                    ? `${meeting.summary}\n\nWichtigste Punkte:\n${meeting.keyPoints}`
                    : meeting.summary,
                  "Zusammenfassung kopiert",
                )
              }
            >
              <>
                <Copy className="h-4 w-4 mr-2" />
                Kopieren
              </>
            </Button>
          </div>
        </div>

        <div className="prose max-w-none leading-7">
          <ReactMarkdown>{meeting.summary}</ReactMarkdown>
        </div>

        {/* Keypoints */}
        {meeting.keyPoints && meeting.keyPoints.trim().length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Wichtigste Punkte
            </h3>
            <div className="prose max-w-none leading-7">
              <ReactMarkdown>{meeting.keyPoints}</ReactMarkdown>
            </div>
          </div>
        )}
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
          </div>
        </div>

        <div className="whitespace-pre-wrap leading-7">
          <CollapsibleText text={meeting.transcript} maxLength={800} />
        </div>
      </Card>
    </div>
  );
}

export default MeetingDetails;

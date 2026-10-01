import { useState } from "react";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { saveMeeting } from "@/lib/meetingsStorage"; //änderung für DB und meetingStorage.ts
import { processMeeting } from "@/lib/api";
import { toast } from "sonner";

interface NewMeetingDialogProps {
  onMeetingCreated: () => void;
  children?: ReactNode;
}

export function NewMeetingDialog({
  onMeetingCreated,
  children,
}: NewMeetingDialogProps) {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [date, setDate] = useState("");
  const [type, setType] = useState<"online" | "praesenz">("online");

  const [status, setStatus] = useState<
    "idle" | "uploading" | "processing" | "success" | "error"
  >("idle");

  const [progress, setProgress] = useState(0);

  function resetForm() {
    setTitle("");
    setNewFile(null);
    setDate("");
    setType("online");
    setStatus("idle");
    setProgress(0);
  }

  async function handleSubmit() {
    if (!title || !date || !newFile) {
      toast.warning("Bitte alle Pflichtfelder ausfüllen.");
      return;
    }

    try {
      setStatus("uploading");
      setProgress(0);
      toast.info("Meeting wird verarbeitet. Dies kann einige Minuten dauern.");

      // Audiodatei ans Backend schicken
      const data = await processMeeting(
        newFile,
        (progress) => setProgress(progress),
        (status) => setStatus(status),
      );
      console.log("Antwort vom Backend:", data);

      //änderung für DB
      await saveMeeting({
        title,
        audioFileName: data.filename,
        date,
        type,
        transcript: data.transcript,
        summary: data.summary,
        keyPoints: data.keyPoints,
      });

      toast.success("Meeting erfolgreich erstellt.");

      resetForm();
      setOpen(false);
      onMeetingCreated();
    } catch (error) {
      console.error(error);
      setStatus("error");
      toast.error("Fehler beim Hochladen oder Verarbeiten der Audiodatei.");
    } finally {
      setProgress(0);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button>Meeting erstellen</Button>}
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Neues Meeting erstellen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Name des Meetings</Label>

            <Input
              id="title"
              className="transition-all hover:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Sprint Planning KW 25"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newFile">Audiodatei</Label>

            <Input
              id="newFile"
              type="file"
              accept="audio/*"
              className="cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-blue-400 file:px-2 file:py-1 file:text-sm file:font-medium file:text-white hover:file:bg-blue-500"
              onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Upload-Fortschritt */}
          {status === "uploading" && (
            <div className="space-y-2 mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-sm text-gray-500">
                Datei wird hochgeladen... {progress}%
              </p>
            </div>
          )}

          {/* Verarbeitung */}
          {status === "processing" && (
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span>Transkript und Zusammenfassung werden erstellt...</span>
            </div>
          )}

          {/* Fehler */}
          {status === "error" && (
            <p className="text-red-500 text-sm mt-2">
              Fehler beim Verarbeiten der Datei.
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Datum</Label>

            <Input
              id="date"
              type="date"
              className="transition-all hover:border-blue-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Art des Meetings</Label>

            <Select
              value={type}
              onValueChange={(v) => setType(v as "online" | "praesenz")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="praesenz">Präsenz</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => setOpen(false)}
            disabled={status === "uploading" || status === "processing"}
            variant="outline"
          >
            Abbrechen
          </Button>

          <Button
            className="bg-blue-400 hover:bg-blue-500 text-white"
            onClick={handleSubmit}
            disabled={status === "uploading" || status === "processing"}
          >
            {status === "uploading" || status === "processing"
              ? "Wird verarbeitet..."
              : "Meeting erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

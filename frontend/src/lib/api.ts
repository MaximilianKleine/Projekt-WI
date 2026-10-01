const API_URL = "http://localhost:8000/process";

export interface ProcessMeetingResponse {
  filename: string;
  transcript: string;
  summary: string;
  keyPoints: string;
}

export async function processMeeting(
  file: File,
  onProgress?: (progress: number) => void,
  onStatusChange?: (status: "uploading" | "processing") => void,
): Promise<ProcessMeetingResponse> {
  const formData = new FormData();
  formData.append("audio", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Upload-Fortschritt
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);

        onProgress?.(progress);

        // Während des Uploads immer "uploading"
        onStatusChange?.("uploading");
      }
    });

    // Sobald der Upload wirklich abgeschlossen ist,
    // beginnt die Serververarbeitung.
    xhr.upload.onload = () => {
      onStatusChange?.("processing");
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error("Fehler beim Verarbeiten der Audiodatei."));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Netzwerkfehler."));
    };

    xhr.open("POST", API_URL);
    xhr.send(formData);
  });
}

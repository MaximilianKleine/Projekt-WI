// import { useState, useRef, useCallback } from "react";

// // URL des Backend-Endpunkts für den Upload und die Verarbeitung der Audiodatei
// const API_URL = "http://localhost:8000/process";

// function Hochladen() {
//   // Zustände für Datei, Uploadstatus, Fortschritt und Drag-and-Drop
//   const [file, setFile] = useState<File | null>(null);
//   const [status, setStatus] = useState("idle"); // idle | uploading | processing | success | error
//   const [progress, setProgress] = useState(0);
//   const [dragOver, setDragOver] = useState(false);
//   const [result, setResult] = useState(null);

//   // Referenz auf das versteckte Datei-Input
//   const inputRef = useRef<HTMLInputElement | null>(null);

//   /**
//    * Prüft, ob eine gültige Audiodatei ausgewählt wurde.
//    * Setzt anschließend die Datei und setzt den Uploadstatus zurück.
//    */
//   const handleFile = useCallback((f) => {
//     if (!f || !f.type.startsWith("audio/")) return;

//     setFile(f);
//     setStatus("idle");
//     setProgress(0);
//   }, []);

//   /**
//    * Behandelt das Ablegen einer Datei in der Drag-and-Drop-Zone.
//    */
//   const handleDrop = (e) => {
//     e.preventDefault();
//     setDragOver(false);
//     handleFile(e.dataTransfer.files[0]);
//   };

//   /**
//    * Lädt die ausgewählte Audiodatei zum Backend hoch.
//    * Während des Uploads wird der Fortschritt angezeigt.
//    * Nach abgeschlossenem Upload verarbeitet der Server die Datei
//    * (Whisper-Transkription + LLM-Auswertung).
//    */
//   const upload = async () => {
//     if (!file) return;
//     setStatus("uploading");
//     setProgress(0);

//     const formData = new FormData();
//     formData.append("audio", file);

//     try {
//       const response = await new Promise<string>((resolve, reject) => {
//         const xhr = new XMLHttpRequest();

//         xhr.upload.addEventListener("progress", (e) => {
//           if (e.lengthComputable) {
//             const pct = Math.round((e.loaded / e.total) * 100);
//             setProgress(pct);
//             if (pct === 100) setStatus("processing");
//           }
//         });

//         xhr.addEventListener("load", () =>
//           xhr.status >= 200 && xhr.status < 300
//             ? resolve(xhr.response as string)
//             : reject(xhr.status),
//         );
//         xhr.addEventListener("error", reject);
//         xhr.open("POST", API_URL);
//         xhr.send(formData);
//       });

//       const data = JSON.parse(response); // String -> Objekt
//       console.log(data); // hier siehst du es in der Konsole
//       setResult(data); // hier speicherst du es im State, um es anzuzeigen

//       setStatus("success");
//       setProgress(100);
//     } catch (err) {
//       console.error(err);
//       setStatus("error");
//     }
//   };

//   /**
//    * Setzt alle Zustände zurück und entfernt die ausgewählte Datei.
//    */
//   const reset = () => {
//     setFile(null);
//     setStatus("idle");
//     setProgress(0);
//   };

//   return (
//     <div className="max-w-lg mx-auto mt-8 flex flex-col gap-4">
//       {/* Bereich für Drag-and-Drop oder Dateiauswahl */}
//       <div
//         onClick={() => inputRef.current?.click()}
//         onDragOver={(e) => {
//           e.preventDefault();
//           setDragOver(true);
//         }}
//         onDragLeave={() => setDragOver(false)}
//         onDrop={handleDrop}
//         className={`
//           border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
//           ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"}
//           ${file ? "border-green-400 bg-green-50 border-solid" : ""}
//         `}
//       >
//         {/* Verstecktes Datei-Input */}
//         <input
//           ref={inputRef}
//           type="file"
//           accept="audio/*"
//           className="hidden"
//           onChange={(e) => {
//             const file = e.target.files?.[0];
//             if (!file) return;
//             handleFile(file);
//           }}
//         />

//         {/* Anzeige der ausgewählten Datei oder Upload-Hinweis */}
//         {file ? (
//           <div>
//             <p className="font-medium text-green-700">{file.name}</p>
//             <p className="text-sm text-gray-500">
//               {(file.size / 1024 / 1024).toFixed(2)} MB
//             </p>
//           </div>
//         ) : (
//           <div>
//             <p className="font-medium text-gray-700">Audiodatei hier ablegen</p>
//             <p className="text-sm text-gray-400 mt-1">
//               oder klicken zum Auswählen
//             </p>
//             <p className="text-xs text-gray-300 mt-2">MP3, WAV, M4A, OGG</p>
//           </div>
//         )}
//       </div>

//       {/* Fortschrittsbalken während des Uploads */}
//       {status === "uploading" && (
//         <div className="w-full bg-gray-200 rounded-full h-2">
//           <div
//             className="bg-blue-400 h-2 rounded-full transition-all"
//             style={{ width: `${progress}%` }}
//           />
//         </div>
//       )}

//       {/* Ladeanimation während der Serververarbeitung */}
//       {status === "processing" && (
//         <div className="flex items-center gap-2 text-sm text-gray-600">
//           <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
//           <span>
//             Transkription &amp; Analyse läuft – das kann etwas dauern…
//           </span>
//         </div>
//       )}

//       {/* Erfolgs- bzw. Fehlermeldung */}
//       {status === "success" && (
//         <p className="text-green-600 text-sm font-medium">
//           ✓ Fertig – Transkription abgeschlossen
//         </p>
//       )}

//       {status === "error" && (
//         <p className="text-red-500 text-sm font-medium">✗ Fehler beim Upload</p>
//       )}

//       {/* Steuerungsbuttons */}
//       <div className="flex gap-2">
//         {/* Startet Upload und Verarbeitung */}
//         <button
//           onClick={upload}
//           disabled={!file || status === "uploading" || status === "processing"}
//           className="flex-1 bg-blue-400 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//         >
//           {status === "uploading" && `Wird hochgeladen… ${progress}%`}
//           {status === "processing" && "Wird verarbeitet…"}
//           {(status === "idle" || status === "success" || status === "error") &&
//             "Hochladen & Transkribieren"}
//         </button>

//         {/* Setzt die Oberfläche zurück */}
//         <button
//           onClick={reset}
//           className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
//         >
//           ✕
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Hochladen;

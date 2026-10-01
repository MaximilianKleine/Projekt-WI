import os
import tempfile

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# KONFIGURATION
# Serveradressen werden aus der .env-Datei geladen (Vorlage: .env.example)

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))


def _require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(
            f"Umgebungsvariable {name} fehlt. Bitte .env anhand von .env.example anlegen."
        )
    return value.rstrip("/")


OLLAMA_URL   = _require_env("OLLAMA_URL")
OLLAMA_MODEL = "gemma4:26b"
WHISPER_URL  = _require_env("WHISPER_URL")

# PROMPTS
# Hier können die Prompts für die KI angepasst werden.
# {transcript} wird automatisch durch das echte Transkript ersetzt.

SUMMARY_PROMPT = """\
Du bist ein Meeting-Assistent.
Erstelle eine Zusammenfassung vom folgenden Transkript.
Gib nur die Zusammenfassung aus, keinen weiteren Text.

Transkript:
{transcript}

Zusammenfassung:\
"""

KEY_POINTS_PROMPT = """\
Du bist ein Meeting-Assistent.
Erstelle eine Liste der wichtigsten Punkte aus dem folgenden Transkript.
Gib nur die Liste aus, keinen weiteren Text.

Transkript:
{transcript}

Wichtigste Punkte:\
"""

# RESPONSE SCHEMA
# Definiert was der Endpoint zurückgibt

class ProcessResponse(BaseModel):
    """Ergebnis der Verarbeitung einer hochgeladenen Audiodatei."""

    filename: str = Field(
        description="Dateiname der hochgeladenen Audiodatei, wie er vom Client übertragen wurde.",
        examples=["projektbesprechung.mp3"],
    )
    transcript: str = Field(
        description=(
            "Vollständiges Transkript der Audiodatei, erzeugt vom Whisper-Server. "
            "Enthält keine Sprecherzuordnung und kann Erkennungsfehler enthalten."
        ),
        examples=["Also, dann fangen wir an. Thema heute ist der Zeitplan für das Backend ..."],
    )
    summary: str = Field(
        description="Zusammenfassung des Meetings als Fließtext, erzeugt vom Sprachmodell.",
        examples=["In der Besprechung wurde der Zeitplan für das Backend festgelegt ..."],
    )
    keyPoints: str = Field(
        description=(
            "Die wichtigsten Punkte des Meetings als zusammenhängender Text, "
            "erzeugt vom Sprachmodell. Die einzelnen Punkte stehen jeweils in einer eigenen Zeile."
        ),
        examples=["- Zeitplan für das Backend wurde festgelegt\n- Schnittstelle zum Frontend bleibt unverändert"],
    )


# APP & MIDDLEWARE

app = FastAPI(
    title="Meeting Assistant",
    version="1.0.0",
    description="""
Backend des Meeting-Assistenten.

Der Dienst nimmt eine Audioaufnahme einer Besprechung entgegen und gibt
das Transkript, eine Zusammenfassung und die wichtigsten Punkte zurück.

**Ablauf einer Anfrage**

1. Das Frontend lädt eine Audiodatei hoch.
2. Das Backend leitet die Datei an den Whisper-Server weiter und erhält das Transkript.
3. Das Transkript wird zusammen mit den hinterlegten Prompts an den Ollama-Server
   (Modell `gemma4:26b`) geschickt, einmal für die Zusammenfassung und einmal für die Stichpunkte.
4. Alle Ergebnisse werden gebündelt als JSON zurückgegeben.

**Hinweis zur Laufzeit:** Transkription und Textgenerierung laufen auf einem
separaten KI-Server. Je nach Länge der Aufnahme kann eine Anfrage mehrere Minuten
dauern. Der Client sollte einen entsprechend hohen Timeout setzen.
""",
    openapi_tags=[
        {
            "name": "Meeting",
            "description": "Verarbeitung von Meeting-Aufnahmen.",
        }
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# DATENBANK

def db_save_transcript(transcript: str):
    print("Diese Funktion macht noch nichts aber es hat schonmal den Transkript welcher gespeichert werden soll als Variable")
    print(transcript)
    return

# SPEECH-TO-TEXT
# Schickt die Audiodatei an den Whisper-Server und gibt das Transkript zurück

def transcribe(file_path: str) -> str:
    """
    Schickt eine Audiodatei an den Whisper STT-Server und gibt den transkribierten Text zurück.

    Parameter:
        file_path : Pfad zur temporär gespeicherten Audiodatei

    Rückgabe:
        Transkribierter Text als String
    """
    with open(file_path, "rb") as f:
        response = requests.post(
            f"{WHISPER_URL}/transcribe",
            files={"file": (file_path, f, "audio/mp3")},
        )
    response.raise_for_status()
    return response.json()["text"]


# OLLAMA/KI ANFRAGEN
# Kommunikation mit dem Ollama-Server

def ask_ollama(prompt: str) -> str:
    # Schickt einen fertigen Prompt an den Ollama-Server und gibt die Antwort zurück.
    # Alle KI-Anfragen laufen über diese Funktion.

    # Parameter:
    #     prompt : Der vollständige Prompt-Text (inkl. Transkript)

    # Rückgabe:
    #     Antwort der KI als String

    response = requests.post(
        f"{OLLAMA_URL}/api/generate",
        json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
        timeout=1800,  # 30 Minuten
    )
    response.raise_for_status()
    return response.json()["response"]


def ask_ollama_safe(prompt: str) -> str:
    # Wrapper um ask_ollama() mit Fehlerbehandlung für den Endpoint.
    # Gibt bei Verbindungs- oder Timeout-Fehlern eine verständliche HTTP-Fehlermeldung zurück.

    # Parameter:
    #     prompt : Der vollständige Prompt-Text

    # Rückgabe:
    #     Antwort der KI als String
    try:
        return ask_ollama(prompt)
    except requests.exceptions.ConnectionError:
        raise HTTPException(503, f"Ollama nicht erreichbar unter {OLLAMA_URL}.")
    except requests.exceptions.Timeout:
        raise HTTPException(504, "Ollama hat zu lange gebraucht.")


# ENDPOINT
# Nimmt eine Audiodatei entgegen und gibt Transkript, Zusammenfassung
# und Stichpunkte zurück

@app.post(
    "/process",
    response_model=ProcessResponse,
    tags=["Meeting"],
    summary="Audioaufnahme verarbeiten",
    response_description="Transkript, Zusammenfassung und wichtigste Punkte der Aufnahme.",
)
async def process_audio(
    audio: UploadFile = File(
        description=(
            "Audiodatei der Besprechung, die verarbeitet werden soll. "
            "Die Datei wird als multipart/form-data im Feld `audio` übertragen. "
            "Die Dateiendung wird für die Weitergabe an den Whisper-Server übernommen. "
        )
    )
):
    """
    Verarbeitet eine hochgeladene Audioaufnahme einer Besprechung.

    Der Endpunkt führt den kompletten Ablauf in einer einzigen Anfrage aus und
    gibt erst nach Abschluss aller Schritte eine Antwort zurück.

    **Ablauf**

    1. Die hochgeladene Audiodatei wird temporär auf dem Server gespeichert.
    2. Die Datei wird an den Whisper-Server geschickt und transkribiert.
    3. Das Transkript wird an die Datenbankfunktion übergeben (aktuell nur Platzhalter).
    4. Aus dem Transkript wird über den Ollama-Server eine Zusammenfassung erzeugt.
    5. Aus dem Transkript wird über den Ollama-Server eine Liste der wichtigsten Punkte erzeugt.
    6. Die temporäre Datei wird gelöscht und das Ergebnis zurückgegeben.

    **Laufzeit**

    Die beiden KI-Anfragen laufen nacheinander. Je nach Länge der Aufnahme kann die
    Verarbeitung mehrere Minuten dauern, der Timeout je Ollama-Anfrage liegt bei 30 Minuten.
    Es gibt keine Zwischenmeldungen über den Fortschritt.

    **Hinweise**

    - Die Audiodatei wird nur während der Verarbeitung gespeichert und danach gelöscht.
    - Das Transkript enthält keine Sprecherzuordnung.
    - Zusammenfassung und Stichpunkte werden von einem Sprachmodell erzeugt und sollten
      vor der Weiterverwendung geprüft werden.
    """
    print("Request Start")
    # Hauptendpunkt verarbeitet eine hochgeladene Audiodatei.

    # Ablauf:
    # 1. Audiodatei temporär speichern
    # 2. Transkription via Whisper
    # 3. Zusammenfassung via Ollama generieren
    # 4. Stichpunkte via Ollama generieren
    # 5. Ergebnis ans Frontend zurückgeben

    # Audiodatei temporär auf dem Server speichern
    suffix = os.path.splitext(audio.filename or "audio")[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name
    print("Saved File")

    try:
        # Audiodatei transkribieren
        print("Starting Whisper Call")
        transcript = transcribe(tmp_path)
        db_save_transcript(transcript=transcript)
        # KI: Zusammenfassung und Stichpunkte generieren
        print("Starting first Ollama Call")
        summary    = ask_ollama_safe(SUMMARY_PROMPT.format(transcript=transcript))
        print("Starting second Ollama Call")
        key_points = ask_ollama_safe(KEY_POINTS_PROMPT.format(transcript=transcript))
    finally:
        # Temporäre Datei wird gelöscht
        os.remove(tmp_path)

    print("Finished")

    return ProcessResponse(
        filename=audio.filename,
        transcript=transcript,
        summary=summary,
        keyPoints=key_points
    )
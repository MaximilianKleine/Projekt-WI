import os
import tempfile
import uuid
from datetime import datetime, timezone
from typing import Optional

import requests
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, String, Text, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

# KONFIGURATION
# Serveradressen und Modellname hier anpassen

OLLAMA_URL   = "http://hal9000.skim.th-owl.de:11430"
OLLAMA_MODEL = "gemma4:26b"
WHISPER_URL  = "http://hal9000.skim.th-owl.de:65000"

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
    filename: str
    transcript: str
    summary: str
    keyPoints: str

# APP & MIDDLEWARE

app = FastAPI(title="Meeting Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# DATENBANK
# SQLite-Datei liegt neben main.py (meetings.db).
# Für einen Prototyp reicht das völlig aus - kein separater DB-Server nötig.

DATABASE_URL = "sqlite:///./meetings.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # nur für SQLite nötig
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class MeetingDB(Base):
    """Datenbank-Tabelle für gespeicherte Meetings."""
    __tablename__ = "meetings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    audioFileName = Column(String, nullable=False)
    date = Column(String, nullable=False)
    type = Column(String, nullable=False)  # "online" | "praesenz"
    createdAt = Column(String, nullable=False)
    transcript = Column(Text, nullable=False)
    summary = Column(Text, nullable=False)
    keyPoints = Column(Text, nullable=True)


# Erstellt die Tabelle beim Start, falls sie noch nicht existiert
Base.metadata.create_all(bind=engine)


def get_db():
    """Öffnet pro Request eine DB-Session und schließt sie danach wieder."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# SCHEMAS FÜR DIE MEETING-ENDPUNKTE

class MeetingCreate(BaseModel):
    title: str
    audioFileName: str
    date: str
    type: str
    transcript: str
    summary: str
    keyPoints: Optional[str] = None


class MeetingOut(MeetingCreate):
    id: str
    createdAt: str

    class Config:
        from_attributes = True  # erlaubt die Umwandlung von MeetingDB -> MeetingOut

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

@app.post("/process", response_model=ProcessResponse)
async def process_audio(audio: UploadFile = File()):
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


# MEETING-ENDPUNKTE (CRUD)
# Das Frontend ruft zuerst /process auf (Transkription + KI-Analyse)
# und speichert das Ergebnis anschließend hier persistent ab.

@app.post("/meetings", response_model=MeetingOut)
def create_meeting(meeting: MeetingCreate, db: Session = Depends(get_db)):
    db_meeting = MeetingDB(
        id=str(uuid.uuid4()),
        createdAt=datetime.now(timezone.utc).isoformat(),
        **meeting.model_dump(),
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting


@app.get("/meetings", response_model=list[MeetingOut])
def list_meetings(db: Session = Depends(get_db)):
    return (
        db.query(MeetingDB)
        .order_by(MeetingDB.createdAt.desc())
        .all()
    )


@app.get("/meetings/{meeting_id}", response_model=MeetingOut)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    db_meeting = db.query(MeetingDB).filter(MeetingDB.id == meeting_id).first()
    if not db_meeting:
        raise HTTPException(404, "Meeting nicht gefunden.")
    return db_meeting


@app.delete("/meetings/{meeting_id}")
def delete_meeting(meeting_id: str, db: Session = Depends(get_db)):
    db_meeting = db.query(MeetingDB).filter(MeetingDB.id == meeting_id).first()
    if not db_meeting:
        raise HTTPException(404, "Meeting nicht gefunden.")
    db.delete(db_meeting)
    db.commit()
    return {"ok": True}
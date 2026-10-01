# Projekt Wirtschaftsinformatik – Meeting AI

KI-basierte Webanwendung, mit der Behörden Sitzungen protokollieren können: Eine Audioaufnahme wird automatisch transkribiert (Whisper), zusammengefasst und in Stichpunkte gegliedert (Ollama).

## Projektstruktur

```
Projekt-WI/
├── frontend/   Weboberfläche (React, Vite, TypeScript)   → http://localhost:5173
└── python/     Backend (FastAPI)                         → http://localhost:8000
```

Das Frontend schickt hochgeladene Audiodateien an das Backend. Das Backend leitet sie an die KI-Server auf `http://localhost` weiter und gibt Transkript, Zusammenfassung und Stichpunkte zurück.

---

## Voraussetzungen

| Programm | Version | Prüfen mit |
|---|---|---|
| [Git](https://git-scm.com/) | beliebig | `git --version` |
| [Python](https://www.python.org/downloads/) | 3.10 oder neuer (getestet mit 3.14) | `python --version` |
| [Node.js](https://nodejs.org/) (inkl. npm) | 20.19+ oder 22.12+ (getestet mit 25) | `node --version` |

Außerdem müssen die KI-Server auf `http://localhost` erreichbar sein, gegebenenfalls nur im Hochschulnetz bzw. per VPN.

> **Hinweis:** Nach der Installation von Python oder Node.js ein **neues Terminal öffnen**. Bereits geöffnete Terminals kennen die neuen Befehle noch nicht.

---

## Erstinstallation

Backend und Frontend laufen gleichzeitig, jeweils in einem **eigenen Terminal**.

### 1. Repository klonen

```bash
git clone https://github.com/MaximilianKleine/Projekt-WI.git
cd Projekt-WI
```

### 2. Backend einrichten und starten (Terminal 1)

**Windows (PowerShell):**

```powershell
cd python
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn main:app --reload --port 8000
```

**macOS / Linux:**

```bash
cd python
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

- Nach dem Aktivieren steht **`(.venv)`** am Anfang der Konsolenzeile.
- In der `.env` stehen die Adressen der KI-Server (`OLLAMA_URL`, `WHISPER_URL`). Die Datei wird nicht eingecheckt. Die Vorlage `.env.example` passt für die Hochschulserver und muss normalerweise nicht geändert werden.
- Das Backend läuft, wenn **http://localhost:8000/docs** die API-Dokumentation anzeigt.
- Das Backend muss auf Port **8000** laufen, da das Frontend es dort erwartet.

### 3. Frontend einrichten und starten (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Anschließend **http://localhost:5173** im Browser öffnen und wie unter [Bedienung der Website](#bedienung-der-website) beschrieben vorgehen.

---

## Schnellstart (alles bereits installiert)

**Terminal 1 – Backend:**

```powershell
cd python
.venv\Scripts\Activate.ps1          # macOS / Linux: source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 – Frontend:**

```bash
cd frontend
npm run dev
```

Dann **http://localhost:5173** öffnen. Beenden mit **Strg + C** im jeweiligen Terminal.

> **Nach einem `git pull`:** Wenn sich `requirements.txt` oder `package.json` geändert haben, einmal `pip install -r requirements.txt` (mit aktivierter `.venv`) bzw. `npm install` ausführen. Neue Einträge in `.env.example` in die eigene `.env` übernehmen.

---

## Bedienung der Website

Backend und Frontend müssen beide laufen (siehe [Schnellstart](#schnellstart-alles-bereits-installiert)).

### 1. Anmelden

Auf der Startseite **http://localhost:5173** auf den großen blauen Button **„Einloggen“** klicken. Nutzername und Passwort müssen nicht ausgefüllt werden. Eine echte Anmeldung gibt es noch nicht, der Button führt direkt zum Dashboard.

> Der kleine dunkle „Einloggen“-Button im Formular und die Registrierung funktionieren noch nicht und führen zu einer Fehlermeldung.

### 2. Audiodatei hochladen (Meeting erstellen)

1. In der Navigation links auf **„Meetings“** klicken.
2. Oben rechts auf **„Meeting erstellen“** klicken. Es öffnet sich das Fenster „Neues Meeting erstellen“.
3. Die Felder ausfüllen:
   - **Name des Meetings** (Pflichtfeld), z. B. „Sprint Planning KW 25“
   - **Audiodatei** (Pflichtfeld): die Aufnahme auswählen
   - **Datum** (Pflichtfeld)
   - **Art des Meetings**: Online oder Präsenz
4. Unten auf **„Meeting erstellen“** klicken.

Zuerst wird die Datei hochgeladen (Fortschrittsbalken), danach verarbeitet („Transkript und Zusammenfassung werden erstellt…“). Je nach Länge der Aufnahme kann das **mehrere Minuten** dauern. Die Seite in dieser Zeit **nicht neu laden oder schließen**, denn das Meeting wird erst gespeichert, wenn die Verarbeitung abgeschlossen ist. Danach erscheint es in der Liste.

> Die Buttons **„Hochladen“** und **„Neues Meeting“** oben in der Kopfzeile haben noch keine Funktion.

### 3. Meetings verwalten

Auf der Seite **„Meetings“**:

- **Suchen:** Im Feld „Meeting suchen…“ nach dem Namen filtern.
- **Öffnen:** Auf ein Meeting klicken, um die Details anzuzeigen.
- **Löschen:** Auf das rote Papierkorb-Symbol klicken und die Abfrage bestätigen.

### 4. Meeting-Details

- **Teilnehmer:** Einen Namen in das Feld „Teilnehmer hinzufügen…“ eingeben und mit **Enter** oder dem **Plus-Button** hinzufügen. Mit dem **×** neben einem Namen wird er wieder entfernt.
- **Zusammenfassung & Keypoints:** Die von der KI erstellte Zusammenfassung und die wichtigsten Punkte. **„Kopieren“** kopiert beides in die Zwischenablage.
- **Transkript:** Der vollständige Text der Aufnahme. Lange Transkripte lassen sich mit **„Mehr anzeigen“** ausklappen. Auch hier gibt es einen **„Kopieren“**-Button.
- **Word-Datei herunterladen** (oben rechts): Erstellt ein Protokoll als `.docx` mit Titel, Datum, Art des Meetings, Dateiname, Zusammenfassung, wichtigsten Punkten und Transkript, inklusive Kreis-Lippe-Logo und Seitenzahlen. Die Teilnehmer sind darin noch nicht enthalten.
- **Zurück zu den Meetings** (oben links) führt zur vorherigen Seite zurück.

### 5. Dashboard

Das **Dashboard** zeigt die Anzahl aller gespeicherten Meetings und unter „Zuletzt verarbeitet“ die fünf neuesten Meetings. Die Einträge dort sind nicht anklickbar; geöffnet werden Meetings über die Seite „Meetings“.

### Wo werden die Meetings gespeichert?

Die Meetings werden **nur im Browser** gespeichert (Local Storage), nicht im Backend. Das bedeutet:

- Sie sind nur in dem Browser auf dem Computer sichtbar, in dem sie erstellt wurden.
- Beim Löschen der Browserdaten (Cookies und Websitedaten) gehen sie verloren.
- Sie gehören zur genauen Adresse inklusive Port: Läuft das Frontend z. B. unter `localhost:5174` statt `localhost:5173`, sind die bisherigen Meetings dort nicht zu sehen.

### Noch nicht umgesetzt

- Anmeldung und Registrierung
- Die Buttons „Hochladen“ und „Neues Meeting“ in der Kopfzeile
- Die Seiten „Analyse“ und „Einstellungen“ (bisher nur mit Überschrift)

### Datenbank
Die Datenbank befindet zum Aktuellen Zeitpunkt auf einem separaten Branch(db-integration). Diese ist funktionsfähig und voll implementiert.

---

## Neu installieren, wenn etwas nicht funktioniert

Folgende Ordner werden bei der Installation bzw. beim Start automatisch erzeugt und können gefahrlos gelöscht werden:

| Ordner | Inhalt | Wird neu erzeugt durch |
|---|---|---|
| `python/.venv/` | Virtuelle Python-Umgebung mit allen Paketen | `python -m venv .venv` und `pip install -r requirements.txt` |
| `python/__pycache__/` | Python-Cache | automatisch beim Start |
| `frontend/node_modules/` | Alle npm-Pakete | `npm install` |
| `frontend/.vite/` | Vite-Cache | automatisch bei `npm run dev` |
| `frontend/dist/` | Build-Ausgabe | `npm run build` |

**Nicht löschen:** `package.json`, `package-lock.json`, `requirements.txt` und `.env.example`. Diese Dateien legen fest, welche Pakete in welchen Versionen installiert werden. Wird z. B. `package-lock.json` gelöscht, installiert jeder andere Versionen und Git zeigt sehr viele Änderungen an.

### Vorgehen

1. Laufende Server mit **Strg + C** beenden und die virtuelle Umgebung mit `deactivate` verlassen. Unter Windows lassen sich Dateien, die noch verwendet werden, sonst nicht löschen.
2. Im Hauptordner des Projekts die Ordner löschen:

   **Windows (PowerShell):**

   ```powershell
   Remove-Item -Recurse -Force python\.venv, python\__pycache__, frontend\node_modules, frontend\.vite, frontend\dist -ErrorAction SilentlyContinue
   ```

   **macOS / Linux:**

   ```bash
   rm -rf python/.venv python/__pycache__ frontend/node_modules frontend/.vite frontend/dist
   ```

3. Die [Erstinstallation](#erstinstallation) ab Schritt 2 erneut durchführen. Die vorhandene `.env` kann bestehen bleiben.

---

## Häufige Probleme

**`python` wird nicht gefunden oder öffnet den Microsoft Store**
Python von [python.org](https://www.python.org/downloads/) installieren und im Installer **„Add python.exe to PATH“** anhaken. Danach ein neues Terminal öffnen.

**PowerShell: „Die Ausführung von Skripts ist auf diesem System deaktiviert“** (beim Aktivieren der `.venv`)
Einmalig für das aktuelle Terminalfenster erlauben und erneut aktivieren:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.venv\Scripts\Activate.ps1
```

**`RuntimeError: Umgebungsvariable OLLAMA_URL fehlt`** beim Start des Backends
Die `.env` fehlt im Ordner `python`. Mit `Copy-Item .env.example .env` (Windows) bzw. `cp .env.example .env` (macOS / Linux) anlegen.

**`uvicorn` bzw. `ModuleNotFoundError` beim Start des Backends**
Die virtuelle Umgebung ist nicht aktiviert (kein `(.venv)` vor der Konsolenzeile) oder die Pakete fehlen. `.venv` aktivieren und `pip install -r requirements.txt` ausführen.

**Port 8000 oder 5173 ist bereits belegt**
Wahrscheinlich läuft der Server schon in einem anderen Terminal. Dieses schließen bzw. dort **Strg + C** drücken. Ist 5173 belegt, weicht Vite automatisch auf 5174 aus. Dort sind die bisher gespeicherten Meetings aber nicht sichtbar (siehe [Wo werden die Meetings gespeichert?](#wo-werden-die-meetings-gespeichert)). Das Backend muss auf 8000 laufen.

**Hochladen schlägt fehl („Fehler beim Hochladen oder Verarbeiten der Audiodatei.“)**
Im Backend-Terminal steht die genaue Ursache. Bei „Ollama nicht erreichbar“ oder Verbindungsfehlern zum Whisper-Server sind die KI-Server nicht erreichbar, z. B. außerhalb des Hochschulnetzes ohne VPN.

---

Weitere Details zum Backend: [python/README.md](python/README.md)
